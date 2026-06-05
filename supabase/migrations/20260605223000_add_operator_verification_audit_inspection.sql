alter table public.security_events
drop constraint if exists security_events_event_type_check;

alter table public.security_events
add constraint security_events_event_type_check check (
  event_type in (
    'auth.sign_in_attempt',
    'auth.sign_in_success',
    'auth.sign_in_failed',
    'auth.sign_up_attempt',
    'auth.sign_up_success',
    'auth.sign_up_failed',
    'auth.password_reset_requested',
    'auth.password_reset_request_failed',
    'auth.callback_resolved',
    'private_access.redirect_login',
    'private_access.redirect_profile',
    'private_access.redirect_access_hold',
    'private_access.allowed',
    'private_access.storage_not_ready',
    'profile.upsert_attempt',
    'profile.upsert_success',
    'profile.upsert_failed',
    'beta_access.checked',
    'verification_request.submitted',
    'verification_request.unsupported_domain',
    'verification_request.invalid_work_email',
    'verification_request.duplicate_active',
    'verification_evidence.created',
    'verification_evidence.uploaded',
    'verification_evidence.view_requested',
    'verification_evidence.view_granted',
    'verification_evidence.view_denied',
    'verification_evidence.deletion_scheduled',
    'verification_evidence.deleted',
    'verification_evidence.deletion_failed',
    'verification_review.approved',
    'verification_review.rejected',
    'verification_review.needs_resubmission',
    'verification_review.unauthorized_attempt',
    'verification_review.self_review_blocked',
    'verification_claim.issued',
    'operator_access.granted',
    'operator_access.revoked',
    'operator_access.unauthorized_attempt',
    'approved_email_domain.created',
    'approved_email_domain.updated',
    'approved_email_domain.disabled',
    'approved_email_domain.unauthorized_attempt',
    'reviewer_scope.granted',
    'reviewer_scope.revoked',
    'reviewer_scope.unauthorized_attempt',
    'operator_audit.viewed',
    'operator_audit.unauthorized_attempt'
  )
);

create or replace function public.operator_audit_metadata_key_sensitive(metadata_key text)
returns boolean
language sql
immutable
as $$
  select lower(btrim(coalesce(metadata_key, ''))) ~
    '(password|authorization|cookie|session|magic_link|secret|service_role|token|access_token|refresh_token|api_key|signed_url|public_url|(^|_)url$|proof_view|proof_text|proof_content|proof_contents|proof_file_contents|proof_body|proof_data|raw_proof|raw_proof_text|raw_proof_contents|extracted_text|ocr_text|storage_path|storage_bucket|(^|_)path$|filename|file_name|original_filename|proof_filename|employee|badge|barcode|qr|ocr|raw_|work_email|local_part)';
$$;

create or replace function public.sanitize_operator_audit_metadata(input_metadata jsonb)
returns jsonb
language sql
immutable
as $$
  select case jsonb_typeof(coalesce(input_metadata, '{}'::jsonb))
    when 'object' then
      coalesce(
        (
          select jsonb_object_agg(
            key,
            public.sanitize_operator_audit_metadata(value)
          )
          from jsonb_each(coalesce(input_metadata, '{}'::jsonb))
          where not public.operator_audit_metadata_key_sensitive(key)
        ),
        '{}'::jsonb
      )
    when 'array' then
      coalesce(
        (
          select jsonb_agg(
            public.sanitize_operator_audit_metadata(value)
            order by array_entry.ordinality
          )
          from jsonb_array_elements(input_metadata)
            with ordinality as array_entry(value, ordinality)
        ),
        '[]'::jsonb
      )
    else coalesce(input_metadata, '{}'::jsonb)
  end;
$$;

