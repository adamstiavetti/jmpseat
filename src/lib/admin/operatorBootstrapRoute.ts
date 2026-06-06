export const OPERATOR_BOOTSTRAP_ROUTE = "/api/ops/operator-bootstrap";
export const OPERATOR_BOOTSTRAP_SECRET_HEADER =
  "x-jmpseat-operator-bootstrap-secret";
export const OPERATOR_BOOTSTRAP_SECRET_ENV_KEY = "OPERATOR_BOOTSTRAP_SECRET";
export const INITIAL_OPERATOR_BOOTSTRAP_SCOPES = [
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

type EnvSource = Record<string, string | undefined>;

export type OperatorBootstrapRunnerInput = {
  targetUserId: string;
  reason: string | null;
};

export type OperatorBootstrapRunnerResult =
  | {
      outcome: "created";
      scopeCount: number;
    }
  | {
      outcome: "closed";
    };

type OperatorBootstrapRunner = (
  input: OperatorBootstrapRunnerInput,
) => Promise<OperatorBootstrapRunnerResult>;

type SupabaseQueryResult<T> = Promise<{
  data: T | null;
  error: { message?: string } | null;
}>;

type OperatorBootstrapSupabaseClient = {
  rpc?: (
    functionName: "bootstrap_operator_access",
    args: {
      target_user_id: string;
      requested_scopes: string[];
      reason: string | null;
    },
  ) => SupabaseQueryResult<{
    outcome?: string;
    scope_count?: number;
  }>;
  from(table: "operator_grants"): {
    select(columns: string): {
      eq(column: string, value: string): {
        is(column: string, value: null): {
          limit(count: number): SupabaseQueryResult<Array<{ id: string }>>;
        };
      };
    };
    insert(payload: Record<string, unknown>): SupabaseQueryResult<unknown>;
  };
  from(table: "security_events"): {
    insert(payload: Record<string, unknown>): SupabaseQueryResult<unknown>;
  };
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function jsonResponse(
  body: Record<string, unknown>,
  status: number,
  headers?: HeadersInit,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(headers ?? {}),
    },
  });
}

export function getOperatorBootstrapSecret(source: EnvSource = process.env) {
  return source[OPERATOR_BOOTSTRAP_SECRET_ENV_KEY]?.trim() ?? "";
}

export function isAuthorizedOperatorBootstrapRequest(input: {
  request: Request;
  source?: EnvSource;
}) {
  const expectedSecret = getOperatorBootstrapSecret(input.source);

  if (!expectedSecret) {
    return false;
  }

  const actualSecret =
    input.request.headers.get(OPERATOR_BOOTSTRAP_SECRET_HEADER)?.trim() ?? "";

  return actualSecret.length > 0 && actualSecret === expectedSecret;
}

function normalizeBootstrapReason(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  return value.trim().slice(0, 500) || null;
}

async function parseBootstrapBody(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return {
      ok: false as const,
      error: "Invalid JSON body.",
    };
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return {
      ok: false as const,
      error: "Invalid JSON body.",
    };
  }

  const targetUserId = (body as { target_user_id?: unknown }).target_user_id;

  if (typeof targetUserId !== "string" || !UUID_PATTERN.test(targetUserId)) {
    return {
      ok: false as const,
      error: "A valid target_user_id is required.",
    };
  }

  return {
    ok: true as const,
    targetUserId,
    reason: normalizeBootstrapReason((body as { reason?: unknown }).reason),
  };
}

async function getStorageAdminReadiness(source: EnvSource) {
  const storageAdminModule = await import("../supabase/storageAdmin");
  return storageAdminModule.isStorageAdminConfigured(source);
}

async function getDefaultOperatorBootstrapRunner(
  source: EnvSource,
): Promise<OperatorBootstrapRunner> {
  const storageAdminModule = await import("../supabase/storageAdmin");

  return (input) =>
    bootstrapInitialOperatorGrant({
      supabase: storageAdminModule.createStorageAdminClient(
        source,
      ) as unknown as OperatorBootstrapSupabaseClient,
      ...input,
    });
}

