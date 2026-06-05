import type { NextRequest } from "next/server";

import { handleOpsProofRetentionCleanupCronRequest } from "../../../../../src/lib/ops/proofRetentionCleanupRoute";

export async function GET(request: NextRequest) {
  return handleOpsProofRetentionCleanupCronRequest(request);
}