create or replace function public.list_verification_requests_for_operator(
  requested_status text default null,
  requested_method text default null,
  requested_limit integer default 25,
  requested_offset integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_limit integer := least(greatest(coalesce(requested_limit, 25), 1), 50);
  v_offset integer := greatest(coalesce(requested_offset, 0), 0);
  v_status text := nullif(lower(btrim(coalesce(requested_status, ''))), '');
  v_method text := nullif(lower(btrim(coalesce(requested_method, ''))), '');
begin
  if v_actor_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'authenticated_operator_required',
      'message', 'Authenticated operator required.',
      'verification_requests', jsonb_build_array()
    );
  end if;

  if not public.is_operator_with_scope('operator.read_verification_requests') then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'operator_audit.unauthorized_attempt',
      '/app/admin/audit',
      'denied',
      jsonb_build_object(
        'reason_code', 'missing_read_verification_requests_scope'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'missing_read_verification_requests_scope',
      'message', 'Operator is not authorized to inspect verification requests.',
      'verification_requests', jsonb_build_array()
    );
  end if;

  insert into public.security_events (user_id, event_type, route, result, metadata)
  values (
    v_actor_id,
    'operator_audit.viewed',
    '/app/admin/audit',
    'allowed',
    jsonb_build_object(
      'surface', 'verification_requests',
      'status_filter_present', v_status is not null,
      'method_filter_present', v_method is not null,
      'limit', v_limit,
      'offset', v_offset
    )
  );

  return jsonb_build_object(
    'ok', true,
    'code', 'verification_requests_listed',
    'verification_requests',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id', request_row.id,
              'user_id', request_row.user_id,
              'status', request_row.status,
              'method', request_row.method,
              'requested_claim_types', request_row.requested_claim_types,
              'submitted_at', request_row.submitted_at,
              'reviewed_at', request_row.reviewed_at,
              'reviewed_by', request_row.reviewed_by,
              'expires_at', request_row.expires_at,
              'created_at', request_row.created_at,
              'updated_at', request_row.updated_at,
              'evidence_count', (
                select count(*)
                from public.verification_evidence evidence_row
                where evidence_row.request_id = request_row.id
              ),
              'claim_count', (
                select count(*)
                from public.verification_claims claim_row
                where claim_row.request_id = request_row.id
              ),
              'review_action_count', (
                select count(*)
                from public.verification_review_actions action_row
                where action_row.request_id = request_row.id
              )
            )
            order by request_row.created_at desc
          )
          from (
            select *
            from public.verification_requests
            where (v_status is null or status = v_status)
              and (v_method is null or method = v_method)
            order by created_at desc
            limit v_limit
            offset v_offset
          ) request_row
        ),
        jsonb_build_array()
      )
  );
end;
$$;

create or replace function public.get_verification_request_audit_detail(
  target_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_request public.verification_requests%rowtype;
begin
  if v_actor_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'authenticated_operator_required',
      'message', 'Authenticated operator required.',
      'verification_request', null
    );
  end if;

  if not public.is_operator_with_scope('operator.read_verification_requests') then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'operator_audit.unauthorized_attempt',
      '/app/admin/audit',
      'denied',
      jsonb_build_object(
        'target_request_id', target_request_id,
        'reason_code', 'missing_read_verification_requests_scope'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'missing_read_verification_requests_scope',
      'message', 'Operator is not authorized to inspect verification requests.',
      'verification_request', null
    );
  end if;

  if target_request_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'target_request_required',
      'message', 'Verification request id required.',
      'verification_request', null
    );
  end if;

  select *
  into v_request
  from public.verification_requests
  where id = target_request_id;

  if not found then
    return jsonb_build_object(
      'ok', false,
      'code', 'target_request_not_found',
      'message', 'Verification request was not found.',
      'verification_request', null
    );
  end if;

  insert into public.security_events (user_id, event_type, route, result, metadata)
  values (
    v_actor_id,
    'operator_audit.viewed',
    '/app/admin/audit',
    'allowed',
    jsonb_build_object(
      'surface', 'verification_request_detail',
      'target_request_id', target_request_id
    )
  );

  return jsonb_build_object(
    'ok', true,
    'code', 'verification_request_detail_loaded',
    'verification_request',
      jsonb_build_object(
        'id', v_request.id,
        'user_id', v_request.user_id,
        'status', v_request.status,
        'method', v_request.method,
        'requested_claim_types', v_request.requested_claim_types,
        'submitted_at', v_request.submitted_at,
        'reviewed_at', v_request.reviewed_at,
        'reviewed_by', v_request.reviewed_by,
        'expires_at', v_request.expires_at,
        'created_at', v_request.created_at,
        'updated_at', v_request.updated_at,
        'evidence_count', (
          select count(*)
          from public.verification_evidence evidence_row
          where evidence_row.request_id = v_request.id
        ),
        'claim_count', (
          select count(*)
          from public.verification_claims claim_row
          where claim_row.request_id = v_request.id
        ),
        'review_action_count', (
          select count(*)
          from public.verification_review_actions action_row
          where action_row.request_id = v_request.id
        ),
        'evidence', coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'id', evidence_row.id,
                'evidence_type', evidence_row.evidence_type,
                'status', evidence_row.status,
                'uploaded_at', evidence_row.uploaded_at,
                'delete_after', evidence_row.delete_after,
                'deleted_at', evidence_row.deleted_at,
                'redaction_acknowledged', evidence_row.redaction_acknowledged,
                'proof_present', evidence_row.storage_path is not null and evidence_row.deleted_at is null,
                'metadata', public.sanitize_operator_audit_metadata(evidence_row.metadata)
              )
              order by evidence_row.created_at desc
            )
            from public.verification_evidence evidence_row
            where evidence_row.request_id = v_request.id
          ),
          jsonb_build_array()
        ),
        'claims', coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'id', claim_row.id,
                'claim_type', claim_row.claim_type,
                'claim_value', claim_row.claim_value,
                'status', claim_row.status,
                'verification_method', claim_row.verification_method,
                'confidence_level', claim_row.confidence_level,
                'approved_by', claim_row.approved_by,
                'approved_at', claim_row.approved_at,
                'expires_at', claim_row.expires_at,
                'revoked_at', claim_row.revoked_at,
                'created_at', claim_row.created_at
              )
              order by claim_row.created_at desc
            )
            from public.verification_claims claim_row
            where claim_row.request_id = v_request.id
          ),
          jsonb_build_array()
        ),
        'review_actions', coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'id', action_row.id,
                'reviewer_id', action_row.reviewer_id,
                'action', action_row.action,
                'created_at', action_row.created_at,
                'claim_id', action_row.claim_id,
                'notes_present', action_row.notes is not null and btrim(action_row.notes) <> ''
              )
              order by action_row.created_at desc
            )
            from public.verification_review_actions action_row
            where action_row.request_id = v_request.id
          ),
          jsonb_build_array()
        )
      )
  );
