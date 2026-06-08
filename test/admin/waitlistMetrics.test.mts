import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  buildWaitlistDashboardMetrics,
  maskWaitlistEmail,
} from "../../src/lib/admin/waitlistMetricsCore.ts";

const now = new Date("2026-06-07T18:00:00.000Z");

function signup(overrides = {}) {
  return {
    email: "crew.one@example.com",
    normalized_email: "crew.one@example.com",
    landing_path: "/",
    referrer: "https://ref.example/path",
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_content: null,
    utm_term: null,
    survey_completed_at: null,
    created_at: "2026-06-07T12:00:00.000Z",
    waitlist_survey_responses: [],
    ...overrides,
  };
}

test("waitlist metrics compute aggregate signup and survey counts from fixture data", () => {
  const metrics = buildWaitlistDashboardMetrics(
    [
      signup({
        normalized_email: "crew.one@example.com",
        survey_completed_at: "2026-06-07T12:05:00.000Z",
        waitlist_survey_responses: [
          {
            aviation_connection: "Flight attendant",
            priority_base: "DFW",
            useful_first: [
              "Base tips from people who actually work there",
              "Verified crew lounges based on role",
            ],
            biggest_pain: "Finding a trusted crew community at new bases.",
            current_tools: ["Reddit"],
            verification_comfort:
              "Comfortable using my company airline email later",
            beta_help: ["I only want launch updates for now"],
            discovery_source: "Team outreach",
            privacy_concern: "Keep work identity separate from public posting.",
            created_at: "2026-06-07T12:05:00.000Z",
          },
        ],
      }),
      signup({
        normalized_email: "crew.two@example.com",
        created_at: "2026-06-02T12:00:00.000Z",
        utm_source: "instagram",
        waitlist_survey_responses: [
          {
            aviation_connection: "Pilot",
            priority_base: "employee id 123",
            useful_first: ["Commuter or non-rev-adjacent tips"],
            biggest_pain: "Sorting out who actually knows the base.",
            current_tools: ["Group chats or text threads"],
            verification_comfort: "I need more privacy details first",
            beta_help: ["I would do a short interview"],
            discovery_source: "Instagram or TikTok",
            privacy_concern: "Do not expose my employee id or base publicly.",
            created_at: "2026-06-02T12:05:00.000Z",
          },
        ],
      }),
      signup({
        normalized_email: "crew.three@example.com",
        created_at: "2026-05-01T12:00:00.000Z",
        waitlist_survey_responses: [],
      }),
    ],
    now,
  );

  assert.equal(metrics.totalSignups, 3);
  assert.equal(metrics.signupsToday, 1);
  assert.equal(metrics.signupsLast7Days, 2);
  assert.equal(metrics.signupsLast30Days, 2);
  assert.equal(metrics.surveyCompletedCount, 2);
  assert.equal(metrics.surveyCompletionRate, 67);
  assert.deepEqual(metrics.topAviationConnections, [
    { label: "Flight attendant", count: 1 },
    { label: "Pilot", count: 1 },
  ]);
  assert.deepEqual(metrics.topDesiredFeatures, [
    { label: "Base tips from people who actually work there", count: 1 },
    { label: "Commuter or non-rev-adjacent tips", count: 1 },
    { label: "Verified crew lounges based on role", count: 1 },
  ]);
  assert.deepEqual(metrics.topBaseValues, [{ label: "DFW", count: 1 }]);
  assert.deepEqual(metrics.topDiscoverySources, [
    { label: "Instagram or TikTok", count: 1 },
    { label: "Team outreach", count: 1 },
  ]);
  assert.deepEqual(metrics.topAttributionSources, [
    { label: "ref.example", count: 2 },
    { label: "instagram", count: 1 },
  ]);
  assert.deepEqual(metrics.topPrivacyConcerns, [
    { label: "Keep work identity separate from public posting.", count: 1 },
  ]);
  assert.deepEqual(metrics.topBetaInterest, [
    { label: "I only want launch updates for now", count: 1 },
    { label: "I would do a short interview", count: 1 },
  ]);
  assert.equal(metrics.topAcquisitionSource, "ref.example");
  assert.equal(
    metrics.topDesiredFeature,
    "Base tips from people who actually work there",
  );
  assert.equal(metrics.emailOnlyCount, 1);
});

