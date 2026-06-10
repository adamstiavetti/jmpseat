create or replace function public.get_open_baseboard_post(
  p_base_code text,
  p_post_id uuid
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
  v_base_id uuid;
  v_board_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  if p_post_id is null then
    raise exception 'Post is required'
      using errcode = '22023';
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
  where board_posts.id = p_post_id
    and board_posts.board_id = v_board_id
    and board_posts.status = 'published'
    and board_posts.visibility = 'board'
  limit 1;
end;
$$;

revoke all on function public.get_open_baseboard_post(text, uuid) from public;
revoke execute on function public.get_open_baseboard_post(text, uuid) from anon;
grant execute on function public.get_open_baseboard_post(text, uuid) to authenticated;
grant execute on function public.get_open_baseboard_post(text, uuid) to service_role;

comment on function public.get_open_baseboard_post(text, uuid) is 'Read-only detail lookup for one published board-visible post on an active open verified Baseboard by active base code. Requires DB-level open-board read eligibility and returns safe fields only, including profiles.handle as author_label with jmpseat member fallback. Does not expose author ids, emails, claimed profile fields, verification evidence, report data, proof storage data, signed URLs, comments, saves, reactions, search, public sharing, lounge posting, seeded content, or proof-upload scope.';
