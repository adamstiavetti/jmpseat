import type { User } from "@supabase/supabase-js";

export const ADMIN_ROUTES = {
  home: "/app/admin",
  verification: "/app/admin/verification",
  operatorAccess: "/app/admin/operator-access",
  approvedDomains: "/app/admin/approved-domains",
  reviewerScopes: "/app/admin/reviewer-scopes",
  auditInspection: "/app/admin/audit",
  proofCleanup: "/app/admin/proof-cleanup",
} as const;

export const OPERATOR_GRANT_IMPLEMENTATION_STATUS = "implemented" as const;

export const OPERATOR_SCOPE_VALUES = [
  "operator.internal_private_app_access",
  "operator.read_audit",
  "operator.manage_approved_domains",
  "operator.manage_reviewer_scopes",
  "operator.read_verification_requests",
  "operator.monitor_proof_cleanup",
  "operator.run_proof_cleanup",
  "operator.manage_operator_access",
  "operator.manage_beta_invites",
] as const;

export type OperatorScope = (typeof OPERATOR_SCOPE_VALUES)[number];

export const OPERATOR_ACCESS_NOT_READY_MESSAGE =
  "Operator access is not ready yet. Apply the operator grants foundation migration to this Supabase project before using operator-only admin sections.";

export type CurrentOperatorAccess = {
  authConfigured: boolean;
  user: User | null;
  scopes: OperatorScope[];
  operatorGranted: boolean;
  loadError: string | null;
};

export type AdminNavigationItem = {
  key:
    | "verification_review"
    | "operator_access"
    | "approved_domains"
    | "reviewer_scopes"
    | "audit_inspection"
    | "proof_cleanup";
  label: string;
  path: string;
  description: string;
  status: "available" | "disabled";
  availabilityLabel: string;
  reason: string;
};

function isOperatorScope(value: string): value is OperatorScope {
  return (OPERATOR_SCOPE_VALUES as readonly string[]).includes(value);
}

export function filterOperatorScopes(scopes: readonly string[] | null | undefined) {
  return (scopes ?? []).filter(isOperatorScope);
}

export function isOperatorGrantActive(input: {
  status: string | null | undefined;
  revokedAt: string | null | undefined;
}) {
  return input.status === "active" && input.revokedAt == null;
}

export function getGrantedOperatorScopes(input: {
  scopes: readonly string[] | null | undefined;
  status: string | null | undefined;
  revokedAt: string | null | undefined;
}) {
  if (!isOperatorGrantActive(input)) {
    return [] as OperatorScope[];
  }

  return filterOperatorScopes(input.scopes);
}

export function hasOperatorScope(input: {
  scopes: readonly string[] | null | undefined;
  scope: OperatorScope;
}) {
  return filterOperatorScopes(input.scopes).includes(input.scope);
}

export function hasAnyOperatorScope(input: {
  scopes: readonly string[] | null | undefined;
  requiredScopes: readonly OperatorScope[];
}) {
  const grantedScopes = filterOperatorScopes(input.scopes);
  return input.requiredScopes.some((scope) => grantedScopes.includes(scope));
}

export async function getCurrentOperatorAccess(): Promise<CurrentOperatorAccess> {
  const [{ getSupabaseBrowserEnv }, { createClient }] = await Promise.all([
    import("../supabase/config"),
    import("../supabase/server"),
  ]);

  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    return {
      authConfigured: false,
      user: null,
      scopes: [],
      operatorGranted: false,
      loadError: null,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      authConfigured: true,
      user: null,
      scopes: [],
      operatorGranted: false,
      loadError: userError?.message ?? null,
    };
  }

  const scopesResult = await supabase.rpc("current_user_operator_scopes");

  if (scopesResult.error) {
    return {
      authConfigured: true,
      user,
      scopes: [],
      operatorGranted: false,
      loadError: OPERATOR_ACCESS_NOT_READY_MESSAGE,
    };
  }

  const scopes = filterOperatorScopes(
    Array.isArray(scopesResult.data) ? scopesResult.data : [],
  );

  return {
    authConfigured: true,
    user,
    scopes,
    operatorGranted: scopes.length > 0,
    loadError: null,
  };
}

export async function requireOperatorScope(scope: OperatorScope) {
  const access = await getCurrentOperatorAccess();

  if (!hasOperatorScope({ scopes: access.scopes, scope })) {
    throw new Error(`Operator scope required: ${scope}`);
  }

  return access;
}

