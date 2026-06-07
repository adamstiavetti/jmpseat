"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getSupabaseBrowserEnv } from "../supabase/config";
import { createClient } from "../supabase/server";
import {
  createStorageAdminClient,
  isStorageAdminConfigured,
} from "../supabase/storageAdmin";
import {
  WAITLIST_SURVEY_QUESTIONS,
  WAITLIST_SURVEY_TOKEN_COOKIE,
  getWaitlistMultiSelectValues,
  normalizeWaitlistEmail,
  trimWaitlistText,
} from "./shared";

const WAITLIST_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

type WaitlistSignupRpcResponse = {
  ok?: boolean;
  code?: string;
  survey_token?: string | null;
};

type WaitlistSurveyRpcResponse = {
  ok?: boolean;
  code?: string;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function buildHomeRedirect(params: Record<string, string | null | undefined>) {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const suffix = search.toString();
  return suffix ? `/?${suffix}#waitlist` : "/#waitlist";
}

function isUuid(value: string | null | undefined) {
  return Boolean(
    value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
      ),
  );
}

async function setSurveyTokenCookie(surveyToken: string) {
  const cookieStore = await cookies();
  cookieStore.set(WAITLIST_SURVEY_TOKEN_COOKIE, surveyToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: WAITLIST_COOKIE_MAX_AGE_SECONDS,
  });
}

async function getSurveyTokenCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(WAITLIST_SURVEY_TOKEN_COOKIE)?.value ?? null;
}

async function clearSurveyTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(WAITLIST_SURVEY_TOKEN_COOKIE);
}

function getQuestionByName(name: string) {
  return WAITLIST_SURVEY_QUESTIONS.find((question) => question.name === name);
}

function getOptionalSingle(formData: FormData, name: string) {
  const question = getQuestionByName(name);
  const value = getString(formData, name);

  if (!value || !question || question.type !== "single") {
    return null;
  }

  return (question.options as readonly string[]).includes(value) ? value : null;
}

function getOptionalMulti(formData: FormData, name: string) {
  const question = getQuestionByName(name);

  if (!question || question.type !== "multi") {
    return [];
  }

  return getWaitlistMultiSelectValues(
    formData,
    name,
    question.options,
    question.maxSelections,
  );
}

export async function submitWaitlistEmailAction(formData: FormData) {
  const normalizedEmail = normalizeWaitlistEmail(getString(formData, "email"));

  if (!normalizedEmail) {
    redirect(buildHomeRedirect({ waitlist: "invalid_email" }));
  }

  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    redirect(buildHomeRedirect({ waitlist: "not_ready" }));
  }

  const supabase = await createClient();
  const response = await supabase.rpc("submit_waitlist_signup", {
    requested_email: normalizedEmail,
    requested_landing_path: getString(formData, "landing_path") || "/",
    requested_referrer: null,
    requested_utm_source: getString(formData, "utm_source") || null,
    requested_utm_medium: getString(formData, "utm_medium") || null,
    requested_utm_campaign: getString(formData, "utm_campaign") || null,
    requested_utm_content: getString(formData, "utm_content") || null,
    requested_utm_term: getString(formData, "utm_term") || null,
  });
  const data = (response.data as WaitlistSignupRpcResponse | null) ?? null;

  if (
    response.error ||
    data?.ok !== true ||
    !isUuid(data.survey_token ?? null)
  ) {
    redirect(
      buildHomeRedirect({
        waitlist: data?.code === "invalid_email" ? "invalid_email" : "error",
      }),
    );
  }

  await setSurveyTokenCookie(data.survey_token as string);
  redirect(buildHomeRedirect({ waitlist: "joined" }));
}

export async function submitWaitlistSurveyAction(formData: FormData) {
  const surveyToken = await getSurveyTokenCookie();

  if (!isUuid(surveyToken)) {
    redirect(buildHomeRedirect({ waitlist: "joined", survey: "missing" }));
  }

  const env = getSupabaseBrowserEnv();

  if (!env.enabled || !isStorageAdminConfigured()) {
    redirect(buildHomeRedirect({ waitlist: "joined", survey: "not_ready" }));
  }

  const priorityBaseQuestion = getQuestionByName("priority_base");
  const biggestPainQuestion = getQuestionByName("biggest_pain");
  const privacyConcernQuestion = getQuestionByName("privacy_concern");

  const supabase = createStorageAdminClient();
  const response = await supabase.rpc("submit_waitlist_survey_response", {
    requested_survey_token: surveyToken,
    requested_aviation_connection: getOptionalSingle(
      formData,
      "aviation_connection",
    ),
    requested_priority_base: trimWaitlistText(
      formData.get("priority_base"),
      priorityBaseQuestion?.type === "short" ? priorityBaseQuestion.maxLength : 120,
    ),
    requested_useful_first: getOptionalMulti(formData, "useful_first"),
    requested_biggest_pain: trimWaitlistText(
      formData.get("biggest_pain"),
      biggestPainQuestion?.type === "short" ? biggestPainQuestion.maxLength : 500,
    ),
    requested_current_tools: getOptionalMulti(formData, "current_tools"),
    requested_verification_comfort: getOptionalSingle(
      formData,
      "verification_comfort",
    ),
    requested_beta_help: getOptionalMulti(formData, "beta_help"),
    requested_discovery_source: getOptionalSingle(formData, "discovery_source"),
    requested_privacy_concern: trimWaitlistText(
      formData.get("privacy_concern"),
      privacyConcernQuestion?.type === "short"
        ? privacyConcernQuestion.maxLength
        : 500,
    ),
  });
  const data = (response.data as WaitlistSurveyRpcResponse | null) ?? null;

  if (response.error || data?.ok !== true) {
    redirect(buildHomeRedirect({ waitlist: "joined", survey: "error" }));
  }

  await clearSurveyTokenCookie();
  redirect(buildHomeRedirect({ waitlist: "joined", survey: "saved" }));
}

export async function skipWaitlistSurveyAction() {
  await clearSurveyTokenCookie();
  redirect(buildHomeRedirect({ waitlist: "joined", survey: "skipped" }));
}
