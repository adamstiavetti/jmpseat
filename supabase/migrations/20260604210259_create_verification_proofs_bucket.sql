insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'verification-proofs',
  'verification-proofs',
  false,
  5242880,
  array['image/jpeg', 'image/png']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Authenticated users can upload verification proofs to their own prefix"
on storage.objects;

create policy "Authenticated users can upload verification proofs to their own prefix"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'verification-proofs'
  and auth.uid() is not null
  and name ~ (
    '^'
    || auth.uid()::text
    || '/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}[.](jpg|jpeg|png)$'
  )
);

drop policy if exists "Authenticated users can delete their own verification proofs for rollback"
on storage.objects;

create policy "Authenticated users can delete their own verification proofs for rollback"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'verification-proofs'
  and auth.uid() is not null
  and name ~ (
    '^'
    || auth.uid()::text
    || '/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}[.](jpg|jpeg|png)$'
  )
  and not exists (
    select 1
    from public.verification_evidence
    where verification_evidence.user_id = auth.uid()
      and verification_evidence.storage_bucket = bucket_id
      and verification_evidence.storage_path = name
      and verification_evidence.deleted_at is null
  )
);

create or replace function public.create_redacted_proof_verification_submission(
  p_request_id uuid,
  p_evidence_id uuid,
  p_storage_bucket text,
  p_storage_path text,
  p_file_size_bytes bigint,
  p_mime_type text,
  p_original_extension text,
  p_upload_client text default 'web',
  p_redaction_acknowledged boolean default true,
  p_submitted_at timestamptz default now(),
  p_delete_after timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_submitted_at timestamptz := coalesce(p_submitted_at, now());
  v_delete_after timestamptz := coalesce(
    p_delete_after,
    coalesce(p_submitted_at, now()) + interval '30 days'
  );
  v_upload_client text := coalesce(nullif(trim(p_upload_client), ''), 'web');
  v_original_extension text := lower(trim(coalesce(p_original_extension, '')));
begin
  if v_user_id is null then
    raise exception 'Authentication required for redacted proof submission.';
  end if;

  if p_request_id is null or p_evidence_id is null then
    raise exception 'Request and evidence identifiers are required.';
  end if;

  if p_storage_bucket <> 'verification-proofs' then
    raise exception 'Invalid verification proof bucket.';
  end if;

  if p_storage_path is null or p_storage_path !~ (
    '^'
    || v_user_id::text
    || '/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}[.](jpg|jpeg|png)$'
  ) then
    raise exception 'Invalid verification proof storage path.';
  end if;

  if p_file_size_bytes is null or p_file_size_bytes <= 0 or p_file_size_bytes > 5242880 then
    raise exception 'Verification proof file size is out of bounds.';
  end if;

  if p_mime_type not in ('image/jpeg', 'image/png') then
    raise exception 'Verification proof mime type is not allowed.';
  end if;

  if v_original_extension not in ('jpg', 'jpeg', 'png') then
    raise exception 'Verification proof extension is not allowed.';
  end if;

  if not coalesce(p_redaction_acknowledged, false) then
    raise exception 'Redaction acknowledgement is required.';
  end if;

  if v_delete_after <= v_submitted_at then
    raise exception 'Verification proof delete_after must be after submitted_at.';
  end if;

  if exists (
    select 1
    from public.verification_requests
    where user_id = v_user_id
      and method = 'redacted_badge_or_proof'
      and status in ('submitted', 'pending_review', 'needs_resubmission')
  ) then
    raise exception 'An active redacted proof verification request already exists.';
  end if;

  insert into public.verification_requests (
    id,
    user_id,
    status,
    requested_claim_types,
    method,
    submitted_at
  )
  values (
    p_request_id,
    v_user_id,
    'submitted',
    array['airline_worker']::text[],
    'redacted_badge_or_proof',
    v_submitted_at
  );

  insert into public.verification_evidence (
    id,
    request_id,
    user_id,
    evidence_type,
    storage_bucket,
    storage_path,
    redaction_acknowledged,
    status,
    uploaded_at,
    delete_after,
    metadata
  )
  values (
    p_evidence_id,
    p_request_id,
    v_user_id,
    'redacted_badge_or_proof',
    p_storage_bucket,
    p_storage_path,
    true,
    'submitted',
    v_submitted_at,
    v_delete_after,
    jsonb_build_object(
      'file_size_bytes', p_file_size_bytes,
      'mime_type', p_mime_type,
      'original_extension', v_original_extension,
      'upload_client', v_upload_client,
      'redaction_acknowledged', true,
      'evidence_method', 'redacted_badge_or_proof'
    )
  );

  return jsonb_build_object(
    'request_id', p_request_id,
    'evidence_id', p_evidence_id,
    'request_status', 'submitted',
    'evidence_status', 'submitted'
  );
end;
$$;

revoke all on function public.create_redacted_proof_verification_submission(
  uuid,
  uuid,
  text,
  text,
  bigint,
  text,
  text,
  text,
  boolean,
  timestamptz,
  timestamptz
) from public;

grant execute on function public.create_redacted_proof_verification_submission(
  uuid,
  uuid,
  text,
  text,
  bigint,
  text,
  text,
  text,
  boolean,
  timestamptz,
  timestamptz
) to authenticated;

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
    'verification_review.approved',
    'verification_review.rejected',
    'verification_review.needs_resubmission',
    'verification_review.unauthorized_attempt',
    'verification_review.self_review_blocked',
    'verification_claim.issued'
  )
);
