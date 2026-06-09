revoke execute on function public.set_user_home_base(text) from anon;
revoke execute on function public.get_current_user_home_base() from anon;
revoke execute on function public.list_current_user_board_follows() from anon;

revoke execute on function public.set_user_home_base(text) from public;
revoke execute on function public.get_current_user_home_base() from public;
revoke execute on function public.list_current_user_board_follows() from public;

grant execute on function public.set_user_home_base(text) to authenticated;
grant execute on function public.get_current_user_home_base() to authenticated;
grant execute on function public.list_current_user_board_follows() to authenticated;

grant execute on function public.set_user_home_base(text) to service_role;
grant execute on function public.get_current_user_home_base() to service_role;
grant execute on function public.list_current_user_board_follows() to service_role;

comment on function public.set_user_home_base(text) is 'Sets the authenticated user Home Base by active base code and ensures the matching active Base Board is followed. This does not grant restricted-board access. The function enforces auth.uid() internally, and anon execute is revoked for least privilege.';
comment on function public.get_current_user_home_base() is 'Returns the authenticated user Home Base preference with base metadata. This is personalization state, not authorization truth. The function enforces auth.uid() internally, and anon execute is revoked for least privilege.';
comment on function public.list_current_user_board_follows() is 'Returns followed board metadata for the authenticated user. Follows do not grant restricted-board access. The function enforces auth.uid() internally, and anon execute is revoked for least privilege.';
