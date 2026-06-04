import { redirect } from "next/navigation";

import { AuthCard } from "../../../src/components/auth/AuthCard";
import styles from "../../../src/components/auth/auth.module.css";
import { AUTH_ROUTES } from "../../../src/lib/auth/routes";
import { saveProfileAction } from "../../../src/lib/profile/actions";
import { getCurrentProfileContext } from "../../../src/lib/profile/server";
import { getSupabaseBrowserEnv } from "../../../src/lib/supabase/config";

type ProfilePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const params = await searchParams;
  const env = getSupabaseBrowserEnv();
  const searchError = getValue(params.error);
  const message = getValue(params.message);

  if (!env.enabled) {
    return (
      <AuthCard
        eyebrow="Epoch 03 Profile"
        title="Profile setup needs Supabase auth"
        description="This onboarding surface depends on the Supabase auth configuration used by the private web app."
        error="Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to exercise runtime profile flows."
      >
        <p className={styles.hint}>
          Local build and tests can run without those values. Profile runtime
          save/read behavior requires a configured Supabase project.
        </p>
      </AuthCard>
    );
  }

  const context = await getCurrentProfileContext();

  if (!context.user) {
    redirect(`${AUTH_ROUTES.login}?next=${encodeURIComponent(AUTH_ROUTES.profile)}`);
  }

  const error = searchError ?? context.loadError ?? undefined;

  return (
    <AuthCard
      eyebrow="Epoch 03 Profile"
      title="Complete your profile"
      description="Add the minimum self-declared account details for private-app onboarding. These fields are not verified claims yet."
      error={error}
      message={message}
      footer={
        <p className={styles.hint}>
          Profile completion does not equal beta approval, worker verification,
          or airline/base/role-specific access.
        </p>
      }
    >
      <form className={styles.form} action={saveProfileAction}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="handle">
            Handle
          </label>
          <input
            className={styles.input}
            id="handle"
            name="handle"
            type="text"
            autoComplete="nickname"
            defaultValue={context.profile?.handle ?? ""}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="display_name">
            Display name
          </label>
          <input
            className={styles.input}
            id="display_name"
            name="display_name"
            type="text"
            autoComplete="name"
            defaultValue={context.profile?.display_name ?? ""}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="claimed_airline">
            Claimed airline
          </label>
          <input
            className={styles.input}
            id="claimed_airline"
            name="claimed_airline"
            type="text"
            autoComplete="organization"
            defaultValue={context.profile?.claimed_airline ?? ""}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="claimed_role">
            Claimed role
          </label>
          <input
            className={styles.input}
            id="claimed_role"
            name="claimed_role"
            type="text"
            defaultValue={context.profile?.claimed_role ?? ""}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="claimed_base">
            Claimed base
          </label>
          <input
            className={styles.input}
            id="claimed_base"
            name="claimed_base"
            type="text"
            defaultValue={context.profile?.claimed_base ?? ""}
            required
          />
        </div>

        <p className={styles.hint}>
          Claimed airline, role, and base are self-declared profile details for
          onboarding only. They are not verified claims yet. Completing this
          profile does not grant beta access. Completing this profile does not
          verify airline-worker status.
        </p>

        <button className={styles.button} type="submit">
          Save profile
        </button>
      </form>
    </AuthCard>
  );
}