test("waitlist metrics keep authorized contact emails and survey detail while still excluding ids and tokens", () => {
  const metrics = buildWaitlistDashboardMetrics([
    signup({
      normalized_email: "private.user@example.com",
      survey_completed_at: "2026-06-07T12:05:00.000Z",
      waitlist_survey_responses: [
        {
          aviation_connection: "Flight attendant",
          priority_base: "LAX",
          useful_first: ["Layover recommendations"],
          biggest_pain: "Need better crew recommendations that are actually current.",
          current_tools: ["Coworkers or friends"],
          verification_comfort: "Not applicable yet",
          beta_help: ["I only want launch updates for now"],
          discovery_source: "Friend or coworker",
          privacy_concern: "Keep my name off public pages.",
          created_at: "2026-06-07T12:05:00.000Z",
        },
      ],
    }),
  ]);

  assert.equal(maskWaitlistEmail("private.user@example.com"), "p...@example.com");
  assert.equal(metrics.recentSignups[0]?.contactEmail, "private.user@example.com");
  assert.equal(metrics.recentSignups[0]?.maskedEmail, "p...@example.com");
  assert.equal(metrics.recentSignups[0]?.priorityBase, "LAX");
  assert.equal(metrics.recentSignups[0]?.statusLabel, "Survey completed");
  assert.deepEqual(metrics.recentSignups[0]?.desiredFeatures, [
    "Layover recommendations",
  ]);
  assert.equal(
    metrics.recentSignups[0]?.biggestPain,
    "Need better crew recommendations that are actually current.",
  );
  assert.equal(
    metrics.recentSignups[0]?.privacyConcern,
    "Keep my name off public pages.",
  );
  assert.doesNotMatch(JSON.stringify(metrics), /survey_token|row_id|user_id|uuid/i);
});

test("waitlist metrics omit raw contact email and richer per-person detail in audit-only mode", () => {
  const metrics = buildWaitlistDashboardMetrics(
    [
      signup({
        email: null,
        normalized_email: null,
        masked_email: "p...@example.com",
        survey_completed_at: "2026-06-07T12:05:00.000Z",
        waitlist_survey_responses: [
          {
            aviation_connection: "Flight attendant",
            priority_base: "LAX",
            useful_first: ["Layover recommendations"],
            biggest_pain: "Need better crew recommendations that are actually current.",
            current_tools: ["Coworkers or friends"],
            verification_comfort: "Not applicable yet",
            beta_help: ["I only want launch updates for now"],
            discovery_source: "Friend or coworker",
            privacy_concern: "Keep my name off public pages.",
            created_at: "2026-06-07T12:05:00.000Z",
          },
        ],
      }),
      signup({
        email: null,
        normalized_email: null,
        masked_email: "c...@example.com",
        created_at: "2026-06-07T12:04:00.000Z",
      }),
    ],
    now,
    undefined,
    { includeContactDetails: false },
  );

  assert.equal(metrics.recentSignups[0]?.maskedEmail, "p...@example.com");
  assert.equal(metrics.recentSignups[1]?.maskedEmail, "c...@example.com");
  assert.equal("contactEmail" in (metrics.recentSignups[0] ?? {}), false);
  assert.equal("biggestPain" in (metrics.recentSignups[0] ?? {}), false);
  assert.equal("privacyConcern" in (metrics.recentSignups[0] ?? {}), false);
  assert.equal("currentTools" in (metrics.recentSignups[0] ?? {}), false);
  assert.equal("betaHelp" in (metrics.recentSignups[0] ?? {}), false);
});

