export const PRIVATE_SHELL_ROUTE = "/app";

export type PrivateShellMessage = {
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
  disclaimer: string;
};

export type PrivateShellNavItem = {
  label: string;
  path: string;
  description: string;
  disabled: true;
};

export type PrivateShellChildRoute = {
  slug: string;
  path: string;
  navLabel: string;
  title: string;
  detail: string;
  message: PrivateShellMessage;
};

export const PRIVATE_SHELL_MESSAGE: PrivateShellMessage = {
  eyebrow: "jmpseat Private Beta",
  title: "Access is not open yet.",
  description:
    "This private app area is reserved for verified airline-worker beta access.",
  detail:
    "Account login and profile setup exist now, but beta approval and worker verification still come later.",
  disclaimer:
    "This locked placeholder is product scaffolding only. It is not beta approval, worker verification, or a real community access grant.",
};

export const OPERATOR_PRIVATE_APP_ACCESS_MESSAGE: PrivateShellMessage = {
  eyebrow: "jmpseat Internal Access",
  title: "Internal access is active for this account.",
  description:
    "This account has explicit operator/internal access to the private app placeholder during private testing.",
  detail:
    "This access path is operational only. It does not mark this account as airline-email verified, airline-worker eligible, or generally beta-approved.",
  disclaimer:
    "This internal path does not grant beta to normal users or issue role, base, or restricted-board claims. The placeholder remains product scaffolding only.",
};

export const PRIVATE_SHELL_NAV_ITEMS: readonly PrivateShellNavItem[] = [
  {
    label: "Home Base",
    path: "/app/home",
    description: "Future private app home surface.",
    disabled: true,
  },
  {
    label: "Baseboard",
    path: "/app/base",
    description: "Future base-specific knowledge surface.",
    disabled: true,
  },
  {
    label: "Layovers",
    path: "/app/layovers",
    description: "Future layover and city intel surface.",
    disabled: true,
  },
  {
    label: "Lounges",
    path: "/app/rooms",
    description: "Future gated discussion surface.",
    disabled: true,
  },
  {
    label: "Profile",
    path: "/app/profile",
    description: "Future account and handle setup surface.",
    disabled: true,
  },
  {
    label: "Verification",
    path: "/app/verification",
    description: "Future aviation-worker verification surface.",
    disabled: true,
  },
  {
    label: "Admin",
    path: "/app/admin",
    description: "Future admin-only operational surface.",
    disabled: true,
  },
] as const;

function createChildRouteMessage(label: string, routeContext: string): PrivateShellMessage {
  return {
    eyebrow: "jmpseat Private Beta",
    title: `${label} is not available yet.`,
    description: `${routeContext} is reserved for a later private-beta epoch and is not open through this placeholder route.`,
    detail:
      "Account login and profile setup exist now, but beta approval and worker verification still come later, and this route does not grant real private-community access yet.",
    disclaimer:
      "This route-level placeholder is scaffolding only. It is not a real security boundary or a working product surface.",
  };
}

export const PRIVATE_SHELL_CHILD_ROUTE_RECORD: Record<string, PrivateShellChildRoute> = {
  home: {
    slug: "home",
    path: "/app/home",
    navLabel: "Home Base",
    title: "Home Base is not available yet.",
    detail:
      "Account login and profile setup exist now, but beta approval and worker verification still come later, and this route does not grant real private-community access yet.",
    message: createChildRouteMessage(
      "Home Base",
      "The future private app home surface",
    ),
  },
  base: {
    slug: "base",
    path: "/app/base",
    navLabel: "Baseboard",
    title: "Baseboard is not available yet.",
    detail:
      "Account login and profile setup exist now, but beta approval and worker verification still come later, and this route does not grant real private-community access yet.",
    message: createChildRouteMessage(
      "Baseboard",
      "Base-specific knowledge and commuting guidance",
    ),
  },
  layovers: {
    slug: "layovers",
    path: "/app/layovers",
    navLabel: "Layovers",
    title: "Layovers is not available yet.",
    detail:
      "Account login and profile setup exist now, but beta approval and worker verification still come later, and this route does not grant real private-community access yet.",
    message: createChildRouteMessage(
      "Layovers",
      "Layover and city-intel guidance",
    ),
  },
  rooms: {
    slug: "rooms",
    path: "/app/rooms",
    navLabel: "Lounges",
    title: "Lounges is not available yet.",
    detail:
      "Account login and profile setup exist now, but beta approval and worker verification still come later, and this route does not grant real private-community access yet.",
    message: createChildRouteMessage(
      "Lounges",
      "Gated discussion areas",
    ),
  },
  profile: {
    slug: "profile",
    path: "/app/profile",
    navLabel: "Profile",
    title: "Profile is not available yet.",
    detail:
      "The dedicated profile completion flow now exists at /app/profile, but this placeholder route config still does not grant beta access, worker verification, or community access.",
    message: createChildRouteMessage(
      "Profile",
      "Account and public-handle setup",
    ),
  },
  verification: {
    slug: "verification",
    path: "/app/verification",
    navLabel: "Verification",
    title: "Verification is not available yet.",
    detail:
      "Account login and profile setup exist now, but worker verification still comes in a later epoch and this route remains a placeholder only.",
    message: createChildRouteMessage(
      "Verification",
      "Aviation-worker verification",
    ),
  },
  admin: {
    slug: "admin",
    path: "/app/admin",
    navLabel: "Admin",
    title: "Admin is not available yet.",
    detail:
      "Account login and profile setup exist now, but admin access and real private-community controls still come later.",
    message: createChildRouteMessage(
      "Admin",
      "Admin-only operational tooling",
    ),
  },
};

export function getPrivateShellChildRoute(
  slug: string,
): PrivateShellChildRoute | null {
  return PRIVATE_SHELL_CHILD_ROUTE_RECORD[slug] ?? null;
}
