create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  survey_token uuid not null default gen_random_uuid(),
  email text not null,
  normalized_email text not null,
  landing_path text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  survey_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint waitlist_signups_normalized_email_unique unique (normalized_email),
  constraint waitlist_signups_survey_token_unique unique (survey_token),
  constraint waitlist_signups_normalized_email_lowercase check (
    normalized_email = lower(normalized_email)
  ),
  constraint waitlist_signups_email_length_check check (
    char_length(email) between 3 and 320
  ),
  constraint waitlist_signups_normalized_email_length_check check (
    char_length(normalized_email) between 3 and 320
  )
);

create table if not exists public.waitlist_survey_responses (
  id uuid primary key default gen_random_uuid(),
  signup_id uuid not null references public.waitlist_signups (id) on delete cascade,
  aviation_connection text,
  priority_base text,
  useful_first text[] not null default '{}'::text[],
  biggest_pain text,
  current_tools text[] not null default '{}'::text[],
  verification_comfort text,
  beta_help text[] not null default '{}'::text[],
  discovery_source text,
  privacy_concern text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint waitlist_survey_responses_signup_unique unique (signup_id),
  constraint waitlist_survey_responses_priority_base_length_check check (
    priority_base is null or char_length(priority_base) <= 120
  ),
  constraint waitlist_survey_responses_biggest_pain_length_check check (
    biggest_pain is null or char_length(biggest_pain) <= 500
  ),
  constraint waitlist_survey_responses_privacy_concern_length_check check (
    privacy_concern is null or char_length(privacy_concern) <= 500
  )
);

create index if not exists waitlist_signups_created_at_idx
on public.waitlist_signups (created_at desc);

create index if not exists waitlist_signups_survey_completed_at_idx
on public.waitlist_signups (survey_completed_at)
where survey_completed_at is not null;

create index if not exists waitlist_survey_responses_created_at_idx
on public.waitlist_survey_responses (created_at desc);

create or replace function public.set_waitlist_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_waitlist_signups_updated_at on public.waitlist_signups;
create trigger set_waitlist_signups_updated_at
before update on public.waitlist_signups
for each row
execute function public.set_waitlist_updated_at();

drop trigger if exists set_waitlist_survey_responses_updated_at on public.waitlist_survey_responses;
create trigger set_waitlist_survey_responses_updated_at
before update on public.waitlist_survey_responses
for each row
execute function public.set_waitlist_updated_at();

alter table public.waitlist_signups enable row level security;
alter table public.waitlist_survey_responses enable row level security;

revoke all on table public.waitlist_signups from anon, authenticated;
revoke all on table public.waitlist_survey_responses from anon, authenticated;

comment on table public.waitlist_signups is 'First-party public jmpseat waitlist email capture. Submission does not grant beta access or worker eligibility.';
comment on table public.waitlist_survey_responses is 'Optional public waitlist product-shaping responses. All questions are optional and separate from auth, beta access, and worker eligibility.';
comment on column public.waitlist_signups.survey_token is 'Opaque token used by server-side waitlist actions to attach optional survey responses after email capture.';

create or replace function public.waitlist_survey_text_has_sensitive_content(
  requested_value text
)
returns boolean
language sql
immutable
as $$
  select coalesce(requested_value, '') ~* '(^|[^a-z])(employee\s*id|badge|document\s*upload|password|portal|passenger|hotel|schedule|credential)([^a-z]|$)';
$$;

create or replace function public.waitlist_survey_array_has_unknown_value(
  requested_values text[],
  allowed_values text[]
)
returns boolean
language sql
immutable
as $$
  select exists (
    select 1
    from unnest(coalesce(requested_values, '{}'::text[])) as requested_value
    where not requested_value = any(allowed_values)
  );
$$;

