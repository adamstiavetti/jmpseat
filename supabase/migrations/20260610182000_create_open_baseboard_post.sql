create or replace function public.create_open_baseboard_post(
  p_base_code text,
  p_title text,
  p_body text,
  p_content_type text default 'note',
  p_category text default 'general'
)
returns uuid
language plpgsql
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

  return public.create_board_post(
    v_board_id,
    p_title,
    p_body,
    p_content_type,
    p_category
  );
end;
$$;

revoke all on function public.create_open_baseboard_post(text, text, text, text, text) from public;
revoke execute on function public.create_open_baseboard_post(text, text, text, text, text) from anon;
grant execute on function public.create_open_baseboard_post(text, text, text, text, text) to authenticated;
grant execute on function public.create_open_baseboard_post(text, text, text, text, text) to service_role;

comment on function public.create_open_baseboard_post(text, text, text, text, text) is 'T15 minimal DFW/Baseboard post wrapper. Resolves an active base code to an active open verified Baseboard and delegates creation to public.create_board_post, preserving T13 DB-level contribution eligibility and safe forced post fields. Returns only the created post UUID and does not expose board metadata or sensitive user details.';
