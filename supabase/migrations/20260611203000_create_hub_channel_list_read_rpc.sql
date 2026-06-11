create or replace function public.list_open_hub_channels(
  p_base_code text
)
returns table (
  slug text,
  name text,
  short_name text,
  description text,
  sort_order integer
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
  into v_parent_board_id
  from public.boards
  inner join public.board_types
    on board_types.id = boards.board_type_id
  where boards.base_id = v_base_id
    and boards.slug = v_parent_slug
    and boards.status = 'active'
    and board_types.key = 'base_board'
    and board_types.is_active = true
  limit 1;

  if v_parent_board_id is null then
    return;
  end if;

  return query
  select
    child_boards.slug,
    child_boards.name,
    child_boards.short_name,
    child_boards.description,
    child_boards.sort_order
  from public.boards as child_boards
  inner join public.board_types as child_board_types
    on child_board_types.id = child_boards.board_type_id
  where child_boards.base_id = v_base_id
    and child_boards.parent_board_id = v_parent_board_id
    and child_boards.status = 'active'
    and child_boards.visibility = 'open_verified'
    and child_boards.discoverability = 'visible'
    and child_board_types.key = 'hub_channel'
    and child_board_types.is_active = true
  order by child_boards.sort_order, child_boards.name;
end;
$$;

revoke all on function public.list_open_hub_channels(text) from public;
revoke execute on function public.list_open_hub_channels(text) from anon;
grant execute on function public.list_open_hub_channels(text) to authenticated;
grant execute on function public.list_open_hub_channels(text) to service_role;

comment on function public.list_open_hub_channels(text) is 'Read-only Hub Channel metadata list for active open verified child boards by active base code. Requires the existing open-board read eligibility helper. Returns slug, name, short_name, description, and sort_order only; does not expose board ids, base ids, parent board ids, user ids, author ids, reporter identity, moderation fields, verification fields, storage paths, signed URLs, posts, comments, reports, or channel write behavior.';
