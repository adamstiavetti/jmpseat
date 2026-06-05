import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  INITIAL_OPERATOR_BOOTSTRAP_SCOPES,
  OPERATOR_BOOTSTRAP_ROUTE,
  OPERATOR_BOOTSTRAP_SECRET_ENV_KEY,
  OPERATOR_BOOTSTRAP_SECRET_HEADER,
  bootstrapInitialOperatorGrant,
  getOperatorBootstrapSecret,
  handleOperatorBootstrapRequest,
  isAuthorizedOperatorBootstrapRequest,
} from "../../src/lib/admin/operatorBootstrapRoute.ts";
import { OPERATOR_SCOPE_VALUES } from "../../src/lib/admin/access.ts";

const TARGET_USER_ID = "11111111-1111-4111-8111-111111111111";

function bootstrapRequest(input: {
  method?: string;
  secret?: string;
  url?: string;
  body?: unknown;
}) {
  return new Request(input.url ?? `http://localhost:3000${OPERATOR_BOOTSTRAP_ROUTE}`, {
    method: input.method ?? "POST",
    headers: input.secret
      ? {
          [OPERATOR_BOOTSTRAP_SECRET_HEADER]: input.secret,
          "content-type": "application/json",
        }
      : {
          "content-type": "application/json",
        },
    body:
      (input.method ?? "POST") === "GET"
        ? undefined
        : input.body === undefined
          ? JSON.stringify({
              target_user_id: TARGET_USER_ID,
            })
          : JSON.stringify(input.body),
  });
}

test("operator bootstrap route constants stay bounded and server-only", () => {
  assert.equal(OPERATOR_BOOTSTRAP_ROUTE, "/api/ops/operator-bootstrap");
  assert.equal(
    OPERATOR_BOOTSTRAP_SECRET_HEADER,
    "x-jmpseat-operator-bootstrap-secret",
  );
  assert.equal(OPERATOR_BOOTSTRAP_SECRET_ENV_KEY, "OPERATOR_BOOTSTRAP_SECRET");
  assert.deepEqual(INITIAL_OPERATOR_BOOTSTRAP_SCOPES, OPERATOR_SCOPE_VALUES);
});

test("operator bootstrap secret is read only from server env", () => {
  assert.equal(getOperatorBootstrapSecret({}), "");
  assert.equal(
    getOperatorBootstrapSecret({
      OPERATOR_BOOTSTRAP_SECRET: "  expected-secret  ",
    }),
    "expected-secret",
  );
});

test("operator bootstrap authorization requires the configured header", () => {
  const source = {
    OPERATOR_BOOTSTRAP_SECRET: "expected-secret",
  };
  const authorizedRequest = bootstrapRequest({
    secret: "expected-secret",
  });
  const querySecretRequest = bootstrapRequest({
    url: `http://localhost:3000${OPERATOR_BOOTSTRAP_ROUTE}?secret=expected-secret`,
  });

  assert.equal(
    isAuthorizedOperatorBootstrapRequest({
      request: authorizedRequest,
      source,
    }),
    true,
  );
  assert.equal(
    isAuthorizedOperatorBootstrapRequest({
      request: querySecretRequest,
      source,
    }),
    false,
  );
});

test("operator bootstrap route denies non-POST methods", async () => {
  const response = await handleOperatorBootstrapRequest(
    bootstrapRequest({
      method: "GET",
      secret: "expected-secret",
    }),
    {
      source: {
        OPERATOR_BOOTSTRAP_SECRET: "expected-secret",
      },
    },
  );

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "POST");
  assert.deepEqual(await response.json(), {
    ok: false,
    error: "Method not allowed.",
  });
});

test("operator bootstrap route fails closed when secret env is missing", async () => {
  let bootstrapCalled = false;

  const response = await handleOperatorBootstrapRequest(
    bootstrapRequest({
      secret: "expected-secret",
    }),
    {
      source: {},
      runBootstrap: async () => {
        bootstrapCalled = true;
        return {
          outcome: "created",
          scopeCount: INITIAL_OPERATOR_BOOTSTRAP_SCOPES.length,
        };
      },
    },
  );

  assert.equal(response.status, 503);
  assert.equal(bootstrapCalled, false);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: "Operator bootstrap is not configured.",
  });
});

