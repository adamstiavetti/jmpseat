import type { NextRequest } from "next/server";

import { handleOperatorBootstrapRequest } from "../../../../src/lib/admin/operatorBootstrapRoute";

export async function POST(request: NextRequest) {
  return handleOperatorBootstrapRequest(request);
}
