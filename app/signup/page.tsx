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
      eyebrow="Epoch 03 Auth"
      title="Sign up"
      description="Create a jmpseat account for web auth. Account creation does not equal beta approval. Account creation does not equal worker verification."
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
          Use any email you want for account login. Beta approval and airline-worker verification happen through separate later flows.
        </p>

        <button className={styles.button} type="submit">
          Create account
        </button>
      </form>
    </AuthCard>
  );
}
