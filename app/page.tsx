import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import styles from "./page.module.css";
import {
  skipWaitlistSurveyAction,
  submitWaitlistEmailAction,
  submitWaitlistSurveyAction,
} from "../src/lib/waitlist/actions";
import { WAITLIST_SURVEY_QUESTIONS } from "../src/lib/waitlist/shared";

const TRUST_ITEMS = [
  "verified workers",
  "private by design",
  "built for airline life",
] as const;

const FEATURE_CARDS = [
  {
    label: "base",
    title: "Base Boards",
    copy: "Trusted base intel for reserve life, new hires, parking, transit, food, errands, and how your base actually works.",
    image: "/jmpseat/base-boards-v2.png",
    imageAlt:
      "Crew members rolling luggage through an airport base parking and shuttle area at blue hour.",
  },
  {
    label: "layover",
    title: "Layover Boards",
    copy: "Trusted layover intel for food, transportation, downtime, and airport-area know-how.",
    image: "/jmpseat/layover-boards-v2.png",
    imageAlt:
      "A late-night airport-district street with a restaurant, traffic, and a traveler pulling luggage.",
  },
  {
    label: "rooms",
    title: "Verified Rooms",
    copy: "Verified discussion spaces for airline life, organized by base and topic.",
    image: "/jmpseat/verified-rooms-v2.png",
    imageAlt:
      "A dim private lounge with conversational seating and warm low lighting.",
  },
  {
    label: "verified",
    title: "Verified Entry",
    copy: "A private beta built around trust, verified context, and careful access.",
    image: "/jmpseat/verified-access-v2.png",
    imageAlt:
      "Travel documents and access materials arranged on a dark tray in warm light.",
  },
] as const;

export const metadata: Metadata = {
  title: "jmpseat. | Private waitlist",
  description:
    "jmpseat. is the off-duty network for airline workers, built for trusted base intel, layover knowledge, and verified discussion.",
};

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type AttributionFields = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
};

function getValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getAttributionFields(
  params: Record<string, string | string[] | undefined>,
): AttributionFields {
  return {
    utm_source: getValue(params.utm_source)?.slice(0, 120) ?? "",
    utm_medium: getValue(params.utm_medium)?.slice(0, 120) ?? "",
    utm_campaign: getValue(params.utm_campaign)?.slice(0, 120) ?? "",
    utm_content: getValue(params.utm_content)?.slice(0, 120) ?? "",
    utm_term: getValue(params.utm_term)?.slice(0, 120) ?? "",
  };
}

