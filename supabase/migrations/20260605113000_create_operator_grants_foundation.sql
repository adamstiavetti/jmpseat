create or replace function public.operator_scope_values()
returns text[]
language sql
immutable
as $$
  select array[
    'operator.read_audit',
    'operator.manage_approved_domains',
    'operator.manage_reviewer_scopes',
    'operator.read_verification_requests',
    'operator.monitor_proof_cleanup',
    'operator.run_proof_cleanup',
    'operator.manage_operator_access'
  ]::text[];
$$;

create or replace function public.normalize_operator_scopes(p_scopes text[])
returns text[]
language sql
immutable
as $$
  select coalesce(
    array_agg(distinct normalized.scope order by normalized.scope),
    '{}'::text[]
  )
  from (
    select nullif(btrim(scope_value), '') as scope
    from unnest(coalesce(p_scopes, '{}'::text[])) as scope_value
  ) as normalized
  where normalized.scope is not null;
$$;

create or replace function public.operator_scopes_are_valid(p_scopes text[])
returns boolean
language sql
immutable
as $$
  select
    p_scopes is not null
    and cardinality(p_scopes) > 0
    and cardinality(public.normalize_operator_scopes(p_scopes)) = cardinality(p_scopes)
    and public.normalize_operator_scopes(p_scopes) <@ public.operator_scope_values();
$$;

create table public.operator_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  scopes text[] not null,
  status text not null default 'active',
  created_by uuid references auth.users (id),
  revoked_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  reason text,
  constraint operator_grants_status_check check (
    status in ('active', 'revoked')
  ),
  constraint operator_grants_scopes_valid_check check (
    public.operator_scopes_are_valid(scopes)
  ),
  constraint operator_grants_revoked_at_check check (
    (status = 'active' and revoked_at is null)
    or (status = 'revoked' and revoked_at is not null)
  )
);

create unique index operator_grants_one_active_grant_per_user_idx
on public.operator_grants (user_id)
where status = 'active';

create index operator_grants_user_id_created_at_idx
on public.operator_grants (user_id, created_at desc);

create index operator_grants_status_created_at_idx
on public.operator_grants (status, created_at desc);

alter table public.operator_grants enable row level security;

comment on table public.operator_grants is 'Explicit operator/admin grants for bounded operational access. Reviewer scope, beta access, verification claims, and profile text do not imply operator access.';
comment on column public.operator_grants.scopes is 'Allowed operator scope values only. Scopes are additive and least-privilege.';

create or replace function public.current_user_operator_scopes()
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select case
    when auth.uid() is null then '{}'::text[]
    else coalesce(
      (
        select scopes
        from public.operator_grants
        where user_id = auth.uid()
          and status = 'active'
          and revoked_at is null
        order by created_at desc
        limit 1
      ),
      '{}'::text[]
    )
  end;
$$;

