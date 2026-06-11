create or replace function public.list_open_baseboard_post_reports(
  p_base_code text,
  p_limit integer default 50
)
returns table (
  report_id uuid,
  post_id uuid,
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
  v_base_id uuid;
  v_board_id uuid;
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
    raise exception 'Active open verified base board not found'
      using errcode = 'P0002';
  end if;

  return query
  select
    board_post_reports.id as report_id,
    board_posts.id as post_id,
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
  left join public.profiles
    on profiles.id = board_posts.author_user_id
  where board_posts.board_id = v_board_id
    and board_posts.visibility = 'board'
    and board_post_reports.status in ('open', 'reviewing')
  order by board_post_reports.created_at asc, board_post_reports.id asc
  limit v_limit;
end;
$$;

revoke all on function public.list_open_baseboard_post_reports(text, integer) from public;
revoke execute on function public.list_open_baseboard_post_reports(text, integer) from anon;
grant execute on function public.list_open_baseboard_post_reports(text, integer) to authenticated;
grant execute on function public.list_open_baseboard_post_reports(text, integer) to service_role;

comment on function public.list_open_baseboard_post_reports(text, integer) is 'Operator-scoped DFW/Baseboard report review list. Requires operator.community_moderation, resolves an active open verified Baseboard by base code, returns open/reviewing reports with safe post review fields only, and does not expose reporter identity or sensitive private data.';