test("waitlist aggregate metrics stay accurate beyond the recent display cap", () => {
  const rows = Array.from({ length: 650 }, (_, index) => {
    const isToday = index < 10;
    const isLast7Days = index < 120;
    const isLast30Days = index < 520;
    const hasSurveyResponse = index < 325;

    return signup({
      normalized_email: `crew.${index}@example.com`,
      created_at: isToday
        ? "2026-06-07T12:00:00.000Z"
        : isLast7Days
          ? "2026-06-03T12:00:00.000Z"
          : isLast30Days
            ? "2026-05-20T12:00:00.000Z"
            : "2026-04-01T12:00:00.000Z",
      survey_completed_at: hasSurveyResponse
        ? "2026-06-07T12:05:00.000Z"
        : null,
      waitlist_survey_responses: hasSurveyResponse
        ? [
            {
              aviation_connection:
                index % 2 === 0 ? "Flight attendant" : "Pilot",
              priority_base: index % 3 === 0 ? "DFW" : "LAX",
              useful_first: ["Verified crew lounges based on role"],
              biggest_pain: "Need trusted base advice.",
              current_tools: ["Group chats or text threads"],
              verification_comfort:
                "Comfortable using my company airline email later",
              beta_help: ["I only want launch updates for now"],
              discovery_source: index % 4 === 0 ? "Team outreach" : "Instagram or TikTok",
              privacy_concern: "Keep verification private.",
              created_at: "2026-06-07T12:05:00.000Z",
            },
          ]
        : [],
    });
  });

  const metrics = buildWaitlistDashboardMetrics(rows, now, rows.slice(0, 50));

  assert.equal(metrics.totalSignups, 650);
  assert.equal(metrics.signupsToday, 10);
  assert.equal(metrics.signupsLast7Days, 120);
  assert.equal(metrics.signupsLast30Days, 520);
  assert.equal(metrics.surveyCompletedCount, 325);
  assert.equal(metrics.surveyCompletionRate, 50);
  assert.equal(metrics.recentSubmissionsCount, 12);
  assert.equal(metrics.recentSignups.length, 12);
  assert.equal(metrics.emailOnlyCount, 325);
  assert.ok(
    metrics.topDesiredFeatures.some(
      (feature) =>
        feature.label === "Verified crew lounges based on role" &&
        feature.count === 325,
    ),
  );
});

test("waitlist attribution preserves common safe UTM labels with underscores", () => {
  const metrics = buildWaitlistDashboardMetrics([
    signup({
      referrer: "https://fallback.example/path",
      utm_source: "ig_story",
    }),
    signup({
      referrer: "https://fallback.example/path",
      utm_source: null,
      utm_campaign: "public_waitlist_launch",
    }),
    signup({
      utm_source: "facebook_ads",
      utm_campaign: "ignored_campaign",
    }),
    signup({
      utm_source: "crew_base_push",
    }),
    signup({
      utm_source: "email_newsletter",
    }),
  ]);

  assert.deepEqual(metrics.topAttributionSources, [
    { label: "crew_base_push", count: 1 },
    { label: "email_newsletter", count: 1 },
    { label: "facebook_ads", count: 1 },
    { label: "ig_story", count: 1 },
    { label: "public_waitlist_launch", count: 1 },
  ]);
});

test("waitlist attribution rejects unsafe UTM labels before falling back safely", () => {
  const metrics = buildWaitlistDashboardMetrics([
    signup({
      referrer: "https://safe-referrer.example/path",
      landing_path: "/",
      utm_source: "private.user@example.com",
      utm_campaign: "token_private_campaign",
    }),
    signup({
      referrer: null,
      landing_path: "/",
      utm_source: "https://example.com/?token=secret",
      utm_campaign: "<script>alert(1)</script>",
    }),
  ]);

  assert.deepEqual(metrics.topAttributionSources, [
    { label: "/", count: 1 },
    { label: "safe-referrer.example", count: 1 },
  ]);
});