test("operator bootstrap route denies missing, wrong, and query-string secrets", async () => {
  const source = {
    OPERATOR_BOOTSTRAP_SECRET: "expected-secret",
  };
  const missingHeaderResponse = await handleOperatorBootstrapRequest(
    bootstrapRequest({}),
    {
      source,
    },
  );
  const wrongHeaderResponse = await handleOperatorBootstrapRequest(
    bootstrapRequest({
      secret: "wrong-secret",
    }),
    {
      source,
    },
  );
  const querySecretResponse = await handleOperatorBootstrapRequest(
    bootstrapRequest({
      url: `http://localhost:3000${OPERATOR_BOOTSTRAP_ROUTE}?secret=expected-secret`,
    }),
    {
      source,
    },
  );

  assert.equal(missingHeaderResponse.status, 401);
  assert.equal(wrongHeaderResponse.status, 401);
  assert.equal(querySecretResponse.status, 401);
  assert.deepEqual(await missingHeaderResponse.json(), {
    ok: false,
    error: "Unauthorized.",
  });
  assert.deepEqual(await wrongHeaderResponse.json(), {
    ok: false,
    error: "Unauthorized.",
  });
  assert.deepEqual(await querySecretResponse.json(), {
    ok: false,
    error: "Unauthorized.",
  });
});

test("operator bootstrap route validates target_user_id before privileged work", async () => {
  let bootstrapCalled = false;

  const response = await handleOperatorBootstrapRequest(
    bootstrapRequest({
      secret: "expected-secret",
      body: {
        target_user_id: "not-a-uuid",
      },
    }),
    {
      source: {
        OPERATOR_BOOTSTRAP_SECRET: "expected-secret",
      },
      runBootstrap: async () => {
        bootstrapCalled = true;
        return {
          outcome: "created",
          scopeCount: INITIAL_OPERATOR_BOOTSTRAP_SCOPES.length,
        };
      },
    },
  );

  assert.equal(response.status, 400);
  assert.equal(bootstrapCalled, false);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: "A valid target_user_id is required.",
  });
});

test("operator bootstrap route requires storage admin readiness", async () => {
  let bootstrapCalled = false;

  const response = await handleOperatorBootstrapRequest(
    bootstrapRequest({
      secret: "expected-secret",
    }),
    {
      source: {
        OPERATOR_BOOTSTRAP_SECRET: "expected-secret",
      },
      isStorageAdminReady: () => false,
      runBootstrap: async () => {
        bootstrapCalled = true;
        return {
          outcome: "created",
          scopeCount: INITIAL_OPERATOR_BOOTSTRAP_SCOPES.length,
        };
      },
    },
  );

  assert.equal(response.status, 503);
  assert.equal(bootstrapCalled, false);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: "Operator bootstrap is unavailable.",
  });
});

test("operator bootstrap route creates the first operator grant with safe response fields", async () => {
  let runnerInput:
    | {
        targetUserId: string;
        reason: string | null;
      }
    | null = null;

  const response = await handleOperatorBootstrapRequest(
    bootstrapRequest({
      secret: "expected-secret",
      body: {
        target_user_id: TARGET_USER_ID,
        reason: " initial bootstrap ",
      },
    }),
    {
      source: {
        OPERATOR_BOOTSTRAP_SECRET: "expected-secret",
      },
      isStorageAdminReady: () => true,
      runBootstrap: async (input) => {
        runnerInput = input;
        return {
          outcome: "created",
          scopeCount: INITIAL_OPERATOR_BOOTSTRAP_SCOPES.length,
        };
      },
    },
  );

  assert.deepEqual(runnerInput, {
    targetUserId: TARGET_USER_ID,
    reason: "initial bootstrap",
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    ok: true,
    status: "active",
    grantedScopeCount: INITIAL_OPERATOR_BOOTSTRAP_SCOPES.length,
  });
});

test("operator bootstrap route closes after an active operator grant exists", async () => {
  const response = await handleOperatorBootstrapRequest(
    bootstrapRequest({
      secret: "expected-secret",
    }),
    {
      source: {
        OPERATOR_BOOTSTRAP_SECRET: "expected-secret",
      },
      isStorageAdminReady: () => true,
      runBootstrap: async () => ({
        outcome: "closed",
      }),
    },
  );

  assert.equal(response.status, 409);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: "Operator bootstrap is closed.",
  });
});

test("operator bootstrap database runner blocks bootstrap when active grants exist", async () => {
  const calls: Array<{ table: string; payload?: Record<string, unknown> }> = [];
  const supabase = {
    from(table: string) {
      if (table === "operator_grants") {
        return {
          select() {
            return {
              eq() {
                return {
                  is() {
                    return {
                      async limit() {
                        return {
                          data: [{ id: "existing-grant" }],
                          error: null,
                        };
                      },
                    };
                  },
                };
              },
            };
          },
          async insert(payload: Record<string, unknown>) {
            calls.push({ table, payload });
            return { data: null, error: null };
          },
        };
      }

      return {
        async insert(payload: Record<string, unknown>) {
          calls.push({ table, payload });
          return { data: null, error: null };
        },
      };
    },
  };

  const result = await bootstrapInitialOperatorGrant({
    supabase,
    targetUserId: TARGET_USER_ID,
    reason: null,
  });

  assert.deepEqual(result, {
    outcome: "closed",
  });
  assert.deepEqual(calls, []);
});

