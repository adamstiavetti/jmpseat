import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");

async function readPngDimensions(filePath: string) {
  const image = await readFile(filePath);

  return {
    width: image.readUInt32BE(16),
    height: image.readUInt32BE(20),
  };
}

test("public waitlist page uses restored editorial card imagery and airline life marketing copy", async () => {
  const pageSource = await readFile(path.join(rootDir, "app/page.tsx"), "utf8");

  assert.match(pageSource, /headlineAccent}>airline life\./);
  assert.match(
    pageSource,
    /A private hub for airline workers .* bringing base questions,\s*layover recommendations,\s*crew conversations,\s*and everyday\s*resources into one place\./s,
  );
  assert.match(pageSource, /"verified privately"/);
  assert.match(pageSource, /"built for airline life"/);
  assert.doesNotMatch(pageSource, /"verified workers"|"private by design"/);
  assert.doesNotMatch(pageSource, /Verified privately\. Private by design\.|Built for life between trips\./);
  assert.doesNotMatch(pageSource, /Beta Access/);
  assert.doesNotMatch(pageSource, /\/login\?next=\/app/);
  assert.doesNotMatch(pageSource, /NEXT_PUBLIC_WAITLIST_FORM_URL|tally\.so/i);
  assert.match(pageSource, /name="email"/);
  assert.match(pageSource, /type="email"/);
  assert.match(pageSource, /join waitlist/i);
  assert.match(pageSource, /You&apos;re on the waitlist\./);
  assert.match(pageSource, /Help us prioritize your invite and shape jmpseat\./);
  assert.match(pageSource, /Skip survey/);
  assert.doesNotMatch(pageSource, /finish later/i);
  assert.match(pageSource, /not sponsored by or affiliated with\s+any airline/i);
  assert.doesNotMatch(pageSource, /invite-only/);
  assert.doesNotMatch(pageSource, /proof upload|badge upload|document upload/i);
  assert.doesNotMatch(pageSource, /access-hold|redeemBetaInviteCode|privateShell/i);
  assert.doesNotMatch(pageSource, /contactEmail|recentSignups|survey_token|normalized_email/i);
  assert.match(pageSource, /"\/jmpseat\/base-boards-v2\.png"/);
  assert.match(pageSource, /"\/jmpseat\/layover-boards-v2\.png"/);
  assert.match(pageSource, /"\/jmpseat\/verified-rooms-v2\.png"/);
  assert.match(pageSource, /"\/jmpseat\/verified-access-v2\.png"/);
  assert.match(pageSource, /label:\s*"base"/);
  assert.match(pageSource, /label:\s*"layover"/);
  assert.match(pageSource, /label:\s*"rooms"/);
  assert.match(pageSource, /label:\s*"verified"/);
  assert.match(pageSource, /featureLabel}>\{card\.label}/);
});

