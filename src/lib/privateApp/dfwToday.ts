export type DfwTodayQuickCheck = {
  title: string;
  detail: string;
};

export type DfwTodayUtilityCard = {
  title: string;
  detail: string;
  href: string;
  meta: string;
};

export const dfwTodayQuickChecks: readonly DfwTodayQuickCheck[] = [
  {
    title: "Check your parking/commute plan.",
    detail:
      "Leave room for normal DFW access friction and confirm your own route before heading in.",
  },
  {
    title: "Confirm terminal/ground logistics with official sources.",
    detail:
      "Use employer, airport, and official travel sources for live operational details.",
  },
  {
    title: "Save useful Channels for DFW questions.",
    detail:
      "Use focused DFW Channels for practical worker questions instead of a single mixed feed.",
  },
];

export const dfwTodayUtilityCards: readonly DfwTodayUtilityCard[] = [
  {
    title: "Commuting & Parking",
    detail: "Parking, commute, transit, and access questions for DFW workers.",
    href: "/app/hubs/dfw/channels/commuting-parking",
    meta: "Channel",
  },
  {
    title: "Terminal & Ground Logistics",
    detail: "Practical terminal and ground-movement reminders at a high level.",
    href: "/app/hubs/dfw/channels/terminal-ground-logistics",
    meta: "Channel",
  },
  {
    title: "Food, Coffee & Breaks",
    detail: "Useful break ideas without pretending to be a live airport guide.",
    href: "/app/hubs/dfw/channels/food-coffee-breaks",
    meta: "Channel",
  },
  {
    title: "DFW Q&A",
    detail: "General DFW questions when a focused channel does not fit.",
    href: "/app/hubs/dfw/channels/dfw-q-and-a",
    meta: "Channel",
  },
];

export const dfwTodaySafetyBoundary =
  "DFW Today avoids live operational data and security-sensitive details. Use official/employer sources for live operations and security procedures.";

export const dfwTodayFutureNote =
  "Future curated updates can be added later. This private beta baseline intentionally avoids fake live data.";