create or replace function public.is_operator_with_scope(required_scope text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() is not null
    and nullif(btrim(required_scope), '') is not null
    and nullif(btrim(required_scope), '') = any (public.current_user_operator_scopes());
$$;

create policy "operators with manage access can read operator grants"
on public.operator_grants
for select
to authenticated
using (
  public.is_operator_with_scope('operator.manage_operator_access')
);

alter table public.security_events
drop constraint if exists security_events_event_type_check;

alter table public.security_events
add constraint security_events_event_type_check check (
  event_type in (
    'auth.sign_in_attempt',
    'auth.sign_in_success',
    'auth.sign_in_failed',
    'auth.sign_up_attempt',
    'auth.sign_up_success',
    'auth.sign_up_failed',
    'auth.password_reset_requested',
    'auth.password_reset_request_failed',
    'auth.callback_resolved',
    'private_access.redirect_login',
    'private_access.redirect_profile',
    'private_access.redirect_access_hold',
    'private_access.allowed',
    'private_access.storage_not_ready',
    'profile.upsert_attempt',
    'profile.upsert_success',
    'profile.upsert_failed',
    'beta_access.checked',
    'verification_request.submitted',
    'verification_request.unsupported_domain',
    'verification_request.invalid_work_email',
    'verification_request.duplicate_active',
    'verification_evidence.created',
    'verification_evidence.uploaded',
    'verification_evidence.view_requested',
    'verification_evidence.view_granted',
    'verification_evidence.view_denied',
    'verification_evidence.deletion_scheduled',
    'verification_evidence.deleted',
    'verification_evidence.deletion_failed',
    'verification_review.approved',
    'verification_review.rejected',
    'verification_review.needs_resubmission',
    'verification_review.unauthorized_attempt',
    'verification_review.self_review_blocked',
    'verification_claim.issued',
    'operator_access.granted',
    'operator_access.revoked',
    'operator_access.unauthorized_attempt'
  )
);

create or replace function public.grant_operator_access(
  target_user_id uuid,
  requested_scopes text[],
  reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_now timestamptz := now();
  v_reason text := nullif(trim(coalesce(reason, '')), '');
  v_scopes text[] := public.normalize_operator_scopes(requested_scopes);
  v_grant_id uuid;
begin
  if v_actor_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'authenticated_operator_required',
      'operator_grant_id', null,
      'message', 'Authenticated operator required.'
    );
  end if;

  if not public.is_operator_with_scope('operator.manage_operator_access') then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'operator_access.unauthorized_attempt',
      '/app/admin',
      'denied',
      jsonb_build_object(
        'target_user_id', target_user_id,
        'scope_names', coalesce(v_scopes, '{}'::text[]),
        'reason_code', 'missing_manage_operator_access_scope'
      )
    );
    return jsonb_build_object(
      'ok', false,
      'code', 'missing_manage_operator_access_scope',
      'operator_grant_id', null,
      'message', 'Operator is not authorized to manage operator access.'
    );
  end if;

  if target_user_id is null then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'operator_access.unauthorized_attempt',
      '/app/admin',
      'denied',
      jsonb_build_object(
        'target_user_id', target_user_id,
        'scope_names', coalesce(v_scopes, '{}'::text[]),
        'reason_code', 'target_user_required'
      )
    );
    return jsonb_build_object(
      'ok', false,
      'code', 'target_user_required',
      'operator_grant_id', null,
      'message', 'Target user id required.'
    );
  end if;

  if target_user_id = v_actor_id then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'operator_access.unauthorized_attempt',
      '/app/admin',
      'denied',
      jsonb_build_object(
        'target_user_id', target_user_id,
        'scope_names', coalesce(v_scopes, '{}'::text[]),
        'reason_code', 'self_grant_blocked'
      )
    );
    return jsonb_build_object(
      'ok', false,
      'code', 'self_grant_blocked',
      'operator_grant_id', null,
      'message', 'Operators cannot grant themselves operator access.'
    );
  end if;

  if not public.operator_scopes_are_valid(requested_scopes) then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'operator_access.unauthorized_attempt',
      '/app/admin',
      'denied',
      jsonb_build_object(
        'target_user_id', target_user_id,
        'scope_names', coalesce(v_scopes, '{}'::text[]),
        'reason_code', 'invalid_requested_scopes'
      )
    );
    return jsonb_build_object(
      'ok', false,
      'code', 'invalid_requested_scopes',
      'operator_grant_id', null,
      'message', 'Requested operator scopes are invalid.'
    );
  end if;

  if exists (
    select 1
    from public.operator_grants
    where user_id = target_user_id
      and status = 'active'
      and revoked_at is null
  ) then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'operator_access.unauthorized_attempt',
      '/app/admin',
      'denied',
      jsonb_build_object(
        'target_user_id', target_user_id,
        'scope_names', v_scopes,
        'reason_code', 'target_already_active'
      )
    );
    return jsonb_build_object(
      'ok', false,
      'code', 'target_already_active',
      'operator_grant_id', null,
      'message', 'Target user already has active operator access.'
    );
  end if;

  insert into public.operator_grants (
    user_id,
    scopes,
    status,
    created_by,
    reason
  )
  values (
    target_user_id,
    v_scopes,
    'active',
    v_actor_id,
    v_reason
  )
  returning id into v_grant_id;

  insert into public.security_events (user_id, event_type, route, result, metadata)
  values (
    v_actor_id,
    'operator_access.granted',
    '/app/admin',
    'granted',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'scope_names', v_scopes,
      'reason_present', v_reason is not null,
      'granted_at', v_now
    )
  );

  return jsonb_build_object(
    'ok', true,
    'code', 'operator_access_granted',
    'operator_grant_id', v_grant_id,
    'user_id', target_user_id,
    'scopes', v_scopes,
    'status', 'active',
    'message', null
  );
end;
$$;

