export type DfwBaseStartItem = {
  title: string;
  detail: string;
};

export type DfwBaseLinkCard = {
  title: string;
  detail: string;
  href: string;
  meta: string;
};

export const dfwBaseStartHere: readonly DfwBaseStartItem[] = [
  {
    title: "Know your commute/parking plan.",
    detail:
      "Treat DFW access as part of the workday and leave room for normal parking, shuttle, and curbside friction.",
  },
  {
    title: "Confirm terminal/ground logistics through official/employer sources.",
    detail:
      "Use current employer, airport, and official travel sources for terminal, ramp, gate, and ground details.",
  },
  {
    title: "Use Channels for DFW-specific questions.",
    detail:
      "Ask practical verified-worker questions in focused DFW Channels instead of treating Base as a social feed.",
  },
];

export const dfwBaseEssentialCards: readonly DfwBaseLinkCard[] = [
  {
    title: "Commuting & Parking",
    detail: "High-level parking, commute, transit, and access questions.",
    href: "/app/hubs/dfw/channels/commuting-parking",
    meta: "Channel",
  },
  {
    title: "Terminal & Ground Logistics",
    detail: "Practical terminal and ground logistics questions without live ops claims.",
    href: "/app/hubs/dfw/channels/terminal-ground-logistics",
    meta: "Channel",
  },
  {
    title: "Food, Coffee & Breaks",
    detail: "Worker-friendly break ideas and airport basics at a high level.",
    href: "/app/hubs/dfw/channels/food-coffee-breaks",
    meta: "Channel",
  },
  {
    title: "New to DFW",
    detail: "Static orientation questions for getting settled around the DFW Hub.",
    href: "/app/hubs/dfw/channels/new-to-dfw",
    meta: "Channel",
  },
];

export const dfwBaseUsefulNextLinks: readonly DfwBaseLinkCard[] = [
  {
    title: "DFW Today",
    detail: "Open the read-only private beta snapshot for quick DFW checks.",
    href: "/app/hubs/dfw/today",
    meta: "MVP pillar",
  },
  {
    title: "DFW Channels",
    detail: "Browse focused DFW worker discussion spaces.",
    href: "/app/hubs/dfw/channels",
    meta: "MVP pillar",
  },
];

export const dfwBaseSafetyBoundary =
  "DFW Base avoids live operations and security-sensitive details. Use official/employer sources for live operations, security procedures, and current policies.";

export const dfwBaseFutureNote =
  "Layover guidance remains a separate MVP pillar. This private beta baseline stays static until curated updates are explicitly scoped.";