end;
$$;

create or replace function public.list_security_events_for_operator(
  requested_event_type text default null,
  requested_limit integer default 25,
  requested_offset integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_limit integer := least(greatest(coalesce(requested_limit, 25), 1), 50);
  v_offset integer := greatest(coalesce(requested_offset, 0), 0);
  v_event_type text := nullif(btrim(coalesce(requested_event_type, '')), '');
begin
  if v_actor_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'authenticated_operator_required',
      'message', 'Authenticated operator required.',
      'security_events', jsonb_build_array()
    );
  end if;

  if not public.is_operator_with_scope('operator.read_audit') then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'operator_audit.unauthorized_attempt',
      '/app/admin/audit',
      'denied',
      jsonb_build_object(
        'reason_code', 'missing_read_audit_scope'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'missing_read_audit_scope',
      'message', 'Operator is not authorized to inspect security events.',
      'security_events', jsonb_build_array()
    );
  end if;

  insert into public.security_events (user_id, event_type, route, result, metadata)
  values (
    v_actor_id,
    'operator_audit.viewed',
    '/app/admin/audit',
    'allowed',
    jsonb_build_object(
      'surface', 'security_events',
      'event_type_filter_present', v_event_type is not null,
      'limit', v_limit,
      'offset', v_offset
    )
  );

  return jsonb_build_object(
    'ok', true,
    'code', 'security_events_listed',
    'security_events',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'id', event_row.id,
              'user_id', event_row.user_id,
              'event_type', event_row.event_type,
              'route', event_row.route,
              'result', event_row.result,
              'metadata', public.sanitize_operator_audit_metadata(event_row.metadata),
              'created_at', event_row.created_at
            )
            order by event_row.created_at desc
          )
          from (
            select *
            from public.security_events
            where (v_event_type is null or event_type = v_event_type)
            order by created_at desc
            limit v_limit
            offset v_offset
          ) event_row
        ),
        jsonb_build_array()
      )
  );
end;
$$;

revoke execute on function public.operator_audit_metadata_key_sensitive(text) from public;
revoke execute on function public.sanitize_operator_audit_metadata(jsonb) from public;
revoke execute on function public.list_verification_requests_for_operator(text, text, integer, integer) from public;
revoke execute on function public.get_verification_request_audit_detail(uuid) from public;
revoke execute on function public.list_security_events_for_operator(text, integer, integer) from public;

grant execute on function public.list_verification_requests_for_operator(text, text, integer, integer) to authenticated;
grant execute on function public.get_verification_request_audit_detail(uuid) to authenticated;
grant execute on function public.list_security_events_for_operator(text, integer, integer) to authenticated;
