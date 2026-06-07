create or replace function public.operator_audit_metadata_key_sensitive(metadata_key text)
returns boolean
language sql
immutable
as $$
  select lower(btrim(coalesce(metadata_key, ''))) ~
    '(password|authorization|cookie|session|magic_link|secret|service_role|token|access_token|refresh_token|api_key|signed_url|public_url|(^|_)url$|proof_view|proof_text|proof_content|proof_contents|proof_file_contents|proof_body|proof_data|raw_proof|raw_proof_text|raw_proof_contents|extracted_text|ocr_text|storage_path|storage_bucket|(^|_)path$|filename|file_name|original_filename|proof_filename|employee|badge|barcode|qr|ocr|raw_|work_email|local_part|^target_?user_?id$|^actor_?user_?id$|^user_?id$|(^|_)user_id$)';
$$;

create or replace function public.grant_operator_access(
  target_user_id uuid,
  requested_scopes text[],
  reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_now timestamptz := now();
  v_reason text := nullif(trim(coalesce(reason, '')), '');
  v_scopes text[] := public.normalize_operator_scopes(requested_scopes);
  v_grant_id uuid;
begin
  if v_actor_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'authenticated_operator_required',
      'operator_grant_id', null,
      'message', 'Authenticated operator required.'
    );
  end if;

  if not public.is_operator_with_scope('operator.manage_operator_access') then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'operator_access.unauthorized_attempt',
      '/app/admin',
      'denied',
      jsonb_build_object(
        'operator_access_flow', 'grant_management',
        'scope_names', coalesce(v_scopes, '{}'::text[]),
        'target_user_found', target_user_id is not null,
        'grant_created', false,
        'reason_code', 'missing_manage_operator_access_scope'
      )
    );
    return jsonb_build_object(
      'ok', false,
      'code', 'missing_manage_operator_access_scope',
      'operator_grant_id', null,
      'message', 'Operator is not authorized to manage operator access.'
    );
  end if;

  if target_user_id is null then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'operator_access.unauthorized_attempt',
      '/app/admin',
      'denied',
      jsonb_build_object(
        'operator_access_flow', 'grant_management',
        'scope_names', coalesce(v_scopes, '{}'::text[]),
        'target_user_found', false,
        'grant_created', false,
        'reason_code', 'target_user_required'
      )
    );
    return jsonb_build_object(
      'ok', false,
      'code', 'target_user_required',
      'operator_grant_id', null,
      'message', 'Target user id required.'
    );
  end if;

  if target_user_id = v_actor_id then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'operator_access.unauthorized_attempt',
      '/app/admin',
      'denied',
      jsonb_build_object(
        'operator_access_flow', 'grant_management',
        'scope_names', coalesce(v_scopes, '{}'::text[]),
        'target_user_found', true,
        'grant_created', false,
        'reason_code', 'self_grant_blocked'
      )
    );
    return jsonb_build_object(
      'ok', false,
      'code', 'self_grant_blocked',
      'operator_grant_id', null,
      'message', 'Operators cannot grant themselves operator access.'
    );
  end if;

  if not public.operator_scopes_are_valid(requested_scopes) then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'operator_access.unauthorized_attempt',
      '/app/admin',
      'denied',
      jsonb_build_object(
        'operator_access_flow', 'grant_management',
        'scope_names', coalesce(v_scopes, '{}'::text[]),
        'target_user_found', true,
        'grant_created', false,
        'reason_code', 'invalid_requested_scopes'
      )
    );
    return jsonb_build_object(
      'ok', false,
      'code', 'invalid_requested_scopes',
      'operator_grant_id', null,
      'message', 'Requested operator scopes are invalid.'
    );
  end if;

  if exists (
    select 1
    from public.operator_grants
    where user_id = target_user_id
      and status = 'active'
      and revoked_at is null
  ) then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'operator_access.unauthorized_attempt',
      '/app/admin',
      'denied',
      jsonb_build_object(
        'operator_access_flow', 'grant_management',
        'scope_names', v_scopes,
        'target_user_found', true,
        'target_already_had_active_grant', true,
        'grant_created', false,
        'reason_code', 'target_already_active'
      )
    );
    return jsonb_build_object(
      'ok', false,
      'code', 'target_already_active',
      'operator_grant_id', null,
      'message', 'Target user already has active operator access.'
    );
  end if;

  insert into public.operator_grants (
    user_id,
    scopes,
    status,
    created_by,
    reason
  )
  values (
    target_user_id,
    v_scopes,
    'active',
    v_actor_id,
    v_reason
  )
  returning id into v_grant_id;

  insert into public.security_events (user_id, event_type, route, result, metadata)
  values (
    v_actor_id,
    'operator_access.granted',
    '/app/admin',
    'granted',
    jsonb_build_object(
      'operator_access_flow', 'grant_management',
      'scope_names', v_scopes,
      'target_user_found', true,
      'target_already_had_active_grant', false,
      'grant_created', true,
      'reason_present', v_reason is not null,
      'granted_at', v_now
    )
  );

  return jsonb_build_object(
    'ok', true,
    'code', 'operator_access_granted',
    'operator_grant_id', v_grant_id,
    'scopes', v_scopes,
    'status', 'active',
    'message', null
  );
