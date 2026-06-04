export const PROFILE_FOUNDATION_FIELDS = [
  "handle",
  "display_name",
  "claimed_airline",
  "claimed_role",
  "claimed_base",
] as const;

export type ProfileFoundationField = (typeof PROFILE_FOUNDATION_FIELDS)[number];

export type AppProfileRecord = Partial<
  Record<ProfileFoundationField, string | null | undefined>
> & {
  profile_completed_at?: string | null;
};

export type ProfileCompletionState = {
  isComplete: boolean;
  missingFields: ProfileFoundationField[];
};

export const PROFILE_DUPLICATE_HANDLE_MESSAGE =
  "That handle is already taken. Try another one.";

export const PROFILE_STORAGE_NOT_READY_MESSAGE =
  "Profile storage is not ready yet. Apply the profiles migration to this Supabase project before using account profiles.";

function normalizeValue(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : null;
}

export function normalizeHandle(value: string | null | undefined) {
  const normalized = normalizeValue(value);

  if (!normalized) {
    return null;
  }

  const withoutLeadingAt = normalized.replace(/^@+/, "");
  const lowered = withoutLeadingAt.toLowerCase();
  const cleaned = lowered.replace(/[^a-z0-9_-]+/g, "");

  return cleaned.length > 0 ? cleaned : null;
}

export function normalizeProfileInput(profile: AppProfileRecord): AppProfileRecord {
  return {
    handle: normalizeHandle(profile.handle),
    display_name: normalizeValue(profile.display_name),
    claimed_airline: normalizeValue(profile.claimed_airline),
    claimed_role: normalizeValue(profile.claimed_role),
    claimed_base: normalizeValue(profile.claimed_base),
    profile_completed_at: profile.profile_completed_at ?? null,
  };
}

export function getProfileCompletionState(
  profile: AppProfileRecord | null | undefined,
): ProfileCompletionState {
  const normalized = normalizeProfileInput(profile ?? {});
  const missingFields = PROFILE_FOUNDATION_FIELDS.filter((field) => !normalized[field]);

  return {
    isComplete: missingFields.length === 0,
    missingFields,
  };
}

export function getProfileSaveErrorMessage(error: {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
} | null | undefined) {
  const combined = [
    error?.message ?? "",
    error?.details ?? "",
    error?.hint ?? "",
  ]
    .join(" ")
    .toLowerCase();

  if (error?.code === "23505" && combined.includes("handle")) {
    return PROFILE_DUPLICATE_HANDLE_MESSAGE;
  }

  return PROFILE_STORAGE_NOT_READY_MESSAGE;
}
