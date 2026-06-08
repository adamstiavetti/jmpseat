const RECENT_SIGNUP_LIMIT = 12;
const TOP_VALUE_LIMIT = 8;
const SAFE_TEXT_PATTERN = /^[a-z0-9 .,'/&()+#_!?%-]{1,240}$/i;
const SENSITIVE_TEXT_PATTERN =
  /employee\s*id|badge|document|proof|password|portal|passenger|hotel|schedule|credential|token|code|uuid|@/i;

export type WaitlistSurveyResponse = {
  aviation_connection: string | null;
  priority_base: string | null;
  useful_first: string[] | null;
  biggest_pain: string | null;
  current_tools: string[] | null;
  verification_comfort: string | null;
  beta_help: string[] | null;
  discovery_source: string | null;
  privacy_concern: string | null;
  created_at: string | null;
};

export type WaitlistSignupRow = {
  email: string | null;
  normalized_email: string | null;
  masked_email?: string | null;
  landing_path: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  survey_completed_at: string | null;
  created_at: string;
  waitlist_survey_responses: WaitlistSurveyResponse[] | null;
};

export type WaitlistTopValue = {
  label: string;
  count: number;
};

export type WaitlistRecentSignup = {
  maskedEmail: string;
  createdAt: string;
  surveyCompleted: boolean;
  statusLabel: "Survey completed" | "Email only";
  aviationConnection: string | null;
  priorityBase: string | null;
  discoverySource: string | null;
  attributionSource: string | null;
  desiredFeatures: string[];
  contactEmail?: string;
  currentTools?: string[];
  verificationComfort?: string | null;
  betaHelp?: string[];
  biggestPain?: string | null;
  privacyConcern?: string | null;
};

export type WaitlistDashboardMetrics = {
  ok: true;
  totalSignups: number;
  signupsToday: number;
  signupsLast7Days: number;
  signupsLast30Days: number;
  surveyCompletedCount: number;
  surveyCompletionRate: number;
  recentSubmissionsCount: number;
  emailOnlyCount: number;
  topAcquisitionSource: string | null;
  topDesiredFeature: string | null;
  topAviationConnections: WaitlistTopValue[];
  topDesiredFeatures: WaitlistTopValue[];
  topBaseValues: WaitlistTopValue[];
  topDiscoverySources: WaitlistTopValue[];
  topAttributionSources: WaitlistTopValue[];
  topPrivacyConcerns: WaitlistTopValue[];
  topBetaInterest: WaitlistTopValue[];
  topCurrentTools: WaitlistTopValue[];
  topVerificationComfort: WaitlistTopValue[];
  recentSignups: WaitlistRecentSignup[];
};

function startOfUtcDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function daysAgo(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() - days);
  return next;
}

export function maskWaitlistEmail(email: string | null | undefined) {
  const normalized = email?.trim().toLowerCase() ?? "";
  const [localPart, domain] = normalized.split("@");

  if (!localPart || !domain) {
    return "hidden";
  }

  return `${localPart.slice(0, 1)}...@${domain}`;
}

function getSurvey(row: WaitlistSignupRow) {
  return row.waitlist_survey_responses?.[0] ?? null;
}

function hasSurvey(row: WaitlistSignupRow) {
  return Boolean(row.survey_completed_at || getSurvey(row));
}

function normalizeSafeText(
  value: string | null | undefined,
  options: { maxLength?: number } = {},
) {
  const trimmed = value?.trim().replace(/\s+/g, " ") ?? "";
  const maxLength = options.maxLength ?? 80;

  if (
    !trimmed ||
    trimmed.length > maxLength ||
    !SAFE_TEXT_PATTERN.test(trimmed) ||
    SENSITIVE_TEXT_PATTERN.test(trimmed)
  ) {
    return null;
  }

  return trimmed;
}

function addCount(
  counts: Map<string, number>,
  value: string | null | undefined,
  options: { freeText?: boolean; maxLength?: number } = {},
) {
  const label = options.freeText
    ? normalizeSafeText(value, { maxLength: options.maxLength })
    : value?.trim();

  if (!label) {
    return;
  }

  counts.set(label, (counts.get(label) ?? 0) + 1);
}

function addArrayCounts(counts: Map<string, number>, values: string[] | null | undefined) {
  for (const value of values ?? []) {
    addCount(counts, value);
  }
}

function getNormalizedWaitlistEmail(row: WaitlistSignupRow) {
  const normalized = row.normalized_email?.trim().toLowerCase();
  if (normalized) {
    return normalized;
  }

  const fallback = row.email?.trim().toLowerCase();
  return fallback || null;
}

function getWaitlistMaskedLabel(row: WaitlistSignupRow, contactEmail: string | null) {
  const projectedMask = row.masked_email?.trim();
  return projectedMask || maskWaitlistEmail(contactEmail);
}

function toTopValues(counts: Map<string, number>) {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, TOP_VALUE_LIMIT)
    .map(([label, count]) => ({ label, count }));
}