test("public waitlist root metadata is launch-ready for jmpseat.com", async () => {
  const pageSource = await readFile(path.join(rootDir, "app/page.tsx"), "utf8");

  assert.match(pageSource, /title:\s*"jmpseat \| Private aviation-worker waitlist"/);
  assert.match(
    pageSource,
    /Join the waitlist for jmpseat, an independent aviation-worker community built around bases, layovers, commuting, and crew-specific knowledge\./,
  );
  assert.match(pageSource, /metadataBase:\s*new URL\("https:\/\/jmpseat\.com"\)/);
  assert.match(pageSource, /alternates:\s*{\s*canonical:\s*"\/"/s);
  assert.match(pageSource, /openGraph:\s*{/);
  assert.match(pageSource, /url:\s*"https:\/\/jmpseat\.com"/);
  assert.match(pageSource, /url:\s*"\/jmpseat\/social-preview\.png"/);
  assert.match(pageSource, /twitter:\s*{/);
  assert.match(pageSource, /card:\s*"summary_large_image"/);
  assert.match(pageSource, /images:\s*\["\/jmpseat\/social-preview\.png"\]/);
  assert.match(pageSource, /robots:\s*{\s*index:\s*true,\s*follow:\s*true/s);
  assert.match(pageSource, /width:\s*1200/);
  assert.match(pageSource, /height:\s*630/);
  assert.doesNotMatch(pageSource, /images:\s*\[[^\]]*"\/jmpseat\/hero-runway\.png"/);
  assert.doesNotMatch(pageSource, /metadata[\s\S]*Beta Access/);
  assert.doesNotMatch(pageSource, /metadata[\s\S]*\/login\?next=\/app/);
});

test("public waitlist social preview asset matches declared metadata dimensions", async () => {
  const previewPath = path.join(rootDir, "public/jmpseat/social-preview.png");
  const dimensions = await readPngDimensions(previewPath);

  assert.deepEqual(dimensions, {
    width: 1200,
    height: 630,
  });
});

test("public waitlist email input is described by its helper text", async () => {
  const pageSource = await readFile(path.join(rootDir, "app/page.tsx"), "utf8");

  assert.match(pageSource, /aria-describedby={`\$\{formId\}-helper`}/);
  assert.match(pageSource, /id={`\$\{formId\}-helper`}/);
});

test("public waitlist top anchor does not skip past the brand header", async () => {
  const pageSource = await readFile(path.join(rootDir, "app/page.tsx"), "utf8");

  assert.match(pageSource, /<main id="top" className=\{styles\.page\}>/);
  assert.match(pageSource, /href="#top"/);
  assert.doesNotMatch(pageSource, /<div id="top" className=\{styles\.heroContent\}>/);
  assert.doesNotMatch(pageSource, /autoFocus|scrollIntoView|window\.scrollTo/);
});

test("public legal pages use concrete launch-intent effective dates", async () => {
  const privacySource = await readFile(path.join(rootDir, "app/privacy/page.tsx"), "utf8");
  const termsSource = await readFile(path.join(rootDir, "app/terms/page.tsx"), "utf8");
  const combinedSource = `${privacySource}\n${termsSource}`;

  assert.match(privacySource, /Effective date: June 8, 2026/);
  assert.match(termsSource, /Effective date: June 8, 2026/);
  assert.match(privacySource, /optional follow-up survey/);
  assert.match(privacySource, /source and attribution information/);
  assert.match(privacySource, /limited cookie or\s*token/);
  assert.match(privacySource, /Retention/);
  assert.match(privacySource, /reasonable technical and organizational safeguards/);
  assert.match(termsSource, /public jmpseat\s*waitlist/);
  assert.match(termsSource, /someone else&apos;s email address/);
  assert.match(termsSource, /spam, scraping,\s*security testing, disruption/);
  assert.match(termsSource, /may reject, remove, or ignore submissions/);
  assert.match(termsSource, /may use that feedback to improve/);
  assert.doesNotMatch(combinedSource, /\[Add launch date\]|\[Add [^\]]+\]/);
  assert.doesNotMatch(combinedSource, /Confirm that the final jmpseat domain email inboxes/);
  assert.doesNotMatch(combinedSource, /preview phase|preview page/);
});

test("public waitlist page includes the research-derived optional survey without sensitive fields", async () => {
  const pageSource = await readFile(path.join(rootDir, "app/page.tsx"), "utf8");
  const sharedSource = await readFile(
    path.join(rootDir, "src/lib/waitlist/shared.ts"),
    "utf8",
  );

  assert.match(pageSource, /WAITLIST_SURVEY_QUESTIONS\.map/);
  assert.match(sharedSource, /What best describes your aviation connection\?/);
  assert.match(sharedSource, /Which base or airport community should jmpseat prioritize first\?/);
  assert.match(sharedSource, /What would make jmpseat most useful to you first\?/);
  assert.match(sharedSource, /Base tips from people who actually work there/);
  assert.match(sharedSource, /Verified crew lounges based on role/);
  assert.match(sharedSource, /Commuter or non-rev-adjacent tips/);
  assert.match(sharedSource, /How comfortable would you be using your company airline email to verify your status and keep the community crew-only\?/);
  assert.match(sharedSource, /Team outreach/);
  assert.match(sharedSource, /What tools or communities do you use today for airline-life information\?/);
  assert.match(sharedSource, /Any privacy or trust concern we should design around\?/);
  assert.doesNotMatch(sharedSource, /Base intel|AI layover brief|Verified crew rooms|without flight loads|Founder or team outreach/);
  assert.doesNotMatch(sharedSource, /—/);
  assert.match(pageSource, /Please keep this general\./);
  assert.doesNotMatch(
    `${pageSource}\n${sharedSource}`,
    /employee id|badge|proof|document upload|\bschedule\b|exact hotel|portal credential|passenger information|confidential company/i,
  );
});

test("waitlist server actions keep raw email out of redirect URLs and expose safe states", async () => {
  const actionsSource = await readFile(
    path.join(rootDir, "src/lib/waitlist/actions.ts"),
    "utf8",
  );
  const sharedSource = await readFile(
    path.join(rootDir, "src/lib/waitlist/shared.ts"),
    "utf8",
  );

  assert.match(actionsSource, /"use server"/);
  assert.match(actionsSource, /submitWaitlistEmailAction/);
  assert.match(actionsSource, /submitWaitlistSurveyAction/);
  assert.match(actionsSource, /skipWaitlistSurveyAction/);
  assert.match(actionsSource, /createStorageAdminClient/);
  assert.match(actionsSource, /isStorageAdminConfigured/);
  assert.match(actionsSource, /waitlist:\s*"joined"/);
  assert.match(actionsSource, /waitlist:\s*"invalid_email"/);
  assert.match(actionsSource, /survey_allowed\?: boolean/);
  assert.match(actionsSource, /RECOVERABLE_WAITLIST_SURVEY_CODES/);
  assert.match(actionsSource, /DEFINITIVE_WAITLIST_SURVEY_TOKEN_FAILURE_CODES/);
  assert.match(actionsSource, /"invalid_survey_value"/);
  assert.match(actionsSource, /"sensitive_content_not_allowed"/);
  assert.match(actionsSource, /"waitlist_signup_not_found"/);
  assert.match(actionsSource, /if \(data\.survey_allowed === true\) \{/);
  assert.match(actionsSource, /await setSurveyTokenCookie\(data\.survey_token as string\)/);
  assert.match(
    actionsSource,
    /await clearSurveyTokenCookie\(\);\s*redirect\(buildHomeRedirect\(\{ waitlist: "joined", survey: "unavailable" \}\)\)/s,
  );
  assert.match(actionsSource, /invalidate_waitlist_survey_token/);
  assert.match(
    actionsSource,
    /RECOVERABLE_WAITLIST_SURVEY_CODES\.has\(data\.code \?\? ""\)[\s\S]*redirect\(buildHomeRedirect\(\{ waitlist: "joined", survey: "invalid" \}\)\)/,
  );
  assert.match(
    actionsSource,
    /response\.error \|\| !data[\s\S]*redirect\(buildHomeRedirect\(\{ waitlist: "joined", survey: "error" \}\)\)/,
  );
  assert.match(
    actionsSource,
    /await clearSurveyTokenCookie\(\);\s*redirect\(buildHomeRedirect\(\{ waitlist: "joined", survey: "missing" \}\)\)/s,
  );
  assert.match(actionsSource, /survey:\s*"missing"/);
  assert.doesNotMatch(
    actionsSource,
    /search\.set\([^)]*email|redirect\([^)]*normalizedEmail|\bemail\s*:\s*normalizedEmail/s,
  );
  assert.match(sharedSource, /normalizeWaitlistEmail/);
  assert.match(sharedSource, /WAITLIST_SURVEY_QUESTIONS/);
  assert.doesNotMatch(sharedSource, /employee id|badge|proof upload|document upload/i);
});

test("public waitlist duplicate success state does not expose an editable survey", async () => {
  const pageSource = await readFile(path.join(rootDir, "app/page.tsx"), "utf8");

  assert.match(pageSource, /surveyStatus === "unavailable"/);
  assert.match(pageSource, /Your waitlist spot is saved\./);
  assert.match(
    pageSource,
    /Optional answers can only be added\s*from the original signup session\./,
  );
  assert.match(
    pageSource,
    /surveyStatus === "missing"[\s\S]*surveyStatus === "unavailable"/,
  );
  assert.match(pageSource, /surveyFinished \? null : <WaitlistSurveyForm \/>/);
});

test("waitlist signup rollout fails closed for legacy token-only RPC responses", async () => {
  const actionsSource = await readFile(
    path.join(rootDir, "src/lib/waitlist/actions.ts"),
    "utf8",
  );
  const migrationsDir = path.join(rootDir, "supabase/migrations");
  const migrationNames = await readdir(migrationsDir);
  const hardeningMigrationName = migrationNames.find((name) =>
    name.includes("harden_waitlist_survey_tokens"),
  );

  assert.ok(hardeningMigrationName, "missing waitlist survey token hardening migration");

  const sql = await readFile(path.join(migrationsDir, hardeningMigrationName), "utf8");

  assert.match(
    actionsSource,
    /legacy token-only RPC responses are intentionally not[\s\S]*accepted/,
  );
  assert.match(actionsSource, /Apply the hardened migration before deploying this app code/);
  assert.match(
    actionsSource,
    /trusting a token without survey_allowed would preserve duplicate-token[\s\S]*takeover/,
  );
  assert.match(
    actionsSource,
    /if \(data\.survey_allowed === true\) \{\s*await setSurveyTokenCookie\(data\.survey_token as string\);\s*redirect\(buildHomeRedirect\(\{ waitlist: "joined" \}\)\);\s*\}\s*await clearSurveyTokenCookie\(\);\s*redirect\(buildHomeRedirect\(\{ waitlist: "joined", survey: "unavailable" \}\)\);/s,
  );
  assert.doesNotMatch(
    actionsSource,
    /if \(\s*(?:isUuid\(data\.survey_token|data\.survey_token)[\s\S]*setSurveyTokenCookie/,
  );
  assert.match(sql, /'survey_allowed', true,\s*'survey_token', v_survey_token/s);
  assert.match(sql, /'survey_allowed', false,\s*'survey_token', null/s);
});

test("recoverable survey errors keep the current signup session editable", async () => {
  const pageSource = await readFile(path.join(rootDir, "app/page.tsx"), "utf8");
  const actionsSource = await readFile(
    path.join(rootDir, "src/lib/waitlist/actions.ts"),
    "utf8",
  );

  assert.match(pageSource, /surveyStatus === "invalid"/);
  assert.match(pageSource, /Check your selections\s*and keep free-text answers general\./);
  const surveyFinishedBlock = pageSource.match(
    /const surveyFinished =[\s\S]*?surveyStatus === "unavailable";/,
  )?.[0] ?? "";
  assert.doesNotMatch(surveyFinishedBlock, /surveyStatus === "invalid"/);
  assert.match(
    actionsSource,
    /RECOVERABLE_WAITLIST_SURVEY_CODES\.has\(data\.code \?\? ""\)[\s\S]*survey: "invalid"/,
  );
  assert.doesNotMatch(
    actionsSource,
    /RECOVERABLE_WAITLIST_SURVEY_CODES\.has\(data\.code \?\? ""\)[\s\S]*clearSurveyTokenCookie\(\)[\s\S]*survey: "invalid"/,
  );
});

test("transient survey RPC failures keep the current signup session editable", async () => {
  const pageSource = await readFile(path.join(rootDir, "app/page.tsx"), "utf8");
  const actionsSource = await readFile(
    path.join(rootDir, "src/lib/waitlist/actions.ts"),
    "utf8",
  );

  assert.match(pageSource, /surveyStatus === "error"/);
  assert.match(pageSource, /We couldn&apos;t save those answers\. Please try again\./);
  const surveyFinishedBlock = pageSource.match(
    /const surveyFinished =[\s\S]*?surveyStatus === "unavailable";/,
  )?.[0] ?? "";
  assert.doesNotMatch(surveyFinishedBlock, /surveyStatus === "error"/);
  assert.match(
    actionsSource,
    /catch \{\s*redirect\(buildHomeRedirect\(\{ waitlist: "joined", survey: "error" \}\)\);\s*\}/,
  );
  assert.match(
    actionsSource,
    /if \(response\.error \|\| !data\) \{\s*redirect\(buildHomeRedirect\(\{ waitlist: "joined", survey: "error" \}\)\);\s*\}/,
  );
  const transientFailureBlock = actionsSource.match(
    /if \(response\.error \|\| !data\) \{[\s\S]*?\n  \}/,
  )?.[0] ?? "";
  assert.doesNotMatch(transientFailureBlock, /clearSurveyTokenCookie\(\)/);
  assert.doesNotMatch(pageSource, /database error|service-role|survey_token|normalized_email/i);
});

test("definitive survey token failures clear the current session token", async () => {
  const actionsSource = await readFile(
    path.join(rootDir, "src/lib/waitlist/actions.ts"),
    "utf8",
  );

  assert.match(actionsSource, /DEFINITIVE_WAITLIST_SURVEY_TOKEN_FAILURE_CODES/);
  assert.match(actionsSource, /"waitlist_signup_not_found"/);
  assert.match(
    actionsSource,
    /DEFINITIVE_WAITLIST_SURVEY_TOKEN_FAILURE_CODES\.has\(data\.code \?\? ""\)[\s\S]*await clearSurveyTokenCookie\(\);[\s\S]*survey: "missing"/,
  );
});

test("skip survey copy is final and invalidates the current token", async () => {
  const pageSource = await readFile(path.join(rootDir, "app/page.tsx"), "utf8");
  const actionsSource = await readFile(
    path.join(rootDir, "src/lib/waitlist/actions.ts"),
    "utf8",
  );

  assert.match(pageSource, /Skip survey/);
  assert.match(pageSource, /Survey skipped\. Your waitlist spot is saved\./);
  assert.doesNotMatch(pageSource, /Skip for now|finish later/i);
  assert.match(actionsSource, /invalidate_waitlist_survey_token/);
  assert.match(
    actionsSource,
    /invalidate_waitlist_survey_token[\s\S]*await clearSurveyTokenCookie\(\);[\s\S]*survey: "skipped"/,
  );
});

test("first-party waitlist migration creates RLS-protected signup and survey persistence", async () => {
  const migrationsDir = path.join(rootDir, "supabase/migrations");
  const migrationNames = await readdir(migrationsDir);
  const waitlistMigrationName = migrationNames.find((name) =>
    name.includes("create_public_waitlist_capture"),
  );

  assert.ok(waitlistMigrationName, "missing public waitlist capture migration");

  const sql = await readFile(path.join(migrationsDir, waitlistMigrationName), "utf8");

  assert.match(sql, /create table if not exists public\.waitlist_signups/i);
  assert.match(sql, /create table if not exists public\.waitlist_survey_responses/i);
  assert.match(sql, /normalized_email/i);
  assert.match(sql, /survey_token/i);
  assert.match(sql, /alter table public\.waitlist_signups enable row level security/i);
  assert.match(sql, /alter table public\.waitlist_survey_responses enable row level security/i);
  assert.match(sql, /submit_waitlist_signup/i);
  assert.match(sql, /submit_waitlist_survey_response/i);
  assert.match(sql, /security definer/i);

  const surveyGrantStatements =
    sql.match(
      /grant execute on function public\.submit_waitlist_survey_response\([\s\S]*?\) to [^;]+;/gi,
    ) ?? [];
  assert.ok(
    surveyGrantStatements.some((statement) => /to service_role/i.test(statement)),
    "survey response RPC should be callable only through a trusted server-owned path",
  );
  assert.ok(
    surveyGrantStatements.every(
      (statement) => !/to\s+(anon|authenticated)\b/i.test(statement),
    ),
    "survey response RPC should not be granted to public client roles",
  );
  assert.match(sql, /grant execute on function public\.submit_waitlist_signup[\s\S]*to anon, authenticated/i);
  assert.match(sql, /waitlist_survey_text_has_sensitive_content/i);
  assert.match(sql, /employee\\s\*id\|badge\|document\\s\*upload\|password\|portal\|passenger\|hotel\|schedule\|credential/i);
  assert.match(sql, /cardinality\(v_useful_first\) > 3/i);
  assert.match(sql, /cardinality\(v_current_tools\) > 5/i);
  assert.match(sql, /cardinality\(v_beta_help\) > 4/i);
  assert.match(sql, /public\.waitlist_survey_array_has_unknown_value/i);
  assert.match(sql, /Comfortable using an airline employee email later/);
  assert.match(sql, /Commuter or non-rev-adjacent tips without flight loads/);
  assert.doesNotMatch(sql, /employee_id|portal_credential/i);
});

test("waitlist survey copy polish migration keeps runtime allowlists aligned", async () => {
  const migrationsDir = path.join(rootDir, "supabase/migrations");
  const migrationNames = await readdir(migrationsDir);
  const polishMigrationName = migrationNames.find((name) =>
    name.includes("polish_waitlist_survey_copy"),
  );

  assert.ok(polishMigrationName, "missing waitlist survey copy polish migration");

  const sql = await readFile(path.join(migrationsDir, polishMigrationName), "utf8");

  assert.match(sql, /Base tips from people who actually work there/);
  assert.match(sql, /Verified crew lounges based on role/);
  assert.match(sql, /Commuter or non-rev-adjacent tips/);
  assert.match(sql, /Comfortable using my company airline email later/);
  assert.match(sql, /Team outreach/);
  assert.doesNotMatch(sql, /Base intel|AI layover brief|Verified crew rooms|without flight loads|Founder or team outreach/);
  assert.doesNotMatch(sql, /—/);
  assert.match(sql, /grant execute on function public\.submit_waitlist_survey_response[\s\S]*to service_role/i);
  assert.doesNotMatch(sql, /grant execute on function public\.submit_waitlist_survey_response[\s\S]*to anon, authenticated/i);
});

test("waitlist duplicate hardening migration withholds duplicate survey tokens", async () => {
  const migrationsDir = path.join(rootDir, "supabase/migrations");
  const migrationNames = await readdir(migrationsDir);
  const hardeningMigrationName = migrationNames.find((name) =>
    name.includes("harden_waitlist_survey_tokens"),
  );

  assert.ok(hardeningMigrationName, "missing waitlist survey token hardening migration");

  const sql = await readFile(path.join(migrationsDir, hardeningMigrationName), "utf8");

  assert.match(sql, /update public\.waitlist_signups\s*set survey_token = gen_random_uuid\(\);/i);
  assert.match(sql, /create or replace function public\.submit_waitlist_signup/i);
  assert.match(sql, /on conflict \(normalized_email\) do nothing/i);
  assert.match(sql, /'survey_allowed', false,\s*'survey_token', null/s);
  assert.match(sql, /'survey_allowed', true,\s*'survey_token', v_survey_token/s);
  assert.doesNotMatch(sql, /on conflict \(normalized_email\) do update/i);
  assert.doesNotMatch(sql, /returning id, survey_token/i);
  assert.match(sql, /create or replace function public\.submit_waitlist_survey_response/i);
  assert.match(
    sql,
    /set\s+survey_token = gen_random_uuid\(\),\s*survey_completed_at = now\(\)\s*where survey_token = requested_survey_token\s*returning id into v_signup_id/is,
  );
  assert.match(sql, /create or replace function public\.invalidate_waitlist_survey_token/i);
  assert.match(
    sql,
    /set survey_token = gen_random_uuid\(\)\s*where survey_token = requested_survey_token/is,
  );
  assert.match(sql, /grant execute on function public\.submit_waitlist_signup[\s\S]*to anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.submit_waitlist_survey_response[\s\S]*to service_role/i);
  assert.match(
    sql,
    /grant execute on function public\.invalidate_waitlist_survey_token\(uuid\)\s*to service_role/i,
  );
  assert.doesNotMatch(sql, /grant execute on function public\.submit_waitlist_survey_response[\s\S]*to anon, authenticated/i);
  assert.doesNotMatch(sql, /grant execute on function public\.invalidate_waitlist_survey_token[\s\S]*to anon, authenticated/i);
});
