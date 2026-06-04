import Link from "next/link";

import { AuthCard } from "../../src/components/auth/AuthCard";
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

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const error = getValue(params.error);
  const message = getValue(params.message);
  const mode = getValue(params.mode);
  const isUpdateMode = mode === "update";

  return (
    <AuthCard
      eyebrow="Epoch 03 Auth"
      title={isUpdateMode ? "Choose a new password" : "Reset your password"}
      description={
        isUpdateMode
          ? "Set a new password for your jmpseat account."
          : "Request a secure password reset email for your jmpseat account."
      }
      error={error}
      message={message}
      footer={
        <div className={styles.links}>
          <Link href={AUTH_ROUTES.login}>Back to login</Link>
        </div>
      }
    >
      {isUpdateMode ? (
        <form className={styles.form} action={updatePasswordAction}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              New password
            </label>
            <input
              className={styles.input}
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <button className={styles.button} type="submit">
            Update password
          </button>
        </form>
      ) : (
        <form className={styles.form} action={requestPasswordResetAction}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email
            </label>
            <input
              className={styles.input}
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <button className={styles.button} type="submit">
            Send reset link
          </button>
        </form>
      )}
    </AuthCard>
  );
}
