create or replace function public.can_review_verification_request(
  actor_id uuid,
  request_owner_id uuid,
  request_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    (
      actor_id is not null
      and actor_id <> request_owner_id
      and exists (
        select 1
        from public.verification_reviewer_scopes
        where reviewer_id = actor_id
          and status = 'active'
          and scope_type = 'global'
      )
    )
    or (
      actor_id is not null
      and actor_id <> request_owner_id
      and exists (
        select 1
        from public.verification_evidence
        where request_id = can_review_verification_request.request_id
          and public.has_matching_verification_reviewer_scope(
            actor_id,
            coalesce(
              metadata ->> 'airline',
              metadata ->> 'requested_airline'
            ),
            metadata ->> 'role',
            metadata ->> 'base'
          )
      )
    );
$$;