create or replace function public.revoke_operator_access(
  target_user_id uuid,
  reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_now timestamptz := now();
  v_reason text := nullif(trim(coalesce(reason, '')), '');
  v_existing public.operator_grants%rowtype;
begin
  if v_actor_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'authenticated_operator_required',
      'operator_grant_id', null,
      'message', 'Authenticated operator required.'
    );
  end if;

  if not public.is_operator_with_scope('operator.manage_operator_access') then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'operator_access.unauthorized_attempt',
      '/app/admin',
      'denied',
      jsonb_build_object(
        'target_user_id', target_user_id,
        'reason_code', 'missing_manage_operator_access_scope'
      )
    );
    return jsonb_build_object(
      'ok', false,
      'code', 'missing_manage_operator_access_scope',
      'operator_grant_id', null,
      'message', 'Operator is not authorized to manage operator access.'
    );
  end if;

  if target_user_id is null then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'operator_access.unauthorized_attempt',
      '/app/admin',
      'denied',
      jsonb_build_object(
        'target_user_id', target_user_id,
        'reason_code', 'target_user_required'
      )
    );
    return jsonb_build_object(
      'ok', false,
      'code', 'target_user_required',
      'operator_grant_id', null,
      'message', 'Target user id required.'
    );
  end if;

  if target_user_id = v_actor_id then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'operator_access.unauthorized_attempt',
      '/app/admin',
      'denied',
      jsonb_build_object(
        'target_user_id', target_user_id,
        'reason_code', 'self_revoke_blocked'
      )
    );
    return jsonb_build_object(
      'ok', false,
      'code', 'self_revoke_blocked',
      'operator_grant_id', null,
      'message', 'Operators cannot revoke their own operator access in this slice.'
    );
  end if;

  select *
  into v_existing
  from public.operator_grants
  where user_id = target_user_id
    and status = 'active'
    and revoked_at is null
  for update;

  if not found then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'operator_access.unauthorized_attempt',
      '/app/admin',
      'denied',
      jsonb_build_object(
        'target_user_id', target_user_id,
        'reason_code', 'target_not_active'
      )
    );
    return jsonb_build_object(
      'ok', false,
      'code', 'target_not_active',
      'operator_grant_id', null,
      'message', 'Target user does not have active operator access.'
    );
  end if;

  update public.operator_grants
  set
    status = 'revoked',
    revoked_by = v_actor_id,
    revoked_at = v_now,
    reason = v_reason
  where id = v_existing.id;

  insert into public.security_events (user_id, event_type, route, result, metadata)
  values (
    v_actor_id,
    'operator_access.revoked',
    '/app/admin',
    'revoked',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'scope_names', v_existing.scopes,
      'reason_present', v_reason is not null,
      'revoked_at', v_now
    )
  );

  return jsonb_build_object(
    'ok', true,
    'code', 'operator_access_revoked',
    'operator_grant_id', v_existing.id,
    'user_id', target_user_id,
    'scopes', v_existing.scopes,
    'status', 'revoked',
    'message', null
  );
end;
$$;

create or replace function public.bootstrap_operator_access(
  target_user_id uuid,
  requested_scopes text[],
  reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reason text := nullif(trim(coalesce(reason, '')), '');
  v_scopes text[] := public.normalize_operator_scopes(requested_scopes);
  v_now timestamptz := now();
begin
  if target_user_id is null then
    raise exception 'Target user id required.';
  end if;

  if not public.operator_scopes_are_valid(requested_scopes) then
    raise exception 'Requested operator scopes are invalid.';
  end if;

  lock table public.operator_grants in exclusive mode;

  if exists (
    select 1
    from public.operator_grants
    where status = 'active'
      and revoked_at is null
  ) then
    return jsonb_build_object(
      'outcome', 'closed'
    );
  end if;

  insert into public.operator_grants (
    user_id,
    scopes,
    status,
    created_by,
    reason
  )
  values (
    target_user_id,
    v_scopes,
    'active',
    null,
    v_reason
  );

  insert into public.security_events (user_id, event_type, route, result, metadata)
  values (
    null,
    'operator_access.granted',
    '/api/ops/operator-bootstrap',
    'granted',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'scope_names', v_scopes,
      'reason_code', 'initial_operator_bootstrap',
      'reason_present', v_reason is not null,
      'granted_at', v_now
    )
  );

  return jsonb_build_object(
    'outcome', 'created',
    'scope_count', cardinality(v_scopes),
    'status', 'active'
  );
end;
$$;

revoke all on function public.current_user_operator_scopes() from public;
grant execute on function public.current_user_operator_scopes() to authenticated;

revoke all on function public.is_operator_with_scope(text) from public;
grant execute on function public.is_operator_with_scope(text) to authenticated;

revoke all on function public.grant_operator_access(uuid, text[], text) from public;
grant execute on function public.grant_operator_access(uuid, text[], text) to authenticated;

revoke all on function public.revoke_operator_access(uuid, text) from public;
grant execute on function public.revoke_operator_access(uuid, text) to authenticated;

revoke all on function public.bootstrap_operator_access(uuid, text[], text) from public;
grant execute on function public.bootstrap_operator_access(uuid, text[], text) to service_role;
