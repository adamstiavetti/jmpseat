import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthCard } from "../../../src/components/auth/AuthCard";
import styles from "../../../src/components/auth/auth.module.css";
import { AUTH_ROUTES } from "../../../src/lib/auth/routes";
import { getCurrentAppAccessContext } from "../../../src/lib/betaAccess/server";
import { saveProfileAction } from "../../../src/lib/profile/actions";
import {
  getPrivateAccessSource,
  getPrivateAppGateResult,
  getPrivateRouteAuditResult,
} from "../../../src/lib/privateApp/access";
import { getPrivateAccessEventType } from "../../../src/lib/securityEvents/securityEvents";
import { recordSecurityEvent } from "../../../src/lib/securityEvents/server";
import { getSupabaseBrowserEnv } from "../../../src/lib/supabase/config";

type ProfilePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const PROFILE_ACCESSIBILITY_NOTE =
  "Add the minimum self-declared account details for minimal onboarding. These fields are not verified claims yet. Claimed airline, role, and base are self-declared profile details for onboarding only. Completing this profile does not grant beta access. Completing this profile does not verify airline-worker status. Airline employee email verification remains separate.";

function AtIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.profileFieldIcon}>
      <path d="M16 12.2a4 4 0 1 1-1.2-2.85" />
      <path d="M16 8v5.1c0 1.2.75 2.1 1.8 2.1 1.35 0 2.7-1.65 2.7-4.15a8.5 8.5 0 1 0-3.15 6.6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.profileFieldIcon}>
      <path d="M12 12.2a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function PlaneIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.profileFieldIcon}>
      <path d="m3.5 14.2 16.2-9.1c.8-.45 1.7.4 1.25 1.2L11.8 20.5l-2.1-7.1-6.2.8Z" />
      <path d="m9.7 13.4 5.15-3.35" />
    </svg>
  );
}

function RoleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.profileFieldIcon}>
      <path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
      <path d="M4 7.5h16v12H4z" />
      <path d="M9 13h6" />
      <path d="M12 10v6" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.profileFieldIcon}>
      <path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </svg>
  );
}

function ShieldInfoIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.profileNoticeIcon}>
      <path d="M12 3.2 19.5 6v5.6c0 4.4-2.6 8.2-7.5 10.6-4.9-2.4-7.5-6.2-7.5-10.6V6z" />
      <path d="M12 10.2v5.1" />
      <path d="M12 7.4h.01" />
    </svg>
  );
}

function SecurityNoteIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className={styles.loginSecurityIcon}>
      <path d="M5 8V5.8a4 4 0 0 1 8 0V8" />
      <path d="M3.7 8h10.6v7.2H3.7z" />
      <path d="M9 10.5v2" />
    </svg>
  );
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

  const context = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "profile",
    nextPath: AUTH_ROUTES.profile,
    context,
  });

  await recordSecurityEvent({
    userId: context.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route: AUTH_ROUTES.profile,
    result: getPrivateRouteAuditResult(gate, context),
    metadata: {
      route_kind: "profile",
      access_source: getPrivateAccessSource(gate),
      ...(getPrivateAccessSource(gate) === "operator_internal"
        ? { operator_private_app_access: true }
        : {}),
    },
  });

  if (gate.kind === "redirect") {
    redirect(gate.path);
  }

  const error = searchError ?? context.profileLoadError ?? undefined;

  return (
    <main className={`${styles.loginPage} ${styles.profileSetupPage}`}>
      <Image
        src="/images/auth/jmpseat-auth-hero-desktop.webp"
        alt=""
        fill
        priority
        className={styles.profileBackdropImage}
        sizes="100vw"
      />
      <section className={styles.profileSetupShell} aria-labelledby="profile-title">
        <div className={styles.profileSetupHeader}>
          <Link className={styles.profileWordmark} href="/" aria-label="jmpseat home">
            jmpseat<span>.</span>
          </Link>
          <p className={styles.profileEyebrow}>PROFILE SETUP</p>
          <h1 id="profile-title" className={styles.profileTitle}>
            Complete your profile
          </h1>
          <p className={styles.profileDescription}>
            Add your basic profile details to get started. These details help
            personalize your account, but they do not verify airline-worker
            status.
          </p>
        </div>

        <div className={styles.profileSetupCard}>
          {error ? (
            <p className={styles.loginError} role="alert">
              {error}
            </p>
          ) : null}

          {message ? (
            <p className={styles.loginMessage} role="status">
              {message}
            </p>
          ) : null}

          <form className={styles.profileSetupForm} action={saveProfileAction}>
            <div className={styles.profileField}>
              <label className={styles.profileLabel} htmlFor="handle">
                Handle
              </label>
              <div className={styles.profileInputShell}>
                <AtIcon />
                <input
                  className={styles.profileInput}
                  id="handle"
                  name="handle"
                  type="text"
                  autoComplete="nickname"
                  placeholder="@jordan"
                  defaultValue={context.profile?.handle ?? ""}
                  required
                />
              </div>
            </div>

            <div className={styles.profileField}>
              <label className={styles.profileLabel} htmlFor="display_name">
                Display name
              </label>
              <div className={styles.profileInputShell}>
                <UserIcon />
                <input
                  className={styles.profileInput}
                  id="display_name"
                  name="display_name"
                  type="text"
                  autoComplete="name"
                  placeholder="Jordan Thompson"
                  defaultValue={context.profile?.display_name ?? ""}
                  required
                />
              </div>
            </div>

            <div className={styles.profileField}>
              <label className={styles.profileLabel} htmlFor="claimed_airline">
                Claimed airline
              </label>
              <div className={styles.profileInputShell}>
                <PlaneIcon />
                <input
                  className={styles.profileInput}
                  id="claimed_airline"
                  name="claimed_airline"
                  type="text"
                  autoComplete="organization"
                  placeholder="American Airlines"
                  defaultValue={context.profile?.claimed_airline ?? ""}
                  required
                />
              </div>
            </div>

            <div className={styles.profileField}>
              <label className={styles.profileLabel} htmlFor="claimed_role">
                Claimed role
              </label>
              <div className={styles.profileInputShell}>
                <RoleIcon />
                <input
                  className={styles.profileInput}
                  id="claimed_role"
                  name="claimed_role"
                  type="text"
                  placeholder="Flight attendant"
                  defaultValue={context.profile?.claimed_role ?? ""}
                  required
                />
              </div>
            </div>

            <div className={styles.profileField}>
              <label className={styles.profileLabel} htmlFor="claimed_base">
                Claimed base
              </label>
              <div className={styles.profileInputShell}>
                <PinIcon />
                <input
                  className={styles.profileInput}
                  id="claimed_base"
                  name="claimed_base"
                  type="text"
                  placeholder="DFW"
                  defaultValue={context.profile?.claimed_base ?? ""}
                  required
                />
              </div>
            </div>

            <div className={styles.profileNotice}>
              <ShieldInfoIcon />
              <p>Profile details are self-declared.</p>
            </div>

            <button className={styles.loginButton} type="submit">
              <span>Save profile</span>
              <span aria-hidden="true">→</span>
            </button>

            <p className={styles.loginSecurityNote}>
              <SecurityNoteIcon />
              Completing your profile does not grant beta approval or worker
              verification.
              <span className={styles.loginSrOnly}>
                {PROFILE_ACCESSIBILITY_NOTE}
              </span>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