end;
$$;

create or replace function public.revoke_operator_access(
  target_user_id uuid,
  reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_now timestamptz := now();
  v_reason text := nullif(trim(coalesce(reason, '')), '');
  v_existing public.operator_grants%rowtype;
begin
  if v_actor_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'authenticated_operator_required',
      'operator_grant_id', null,
      'message', 'Authenticated operator required.'
    );
  end if;

  if not public.is_operator_with_scope('operator.manage_operator_access') then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'operator_access.unauthorized_attempt',
      '/app/admin',
      'denied',
      jsonb_build_object(
        'operator_access_flow', 'grant_management',
        'target_user_found', target_user_id is not null,
        'grant_revoked', false,
        'reason_code', 'missing_manage_operator_access_scope'
      )
    );
    return jsonb_build_object(
      'ok', false,
      'code', 'missing_manage_operator_access_scope',
      'operator_grant_id', null,
      'message', 'Operator is not authorized to manage operator access.'
    );
  end if;

  if target_user_id is null then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'operator_access.unauthorized_attempt',
      '/app/admin',
      'denied',
      jsonb_build_object(
        'operator_access_flow', 'grant_management',
        'target_user_found', false,
        'grant_revoked', false,
        'reason_code', 'target_user_required'
      )
    );
    return jsonb_build_object(
      'ok', false,
      'code', 'target_user_required',
      'operator_grant_id', null,
      'message', 'Target user id required.'
    );
  end if;

  if target_user_id = v_actor_id then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'operator_access.unauthorized_attempt',
      '/app/admin',
      'denied',
      jsonb_build_object(
        'operator_access_flow', 'grant_management',
        'target_user_found', true,
        'grant_revoked', false,
        'reason_code', 'self_revoke_blocked'
      )
    );
    return jsonb_build_object(
      'ok', false,
      'code', 'self_revoke_blocked',
      'operator_grant_id', null,
      'message', 'Operators cannot revoke their own operator access in this slice.'
    );
  end if;

  select *
  into v_existing
  from public.operator_grants
  where user_id = target_user_id
    and status = 'active'
    and revoked_at is null
  for update;

  if not found then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'operator_access.unauthorized_attempt',
      '/app/admin',
      'denied',
      jsonb_build_object(
        'operator_access_flow', 'grant_management',
        'target_user_found', true,
        'target_had_active_grant', false,
        'grant_revoked', false,
        'reason_code', 'target_not_active'
      )
    );
    return jsonb_build_object(
      'ok', false,
      'code', 'target_not_active',
      'operator_grant_id', null,
      'message', 'Target user does not have active operator access.'
    );
  end if;

  update public.operator_grants
  set
    status = 'revoked',
    revoked_by = v_actor_id,
    revoked_at = v_now,
    reason = v_reason
  where id = v_existing.id;

  insert into public.security_events (user_id, event_type, route, result, metadata)
  values (
    v_actor_id,
    'operator_access.revoked',
    '/app/admin',
    'revoked',
    jsonb_build_object(
      'operator_access_flow', 'grant_management',
      'scope_names', v_existing.scopes,
      'target_user_found', true,
      'target_had_active_grant', true,
      'grant_revoked', true,
      'reason_present', v_reason is not null,
      'revoked_at', v_now
    )
  );

  return jsonb_build_object(
    'ok', true,
    'code', 'operator_access_revoked',
    'operator_grant_id', v_existing.id,
    'scopes', v_existing.scopes,
    'status', 'revoked',
    'message', null
  );
end;
$$;

revoke all on function public.grant_operator_access(uuid, text[], text) from public;
grant execute on function public.grant_operator_access(uuid, text[], text) to authenticated;

revoke all on function public.revoke_operator_access(uuid, text) from public;
grant execute on function public.revoke_operator_access(uuid, text) to authenticated;
