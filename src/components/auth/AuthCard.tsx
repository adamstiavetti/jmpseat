import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./auth.module.css";

type AuthCardProps = {
  title: string;
  eyebrow: string;
  description: string;
  error?: string;
  message?: string;
  footer?: ReactNode;
  children: ReactNode;
};

export function AuthCard({
  title,
  eyebrow,
  description,
  error,
  message,
  footer,
  children,
}: AuthCardProps) {
  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="auth-title">
        <div className={styles.header}>
          <Link className={styles.wordmark} href="/">
            jmpseat.
          </Link>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 id="auth-title" className={styles.title}>
            {title}
          </h1>
          <p className={styles.description}>{description}</p>
        </div>

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className={styles.message} role="status">
            {message}
          </p>
        ) : null}

        <div className={styles.body}>{children}</div>
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </section>
    </main>
  );
}
