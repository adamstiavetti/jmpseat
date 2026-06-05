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
    'operator_audit.unauthorized_attempt',
    'proof_cleanup.monitor_viewed',
    'proof_cleanup.monitor_unauthorized_attempt'
  )
);

create or replace function public.get_proof_cleanup_monitoring_summary()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
begin
  if v_actor_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'authenticated_operator_required',
      'message', 'Authenticated operator required.',
      'summary', null
    );
  end if;

  if not public.is_operator_with_scope('operator.monitor_proof_cleanup') then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'proof_cleanup.monitor_unauthorized_attempt',
      '/app/admin/proof-cleanup',
      'denied',
      jsonb_build_object(
        'reason_code', 'missing_monitor_proof_cleanup_scope'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'missing_monitor_proof_cleanup_scope',
      'message', 'Operator is not authorized to monitor proof cleanup.',
      'summary', null
    );
  end if;

  insert into public.security_events (user_id, event_type, route, result, metadata)
  values (
    v_actor_id,
    'proof_cleanup.monitor_viewed',
    '/app/admin/proof-cleanup',
    'allowed',
    jsonb_build_object('surface', 'proof_cleanup_summary')
  );

  return jsonb_build_object(
    'ok', true,
    'code', 'proof_cleanup_summary_loaded',
    'summary', jsonb_build_object(
      'scheduled_count', (
        select count(*)
        from public.verification_evidence evidence_row
        where evidence_row.evidence_type = 'redacted_badge_or_proof'
          and evidence_row.delete_after is not null
          and evidence_row.deleted_at is null
      ),
      'due_count', (
        select count(*)
        from public.verification_evidence evidence_row
        where evidence_row.evidence_type = 'redacted_badge_or_proof'
          and evidence_row.delete_after is not null
          and evidence_row.delete_after <= now()
          and evidence_row.deleted_at is null
      ),
      'overdue_count', (
        select count(*)
        from public.verification_evidence evidence_row
        where evidence_row.evidence_type = 'redacted_badge_or_proof'
          and evidence_row.delete_after is not null
          and evidence_row.delete_after < now() - interval '24 hours'
          and evidence_row.deleted_at is null
      ),
      'deleted_count', (
        select count(*)
        from public.verification_evidence evidence_row
        where evidence_row.evidence_type = 'redacted_badge_or_proof'
          and evidence_row.deleted_at is not null
      ),
      'failed_event_count', (
        select count(*)
        from public.security_events event_row
        where event_row.event_type = 'verification_evidence.deletion_failed'
      ),
      'recent_failure_count', (
        select count(*)
        from public.security_events event_row
        where event_row.event_type = 'verification_evidence.deletion_failed'
          and event_row.created_at >= now() - interval '7 days'
      ),
      'last_cleanup_event_at', (
        select max(event_row.created_at)
        from public.security_events event_row
        where event_row.event_type in (
          'verification_evidence.deletion_scheduled',
          'verification_evidence.deleted',
          'verification_evidence.deletion_failed'
        )
      ),
      'last_failure_at', (
        select max(event_row.created_at)
        from public.security_events event_row
        where event_row.event_type = 'verification_evidence.deletion_failed'
      )
    )
  );
end;
$$;

