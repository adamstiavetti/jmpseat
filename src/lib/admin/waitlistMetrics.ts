import "server-only";

import { createStorageAdminClient, isStorageAdminConfigured } from "../supabase/storageAdmin";
import {
  buildWaitlistDashboardMetrics,
  type WaitlistDashboardMetrics,
  type WaitlistSignupRow,
} from "./waitlistMetricsCore";

export const WAITLIST_ADMIN_ROUTE = "/app/admin/waitlist";
export const WAITLIST_ADMIN_SCOPE = "operator.read_audit";
export const WAITLIST_CONTACT_SCOPE = "operator.view_waitlist_contacts";
export const WAITLIST_METRICS_NOT_READY_MESSAGE =
  "Waitlist metrics are not ready yet. Apply the first-party waitlist migration and configure the service-role server environment before using this dashboard.";

const AGGREGATE_PAGE_SIZE = 1000;
const RECENT_QUERY_LIMIT = 50;
const WAITLIST_AGGREGATE_SELECT_COLUMNS = [
  "landing_path",
  "referrer",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "survey_completed_at",
  "created_at",
  "waitlist_survey_responses(aviation_connection, priority_base, useful_first, current_tools, verification_comfort, beta_help, discovery_source, privacy_concern, created_at)",
].join(",");

const WAITLIST_RECENT_CONTACT_SELECT_COLUMNS = [
  "email",
  "normalized_email",
  "landing_path",
  "referrer",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "survey_completed_at",
  "created_at",
  "waitlist_survey_responses(aviation_connection, priority_base, useful_first, biggest_pain, current_tools, verification_comfort, beta_help, discovery_source, privacy_concern, created_at)",
].join(",");

type WaitlistRecentSummaryRpcRow = {
  masked_email: string | null;
  landing_path: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  survey_completed_at: string | null;
  created_at: string;
  aviation_connection: string | null;
  priority_base: string | null;
  useful_first: string[] | null;
  discovery_source: string | null;
  survey_response_created_at: string | null;
};

export type WaitlistDashboardResult =
  | WaitlistDashboardMetrics
  | {
      ok: false;
      code: "not_ready" | "query_failed";
      message: string;
    };

async function fetchAllWaitlistAggregateRows(
  supabase: ReturnType<typeof createStorageAdminClient>,
) {
  const rows: WaitlistSignupRow[] = [];
  let from = 0;

  while (true) {
    const to = from + AGGREGATE_PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("waitlist_signups")
      .select(WAITLIST_AGGREGATE_SELECT_COLUMNS)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      return { rows: [], error };
    }

    const pageRows = (data ?? []) as unknown as WaitlistSignupRow[];
    rows.push(...pageRows);

    if (pageRows.length < AGGREGATE_PAGE_SIZE) {
      return { rows, error: null };
    }

    from += AGGREGATE_PAGE_SIZE;
  }
}

async function fetchRecentWaitlistRows(
  supabase: ReturnType<typeof createStorageAdminClient>,
  input: {
    includeContactDetails: boolean;
  },
) {
  if (!input.includeContactDetails) {
    const { data, error } = await supabase.rpc("recent_waitlist_signup_summaries", {
      result_limit: RECENT_QUERY_LIMIT,
    });
    const rows = ((data ?? []) as WaitlistRecentSummaryRpcRow[]).map((row) => ({
      email: null,
      normalized_email: null,
      masked_email: row.masked_email,
      landing_path: row.landing_path,
      referrer: row.referrer,
      utm_source: row.utm_source,
      utm_medium: row.utm_medium,
      utm_campaign: row.utm_campaign,
      utm_content: row.utm_content,
      utm_term: row.utm_term,
      survey_completed_at: row.survey_completed_at,
      created_at: row.created_at,
      waitlist_survey_responses:
        row.aviation_connection ||
        row.priority_base ||
        (row.useful_first?.length ?? 0) > 0 ||
        row.discovery_source
          ? [
              {
                aviation_connection: row.aviation_connection,
                priority_base: row.priority_base,
                useful_first: row.useful_first,
                biggest_pain: null,
                current_tools: null,
                verification_comfort: null,
                beta_help: null,
                discovery_source: row.discovery_source,
                privacy_concern: null,
                created_at: row.survey_response_created_at,
              },
            ]
          : [],
    })) satisfies WaitlistSignupRow[];

    return {
      rows,
      error,
    };
  }

  const { data, error } = await supabase
    .from("waitlist_signups")
    .select(WAITLIST_RECENT_CONTACT_SELECT_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(RECENT_QUERY_LIMIT);

  return {
    rows: (data ?? []) as unknown as WaitlistSignupRow[],
    error,
  };
}

export async function getWaitlistDashboardForOperator(input: {
  includeContactDetails: boolean;
}): Promise<WaitlistDashboardResult> {
  if (!isStorageAdminConfigured()) {
    return {
      ok: false,
      code: "not_ready",
      message: WAITLIST_METRICS_NOT_READY_MESSAGE,
    };
  }

  const supabase = createStorageAdminClient();
  const [aggregateResult, recentResult] = await Promise.all([
    fetchAllWaitlistAggregateRows(supabase),
    fetchRecentWaitlistRows(supabase, input),
  ]);

  if (aggregateResult.error || recentResult.error) {
    return {
      ok: false,
      code: "query_failed",
      message:
        "Waitlist metrics could not load. Confirm the first-party waitlist migration is applied.",
    };
  }

  return buildWaitlistDashboardMetrics(
    aggregateResult.rows,
    new Date(),
    recentResult.rows,
    { includeContactDetails: input.includeContactDetails },
  );
}
