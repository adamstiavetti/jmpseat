import { redirect } from "next/navigation";

import { AUTH_ROUTES } from "../../../src/lib/auth/routes";

export default function DeprecatedVerificationPage() {
  redirect(AUTH_ROUTES.accessHold);
}
