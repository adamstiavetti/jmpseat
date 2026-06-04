create table public.beta_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null,
  source text,
  invited_email text,
  invited_by uuid references auth.users (id),
  approved_by uuid references auth.users (id),
  approved_at timestamptz,
  revoked_by uuid references auth.users (id),
  revoked_at timestamptz,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint beta_access_status_check check (status in ('waitlisted', 'invited', 'active', 'denied', 'revoked', 'paused'))
);

create unique index beta_access_user_id on public.beta_access (user_id);
create index beta_access_status_idx on public.beta_access (status, created_at desc);
create index beta_access_invited_email_idx on public.beta_access (invited_email);

create or replace function public.set_beta_access_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_beta_access_updated_at
before update on public.beta_access
for each row
execute function public.set_beta_access_updated_at();

alter table public.beta_access enable row level security;

comment on table public.beta_access is 'Invite-only beta access state for jmpseat private app entry. Separate from waitlist, auth, profile completion, and worker verification.';
comment on column public.beta_access.status is 'Invite-only beta access state. Active is required for private app entry.';

create policy "users can read their own beta access"
on public.beta_access
for select
to authenticated
using (auth.uid() = user_id);
