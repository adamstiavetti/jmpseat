create or replace function public.current_user_can_read_open_board_posts()
returns boolean
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_has_completed_profile boolean := false;
  v_has_operator_access boolean := false;
  v_has_active_beta_access boolean := false;
  v_has_verified_work_email boolean := false;
begin
  if v_user_id is null then
    return false;
  end if;

  select exists (
    select 1
    from public.profiles
    where profiles.id = v_user_id
      and profiles.profile_completed_at is not null
  ) into v_has_completed_profile;

  if not v_has_completed_profile then
    return false;
  end if;

  v_has_operator_access :=
    public.is_operator_with_scope('operator.internal_private_app_access');

  if v_has_operator_access then
    return true;
  end if;

  select exists (
    select 1
    from public.beta_access
    where beta_access.user_id = v_user_id
      and beta_access.status = 'active'
      and beta_access.revoked_at is null
  ) into v_has_active_beta_access;

  if not v_has_active_beta_access then
    return false;
  end if;

  select (
    exists (
      select 1
      from public.verification_requests
      inner join public.verification_evidence
        on verification_evidence.request_id = verification_requests.id
       and verification_evidence.user_id = verification_requests.user_id
       and verification_evidence.evidence_type = 'work_email'
      inner join public.approved_email_domains
        on approved_email_domains.domain = verification_evidence.metadata->>'email_domain'
       and approved_email_domains.status = 'active'
      where verification_requests.user_id = v_user_id
        and verification_requests.method = 'work_email'
        and verification_requests.status = 'approved'
        and (verification_requests.expires_at is null or verification_requests.expires_at > now())
        and verification_evidence.status = 'accepted'
        and verification_evidence.metadata->>'support_result' = 'supported_domain'
        and verification_evidence.metadata->>'verification_method' = 'work_email'
    )
    or exists (
      select 1
      from public.verification_claims
      inner join public.verification_requests
        on verification_requests.id = verification_claims.request_id
       and verification_requests.user_id = verification_claims.user_id
       and verification_requests.method = 'work_email'
      inner join public.verification_evidence
        on verification_evidence.request_id = verification_claims.request_id
       and verification_evidence.user_id = verification_claims.user_id
       and verification_evidence.evidence_type = 'work_email'
      inner join public.approved_email_domains
        on approved_email_domains.domain = verification_evidence.metadata->>'email_domain'
       and approved_email_domains.status = 'active'
      where verification_claims.user_id = v_user_id
        and verification_claims.request_id is not null
        and verification_claims.claim_type = 'airline_worker'
        and verification_claims.status = 'approved'
        and verification_claims.verification_method = 'work_email'
        and verification_claims.revoked_at is null
        and (verification_claims.expires_at is null or verification_claims.expires_at > now())
        and verification_evidence.status = 'accepted'
        and verification_evidence.metadata->>'support_result' = 'supported_domain'
        and verification_evidence.metadata->>'verification_method' = 'work_email'
    )
  ) into v_has_verified_work_email;

  return v_has_verified_work_email;
end;
$$;

create or replace function public.list_open_baseboard_posts(
  p_base_code text,
  p_limit integer default 20
)
returns table (
  id uuid,
  title text,
  body text,
  content_type text,
  category text,
  is_pinned boolean,
  created_at timestamptz,
  updated_at timestamptz,
  author_label text
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_base_code text := coalesce(upper(trim(p_base_code)), '');
  v_limit integer := least(greatest(coalesce(p_limit, 20), 1), 50);
  v_base_id uuid;
  v_board_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  if not public.current_user_can_read_open_board_posts() then
    raise exception 'Read eligibility required'
      using errcode = '42501';
  end if;

  select bases.id
  into v_base_id
  from public.bases
  where bases.code = v_base_code
    and bases.status = 'active'
  limit 1;

  if v_base_id is null then
    return;
  end if;

  select boards.id
  into v_board_id
  from public.boards
  inner join public.board_types
    on board_types.id = boards.board_type_id
  where boards.base_id = v_base_id
    and boards.status = 'active'
    and boards.visibility = 'open_verified'
    and board_types.key = 'base_board'
    and board_types.is_active = true
  order by boards.sort_order, boards.created_at
  limit 1;

  if v_board_id is null then
    return;
  end if;

  return query
  select
    board_posts.id,
    board_posts.title,
    board_posts.body,
    board_posts.content_type,
    board_posts.category,
    board_posts.is_pinned,
    board_posts.created_at,
    board_posts.updated_at,
    coalesce(nullif(trim(profiles.handle), ''), 'jmpseat member') as author_label
  from public.board_posts
  left join public.profiles
    on profiles.id = board_posts.author_user_id
  where board_posts.board_id = v_board_id
    and board_posts.status = 'published'
    and board_posts.visibility = 'board'
  order by
    board_posts.is_pinned desc,
    board_posts.created_at desc
  limit v_limit;
end;
$$;

revoke all on function public.current_user_can_read_open_board_posts() from public;
revoke execute on function public.current_user_can_read_open_board_posts() from anon;
grant execute on function public.current_user_can_read_open_board_posts() to authenticated;
grant execute on function public.current_user_can_read_open_board_posts() to service_role;

revoke all on function public.list_open_baseboard_posts(text, integer) from public;
revoke execute on function public.list_open_baseboard_posts(text, integer) from anon;
grant execute on function public.list_open_baseboard_posts(text, integer) to authenticated;
grant execute on function public.list_open_baseboard_posts(text, integer) to service_role;

comment on function public.current_user_can_read_open_board_posts() is 'Returns whether the authenticated caller may read open Baseboard posts through the T14 read RPC. Auth alone is not enough: callers need a completed profile plus operator internal private-app access or active beta access with verified work-email eligibility. Returns only a boolean and does not expose verification evidence details.';
comment on function public.list_open_baseboard_posts(text, integer) is 'Read-only post list for active open verified Baseboards by active base code. Returns published board-visible posts with safe fields only, including profiles.handle as author_label with jmpseat member fallback. Does not expose author ids, emails, claimed profile fields, verification evidence, proof storage data, signed URLs, comments, saves, reactions, search, lounge posting, seeded content, or proof-upload scope.';
