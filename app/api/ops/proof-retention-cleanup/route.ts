import type { NextRequest } from "next/server";

import { handleOpsProofRetentionCleanupRequest } from "../../../../src/lib/ops/proofRetentionCleanupRoute";

export async function GET(request: NextRequest) {
  return handleOpsProofRetentionCleanupRequest(request);
}

export async function POST(request: NextRequest) {
  return handleOpsProofRetentionCleanupRequest(request);
}
