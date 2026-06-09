import Link from "next/link";
import type { Metadata } from "next";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "jmpseat. | Privacy",
  description: "Privacy policy for the public jmpseat waitlist.",
};

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link href="/" className={styles.backLink}>
          ← Back to waitlist
        </Link>

        <article className={styles.card}>
          <p className={styles.eyebrow}>waitlist privacy</p>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.lede}>
            This page explains how jmpseat. handles information collected
            through the public waitlist.
          </p>
          <p className={styles.effective}>Effective date: June 8, 2026</p>

          <section className={styles.section}>
            <h2>What we collect</h2>
            <p>
              jmpseat collects the email address you submit through the public
              waitlist.
            </p>
            <p>
              If you choose to answer the optional follow-up survey, jmpseat may
              collect general information about your aviation connection,
              base or airport priorities, desired features, current tools or
              communities, beta interest, how you heard about jmpseat, and
              privacy or trust concerns.
            </p>
            <p>
              jmpseat may also collect basic source and attribution information,
              such as landing path and campaign parameters, to understand where
              waitlist interest is coming from.
            </p>
            <p>
              After you join the waitlist, jmpseat may set a limited cookie or
              token in your browser so optional survey answers can be attached
              to the waitlist signup you already submitted. This cookie is not a
              login credential and does not grant beta access.
            </p>
          </section>

          <section className={styles.section}>
            <h2>How we use it</h2>
            <p>
              We use waitlist information to manage the waitlist, send jmpseat
              updates, understand demand for bases, layovers, lounges, and
              access features, prioritize early product direction, and decide
              which communities to support first.
            </p>
            <p>
              jmpseat also uses Vercel Web Analytics for public-site analytics
              on the public waitlist, Privacy, and Terms pages. This helps us
              understand basic page traffic and performance for the public
              marketing surface. It is not enabled on private beta, auth, admin,
              app, or lab routes.
            </p>
          </section>

          <section className={styles.section}>
            <h2>What we do not do</h2>
            <p>jmpseat does not sell personal information.</p>
            <p>
              The public waitlist does not ask for employee IDs, badge or proof
              uploads, documents, schedules, exact hotel information, portal
              credentials, passenger information, live location, or confidential
              company information.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Service providers</h2>
            <p>
              jmpseat may use service providers for hosting, database storage,
              email delivery, security, public-site analytics, and similar
              operations needed to run the waitlist. Those providers are used to
              operate jmpseat, not to sell waitlist information.
            </p>
            <p>
              Google Analytics is not enabled on the public jmpseat waitlist in
              this implementation.
            </p>
            <p>
              jmpseat may also disclose information if required by law, to
              protect the service, or to respond to abuse, security, or safety
              issues.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Retention</h2>
            <p>
              jmpseat keeps waitlist information while it is needed for
              waitlist management, product planning, launch communications,
              security, or legal reasons. We may delete or de-identify waitlist
              information when it is no longer needed.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Security</h2>
            <p>
              jmpseat uses reasonable technical and organizational safeguards to
              protect waitlist information. No internet service can guarantee
              perfect security.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Your choices</h2>
            <p>
              You can unsubscribe from email updates or request deletion of your
              waitlist information by contacting{" "}
              <a className={styles.contact} href="mailto:privacy@jmpseat.com">
                privacy@jmpseat.com
              </a>
              .
            </p>
          </section>

          <section className={styles.section}>
            <h2>Age requirement</h2>
            <p>jmpseat is intended for users 18 and older.</p>
          </section>

          <section className={styles.section}>
            <h2>Independence</h2>
            <p>
              jmpseat is independent and not affiliated with any airline,
              airport, union, or employer.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