function buildOperatorUnavailableItem(input: {
  key: AdminNavigationItem["key"];
  label: string;
  path: string;
  description: string;
  requiredScopes: readonly OperatorScope[];
  grantedScopes: readonly string[] | null | undefined;
}): AdminNavigationItem {
  const authorized = hasAnyOperatorScope({
    scopes: input.grantedScopes,
    requiredScopes: input.requiredScopes,
  });

  const requiredScopeLabel =
    input.requiredScopes.length === 1
      ? input.requiredScopes[0]
      : input.requiredScopes.join(" or ");

  return {
    ...input,
    status: "disabled",
    availabilityLabel: authorized
      ? "Authorized, not built yet"
      : "Requires operator scope",
    reason: authorized
      ? `Authorized by explicit active operator grant, but this route is not implemented yet. It remains unavailable until a later Epoch 05 ticket builds the tool.`
      : `Requires ${requiredScopeLabel}. Reviewer scope, beta access, verification claims, and profile text do not activate operator sections.`,
  };
}

function buildOperatorNavigationItem(input: {
  key: AdminNavigationItem["key"];
  label: string;
  path: string;
  description: string;
  requiredScopes: readonly OperatorScope[];
  grantedScopes: readonly string[] | null | undefined;
  implemented: boolean;
}) {
  if (!input.implemented) {
    return buildOperatorUnavailableItem(input);
  }

  const authorized = hasAnyOperatorScope({
    scopes: input.grantedScopes,
    requiredScopes: input.requiredScopes,
  });

  const requiredScopeLabel =
    input.requiredScopes.length === 1
      ? input.requiredScopes[0]
      : input.requiredScopes.join(" or ");

  return {
    ...input,
    status: authorized ? ("available" as const) : ("disabled" as const),
    availabilityLabel: authorized ? "Available now" : "Requires operator scope",
    reason: authorized
      ? `Available through explicit active operator grant for ${requiredScopeLabel}.`
      : `Requires ${requiredScopeLabel}. Reviewer scope, beta access, verification claims, and profile text do not activate operator sections.`,
  };
}

export function buildAdminNavigation(input: {
  reviewerAuthorized: boolean;
  operatorScopes?: readonly string[] | null;
}) {
  const verificationReviewItem: AdminNavigationItem = input.reviewerAuthorized
    ? {
        key: "verification_review",
        label: "Verification Review",
        path: ADMIN_ROUTES.verification,
        description: "Existing reviewer queue for bounded verification decisions.",
        status: "available",
        availabilityLabel: "Available now",
        reason:
          "Available through the existing reviewer-scope authorization path only.",
      }
    : {
        key: "verification_review",
        label: "Verification Review",
        path: ADMIN_ROUTES.verification,
        description: "Existing reviewer queue for bounded verification decisions.",
        status: "disabled",
        availabilityLabel: "Requires reviewer scope",
        reason:
          "Reviewer access remains separate from operator access and requires an active reviewer scope.",
      };

  return [
    verificationReviewItem,
    buildOperatorNavigationItem({
      key: "operator_access",
      label: "Operator Access",
      path: ADMIN_ROUTES.operatorAccess,
      description: "Grant the minimal internal private-app operator access to another existing account after first-operator bootstrap is closed.",
      requiredScopes: ["operator.manage_operator_access"],
      grantedScopes: input.operatorScopes,
      implemented: true,
    }),
    buildOperatorNavigationItem({
      key: "approved_domains",
      label: "Approved Domains",
      path: ADMIN_ROUTES.approvedDomains,
      description: "Operator management for approved work-email domains and soft-disable status changes.",
      requiredScopes: ["operator.manage_approved_domains"],
      grantedScopes: input.operatorScopes,
      implemented: true,
    }),
    buildOperatorNavigationItem({
      key: "reviewer_scopes",
      label: "Reviewer Scopes",
      path: ADMIN_ROUTES.reviewerScopes,
      description: "Operator management for reviewer-scope grants and soft revocations.",
      requiredScopes: ["operator.manage_reviewer_scopes"],
      grantedScopes: input.operatorScopes,
      implemented: true,
    }),
    buildOperatorNavigationItem({
      key: "audit_inspection",
      label: "Audit Inspection",
      path: ADMIN_ROUTES.auditInspection,
      description: "Metadata-only inspection of verification request state and security events.",
      requiredScopes: [
        "operator.read_audit",
        "operator.read_verification_requests",
      ],
      grantedScopes: input.operatorScopes,
      implemented: true,
    }),
    buildOperatorNavigationItem({
      key: "proof_cleanup",
      label: "Proof Cleanup",
      path: ADMIN_ROUTES.proofCleanup,
      description: "Operator monitoring and bounded manual cleanup for expired proof files.",
      requiredScopes: [
        "operator.monitor_proof_cleanup",
        "operator.run_proof_cleanup",
      ],
      grantedScopes: input.operatorScopes,
      implemented: true,
    }),
  ] as const;
}
