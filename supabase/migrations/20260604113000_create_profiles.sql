create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  handle text unique,
  display_name text,
  claimed_airline text,
  claimed_role text,
  claimed_base text,
  profile_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_handle_lowercase check (handle is null or handle = lower(handle))
);

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_profiles_updated_at();

alter table public.profiles enable row level security;

comment on table public.profiles is 'Self-declared account/profile foundation fields for jmpseat onboarding. These are not verified worker claims.';
comment on column public.profiles.claimed_airline is 'Self-declared airline field only. Not a verified claim.';
comment on column public.profiles.claimed_role is 'Self-declared role field only. Not a verified claim.';
comment on column public.profiles.claimed_base is 'Self-declared base field only. Not a verified claim.';

create policy "users can read their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