create or replace function public.submit_waitlist_signup(
  requested_email text,
  requested_landing_path text default null,
  requested_referrer text default null,
  requested_utm_source text default null,
  requested_utm_medium text default null,
  requested_utm_campaign text default null,
  requested_utm_content text default null,
  requested_utm_term text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(btrim(coalesce(requested_email, '')));
  v_signup_id uuid;
  v_survey_token uuid;
begin
  if v_email = ''
    or char_length(v_email) > 320
    or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  then
    return jsonb_build_object(
      'ok', false,
      'code', 'invalid_email',
      'survey_token', null
    );
  end if;

  insert into public.waitlist_signups (
    email,
    normalized_email,
    landing_path,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term
  )
  values (
    v_email,
    v_email,
    nullif(left(btrim(coalesce(requested_landing_path, '')), 300), ''),
    nullif(left(btrim(coalesce(requested_referrer, '')), 500), ''),
    nullif(left(btrim(coalesce(requested_utm_source, '')), 120), ''),
    nullif(left(btrim(coalesce(requested_utm_medium, '')), 120), ''),
    nullif(left(btrim(coalesce(requested_utm_campaign, '')), 120), ''),
    nullif(left(btrim(coalesce(requested_utm_content, '')), 120), ''),
    nullif(left(btrim(coalesce(requested_utm_term, '')), 120), '')
  )
  on conflict (normalized_email) do update
  set
    landing_path = coalesce(excluded.landing_path, public.waitlist_signups.landing_path),
    referrer = coalesce(excluded.referrer, public.waitlist_signups.referrer),
    utm_source = coalesce(excluded.utm_source, public.waitlist_signups.utm_source),
    utm_medium = coalesce(excluded.utm_medium, public.waitlist_signups.utm_medium),
    utm_campaign = coalesce(excluded.utm_campaign, public.waitlist_signups.utm_campaign),
    utm_content = coalesce(excluded.utm_content, public.waitlist_signups.utm_content),
    utm_term = coalesce(excluded.utm_term, public.waitlist_signups.utm_term)
  returning id, survey_token into v_signup_id, v_survey_token;

  return jsonb_build_object(
    'ok', true,
    'code', 'waitlist_joined',
    'survey_token', v_survey_token
  );
end;
$$;

create or replace function public.submit_waitlist_survey_response(
  requested_survey_token uuid,
  requested_aviation_connection text default null,
  requested_priority_base text default null,
  requested_useful_first text[] default '{}'::text[],
  requested_biggest_pain text default null,
  requested_current_tools text[] default '{}'::text[],
  requested_verification_comfort text default null,
  requested_beta_help text[] default '{}'::text[],
  requested_discovery_source text default null,
  requested_privacy_concern text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_signup_id uuid;
  v_aviation_connection text := nullif(left(btrim(coalesce(requested_aviation_connection, '')), 120), '');
  v_priority_base text := nullif(left(btrim(coalesce(requested_priority_base, '')), 120), '');
  v_useful_first text[];
  v_biggest_pain text := nullif(left(btrim(coalesce(requested_biggest_pain, '')), 500), '');
  v_current_tools text[];
  v_verification_comfort text := nullif(left(btrim(coalesce(requested_verification_comfort, '')), 160), '');
  v_beta_help text[];
  v_discovery_source text := nullif(left(btrim(coalesce(requested_discovery_source, '')), 160), '');
  v_privacy_concern text := nullif(left(btrim(coalesce(requested_privacy_concern, '')), 500), '');
  v_allowed_aviation_connections text[] := array[
    'Flight attendant',
    'Pilot',
    'Gate agent or customer service',
    'Ramp, baggage, or cargo',
    'Dispatcher, crew scheduler, or ops',
    'Airport ops',
    'Regional airline worker',
    'New hire or trainee',
    'Commuter',
    'Former airline worker',
    'Aspiring aviation worker',
    'Other'
  ];
  v_allowed_useful_first text[] := array[
    'Base intel',
    'Layover recommendations',
    'Verified crew rooms',
    'Anonymous-but-accountable discussion',
    'Career, interview, or new-hire help',
    'Crew-friendly deals or perks',
    'AI layover brief',
    'Commuter or non-rev-adjacent tips without flight loads',
    'Wellness, rest, or downtime',
    'Other'
  ];
  v_allowed_current_tools text[] := array[
    'Facebook groups',
    'Reddit',
    'Group chats or text threads',
    'Coworkers or friends',
    'Notes or spreadsheets',
    'StaffTraveler',
    'Flight Crew View',
    'CrewLounge',
    'CrewVIP',
    'Union or company resources',
    'Other'
  ];
  v_allowed_verification_comfort text[] := array[
    'Comfortable using an airline employee email later',
    'Comfortable with non-upload review later',
    'I need more privacy details first',
    'Not comfortable',
    'Not applicable yet'
  ];
  v_allowed_beta_help text[] := array[
    'I would do a short interview',
    'I might seed useful base or layover posts',
    'I could invite trusted coworkers later',
    'I only want launch updates for now'
  ];
  v_allowed_discovery_sources text[] := array[
    'Friend or coworker',
    'Group chat',
    'Facebook group',
    'Reddit',
    'LinkedIn',
    'Instagram or TikTok',
    'Search',
    'Founder or team outreach',
    'Other'
  ];
begin
  select coalesce(array_agg(value order by first_seen), '{}'::text[])
    into v_useful_first
  from (
    select trimmed.trimmed_value as value, min(input.ord) as first_seen
    from unnest(coalesce(requested_useful_first, '{}'::text[])) with ordinality as input(raw_value, ord)
    cross join lateral (select btrim(input.raw_value) as trimmed_value) as trimmed
    where trimmed.trimmed_value <> ''
    group by trimmed.trimmed_value
  ) as cleaned_values;

  select coalesce(array_agg(value order by first_seen), '{}'::text[])
    into v_current_tools
  from (
    select trimmed.trimmed_value as value, min(input.ord) as first_seen
    from unnest(coalesce(requested_current_tools, '{}'::text[])) with ordinality as input(raw_value, ord)
    cross join lateral (select btrim(input.raw_value) as trimmed_value) as trimmed
    where trimmed.trimmed_value <> ''
    group by trimmed.trimmed_value
  ) as cleaned_values;

  select coalesce(array_agg(value order by first_seen), '{}'::text[])
    into v_beta_help
  from (
    select trimmed.trimmed_value as value, min(input.ord) as first_seen
    from unnest(coalesce(requested_beta_help, '{}'::text[])) with ordinality as input(raw_value, ord)
    cross join lateral (select btrim(input.raw_value) as trimmed_value) as trimmed
    where trimmed.trimmed_value <> ''
    group by trimmed.trimmed_value
  ) as cleaned_values;

  if v_aviation_connection is not null
    and not v_aviation_connection = any(v_allowed_aviation_connections)
  then
    return jsonb_build_object('ok', false, 'code', 'invalid_survey_value');
  end if;

  if cardinality(v_useful_first) > 3
    or public.waitlist_survey_array_has_unknown_value(v_useful_first, v_allowed_useful_first)
  then
    return jsonb_build_object('ok', false, 'code', 'invalid_survey_value');
  end if;

  if cardinality(v_current_tools) > 5
    or public.waitlist_survey_array_has_unknown_value(v_current_tools, v_allowed_current_tools)
  then
    return jsonb_build_object('ok', false, 'code', 'invalid_survey_value');
  end if;

  if v_verification_comfort is not null
    and not v_verification_comfort = any(v_allowed_verification_comfort)
  then
    return jsonb_build_object('ok', false, 'code', 'invalid_survey_value');
  end if;

  if cardinality(v_beta_help) > 4
    or public.waitlist_survey_array_has_unknown_value(v_beta_help, v_allowed_beta_help)
  then
    return jsonb_build_object('ok', false, 'code', 'invalid_survey_value');
  end if;

  if v_discovery_source is not null
    and not v_discovery_source = any(v_allowed_discovery_sources)
  then
    return jsonb_build_object('ok', false, 'code', 'invalid_survey_value');
  end if;

  if public.waitlist_survey_text_has_sensitive_content(v_priority_base)
    or public.waitlist_survey_text_has_sensitive_content(v_biggest_pain)
    or public.waitlist_survey_text_has_sensitive_content(v_privacy_concern)
  then
    return jsonb_build_object('ok', false, 'code', 'sensitive_content_not_allowed');
  end if;

  select id
    into v_signup_id
  from public.waitlist_signups
  where survey_token = requested_survey_token;

  if v_signup_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'waitlist_signup_not_found'
    );
  end if;

  insert into public.waitlist_survey_responses (
    signup_id,
    aviation_connection,
    priority_base,
    useful_first,
    biggest_pain,
    current_tools,
    verification_comfort,
    beta_help,
    discovery_source,
    privacy_concern
  )
  values (
    v_signup_id,
    v_aviation_connection,
    v_priority_base,
    v_useful_first,
    v_biggest_pain,
    v_current_tools,
    v_verification_comfort,
    v_beta_help,
    v_discovery_source,
    v_privacy_concern
  )
  on conflict (signup_id) do update
  set
    aviation_connection = excluded.aviation_connection,
    priority_base = excluded.priority_base,
    useful_first = excluded.useful_first,
    biggest_pain = excluded.biggest_pain,
    current_tools = excluded.current_tools,
    verification_comfort = excluded.verification_comfort,
    beta_help = excluded.beta_help,
    discovery_source = excluded.discovery_source,
    privacy_concern = excluded.privacy_concern;

  update public.waitlist_signups
  set survey_completed_at = now()
  where id = v_signup_id;

  return jsonb_build_object(
    'ok', true,
    'code', 'waitlist_survey_saved'
  );
end;
$$;

revoke all on function public.submit_waitlist_signup(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) from public;

revoke all on function public.submit_waitlist_survey_response(
  uuid,
  text,
  text,
  text[],
  text,
  text[],
  text,
  text[],
  text,
  text
) from public;

revoke all on function public.waitlist_survey_text_has_sensitive_content(text) from public;
revoke all on function public.waitlist_survey_array_has_unknown_value(text[], text[]) from public;

grant execute on function public.submit_waitlist_signup(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) to anon, authenticated;

grant execute on function public.submit_waitlist_survey_response(
  uuid,
  text,
  text,
  text[],
  text,
  text[],
  text,
  text[],
  text,
  text
) to service_role;
