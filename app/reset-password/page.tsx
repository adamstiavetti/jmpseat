import Image from "next/image";
import Link from "next/link";

import { PasswordInput } from "../../src/components/auth/PasswordInput";
import styles from "../../src/components/auth/auth.module.css";
import {
  requestPasswordResetAction,
  updatePasswordAction,
} from "../../src/lib/auth/actions";
import { AUTH_ROUTES } from "../../src/lib/auth/routes";

type ResetPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.loginFieldIcon}>
      <path d="M4 6.5h16v11H4z" />
      <path d="m4.5 7 7.5 6 7.5-6" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.resetButtonIcon}>
      <path d="M21 3 10 14" />
      <path d="m21 3-7 18-4-7-7-4Z" />
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

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const error = getValue(params.error);
  const message = getValue(params.message);
  const mode = getValue(params.mode);
  const isUpdateMode = mode === "update";
  const title = isUpdateMode ? "Choose a new password" : "Reset your password";
  const description = isUpdateMode
    ? "Set a new password for your jmpseat account."
    : "Enter your email and we'll send a secure link to reset your password.";

  return (
    <main className={`${styles.loginPage} ${styles.resetPage}`}>
      <Image
        src="/images/auth/jmpseat-auth-hero-desktop.webp"
        alt=""
        fill
        priority
        className={styles.resetBackdropImage}
        sizes="100vw"
      />
      <section className={styles.resetShell} aria-labelledby="reset-title">
        <Link className={styles.resetWordmark} href="/" aria-label="jmpseat home">
          jmpseat<span>.</span>
        </Link>

        <div className={styles.resetHeader}>
          <p className={styles.loginEyebrow}>ACCOUNT RECOVERY</p>
          <h1 id="reset-title" className={styles.resetTitle}>
            {title}
          </h1>
          <p className={styles.resetDescription}>{description}</p>
        </div>

        <div className={styles.resetCard}>
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

          {isUpdateMode ? (
            <form className={styles.resetForm} action={updatePasswordAction}>
              <div className={styles.loginField}>
                <label className={styles.loginLabel} htmlFor="password">
                  New password
                </label>
                <PasswordInput
                  autoComplete="new-password"
                  minLength={8}
                  placeholder="Enter a new password"
                />
              </div>

              <button className={styles.loginButton} type="submit">
                <span>Update password</span>
                <span aria-hidden="true">→</span>
              </button>
            </form>
          ) : (
            <form className={styles.resetForm} action={requestPasswordResetAction}>
              <div className={styles.loginField}>
                <label className={styles.loginLabel} htmlFor="email">
                  Email
                </label>
                <div className={styles.loginInputShell}>
                  <MailIcon />
                  <input
                    className={styles.loginInput}
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <button className={`${styles.loginButton} ${styles.resetButton}`} type="submit">
                <span>
                  <SendIcon />
                  Send reset link
                </span>
              </button>
            </form>
          )}

          <div className={styles.resetOrDivider} aria-hidden="true">
            <span />
            <span>or</span>
            <span />
          </div>

          <Link className={styles.resetSigninLink} href={AUTH_ROUTES.login}>
            Back to sign in
          </Link>

          <p className={styles.loginSecurityNote}>
            <SecurityNoteIcon />
            Private community for verified aviation professionals.
          </p>
        </div>
      </section>
    </main>
  );
}
