create or replace function public.operator_scope_values()
returns text[]
language sql
immutable
as $$
  select array[
    'operator.internal_private_app_access',
    'operator.read_audit',
    'operator.view_waitlist_contacts',
    'operator.manage_approved_domains',
    'operator.manage_reviewer_scopes',
    'operator.read_verification_requests',
    'operator.monitor_proof_cleanup',
    'operator.run_proof_cleanup',
    'operator.manage_operator_access',
    'operator.manage_beta_invites'
  ]::text[];
$$;

create or replace function public.mask_waitlist_contact_label(input_email text)
returns text
language sql
immutable
as $$
  with normalized as (
    select lower(nullif(btrim(input_email), '')) as email
  ),
  parts as (
    select
      split_part(email, '@', 1) as local_part,
      split_part(email, '@', 2) as domain_part
    from normalized
    where email is not null
      and position('@' in email) > 1
  )
  select coalesce(
    (
      select
        case
          when local_part = '' or domain_part = '' then 'hidden'
          else left(local_part, 1) || '...@' || domain_part
        end
      from parts
    ),
    'hidden'
  );
$$;

create or replace function public.recent_waitlist_signup_summaries(result_limit integer default 50)
returns table (
  masked_email text,
  landing_path text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  survey_completed_at timestamptz,
  created_at timestamptz,
  aviation_connection text,
  priority_base text,
  useful_first text[],
  discovery_source text,
  survey_response_created_at timestamptz
)
language sql
stable
as $$
  select
    public.mask_waitlist_contact_label(coalesce(signups.normalized_email, signups.email)) as masked_email,
    signups.landing_path,
    signups.referrer,
    signups.utm_source,
    signups.utm_medium,
    signups.utm_campaign,
    signups.utm_content,
    signups.utm_term,
    signups.survey_completed_at,
    signups.created_at,
    survey.aviation_connection,
    survey.priority_base,
    survey.useful_first,
    survey.discovery_source,
    survey.created_at as survey_response_created_at
  from public.waitlist_signups as signups
  left join lateral (
    select
      responses.aviation_connection,
      responses.priority_base,
      responses.useful_first,
      responses.discovery_source,
      responses.created_at
    from public.waitlist_survey_responses as responses
    where responses.signup_id = signups.id
    order by responses.created_at desc
    limit 1
  ) as survey on true
  order by signups.created_at desc
  limit least(greatest(coalesce(result_limit, 50), 1), 50);
$$;

revoke all on function public.recent_waitlist_signup_summaries(integer) from public;
revoke all on function public.recent_waitlist_signup_summaries(integer) from anon, authenticated;
grant execute on function public.recent_waitlist_signup_summaries(integer) to service_role;