export async function bootstrapInitialOperatorGrant(input: {
  supabase: OperatorBootstrapSupabaseClient;
  targetUserId: string;
  reason: string | null;
}): Promise<OperatorBootstrapRunnerResult> {
  if (typeof input.supabase.rpc === "function") {
    const bootstrapResult = await input.supabase.rpc("bootstrap_operator_access", {
      target_user_id: input.targetUserId,
      requested_scopes: [...INITIAL_OPERATOR_BOOTSTRAP_SCOPES],
      reason: input.reason,
    });

    if (bootstrapResult.error) {
      throw new Error("Operator bootstrap RPC failed.");
    }

    if (bootstrapResult.data?.outcome === "closed") {
      return {
        outcome: "closed",
      };
    }

    return {
      outcome: "created",
      scopeCount:
        typeof bootstrapResult.data?.scope_count === "number"
          ? bootstrapResult.data.scope_count
          : INITIAL_OPERATOR_BOOTSTRAP_SCOPES.length,
    };
  }

  const activeGrantResult = await input.supabase
    .from("operator_grants")
    .select("id")
    .eq("status", "active")
    .is("revoked_at", null)
    .limit(1);

  if (activeGrantResult.error) {
    throw new Error("Operator bootstrap active-grant check failed.");
  }

  if ((activeGrantResult.data ?? []).length > 0) {
    return {
      outcome: "closed",
    };
  }

  const scopes = [...INITIAL_OPERATOR_BOOTSTRAP_SCOPES];
  const insertResult = await input.supabase.from("operator_grants").insert({
    user_id: input.targetUserId,
    scopes,
    status: "active",
    created_by: null,
    reason: input.reason,
  });

  if (insertResult.error) {
    throw new Error("Operator bootstrap grant insert failed.");
  }

  try {
    await input.supabase.from("security_events").insert({
      user_id: null,
      event_type: "operator_access.granted",
      route: OPERATOR_BOOTSTRAP_ROUTE,
      result: "granted",
      metadata: {
        target_user_id: input.targetUserId,
        scope_names: scopes,
        reason_code: "initial_operator_bootstrap",
        reason_present: input.reason !== null,
      },
    });
  } catch {
    // Bootstrap must not expose audit infrastructure details in responses.
  }

  return {
    outcome: "created",
    scopeCount: scopes.length,
  };
}

export async function handleOperatorBootstrapRequest(
  request: Request,
  options: {
    source?: EnvSource;
    runBootstrap?: OperatorBootstrapRunner;
    isStorageAdminReady?: (source?: EnvSource) => boolean;
  } = {},
) {
  if (request.method !== "POST") {
    return jsonResponse(
      {
        ok: false,
        error: "Method not allowed.",
      },
      405,
      {
        allow: "POST",
      },
    );
  }

  const source = options.source ?? process.env;
  const configuredSecret = getOperatorBootstrapSecret(source);

  if (!configuredSecret) {
    return jsonResponse(
      {
        ok: false,
        error: "Operator bootstrap is not configured.",
      },
      503,
    );
  }

  if (!isAuthorizedOperatorBootstrapRequest({ request, source })) {
    return jsonResponse(
      {
        ok: false,
        error: "Unauthorized.",
      },
      401,
    );
  }

  const parsedBody = await parseBootstrapBody(request);

  if (!parsedBody.ok) {
    return jsonResponse(
      {
        ok: false,
        error: parsedBody.error,
      },
      400,
    );
  }

  try {
    const storageAdminReady =
      options.isStorageAdminReady?.(source) ??
      (await getStorageAdminReadiness(source));

    if (!storageAdminReady) {
      return jsonResponse(
        {
          ok: false,
          error: "Operator bootstrap is unavailable.",
        },
        503,
      );
    }

    const runBootstrap =
      options.runBootstrap ?? (await getDefaultOperatorBootstrapRunner(source));
    const result = await runBootstrap({
      targetUserId: parsedBody.targetUserId,
      reason: parsedBody.reason,
    });

    if (result.outcome === "closed") {
      return jsonResponse(
        {
          ok: false,
          error: "Operator bootstrap is closed.",
        },
        409,
      );
    }

    return jsonResponse(
      {
        ok: true,
        status: "active",
        grantedScopeCount: result.scopeCount,
      },
      200,
    );
  } catch {
    return jsonResponse(
      {
        ok: false,
        error: "Operator bootstrap grant could not be created.",
      },
      500,
    );
  }
}
