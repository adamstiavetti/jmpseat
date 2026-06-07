export const WAITLIST_SURVEY_TOKEN_COOKIE = "jmpseat_waitlist_survey";

export const WAITLIST_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type WaitlistSurveyQuestion =
  | {
      id: string;
      label: string;
      type: "single";
      name: string;
      options: readonly string[];
    }
  | {
      id: string;
      label: string;
      type: "multi";
      name: string;
      maxSelections: number;
      options: readonly string[];
    }
  | {
      id: string;
      label: string;
      type: "short";
      name: string;
      placeholder: string;
      maxLength: number;
    };

export const WAITLIST_SURVEY_QUESTIONS = [
  {
    id: "aviation_connection",
    label: "What best describes your aviation connection?",
    type: "single",
    name: "aviation_connection",
    options: [
      "Flight attendant",
      "Pilot",
      "Gate agent or customer service",
      "Ramp, baggage, or cargo",
      "Dispatcher, crew scheduler, or ops",
      "Airport ops",
      "Regional airline worker",
      "New hire or trainee",
      "Commuter",
      "Former airline worker",
      "Aspiring aviation worker",
      "Other",
    ],
  },
  {
    id: "priority_base",
    label: "Which base or airport community should jmpseat prioritize first?",
    type: "short",
    name: "priority_base",
    placeholder: "Example: DFW, ATL, LAX, ORD",
    maxLength: 120,
  },
  {
    id: "useful_first",
    label: "What would make jmpseat most useful to you first?",
    type: "multi",
    name: "useful_first",
    maxSelections: 3,
    options: [
      "Base intel",
      "Layover recommendations",
      "Verified crew rooms",
      "Anonymous-but-accountable discussion",
      "Career, interview, or new-hire help",
      "Crew-friendly deals or perks",
      "AI layover brief",
      "Commuter or non-rev-adjacent tips without flight loads",
      "Wellness, rest, or downtime",
      "Other",
    ],
  },
  {
    id: "biggest_pain",
    label: "What is the biggest pain you would want jmpseat to solve?",
    type: "short",
    name: "biggest_pain",
    placeholder: "Keep it general and non-sensitive.",
    maxLength: 500,
  },
  {
    id: "current_tools",
    label: "What tools or communities do you use today for airline-life information?",
    type: "multi",
    name: "current_tools",
    maxSelections: 5,
    options: [
      "Facebook groups",
      "Reddit",
      "Group chats or text threads",
      "Coworkers or friends",
      "Notes or spreadsheets",
      "StaffTraveler",
      "Flight Crew View",
      "CrewLounge",
      "CrewVIP",
      "Union or company resources",
      "Other",
    ],
  },
  {
    id: "verification_comfort",
    label: "How comfortable would you be verifying privately later to keep the community crew-only?",
    type: "single",
    name: "verification_comfort",
    options: [
      "Comfortable using an airline employee email later",
      "Comfortable with non-upload review later",
      "I need more privacy details first",
      "Not comfortable",
      "Not applicable yet",
    ],
  },
  {
    id: "beta_help",
    label: "Would you be open to helping shape the first beta?",
    type: "multi",
    name: "beta_help",
    maxSelections: 4,
    options: [
      "I would do a short interview",
      "I might seed useful base or layover posts",
      "I could invite trusted coworkers later",
      "I only want launch updates for now",
    ],
  },
  {
    id: "discovery_source",
    label: "How did you hear about jmpseat?",
    type: "single",
    name: "discovery_source",
    options: [
      "Friend or coworker",
      "Group chat",
      "Facebook group",
      "Reddit",
      "LinkedIn",
      "Instagram or TikTok",
      "Search",
      "Founder or team outreach",
      "Other",
    ],
  },
  {
    id: "privacy_concern",
    label: "Any privacy or trust concern we should design around?",
    type: "short",
    name: "privacy_concern",
    placeholder: "Keep it general; do not share private work details.",
    maxLength: 500,
  },
] as const satisfies readonly WaitlistSurveyQuestion[];

export function normalizeWaitlistEmail(rawEmail: string | null | undefined) {
  const email = rawEmail?.trim().toLowerCase() ?? "";

  if (!email || email.length > 320 || !WAITLIST_EMAIL_PATTERN.test(email)) {
    return null;
  }

  return email;
}

export function trimWaitlistText(
  value: FormDataEntryValue | null,
  maxLength: number,
) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim().slice(0, maxLength);
  return trimmed || null;
}

export function getWaitlistMultiSelectValues(
  formData: FormData,
  name: string,
  allowedValues: readonly string[],
  maxSelections: number,
) {
  const allowed = new Set(allowedValues);
  const selected: string[] = [];

  for (const value of formData.getAll(name)) {
    if (
      typeof value === "string" &&
      allowed.has(value) &&
      !selected.includes(value)
    ) {
      selected.push(value);
    }

    if (selected.length >= maxSelections) {
      break;
    }
  }

  return selected;
}
