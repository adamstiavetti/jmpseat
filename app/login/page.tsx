import Link from "next/link";

import { AuthCard } from "../../src/components/auth/AuthCard";
import styles from "../../src/components/auth/auth.module.css";
import { signInAction } from "../../src/lib/auth/actions";
import { AUTH_ROUTES } from "../../src/lib/auth/routes";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = getValue(params.error);
  const message = getValue(params.message);
  const next = getValue(params.next) ?? AUTH_ROUTES.app;

  return (
    <AuthCard
      eyebrow="Epoch 03 Auth"
      title="Log in"
      description="Sign in to your jmpseat account. Auth proves account control only. It does not equal beta approval or worker verification."
      error={error}
      message={message}
      footer={
        <div className={styles.links}>
          <Link href={AUTH_ROUTES.signup}>Create an account</Link>
          <Link href={AUTH_ROUTES.resetPassword}>Forgot your password?</Link>
        </div>
      }
    >
      <form className={styles.form} action={signInAction}>
        <input type="hidden" name="next" value={next} />
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
            autoComplete="current-password"
            required
          />
        </div>

        <button className={styles.button} type="submit">
          Log in
        </button>
      </form>
    </AuthCard>
  );
}
