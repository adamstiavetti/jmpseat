alter table public.work_email_confirmation_tokens
add column failed_attempts integer not null default 0;

alter table public.work_email_confirmation_tokens
add column code_nonce text;

create extension if not exists pgcrypto with schema extensions;

alter table public.work_email_confirmation_tokens
add constraint work_email_confirmation_tokens_failed_attempts_check check (
  failed_attempts >= 0 and failed_attempts <= 5
);

alter table public.work_email_confirmation_tokens
add constraint work_email_confirmation_tokens_code_nonce_check check (
  code_nonce is null or length(code_nonce) >= 16
);

comment on column public.work_email_confirmation_tokens.failed_attempts is 'Bounded failed verification-code attempts for the active hashed work-email confirmation secret.';
comment on column public.work_email_confirmation_tokens.code_nonce is 'Row-specific nonce used only for six-digit work-email verification-code hashes. Legacy link-token rows keep this null.';

revoke execute on function public.create_work_email_confirmation_token_for_user(uuid, text, text, text, timestamptz) from public;
revoke execute on function public.create_work_email_confirmation_token_for_user(uuid, text, text, text, timestamptz) from anon;
revoke execute on function public.create_work_email_confirmation_token_for_user(uuid, text, text, text, timestamptz) from authenticated;

comment on function public.create_work_email_confirmation_token_for_user(uuid, text, text, text, timestamptz)
is 'Legacy link-token verifier creation is not normal-user callable. Work-email verifier creation is trusted-server-owned; authenticated clients may submit existing secrets but may not create verifier rows.';

create or replace function public.confirm_work_email_confirmation_code_for_user(
  requested_code text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  confirmation public.work_email_confirmation_tokens%rowtype;
  v_domain_active boolean;
  v_requested_code text := btrim(coalesce(requested_code, ''));
  v_requested_code_hash text;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'code', 'authenticated_user_required');
  end if;

  select *
  into confirmation
  from public.work_email_confirmation_tokens
  where user_id = v_user_id
    and status = 'active'
    and code_nonce is not null
  order by created_at desc
  limit 1
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_code');
  end if;

  if confirmation.expires_at <= now() then
    update public.work_email_confirmation_tokens
    set status = 'expired',
        updated_at = now()
    where id = confirmation.id;

    return jsonb_build_object('ok', false, 'code', 'expired_code');
  end if;

  if confirmation.failed_attempts >= 5 then
    update public.work_email_confirmation_tokens
    set status = 'revoked',
        updated_at = now()
    where id = confirmation.id;

    return jsonb_build_object('ok', false, 'code', 'too_many_attempts');
  end if;

  v_requested_code_hash := encode(
    extensions.digest(confirmation.code_nonce || ':' || v_requested_code, 'sha256'),
    'hex'
  );

  if confirmation.token_hash <> v_requested_code_hash then
    update public.work_email_confirmation_tokens
    set failed_attempts = confirmation.failed_attempts + 1,
        status = case
          when confirmation.failed_attempts + 1 >= 5 then 'revoked'
          else status
        end,
        updated_at = now()
    where id = confirmation.id;

    return jsonb_build_object(
      'ok', false,
      'code', case
        when confirmation.failed_attempts + 1 >= 5 then 'too_many_attempts'
        else 'invalid_code'
      end
    );
  end if;

  select exists (
    select 1
    from public.verification_requests request
    join public.verification_evidence evidence
      on evidence.request_id = request.id
     and evidence.user_id = request.user_id
     and evidence.evidence_type = 'work_email'
    join public.approved_email_domains domain
      on domain.domain = confirmation.email_domain
     and domain.status = 'active'
    where request.id = confirmation.verification_request_id
      and request.user_id = v_user_id
      and request.method = 'work_email'
      and request.status in ('submitted', 'pending_review', 'needs_resubmission')
      and evidence.status in ('submitted', 'pending')
      and evidence.metadata->>'email_domain' = confirmation.email_domain
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
  where id = confirmation.id;

  update public.verification_requests
  set status = 'approved',
      reviewed_at = now(),
      reason = 'airline_employee_email_confirmed',
      updated_at = now()
  where id = confirmation.verification_request_id
    and user_id = v_user_id;

  update public.verification_evidence
  set status = 'accepted',
      metadata = metadata || jsonb_build_object(
        'confirmation_source', 'work_email_confirmation_code',
        'confirmed_at', now()
      ),
      updated_at = now()
  where request_id = confirmation.verification_request_id
    and user_id = v_user_id
    and evidence_type = 'work_email';

  return jsonb_build_object(
    'ok', true,
    'code', 'confirmed',
    'verification_request_id', confirmation.verification_request_id,
    'email_domain', confirmation.email_domain
  );
end;
$$;

grant execute on function public.confirm_work_email_confirmation_code_for_user(text) to authenticated;