create or replace function public.list_proof_cleanup_failures_for_operator(
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
begin
  if v_actor_id is null then
    return jsonb_build_object(
      'ok', false,
      'code', 'authenticated_operator_required',
      'message', 'Authenticated operator required.',
      'failures', jsonb_build_array()
    );
  end if;

  if not public.is_operator_with_scope('operator.monitor_proof_cleanup') then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'proof_cleanup.monitor_unauthorized_attempt',
      '/app/admin/proof-cleanup',
      'denied',
      jsonb_build_object(
        'reason_code', 'missing_monitor_proof_cleanup_scope',
        'surface', 'proof_cleanup_failures'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'missing_monitor_proof_cleanup_scope',
      'message', 'Operator is not authorized to monitor proof cleanup.',
      'failures', jsonb_build_array()
    );
  end if;

  insert into public.security_events (user_id, event_type, route, result, metadata)
  values (
    v_actor_id,
    'proof_cleanup.monitor_viewed',
    '/app/admin/proof-cleanup',
    'allowed',
    jsonb_build_object(
      'surface', 'proof_cleanup_failures',
      'limit', v_limit,
      'offset', v_offset
    )
  );

  return jsonb_build_object(
    'ok', true,
    'code', 'proof_cleanup_failures_listed',
    'failures',
      coalesce(
        (
          select jsonb_agg(
            jsonb_build_object(
              'event_id', failure_row.event_id,
              'verification_evidence_id', failure_row.verification_evidence_id,
              'verification_request_id', failure_row.verification_request_id,
              'evidence_status', evidence_row.status,
              'delete_after', evidence_row.delete_after,
              'deleted_at', evidence_row.deleted_at,
              'reason_code', failure_row.reason_code,
              'result', failure_row.result,
              'failed_at', failure_row.failed_at
            )
            order by failure_row.failed_at desc
          )
          from (
            select
              event_row.id as event_id,
              event_row.result,
              event_row.created_at as failed_at,
              case
                when coalesce(event_row.metadata ->> 'verification_evidence_id', '')
                  ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
                then (event_row.metadata ->> 'verification_evidence_id')::uuid
                else null
              end as verification_evidence_id,
              case
                when coalesce(event_row.metadata ->> 'verification_request_id', '')
                  ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
                then (event_row.metadata ->> 'verification_request_id')::uuid
                else null
              end as verification_request_id,
              nullif(event_row.metadata ->> 'reason_code', '') as reason_code
            from public.security_events event_row
            where event_row.event_type = 'verification_evidence.deletion_failed'
            order by event_row.created_at desc
            limit v_limit
            offset v_offset
          ) failure_row
          left join public.verification_evidence evidence_row
            on evidence_row.id = failure_row.verification_evidence_id
        ),
        jsonb_build_array()
      )
  );
end;
$$;

create or replace function public.list_proof_cleanup_events_for_operator(
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
      'events', jsonb_build_array()
    );
  end if;

  if not public.is_operator_with_scope('operator.monitor_proof_cleanup') then
    insert into public.security_events (user_id, event_type, route, result, metadata)
    values (
      v_actor_id,
      'proof_cleanup.monitor_unauthorized_attempt',
      '/app/admin/proof-cleanup',
      'denied',
      jsonb_build_object(
        'reason_code', 'missing_monitor_proof_cleanup_scope',
        'surface', 'proof_cleanup_events'
      )
    );

    return jsonb_build_object(
      'ok', false,
      'code', 'missing_monitor_proof_cleanup_scope',
      'message', 'Operator is not authorized to monitor proof cleanup.',
      'events', jsonb_build_array()
    );
  end if;

  if v_event_type is not null and v_event_type not in (
    'verification_evidence.deletion_scheduled',
    'verification_evidence.deleted',
    'verification_evidence.deletion_failed',
    'proof_cleanup.monitor_viewed',
    'proof_cleanup.monitor_unauthorized_attempt'
  ) then
    return jsonb_build_object(
      'ok', false,
      'code', 'invalid_cleanup_event_type',
      'message', 'Cleanup event filter is not supported.',
      'events', jsonb_build_array()
    );
  end if;

  insert into public.security_events (user_id, event_type, route, result, metadata)
  values (
    v_actor_id,
    'proof_cleanup.monitor_viewed',
    '/app/admin/proof-cleanup',
    'allowed',
    jsonb_build_object(
      'surface', 'proof_cleanup_events',
      'event_type_filter_present', v_event_type is not null,
      'limit', v_limit,
      'offset', v_offset
    )
  );

  return jsonb_build_object(
    'ok', true,
    'code', 'proof_cleanup_events_listed',
    'events',
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
            where event_type in (
                'verification_evidence.deletion_scheduled',
                'verification_evidence.deleted',
                'verification_evidence.deletion_failed',
                'proof_cleanup.monitor_viewed',
                'proof_cleanup.monitor_unauthorized_attempt'
              )
              and (v_event_type is null or event_type = v_event_type)
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

revoke execute on function public.get_proof_cleanup_monitoring_summary() from public;
revoke execute on function public.list_proof_cleanup_failures_for_operator(integer, integer) from public;
revoke execute on function public.list_proof_cleanup_events_for_operator(text, integer, integer) from public;

grant execute on function public.get_proof_cleanup_monitoring_summary() to authenticated;
grant execute on function public.list_proof_cleanup_failures_for_operator(integer, integer) to authenticated;
grant execute on function public.list_proof_cleanup_events_for_operator(text, integer, integer) to authenticated;
