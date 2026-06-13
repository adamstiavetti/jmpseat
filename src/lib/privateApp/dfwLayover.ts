export type DfwLayoverStartItem = {
  title: string;
  detail: string;
};

export type DfwLayoverLinkCard = {
  title: string;
  detail: string;
  href: string;
  meta: string;
};

export const dfwLayoverStartHere: readonly DfwLayoverStartItem[] = [
  {
    title: "Confirm duty/rest timing through official/employer sources.",
    detail:
      "Use current employer and official travel sources for timing decisions before leaving the airport area.",
  },
  {
    title: "Keep transportation plans simple and reversible.",
    detail:
      "Favor plans that are easy to unwind if timing changes, and leave room for normal DFW-area travel friction.",
  },
  {
    title: "Avoid unofficial live operations information.",
    detail:
      "Treat this page as static orientation only, not a source for operational status or time-critical decisions.",
  },
];

export const dfwLayoverEssentialCards: readonly DfwLayoverLinkCard[] = [
  {
    title: "Short sit",
    detail:
      "Static reminders for staying close, keeping plans flexible, and avoiding live operational assumptions.",
    href: "/app/hubs/dfw/channels/terminal-ground-logistics",
    meta: "High-level planning",
  },
  {
    title: "Longer layover",
    detail:
      "General planning prompts for longer sits without crew-hotel tie-ins or location tracking.",
    href: "/app/hubs/dfw/channels/dfw-layover-local",
    meta: "Channel",
  },
  {
    title: "Food, Coffee & Breaks",
    detail:
      "Worker-friendly food and break ideas at a high level, without live availability claims.",
    href: "/app/hubs/dfw/channels/food-coffee-breaks",
    meta: "Channel",
  },
  {
    title: "DFW Layover & Local",
    detail:
      "Safe local questions and practical DFW-area tips for verified aviation workers.",
    href: "/app/hubs/dfw/channels/dfw-layover-local",
    meta: "Channel",
  },
];

export const dfwLayoverUsefulNextLinks: readonly DfwLayoverLinkCard[] = [
  {
    title: "DFW Today",
    detail: "Open the static private-beta DFW utility snapshot.",
    href: "/app/hubs/dfw/today",
    meta: "MVP pillar",
  },
  {
    title: "DFW Base",
    detail: "Use the read-only base orientation surface for DFW worker basics.",
    href: "/app/hubs/dfw/base",
    meta: "MVP pillar",
  },
  {
    title: "DFW Channels",
    detail: "Browse focused DFW worker discussion spaces.",
    href: "/app/hubs/dfw/channels",
    meta: "MVP pillar",
  },
];

export const dfwLayoverSafetyBoundary =
  "DFW Layover avoids exact crew hotel exposure, live location, live operations, and security-sensitive details. Use official/employer sources for duty/rest timing, live operations, security procedures, and current policies.";

export const dfwLayoverFutureNote =
  "This private beta baseline avoids live location and exact crew hotel exposure. Future curated updates can be added later after safety review.";