test("operator bootstrap database runner prefers the atomic service-role RPC", async () => {
  const rpcCalls: Array<{
    functionName: string;
    args: Record<string, unknown>;
  }> = [];
  const supabase = {
    async rpc(functionName: string, args: Record<string, unknown>) {
      rpcCalls.push({ functionName, args });
      return {
        data: {
          outcome: "created",
          scope_count: INITIAL_OPERATOR_BOOTSTRAP_SCOPES.length,
        },
        error: null,
      };
    },
    from() {
      throw new Error("fallback path should not run when RPC exists");
    },
  };

  const result = await bootstrapInitialOperatorGrant({
    supabase,
    targetUserId: TARGET_USER_ID,
    reason: "initial bootstrap",
  });

  assert.deepEqual(result, {
    outcome: "created",
    scopeCount: INITIAL_OPERATOR_BOOTSTRAP_SCOPES.length,
  });
  assert.deepEqual(rpcCalls, [
    {
      functionName: "bootstrap_operator_access",
      args: {
        target_user_id: TARGET_USER_ID,
        requested_scopes: [...INITIAL_OPERATOR_BOOTSTRAP_SCOPES],
        reason: "initial bootstrap",
      },
    },
  ]);
});

test("operator bootstrap database runner respects RPC closed state", async () => {
  const supabase = {
    async rpc() {
      return {
        data: {
          outcome: "closed",
        },
        error: null,
      };
    },
    from() {
      throw new Error("fallback path should not run when RPC exists");
    },
  };

  const result = await bootstrapInitialOperatorGrant({
    supabase,
    targetUserId: TARGET_USER_ID,
    reason: null,
  });

  assert.deepEqual(result, {
    outcome: "closed",
  });
});

test("operator bootstrap database runner grants full bootstrap scope set and audits", async () => {
  const calls: Array<{ table: string; payload?: Record<string, unknown> }> = [];
  const supabase = {
    from(table: string) {
      if (table === "operator_grants") {
        return {
          select() {
            return {
              eq() {
                return {
                  is() {
                    return {
                      async limit() {
                        return {
                          data: [],
                          error: null,
                        };
                      },
                    };
                  },
                };
              },
            };
          },
          async insert(payload: Record<string, unknown>) {
            calls.push({ table, payload });
            return { data: null, error: null };
          },
        };
      }

      return {
        async insert(payload: Record<string, unknown>) {
          calls.push({ table, payload });
          return { data: null, error: null };
        },
      };
    },
  };

  const result = await bootstrapInitialOperatorGrant({
    supabase,
    targetUserId: TARGET_USER_ID,
    reason: "initial bootstrap",
  });

  assert.deepEqual(result, {
    outcome: "created",
    scopeCount: INITIAL_OPERATOR_BOOTSTRAP_SCOPES.length,
  });
  assert.deepEqual(calls[0], {
    table: "operator_grants",
    payload: {
      user_id: TARGET_USER_ID,
      scopes: [...INITIAL_OPERATOR_BOOTSTRAP_SCOPES],
      status: "active",
      created_by: null,
      reason: "initial bootstrap",
    },
  });
  assert.equal(calls[1].table, "security_events");
  assert.deepEqual(calls[1].payload?.metadata, {
    target_user_id: TARGET_USER_ID,
    scope_names: [...INITIAL_OPERATOR_BOOTSTRAP_SCOPES],
    reason_code: "initial_operator_bootstrap",
    reason_present: true,
  });
});

test("operator bootstrap setup is documented without hard-coded admin emails", () => {
  const envExample = readFileSync(
    new URL("../../.env.example", import.meta.url),
    "utf8",
  );
  const routeSource = readFileSync(
    new URL("../../src/lib/admin/operatorBootstrapRoute.ts", import.meta.url),
    "utf8",
  );

  assert.match(envExample, /OPERATOR_BOOTSTRAP_SECRET=/);
  assert.doesNotMatch(routeSource, /@gmail\.com|@jmpseat\.com/i);
  assert.doesNotMatch(routeSource, /split\(["']@["']\)|endsWith\(["'][^"']+["']\)/);
});