test("waitlist dashboard source keeps contact detail behind waitlist-contact access and avoids sensitive ids or tokens", () => {
  const pageSource = readFileSync(
    new URL("../../app/app/admin/waitlist/page.tsx", import.meta.url),
    "utf8",
  );
  const metricsSource = readFileSync(
    new URL("../../src/lib/admin/waitlistMetrics.ts", import.meta.url),
    "utf8",
  );
  const metricsCoreSource = readFileSync(
    new URL("../../src/lib/admin/waitlistMetricsCore.ts", import.meta.url),
    "utf8",
  );
  const combined = `${pageSource}\n${metricsSource}\n${metricsCoreSource}`;
  const contactColumns = metricsSource.match(
    /const WAITLIST_RECENT_CONTACT_SELECT_COLUMNS = \[(.*?)\]\.join\(","\);/s,
  )?.[1];

  assert.match(pageSource, /WAITLIST_ADMIN_SCOPE/);
  assert.match(pageSource, /WAITLIST_CONTACT_SCOPE/);
  assert.match(pageSource, /canViewWaitlistContacts/);
  assert.match(pageSource, /includeContactDetails:\s*canViewWaitlistContacts/);
  assert.match(pageSource, /AUTH_ROUTES\.accessRestricted/);
  assert.match(pageSource, /full waitlist contact emails/i);
  assert.match(pageSource, /masked recent submission summaries/i);
  assert.match(pageSource, /Contact details and full per-submission survey context require/i);
  assert.match(pageSource, /founder\/admin invite prioritization/i);
  assert.match(pageSource, /signup\.contactEmail/);
  assert.match(pageSource, /signup\.maskedEmail/);
  assert.match(pageSource, /Email-only rows still matter/i);
  assert.match(pageSource, /Biggest problem to solve first/i);
  assert.match(pageSource, /Private beta willingness/i);
  assert.match(metricsSource, /WAITLIST_CONTACT_SCOPE/);
  assert.match(metricsSource, /WAITLIST_AGGREGATE_SELECT_COLUMNS/);
  assert.match(metricsSource, /recent_waitlist_signup_summaries/);
  assert.match(metricsSource, /masked_email/);
  assert.match(metricsSource, /email:\s*null/);
  assert.match(metricsSource, /normalized_email:\s*null/);
  assert.match(metricsSource, /WAITLIST_RECENT_CONTACT_SELECT_COLUMNS/);
  assert.ok(contactColumns);
  assert.match(contactColumns ?? "", /email/i);
  assert.match(contactColumns ?? "", /normalized_email/i);
  assert.match(contactColumns ?? "", /biggest_pain/i);
  assert.match(contactColumns ?? "", /privacy_concern/i);
  assert.match(metricsSource, /input\.includeContactDetails/);
  assert.match(metricsCoreSource, /contactEmail/);
  assert.match(metricsCoreSource, /maskedEmail/);
  assert.match(metricsCoreSource, /biggestPain/);
  assert.match(metricsCoreSource, /privacyConcern/);
  assert.match(metricsSource, /fetchAllWaitlistAggregateRows/);
  assert.match(metricsSource, /\.range\(from, to\)/);
  assert.match(metricsSource, /RECENT_QUERY_LIMIT/);
  assert.match(metricsSource, /biggest_pain/);
  assert.match(metricsSource, /privacy_concern/);
  assert.match(metricsSource, /buildWaitlistDashboardMetrics\([\s\S]*includeContactDetails: input\.includeContactDetails/s);
  assert.doesNotMatch(metricsSource, /\.limit\(500\)/);
  assert.doesNotMatch(combined, /proof upload|badge upload|document upload|portal credential|passenger information/i);
  assert.doesNotMatch(pageSource, /survey_token|normalized_email|waitlist_signups|row_id|uuid/i);
});
