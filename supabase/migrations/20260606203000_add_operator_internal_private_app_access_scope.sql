create or replace function public.operator_scope_values()
returns text[]
language sql
immutable
as $$
  select array[
    'operator.internal_private_app_access',
    'operator.read_audit',
    'operator.manage_approved_domains',
    'operator.manage_reviewer_scopes',
    'operator.read_verification_requests',
    'operator.monitor_proof_cleanup',
    'operator.run_proof_cleanup',
    'operator.manage_operator_access',
    'operator.manage_beta_invites'
  ]::text[];
$$;
