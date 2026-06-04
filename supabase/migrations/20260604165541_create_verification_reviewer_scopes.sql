create table public.verification_reviewer_scopes (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references auth.users (id) on delete cascade,
  scope_type text not null,
  scope_value text,
  status text not null default 'active',
  granted_by uuid references auth.users (id),
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint verification_reviewer_scopes_type_check check (
    scope_type in ('global', 'airline', 'role', 'base')
  ),
  constraint verification_reviewer_scopes_status_check check (
    status in ('active', 'paused', 'revoked')
  ),
  constraint verification_reviewer_scopes_global_value_check check (
    (scope_type = 'global' and scope_value is null)
    or (scope_type <> 'global')
  )
);

create index verification_reviewer_scopes_reviewer_id_idx
on public.verification_reviewer_scopes (reviewer_id, created_at desc);
create index verification_reviewer_scopes_status_idx
on public.verification_reviewer_scopes (status, created_at desc);
create index verification_reviewer_scopes_scope_type_idx
on public.verification_reviewer_scopes (scope_type, scope_value, created_at desc);

create trigger set_verification_reviewer_scopes_updated_at
before update on public.verification_reviewer_scopes
for each row
execute function public.set_verification_updated_at();

alter table public.verification_reviewer_scopes enable row level security;

comment on table public.verification_reviewer_scopes is 'Reviewer authorization scopes for bounded verification review flows. No self-serve reviewer enrollment or reviewer-management UI is included here.';

create or replace function public.has_active_verification_reviewer_scope(actor_id uuid default auth.uid())
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.verification_reviewer_scopes
    where reviewer_id = actor_id
      and status = 'active'
  );
$$;

create or replace function public.has_matching_verification_reviewer_scope(
  actor_id uuid,
  airline_value text,
  role_value text,
  base_value text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.verification_reviewer_scopes
    where reviewer_id = actor_id
      and status = 'active'
      and (
        scope_type = 'global'
        or (scope_type = 'airline' and lower(coalesce(scope_value, '')) = lower(coalesce(airline_value, '')))
        or (scope_type = 'role' and lower(coalesce(scope_value, '')) = lower(coalesce(role_value, '')))
        or (scope_type = 'base' and lower(coalesce(scope_value, '')) = lower(coalesce(base_value, '')))
      )
  );
$$;

create or replace function public.can_review_verification_request(
  actor_id uuid,
  request_owner_id uuid,
  request_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    (
      actor_id is not null
      and actor_id <> request_owner_id
      and exists (
        select 1
        from public.verification_reviewer_scopes
        where reviewer_id = actor_id
          and status = 'active'
          and scope_type = 'global'
      )
    )
    or (
      actor_id is not null
      and actor_id <> request_owner_id
      and exists (
        select 1
        from public.verification_evidence
        where request_id = can_review_verification_request.request_id
          and public.has_matching_verification_reviewer_scope(
            actor_id,
            metadata ->> 'airline',
            metadata ->> 'role',
            metadata ->> 'base'
          )
      )
    );
$$;

create policy "users can read their own reviewer scopes"
on public.verification_reviewer_scopes
for select
to authenticated
using (auth.uid() = reviewer_id);

create policy "reviewers can read verification requests"
on public.verification_requests
for select
to authenticated
using (public.can_review_verification_request(auth.uid(), user_id, id));

create policy "reviewers can update verification requests"
on public.verification_requests
for update
to authenticated
using (
  public.can_review_verification_request(auth.uid(), user_id, id)
)
with check (
  public.can_review_verification_request(auth.uid(), user_id, id)
  and reviewed_by = auth.uid()
  and status in ('approved', 'rejected', 'needs_resubmission')
);

create policy "reviewers can read verification evidence metadata"
on public.verification_evidence
for select
to authenticated
using (
  exists (
    select 1
    from public.verification_requests
    where verification_requests.id = verification_evidence.request_id
      and public.can_review_verification_request(
        auth.uid(),
        verification_requests.user_id,
        verification_requests.id
      )
  )
);

create policy "reviewers can read verification claims"
on public.verification_claims
for select
to authenticated
using (
  request_id is not null
  and public.can_review_verification_request(auth.uid(), user_id, request_id)
);

create policy "reviewers can insert approved verification claims"
on public.verification_claims
for insert
to authenticated
with check (
  public.can_review_verification_request(auth.uid(), user_id, request_id)
  and approved_by = auth.uid()
  and status = 'approved'
  and request_id is not null
  and exists (
    select 1
    from public.verification_requests
    where verification_requests.id = request_id
      and verification_requests.user_id = verification_claims.user_id
      and verification_requests.user_id <> auth.uid()
  )
);

create policy "reviewers can read verification review actions"
on public.verification_review_actions
for select
to authenticated
using (
  exists (
    select 1
    from public.verification_requests
    where verification_requests.id = verification_review_actions.request_id
      and public.can_review_verification_request(
        auth.uid(),
        verification_requests.user_id,
        verification_requests.id
      )
  )
);

create policy "reviewers can create verification review actions"
on public.verification_review_actions
for insert
to authenticated
with check (
  reviewer_id = auth.uid()
  and action in ('approve', 'reject', 'request_resubmission')
  and exists (
    select 1
    from public.verification_requests
    where verification_requests.id = request_id
      and public.can_review_verification_request(
        auth.uid(),
        verification_requests.user_id,
        verification_requests.id
      )
  )
);
