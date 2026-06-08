-- Invalidate tokens issued before duplicate signup hardening. This preserves
-- waitlist rows and survey responses while closing any token already obtained
-- through the prior duplicate-submit behavior.
update public.waitlist_signups
set survey_token = gen_random_uuid();

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
  v_survey_token uuid;
begin
  if v_email = ''
    or char_length(v_email) > 320
    or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  then
    return jsonb_build_object(
      'ok', false,
      'code', 'invalid_email',
      'survey_allowed', false,
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
  on conflict (normalized_email) do nothing
  returning survey_token into v_survey_token;

  if v_survey_token is null then
    return jsonb_build_object(
      'ok', true,
      'code', 'waitlist_joined',
      'survey_allowed', false,
      'survey_token', null
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'code', 'waitlist_joined',
    'survey_allowed', true,
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
    'Base tips from people who actually work there',
    'Layover recommendations',
    'Verified crew lounges based on role',
    'Anonymous-but-accountable discussion',
    'Career, interview, or new-hire help',
    'Crew-friendly deals or perks',
    'Commuter or non-rev-adjacent tips',
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
    'Comfortable using my company airline email later',
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
    'Team outreach',
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

  update public.waitlist_signups
  set
    survey_token = gen_random_uuid(),
    survey_completed_at = now()
  where survey_token = requested_survey_token
  returning id into v_signup_id;

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

  return jsonb_build_object(
    'ok', true,
    'code', 'waitlist_survey_saved'
  );
end;
$$;

create or replace function public.invalidate_waitlist_survey_token(
  requested_survey_token uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_signup_id uuid;
begin
  update public.waitlist_signups
  set survey_token = gen_random_uuid()
  where survey_token = requested_survey_token
  returning id into v_signup_id;

  if v_signup_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'waitlist_signup_not_found'
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'code', 'waitlist_survey_token_invalidated'
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
) from public, anon, authenticated;

revoke all on function public.invalidate_waitlist_survey_token(uuid)
from public, anon, authenticated;

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

grant execute on function public.invalidate_waitlist_survey_token(uuid)
to service_role;
