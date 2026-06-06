create table public.work_email_confirmation_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  verification_request_id uuid not null references public.verification_requests (id) on delete cascade,
  email_domain text not null,
  email_hash text not null,
  token_hash text not null unique,
  status text not null default 'active',
  sent_at timestamptz,
  used_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint work_email_confirmation_tokens_domain_lowercase check (email_domain = lower(email_domain)),
  constraint work_email_confirmation_tokens_status_check check (
    status in ('active', 'used', 'expired', 'revoked')
  ),
  constraint work_email_confirmation_tokens_hash_check check (
    length(email_hash) >= 32
    and length(token_hash) >= 32
  ),
  constraint work_email_confirmation_tokens_used_state_check check (
    (
      status = 'used'
      and used_at is not null
    )
    or (
      status <> 'used'
      and used_at is null
    )
  )
);

create index work_email_confirmation_tokens_user_created_idx
on public.work_email_confirmation_tokens (user_id, created_at desc);

create index work_email_confirmation_tokens_request_status_idx
on public.work_email_confirmation_tokens (verification_request_id, status, created_at desc);

create index work_email_confirmation_tokens_active_expiry_idx
on public.work_email_confirmation_tokens (expires_at)
where status = 'active';

alter table public.work_email_confirmation_tokens enable row level security;

revoke all on public.work_email_confirmation_tokens from anon, authenticated;

comment on table public.work_email_confirmation_tokens is 'Hashed token lifecycle for confirming control of an approved airline employee email. Plaintext tokens and full work emails are not stored.';
comment on column public.work_email_confirmation_tokens.email_hash is 'Server-generated hash of the normalized work email for non-reversible correlation. Do not store the raw work email here.';
comment on column public.work_email_confirmation_tokens.token_hash is 'Server-generated hash of the confirmation token. Plaintext confirmation tokens are not stored.';

create trigger set_work_email_confirmation_tokens_updated_at
before update on public.work_email_confirmation_tokens
for each row
execute function public.set_verification_updated_at();

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
    'beta_invite.batch_created',
    'beta_invite.code_redeemed',
    'beta_invite.redemption_failed',
    'beta_access.granted_from_invite',
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
    'work_email_verification.email_send_requested',
    'work_email_verification.email_sent',
    'work_email_verification.email_send_failed',
    'work_email_verification.confirmed',
    'work_email_verification.confirm_failed',
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
    'proof_cleanup.monitor_unauthorized_attempt',
    'proof_cleanup.manual_requested',
    'proof_cleanup.manual_completed',
    'proof_cleanup.manual_denied',
    'proof_cleanup.manual_failed'
  )
);

create or replace function public.create_work_email_confirmation_token_for_user(
  requested_verification_request_id uuid,
  requested_email_domain text,
  requested_email_hash text,
  requested_token_hash text,
  requested_expires_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_domain text := lower(btrim(coalesce(requested_email_domain, '')));
  v_token_id uuid;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'authenticated_user_required', 'token_id', null);
  end if;

  if requested_verification_request_id is null
    or v_domain = ''
    or nullif(btrim(coalesce(requested_email_hash, '')), '') is null
    or nullif(btrim(coalesce(requested_token_hash, '')), '') is null
    or requested_expires_at <= now()
  then
    return jsonb_build_object('ok', false, 'code', 'invalid_token_request', 'token_id', null);
  end if;

  if not exists (
    select 1
    from public.verification_requests request
    join public.verification_evidence evidence
      on evidence.request_id = request.id
     and evidence.user_id = request.user_id
     and evidence.evidence_type = 'work_email'
    join public.approved_email_domains domain
      on domain.domain = v_domain
     and domain.status = 'active'
    where request.id = requested_verification_request_id
      and request.user_id = v_user_id
      and request.method = 'work_email'
      and request.status in ('submitted', 'pending_review', 'needs_resubmission')
      and evidence.status in ('submitted', 'pending')
      and evidence.metadata->>'email_domain' = v_domain
      and evidence.metadata->>'support_result' = 'supported_domain'
      and evidence.metadata->>'verification_method' = 'work_email'
  ) then
    return jsonb_build_object('ok', false, 'code', 'verification_request_not_confirmable', 'token_id', null);
  end if;

  update public.work_email_confirmation_tokens
  set status = 'revoked',
      updated_at = now()
  where user_id = v_user_id
    and verification_request_id = requested_verification_request_id
    and status = 'active';

  insert into public.work_email_confirmation_tokens (
    user_id,
    verification_request_id,
    email_domain,
    email_hash,
    token_hash,
    status,
    expires_at
  )
  values (
    v_user_id,
    requested_verification_request_id,
    v_domain,
    btrim(requested_email_hash),
    btrim(requested_token_hash),
    'active',
    requested_expires_at
  )
  returning id into v_token_id;

  return jsonb_build_object('ok', true, 'code', 'token_created', 'token_id', v_token_id);
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'code', 'token_collision', 'token_id', null);
end;
$$;