function WaitlistHiddenFields({ attribution }: { attribution: AttributionFields }) {
  return (
    <>
      <input type="hidden" name="landing_path" value="/" />
      {Object.entries(attribution).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
    </>
  );
}

function WaitlistEmailForm({
  attribution,
  formId,
}: {
  attribution: AttributionFields;
  formId: string;
}) {
  return (
    <form
      id={formId}
      className={styles.waitlistForm}
      action={submitWaitlistEmailAction}
    >
      <WaitlistHiddenFields attribution={attribution} />
      <div className={styles.waitlistField}>
        <label className={styles.waitlistLabel} htmlFor={`${formId}-email`}>
          Email
        </label>
        <input
          className={styles.waitlistInput}
          id={`${formId}-email`}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </div>
      <button className={styles.submitButton} type="submit">
        join waitlist
      </button>
    </form>
  );
}

function WaitlistSurveyQuestion({
  question,
}: {
  question: (typeof WAITLIST_SURVEY_QUESTIONS)[number];
}) {
  if (question.type === "short") {
    return (
      <label className={styles.surveyQuestion}>
        <span>{question.label}</span>
        <input
          className={styles.surveyInput}
          name={question.name}
          maxLength={question.maxLength}
          placeholder={question.placeholder}
        />
      </label>
    );
  }

  if (question.type === "single") {
    return (
      <label className={styles.surveyQuestion}>
        <span>{question.label}</span>
        <select className={styles.surveyInput} name={question.name} defaultValue="">
          <option value="">Optional</option>
          {question.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <fieldset className={styles.surveyQuestion}>
      <legend>{question.label}</legend>
      <p className={styles.surveyHint}>Optional. Choose up to {question.maxSelections}.</p>
      <div className={styles.surveyOptions}>
        {question.options.map((option) => (
          <label key={option} className={styles.surveyOption}>
            <input type="checkbox" name={question.name} value={option} />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function WaitlistSurveyForm() {
  return (
    <div className={styles.surveyCard}>
      <div className={styles.surveyIntro}>
        <p className={styles.surveyEyebrow}>optional follow-up</p>
        <h2>Help us prioritize your invite and shape jmpseat.</h2>
        <p>
          These questions are optional. Your waitlist spot is already captured.
        </p>
        <p className={styles.surveySafety}>
          Please keep this general. Do not share sensitive or confidential work
          details.
        </p>
      </div>

      <form className={styles.surveyForm} action={submitWaitlistSurveyAction}>
        {WAITLIST_SURVEY_QUESTIONS.map((question) => (
          <WaitlistSurveyQuestion key={question.id} question={question} />
        ))}
        <div className={styles.surveyActions}>
          <button className={styles.submitButton} type="submit">
            save optional answers
          </button>
        </div>
      </form>

      <form action={skipWaitlistSurveyAction}>
        <button className={styles.skipButton} type="submit">
          Skip for now
        </button>
      </form>
    </div>
  );
}

function WaitlistPanel({
  attribution,
  formId,
  anchorId,
  waitlistStatus,
  surveyStatus,
}: {
  attribution: AttributionFields;
  formId: string;
  anchorId: string;
  waitlistStatus: string | undefined;
  surveyStatus: string | undefined;
}) {
  const hasJoined = waitlistStatus === "joined";
  const surveyFinished = surveyStatus === "saved" || surveyStatus === "skipped";

  if (hasJoined) {
    return (
      <div id={anchorId} className={styles.formBlock}>
        <div className={styles.successCard} role="status">
          <p className={styles.successEyebrow}>You&apos;re on the waitlist.</p>
          <h2>We captured your email.</h2>
          <p>
            We&apos;ll use it only for jmpseat waitlist and product updates.
            Optional answers below help us decide which communities and features
            to prioritize first.
          </p>
          {surveyStatus === "saved" ? (
            <p className={styles.successNote}>Thanks, your optional answers were saved.</p>
          ) : null}
          {surveyStatus === "skipped" ? (
            <p className={styles.successNote}>No problem. You can finish later.</p>
          ) : null}
          {surveyStatus === "error" ? (
            <p className={styles.errorText}>
              We could not save those optional answers. Your waitlist signup is
              still captured.
            </p>
          ) : null}
          {surveyStatus === "missing" ? (
            <p className={styles.errorText}>
              Your waitlist signup is captured, but this browser session can no
              longer attach optional answers.
            </p>
          ) : null}
        </div>
        {surveyFinished ? null : <WaitlistSurveyForm />}
      </div>
    );
  }

  return (
    <div id={anchorId} className={styles.formBlock}>
      {waitlistStatus === "invalid_email" ? (
        <p className={styles.errorText} role="alert">
          Enter a valid email to join the waitlist.
        </p>
      ) : null}
      {waitlistStatus === "not_ready" ? (
        <p className={styles.errorText} role="alert">
          Waitlist capture is not ready in this environment yet.
        </p>
      ) : null}
      {waitlistStatus === "error" ? (
        <p className={styles.errorText} role="alert">
          We could not save that email. Please try again.
        </p>
      ) : null}
      <WaitlistEmailForm attribution={attribution} formId={formId} />
      <p id={`${formId}-helper`} className={styles.helperText}>
        Early waitlist access for airline-life communities. No account creation
        or verification happens here.
      </p>
      <p className={styles.consentText}>
        By joining the waitlist, you agree to receive jmpseat updates about
        early access. We&apos;ll use your email only for waitlist and product
        updates. Unsubscribe anytime. See our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </div>
  );
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const attribution = getAttributionFields(params);
  const waitlistStatus = getValue(params.waitlist);
  const surveyStatus = getValue(params.survey);

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <Image
          src="/jmpseat/hero-runway.png"
          alt=""
          fill
          priority
          className={styles.heroImage}
          sizes="100vw"
        />
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroShell}>
          <header className={styles.header}>
            <a className={styles.wordmark} href="#top" aria-label="jmpseat. home">
              jmpseat.
            </a>
          </header>

          <div id="top" className={styles.heroContent}>
            <div className={styles.copyColumn}>
              <h1 id="hero-title" className={styles.headline}>
                <span>the off-duty</span>
                <span>network for</span>
                <span className={styles.headlineAccent}>airline life.</span>
              </h1>
              <div className={styles.supportingCopy}>
                <p>Trusted base intel and layover knowledge for airline life.</p>
                <p>Verified privately. Private by design.</p>
                <p>Built for life between trips.</p>
              </div>

              <ul className={styles.trustRow} aria-label="Trust highlights">
                {TRUST_ITEMS.map((item) => (
                  <li key={item} className={styles.trustChip}>
                    {item}
                  </li>
                ))}
              </ul>

              <WaitlistPanel
                attribution={attribution}
                formId="hero-waitlist"
                anchorId="waitlist"
                waitlistStatus={waitlistStatus}
                surveyStatus={surveyStatus}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.contentShell}>
        <div className={styles.sectionDivider}>
          <span />
          <p>BUILT FOR LIFE BETWEEN TRIPS</p>
          <span />
        </div>

        <section className={styles.featureGrid} aria-label="Core product surfaces">
          {FEATURE_CARDS.map((card) => (
            <article key={card.title} className={styles.featureCard}>
              <div className={styles.featureMedia}>
                <Image
                  src={card.image}
                  alt={card.imageAlt}
                  fill
                  className={styles.featureImage}
                  sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 25vw"
                />
                <div className={styles.featureMediaOverlay} aria-hidden="true" />
                <span className={styles.featureLabel}>{card.label}</span>
              </div>
              <div className={styles.featureBody}>
                <h2>{card.title}</h2>
                <p>{card.copy}</p>
              </div>
            </article>
          ))}
        </section>

        <section className={styles.privacyPanel} aria-labelledby="privacy-title">
          <div>
            <p className={styles.privacyEyebrow}>private by design</p>
            <h2 id="privacy-title">We protect your privacy.</h2>
          </div>
          <p className={styles.privacyCopy}>
            Verified privately. Anonymous publicly. Built to keep passenger,
            location, and sensitive information out.
          </p>
        </section>

        <section className={styles.bottomCta} aria-labelledby="bottom-cta-title">
          <div className={styles.bottomCtaCopy}>
            <p className={styles.bottomCtaEyebrow}>private beta waitlist</p>
            <h2 id="bottom-cta-title">Join the private beta waitlist.</h2>
            <p>
              Get early access to trusted base intel, layover knowledge, and
              verified discussion for airline life.
            </p>
          </div>
          <WaitlistPanel
            attribution={attribution}
            formId="footer-waitlist"
            anchorId="footer-waitlist-panel"
            waitlistStatus={waitlistStatus}
            surveyStatus={surveyStatus}
          />
        </section>

        <footer className={styles.footer}>
          <span className={styles.footerBrand}>jmpseat.</span>
          <span className={styles.footerMeta}>
            crew knowledge. private community. off-duty.
          </span>
          <nav className={styles.footerLinks} aria-label="Footer links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <a href="mailto:contact@jmpseat.com">Contact</a>
          </nav>
          <p className={styles.footerDisclaimer}>
            jmpseat is independent and is not sponsored by or affiliated with
            any airline, airport, union, or employer.
          </p>
        </footer>
      </section>
    </main>
  );
}