function getAttributionLabel(row: WaitlistSignupRow) {
  let referrerHost: string | null = null;

  if (row.referrer) {
    try {
      referrerHost = new URL(row.referrer).hostname;
    } catch {
      referrerHost = row.referrer;
    }
  }

  return (
    normalizeSafeText(row.utm_source) ||
    normalizeSafeText(row.utm_campaign) ||
    normalizeSafeText(referrerHost) ||
    normalizeSafeText(row.landing_path) ||
    null
  );
}

export function buildWaitlistDashboardMetrics(
  aggregateRows: WaitlistSignupRow[],
  now: Date = new Date(),
  recentRows: WaitlistSignupRow[] = aggregateRows,
  options: { includeContactDetails?: boolean } = {},
): WaitlistDashboardMetrics {
  const includeContactDetails = options.includeContactDetails ?? true;
  const todayStart = startOfUtcDay(now);
  const last7Days = daysAgo(now, 7);
  const last30Days = daysAgo(now, 30);
  const topAviationConnections = new Map<string, number>();
  const topDesiredFeatures = new Map<string, number>();
  const topBaseValues = new Map<string, number>();
  const topDiscoverySources = new Map<string, number>();
  const topAttributionSources = new Map<string, number>();
  const topPrivacyConcerns = new Map<string, number>();
  const topBetaInterest = new Map<string, number>();
  const topCurrentTools = new Map<string, number>();
  const topVerificationComfort = new Map<string, number>();

  let signupsToday = 0;
  let signupsLast7Days = 0;
  let signupsLast30Days = 0;
  let surveyCompletedCount = 0;

  for (const row of aggregateRows) {
    const createdAt = new Date(row.created_at);
    const survey = getSurvey(row);

    if (createdAt >= todayStart) {
      signupsToday += 1;
    }

    if (createdAt >= last7Days) {
      signupsLast7Days += 1;
    }

    if (createdAt >= last30Days) {
      signupsLast30Days += 1;
    }

    if (hasSurvey(row)) {
      surveyCompletedCount += 1;
    }

    addCount(topAviationConnections, survey?.aviation_connection);
    addArrayCounts(topDesiredFeatures, survey?.useful_first);
    addCount(topBaseValues, survey?.priority_base, { freeText: true, maxLength: 80 });
    addCount(topDiscoverySources, survey?.discovery_source);
    addCount(topAttributionSources, getAttributionLabel(row));
    addCount(topPrivacyConcerns, survey?.privacy_concern, {
      freeText: true,
      maxLength: 120,
    });
    addArrayCounts(topBetaInterest, survey?.beta_help);
    addArrayCounts(topCurrentTools, survey?.current_tools);
    addCount(topVerificationComfort, survey?.verification_comfort);
  }

  const recentSignups = recentRows.slice(0, RECENT_SIGNUP_LIMIT).map((row) => {
    const survey = getSurvey(row);
    const contactEmail = getNormalizedWaitlistEmail(row);
    const surveyCompleted = hasSurvey(row);
    const summary = {
      maskedEmail: getWaitlistMaskedLabel(row, contactEmail),
      createdAt: row.created_at,
      surveyCompleted,
      statusLabel: surveyCompleted
        ? ("Survey completed" as const)
        : ("Email only" as const),
      aviationConnection: survey?.aviation_connection ?? null,
      priorityBase: normalizeSafeText(survey?.priority_base, { maxLength: 80 }),
      discoverySource: survey?.discovery_source ?? null,
      attributionSource: getAttributionLabel(row),
      desiredFeatures: survey?.useful_first ?? [],
    };

    if (!includeContactDetails) {
      return summary;
    }

    return {
      ...summary,
      contactEmail: contactEmail ?? "hidden",
      currentTools: survey?.current_tools ?? [],
      verificationComfort: survey?.verification_comfort ?? null,
      betaHelp: survey?.beta_help ?? [],
      biggestPain: normalizeSafeText(survey?.biggest_pain, { maxLength: 180 }),
      privacyConcern: normalizeSafeText(survey?.privacy_concern, { maxLength: 160 }),
    };
  });

  const topAttributionValues = toTopValues(topAttributionSources);
  const topDesiredFeatureValues = toTopValues(topDesiredFeatures);

  return {
    ok: true,
    totalSignups: aggregateRows.length,
    signupsToday,
    signupsLast7Days,
    signupsLast30Days,
    surveyCompletedCount,
    surveyCompletionRate:
      aggregateRows.length > 0
        ? Math.round((surveyCompletedCount / aggregateRows.length) * 100)
        : 0,
    recentSubmissionsCount: recentSignups.length,
    emailOnlyCount: Math.max(aggregateRows.length - surveyCompletedCount, 0),
    topAcquisitionSource: topAttributionValues[0]?.label ?? null,
    topDesiredFeature: topDesiredFeatureValues[0]?.label ?? null,
    topAviationConnections: toTopValues(topAviationConnections),
    topDesiredFeatures: topDesiredFeatureValues,
    topBaseValues: toTopValues(topBaseValues),
    topDiscoverySources: toTopValues(topDiscoverySources),
    topAttributionSources: topAttributionValues,
    topPrivacyConcerns: toTopValues(topPrivacyConcerns),
    topBetaInterest: toTopValues(topBetaInterest),
    topCurrentTools: toTopValues(topCurrentTools),
    topVerificationComfort: toTopValues(topVerificationComfort),
    recentSignups,
  };
}
