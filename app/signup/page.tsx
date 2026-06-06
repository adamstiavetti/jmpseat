import Link from "next/link";

import { AuthCard } from "../../src/components/auth/AuthCard";
import styles from "../../src/components/auth/auth.module.css";
import { signUpAction } from "../../src/lib/auth/actions";
import { AUTH_ROUTES } from "../../src/lib/auth/routes";

type SignupPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const error = getValue(params.error);
  const message = getValue(params.message);

  return (
    <AuthCard
      eyebrow="jmpseat account"
      title="Sign up"
      description="Create a jmpseat login account. Airline employee email verification is required for app access, and closed beta/private testing may also require a beta invite code."
      error={error}
      message={message}
      footer={
        <div className={styles.links}>
          <Link href={AUTH_ROUTES.login}>Already have an account?</Link>
        </div>
      }
    >
      <form className={styles.form} action={signUpAction}>
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

        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            Password
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

        <p className={styles.hint}>
          Your login email can be separate from your airline employee email.
          An invite code helps only when private testing requires beta access;
          it does not replace airline-email verification.
        </p>

        <button className={styles.button} type="submit">
          Create account
        </button>
      </form>
    </AuthCard>
  );
}
