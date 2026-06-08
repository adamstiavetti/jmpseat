import "server-only";

import type { PostgrestError } from "@supabase/supabase-js";

import { createStorageAdminClient, isStorageAdminConfigured } from "../supabase/storageAdmin";
import {
  recordSecurityEventWithInsert,
  type RecordSecurityEventInput,
  type SecurityEventInsert,
} from "./securityEvents";

type SecurityEventInsertResult =
  | { error: PostgrestError | Error | null }
  | undefined;

async function insertTrustedSecurityEvent(
  payload: SecurityEventInsert,
): Promise<SecurityEventInsertResult> {
  const supabase = createStorageAdminClient();
  return supabase.from("security_events").insert(payload);
}

export async function recordSecurityEvent(input: RecordSecurityEventInput) {
  return recordSecurityEventWithInsert(input, {
    enabled: isStorageAdminConfigured(),
    insert: insertTrustedSecurityEvent,
  });
}

export async function recordSecurityEventWithServiceRole(
  input: RecordSecurityEventInput,
) {
  return recordSecurityEventWithInsert(input, {
    enabled: isStorageAdminConfigured(),
    insert: insertTrustedSecurityEvent,
  });
}
