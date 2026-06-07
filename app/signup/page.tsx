import Image from "next/image";
import Link from "next/link";

import { PasswordInput } from "../../src/components/auth/PasswordInput";
import styles from "../../src/components/auth/auth.module.css";
import { signUpAction } from "../../src/lib/auth/actions";
import { AUTH_ROUTES } from "../../src/lib/auth/routes";

type SignupPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const SIGNUP_ACCESSIBILITY_NOTE =
  "Create a login account first. Airline employee email verification is required for closed beta private access, and beta access may require an invite code after verification.";

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={styles.loginFieldIcon}>
      <path d="M4 6.5h16v11H4z" />
      <path d="m4.5 7 7.5 6 7.5-6" />
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

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const error = getValue(params.error);
  const message = getValue(params.message);

  return (
    <main className={`${styles.loginPage} ${styles.signupPage}`}>
      <section className={styles.loginShell} aria-labelledby="signup-title">
        <Image
          src="/images/auth/jmpseat-auth-hero-mobile.webp"
          alt=""
          fill
          priority
          className={styles.loginHeroMobileImage}
          sizes="(max-width: 760px) 100vw, 1px"
        />
        <div className={styles.loginStory}>
          <div className={styles.loginBrandBlock}>
            <Link className={styles.loginWordmark} href="/" aria-label="jmpseat home">
              jmpseat<span>.</span>
            </Link>
          </div>

          <div className={styles.loginCopy}>
            <p className={styles.loginEyebrow}>PRIVATE BETA</p>
            <h1 id="signup-title" className={styles.loginTitle}>
              Create your jmpseat account
            </h1>
            <div className={styles.loginDivider} aria-hidden="true">
              <span />
              <span>✈</span>
              <span />
            </div>
            <p className={styles.loginLead}>Create your account to continue.</p>
            <p className={styles.loginDescription}>
              Private beta access requires an approved airline employee email and
              may require an invite code.
            </p>
          </div>

          <div className={styles.loginImagePanel} aria-hidden="true">
            <Image
              src="/images/auth/jmpseat-auth-hero-desktop.webp"
              alt=""
              fill
              priority
              className={styles.loginImage}
              sizes="(min-width: 761px) 50vw, 1px"
            />
          </div>
        </div>

        <div className={styles.loginFormPanel}>
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

          <form className={styles.loginForm} action={signUpAction}>
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

            <div className={styles.loginField}>
              <label className={styles.loginLabel} htmlFor="password">
                Password
              </label>
              <PasswordInput
                autoComplete="new-password"
                minLength={8}
                placeholder="Create a password"
              />
            </div>

            <p className={styles.signupHint}>
              Your login email can be separate from your airline employee email.
              Airline verification happens later.
            </p>

            <button className={styles.loginButton} type="submit">
              <span>Create account</span>
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <Link className={styles.signupSigninLink} href={AUTH_ROUTES.login}>
            Already have an account? Sign in
          </Link>

          <p className={styles.loginSecurityNote}>
            <SecurityNoteIcon />
            Private community for verified aviation professionals.
            <span className={styles.loginSrOnly}>{SIGNUP_ACCESSIBILITY_NOTE}</span>
          </p>
        </div>
      </section>
    </main>
  );
}