create or replace function public.mark_work_email_confirmation_token_sent_for_user(
  requested_token_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'authenticated_user_required');
  end if;

  update public.work_email_confirmation_tokens
  set sent_at = now(),
      updated_at = now()
  where id = requested_token_id
    and user_id = v_user_id
    and status = 'active'
    and sent_at is null
    and expires_at > now();

  if not found then
    return jsonb_build_object('ok', false, 'code', 'token_not_active');
  end if;

  return jsonb_build_object('ok', true, 'code', 'token_sent');
end;
$$;

create or replace function public.revoke_work_email_confirmation_token_for_user(
  requested_token_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'authenticated_user_required');
  end if;

  update public.work_email_confirmation_tokens
  set status = 'revoked',
      updated_at = now()
  where id = requested_token_id
    and user_id = v_user_id
    and status = 'active';

  return jsonb_build_object('ok', true, 'code', 'token_revoked');
end;
$$;

create or replace function public.confirm_work_email_confirmation_token_for_user(
  requested_token_id uuid,
  requested_token_hash text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_token public.work_email_confirmation_tokens%rowtype;
  v_domain_active boolean;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'authenticated_user_required');
  end if;

  select *
  into v_token
  from public.work_email_confirmation_tokens
  where id = requested_token_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_token');
  end if;

  if v_token.user_id <> v_user_id then
    return jsonb_build_object('ok', false, 'code', 'wrong_user');
  end if;

  if v_token.status = 'used' then
    return jsonb_build_object('ok', false, 'code', 'already_used');
  end if;

  if v_token.status <> 'active' then
    return jsonb_build_object('ok', false, 'code', 'invalid_token');
  end if;

  if v_token.expires_at <= now() then
    update public.work_email_confirmation_tokens
    set status = 'expired',
        updated_at = now()
    where id = v_token.id;

    return jsonb_build_object('ok', false, 'code', 'expired_token');
  end if;

  if v_token.token_hash <> btrim(coalesce(requested_token_hash, '')) then
    return jsonb_build_object('ok', false, 'code', 'invalid_token');
  end if;

  select exists (
    select 1
    from public.verification_requests request
    join public.verification_evidence evidence
      on evidence.request_id = request.id
     and evidence.user_id = request.user_id
     and evidence.evidence_type = 'work_email'
    join public.approved_email_domains domain
      on domain.domain = v_token.email_domain
     and domain.status = 'active'
    where request.id = v_token.verification_request_id
      and request.user_id = v_user_id
      and request.method = 'work_email'
      and request.status in ('submitted', 'pending_review', 'needs_resubmission')
      and evidence.status in ('submitted', 'pending')
      and evidence.metadata->>'email_domain' = v_token.email_domain
      and evidence.metadata->>'support_result' = 'supported_domain'
      and evidence.metadata->>'verification_method' = 'work_email'
  ) into v_domain_active;

  if not v_domain_active then
    return jsonb_build_object('ok', false, 'code', 'verification_request_not_confirmable');
  end if;

  update public.work_email_confirmation_tokens
  set status = 'used',
      used_at = now(),
      updated_at = now()
  where id = v_token.id;

  update public.verification_requests
  set status = 'approved',
      reviewed_at = now(),
      reason = 'airline_employee_email_confirmed',
      updated_at = now()
  where id = v_token.verification_request_id
    and user_id = v_user_id;

  update public.verification_evidence
  set status = 'accepted',
      metadata = metadata || jsonb_build_object(
        'confirmation_source', 'work_email_confirmation_link',
        'confirmed_at', now()
      ),
      updated_at = now()
  where request_id = v_token.verification_request_id
    and user_id = v_user_id
    and evidence_type = 'work_email';

  return jsonb_build_object(
    'ok', true,
    'code', 'confirmed',
    'verification_request_id', v_token.verification_request_id,
    'email_domain', v_token.email_domain
  );
end;
$$;

grant execute on function public.create_work_email_confirmation_token_for_user(uuid, text, text, text, timestamptz) to authenticated;
grant execute on function public.mark_work_email_confirmation_token_sent_for_user(uuid) to authenticated;
grant execute on function public.revoke_work_email_confirmation_token_for_user(uuid) to authenticated;
grant execute on function public.confirm_work_email_confirmation_token_for_user(uuid, text) to authenticated;
