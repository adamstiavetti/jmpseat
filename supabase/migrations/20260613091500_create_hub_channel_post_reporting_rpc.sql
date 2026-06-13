create or replace function public.report_open_hub_channel_post(
  p_base_code text,
  p_channel_slug text,
  p_post_id uuid,
  p_reason text,
  p_details text default null
)
returns table (
  report_id uuid,
  result_status text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_base_code text := coalesce(upper(trim(p_base_code)), '');
  v_parent_slug text := lower(v_base_code);
  v_channel_slug text := coalesce(lower(trim(p_channel_slug)), '');
  v_reason text := lower(trim(coalesce(p_reason, '')));
  v_details text := nullif(trim(coalesce(p_details, '')), '');
  v_base_id uuid;
  v_parent_board_id uuid;
  v_channel_board_id uuid;
  v_report_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  if v_channel_slug = '' then
    raise exception 'Channel is required'
      using errcode = '22023';
  end if;

  if p_post_id is null then
    raise exception 'Post is required'
      using errcode = '22023';
  end if;

  if not public.current_user_can_read_open_board_posts() then
    raise exception 'Read eligibility required'
      using errcode = '42501';
  end if;

  if v_reason not in ('spam', 'harassment', 'unsafe_info', 'privacy', 'off_topic', 'other') then
    raise exception 'Unsupported report reason'
      using errcode = '22023';
  end if;

  if v_details is not null and char_length(v_details) > 1000 then
    raise exception 'Report details are too long'
      using errcode = '22023';
  end if;

  select bases.id
  into v_base_id
  from public.bases
  where bases.code = v_base_code
    and bases.status = 'active'
  limit 1;

  if v_base_id is null then
    raise exception 'Active base not found'
      using errcode = 'P0002';
  end if;

  select parent_boards.id
  into v_parent_board_id
  from public.boards as parent_boards
  inner join public.board_types as parent_board_types
    on parent_board_types.id = parent_boards.board_type_id
  where parent_boards.base_id = v_base_id
    and parent_boards.slug = v_parent_slug
    and parent_boards.status = 'active'
    and parent_board_types.key = 'base_board'
    and parent_board_types.is_active = true
  limit 1;

  if v_parent_board_id is null then
    raise exception 'Active parent base board not found'
      using errcode = 'P0002';
  end if;

  select child_boards.id
  into v_channel_board_id
  from public.boards as child_boards
  inner join public.board_types as child_board_types
    on child_board_types.id = child_boards.board_type_id
  where child_boards.base_id = v_base_id
    and child_boards.parent_board_id = v_parent_board_id
    and child_boards.slug = v_channel_slug
    and child_boards.status = 'active'
    and child_boards.visibility = 'open_verified'
    and child_boards.discoverability = 'visible'
    and child_board_types.key = 'hub_channel'
    and child_board_types.is_active = true
  limit 1;

  if v_channel_board_id is null then
    raise exception 'Active visible Hub Channel not found'
      using errcode = 'P0002';
  end if;

  perform 1
  from public.board_posts
  where board_posts.id = p_post_id
    and board_posts.board_id = v_channel_board_id
    and board_posts.status = 'published'
    and board_posts.visibility = 'board';

  if not found then
    raise exception 'Published Hub Channel post not found'
      using errcode = 'P0002';
  end if;

  select board_post_reports.id
  into v_report_id
  from public.board_post_reports
  where board_post_reports.post_id = p_post_id
    and board_post_reports.reporter_user_id = v_user_id
    and board_post_reports.status in ('open', 'reviewing')
  order by board_post_reports.created_at desc
  limit 1;

  if v_report_id is not null then
    return query select v_report_id, 'already_reported'::text;
    return;
  end if;

  insert into public.board_post_reports (
    post_id,
    reporter_user_id,
    reason,
    details
  )
  values (
    p_post_id,
    v_user_id,
    v_reason,
    v_details
  )
  returning id into v_report_id;

  return query select v_report_id, 'reported'::text;
end;
$$;

create or replace function public.list_open_hub_channel_post_reports(
  p_base_code text,
  p_limit integer default 50
)
returns table (
  report_id uuid,
  post_id uuid,
  channel_slug text,
  channel_name text,
  post_title text,
  post_body_preview text,
  post_category text,
  post_content_type text,
  post_created_at timestamptz,
  post_author_label text,
  reason text,
  details text,
  report_status text,
  reported_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_base_code text := coalesce(upper(trim(p_base_code)), '');
  v_parent_slug text := lower(v_base_code);
  v_base_id uuid;
  v_parent_board_id uuid;
  v_limit integer := least(greatest(coalesce(p_limit, 50), 1), 100);
begin
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  if not public.is_operator_with_scope('operator.community_moderation') then
    raise exception 'Operator moderation scope required'
      using errcode = '42501';
  end if;

  select bases.id
  into v_base_id
  from public.bases
  where bases.code = v_base_code
    and bases.status = 'active'
  limit 1;

  if v_base_id is null then
    raise exception 'Active base not found'
      using errcode = 'P0002';
  end if;

  select parent_boards.id
  into v_parent_board_id
  from public.boards as parent_boards
  inner join public.board_types as parent_board_types
    on parent_board_types.id = parent_boards.board_type_id
  where parent_boards.base_id = v_base_id
    and parent_boards.slug = v_parent_slug
    and parent_boards.status = 'active'
    and parent_board_types.key = 'base_board'
    and parent_board_types.is_active = true
  limit 1;

  if v_parent_board_id is null then
    raise exception 'Active parent base board not found'
      using errcode = 'P0002';
  end if;

  return query
  select
    board_post_reports.id as report_id,
    board_posts.id as post_id,
    child_boards.slug as channel_slug,
    child_boards.name as channel_name,
    board_posts.title as post_title,
    case
      when char_length(board_posts.body) > 280
        then substring(board_posts.body from 1 for 280) || '...'
      else board_posts.body
    end as post_body_preview,
    board_posts.category as post_category,
    board_posts.content_type as post_content_type,
    board_posts.created_at as post_created_at,
    coalesce(nullif(trim(profiles.handle), ''), 'jmpseat member') as post_author_label,
    board_post_reports.reason,
    board_post_reports.details,
    board_post_reports.status as report_status,
    board_post_reports.created_at as reported_at
  from public.board_post_reports
  inner join public.board_posts
    on board_posts.id = board_post_reports.post_id
  inner join public.boards as child_boards
    on child_boards.id = board_posts.board_id
  inner join public.board_types as child_board_types
    on child_board_types.id = child_boards.board_type_id
  left join public.profiles
    on profiles.id = board_posts.author_user_id
  where child_boards.base_id = v_base_id
    and child_boards.parent_board_id = v_parent_board_id
    and child_boards.status = 'active'
    and child_boards.visibility = 'open_verified'
    and child_boards.discoverability = 'visible'
    and child_board_types.key = 'hub_channel'
    and child_board_types.is_active = true
    and board_posts.visibility = 'board'
    and board_post_reports.status in ('open', 'reviewing')
  order by board_post_reports.created_at asc, board_post_reports.id asc
  limit v_limit;
end;
$$;

create or replace function public.moderate_open_hub_channel_post(
  p_base_code text,
  p_channel_slug text,
  p_post_id uuid,
  p_action text,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_base_code text := coalesce(upper(trim(p_base_code)), '');
  v_parent_slug text := lower(v_base_code);
  v_channel_slug text := coalesce(lower(trim(p_channel_slug)), '');
  v_action text := lower(trim(coalesce(p_action, '')));
  v_reason text := trim(coalesce(p_reason, ''));
  v_base_id uuid;
  v_parent_board_id uuid;
  v_channel_board_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  if not public.is_operator_with_scope('operator.community_moderation') then
    raise exception 'Operator moderation scope required'
      using errcode = '42501';
  end if;

  if v_channel_slug = '' then
    raise exception 'Channel is required'
      using errcode = '22023';
  end if;

  if p_post_id is null then
    raise exception 'Post is required'
      using errcode = '22023';
  end if;

  if v_action not in ('hide', 'remove') then
    raise exception 'Unsupported moderation action'
      using errcode = '22023';
  end if;

  if char_length(v_reason) = 0 then
    raise exception 'Moderation reason is required'
      using errcode = '22023';
  end if;

  if char_length(v_reason) > 1000 then
    raise exception 'Moderation reason is too long'
      using errcode = '22023';
  end if;

  select bases.id
  into v_base_id
  from public.bases
  where bases.code = v_base_code
    and bases.status = 'active'
  limit 1;

  if v_base_id is null then
    raise exception 'Active base not found'
      using errcode = 'P0002';
  end if;

  select parent_boards.id
  into v_parent_board_id
  from public.boards as parent_boards
  inner join public.board_types as parent_board_types
    on parent_board_types.id = parent_boards.board_type_id
  where parent_boards.base_id = v_base_id
    and parent_boards.slug = v_parent_slug
    and parent_boards.status = 'active'
    and parent_board_types.key = 'base_board'
    and parent_board_types.is_active = true
  limit 1;

  if v_parent_board_id is null then
    raise exception 'Active parent base board not found'
      using errcode = 'P0002';
  end if;

  select child_boards.id
  into v_channel_board_id
  from public.boards as child_boards
  inner join public.board_types as child_board_types
    on child_board_types.id = child_boards.board_type_id
  where child_boards.base_id = v_base_id
    and child_boards.parent_board_id = v_parent_board_id
    and child_boards.slug = v_channel_slug
    and child_boards.status = 'active'
    and child_boards.visibility = 'open_verified'
    and child_boards.discoverability = 'visible'
    and child_board_types.key = 'hub_channel'
    and child_board_types.is_active = true
  limit 1;

  if v_channel_board_id is null then
    raise exception 'Active visible Hub Channel not found'
      using errcode = 'P0002';
  end if;

  update public.board_posts
  set
    status = case when v_action = 'hide' then 'hidden' else 'removed' end,
    removed_at = now(),
    removed_by = v_user_id,
    removal_reason = v_reason
  where board_posts.id = p_post_id
    and board_posts.board_id = v_channel_board_id;

  if not found then
    raise exception 'Hub Channel post not found'
      using errcode = 'P0002';
  end if;

  update public.board_post_reports
  set
    status = 'resolved',
    reviewed_at = now(),
    reviewed_by = v_user_id,
    resolution_note = v_reason
  where board_post_reports.post_id = p_post_id
    and board_post_reports.status in ('open', 'reviewing');

  return p_post_id;
end;
$$;

revoke all on function public.report_open_hub_channel_post(text, text, uuid, text, text) from public;
revoke execute on function public.report_open_hub_channel_post(text, text, uuid, text, text) from anon;
grant execute on function public.report_open_hub_channel_post(text, text, uuid, text, text) to authenticated;
grant execute on function public.report_open_hub_channel_post(text, text, uuid, text, text) to service_role;

revoke all on function public.list_open_hub_channel_post_reports(text, integer) from public;
revoke execute on function public.list_open_hub_channel_post_reports(text, integer) from anon;
grant execute on function public.list_open_hub_channel_post_reports(text, integer) to authenticated;
grant execute on function public.list_open_hub_channel_post_reports(text, integer) to service_role;

revoke all on function public.moderate_open_hub_channel_post(text, text, uuid, text, text) from public;
revoke execute on function public.moderate_open_hub_channel_post(text, text, uuid, text, text) from anon;
grant execute on function public.moderate_open_hub_channel_post(text, text, uuid, text, text) to authenticated;
grant execute on function public.moderate_open_hub_channel_post(text, text, uuid, text, text) to service_role;

comment on function public.report_open_hub_channel_post(text, text, uuid, text, text) is 'Reports a published board-visible post inside an active visible DFW Hub Channel. Reuses board_post_reports, requires authenticated open-board read eligibility, returns only report id plus safe result status, handles duplicate open/reviewing reports safely, and exposes no reporter identity, author ids, verification data, storage paths, signed URLs, comments, report counts, or moderation internals.';
comment on function public.list_open_hub_channel_post_reports(text, integer) is 'Operator-scoped DFW Hub Channel report review list. Requires operator.community_moderation, returns open/reviewing reports with safe channel/post review fields only, and does not expose reporter identity, author user ids, verification data, storage paths, signed URLs, or private identity fields.';
comment on function public.moderate_open_hub_channel_post(text, text, uuid, text, text) is 'Operator-scoped hide/remove RPC for active visible DFW Hub Channel posts. Requires operator.community_moderation, updates board_posts lifecycle fields, resolves open/reviewing reports, and does not implement comments, AI decisions, account bans, appeals, public moderation feeds, or public reporter identity.';
