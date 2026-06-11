import Image from "next/image";
import Link from "next/link";
import {
  DFW_BASEBOARD_COMMENT_CREATED_STATUS,
  DFW_BASEBOARD_COMMENT_FAILED_STATUS,
  DFW_BASEBOARD_COMMENT_INVALID_STATUS,
  DFW_BASEBOARD_COMMENT_REPORT_FAILED_STATUS,
  DFW_BASEBOARD_COMMENT_REPORT_INVALID_STATUS,
  DFW_BASEBOARD_COMMENT_REPORT_REPORTED_STATUS,
  type DfwBaseboardCommentReportStatus,
  type DfwBaseboardCommentStatus,
} from "../../lib/community/boardPostCommentActionState";
import type { BaseboardPostComment } from "../../lib/community/boardPostComments";
import {
  DFW_BASEBOARD_POST_CREATED_STATUS,
  DFW_BASEBOARD_POST_FAILED_STATUS,
  DFW_BASEBOARD_POST_INVALID_STATUS,
  type DfwBaseboardPostStatus,
} from "../../lib/community/boardPostActionState";
import type { BaseboardPostListItem } from "../../lib/community/boardPostReads";
import {
  DFW_BASEBOARD_REPORT_FAILED_STATUS,
  DFW_BASEBOARD_REPORT_INVALID_STATUS,
  DFW_BASEBOARD_REPORT_REPORTED_STATUS,
  type DfwBaseboardReportStatus,
} from "../../lib/community/boardPostSafetyActionState";

import styles from "./homeHubShell.module.css";

type HomeHubShellProps = {
  homeBaseCode?: string | null;
  homeBaseName?: string | null;
  homeBaseLoadError?: boolean;
  startWithDfwAction?: (formData: FormData) => Promise<void>;
  startWithDfwError?: boolean;
};

type DashboardItem = {
  title: string;
  detail: string;
  meta: string;
};

type DfwHubSectionItem = DashboardItem & {
  href?: string;
};

export type DfwHubSectionKey = "baseboard" | "layovers" | "lounges" | "crew-picks";

type DfwHubSectionShell = {
  key: DfwHubSectionKey;
  title: string;
  eyebrow: string;
  purpose: string;
  safetyNotes?: readonly string[];
  placeholders: readonly DashboardItem[];
};

type DfwHubSectionReadOnlyShellProps = {
  section: DfwHubSectionShell;
  baseboardPosts?: readonly BaseboardPostListItem[];
  baseboardPostsUnavailable?: boolean;
  baseboardPostStatus?: DfwBaseboardPostStatus | null;
  baseboardReportStatus?: DfwBaseboardReportStatus | null;
  createBaseboardPostAction?: (formData: FormData) => Promise<void>;
  reportBaseboardPostAction?: (formData: FormData) => Promise<void>;
};

type DfwBaseboardPostDetailShellProps = {
  post?: BaseboardPostListItem | null;
  postUnavailable?: boolean;
  reportStatus?: DfwBaseboardReportStatus | null;
  reportAction?: (formData: FormData) => Promise<void>;
  comments?: readonly BaseboardPostComment[];
  commentsUnavailable?: boolean;
  commentStatus?: DfwBaseboardCommentStatus | null;
  commentReportStatus?: DfwBaseboardCommentReportStatus | null;
  createCommentAction?: (formData: FormData) => Promise<void>;
  reportCommentAction?: (formData: FormData) => Promise<void>;
};

type QuickAction = {
  title: string;
  detail: string;
  tone: "ask" | "layover" | "lounge" | "saved";
};

const crewPicks: readonly DashboardItem[] = [
  {
    title: "DFW basics",
    detail: "Useful launch intel will appear here once posts and guides exist.",
    meta: "Admin curated placeholder",
  },
  {
    title: "Layover utility",
    detail: "Saved-driven picks will later surface practical crew recommendations.",
    meta: "Ranking not implemented",
  },
  {
    title: "Crew Q&A",
    detail: "High-signal answers belong here after posting and moderation land.",
    meta: "Read-only shell",
  },
];

const quickActions: readonly QuickAction[] = [
  {
    title: "Open Channels",
    detail: "Scoped posts",
    tone: "ask",
  },
  {
    title: "Find Layover",
    detail: "Utility later",
    tone: "layover",
  },
  {
    title: "Browse Lounges",
    detail: "Membership gated",
    tone: "lounge",
  },
  {
    title: "Saved",
    detail: "Library later",
    tone: "saved",
  },
];

const layoverPreviews: readonly DashboardItem[] = [
  {
    title: "MIA",
    detail: "Passing-through tips without hotel or live-location details.",
    meta: "Coming soon",
  },
  {
    title: "LAX",
    detail: "Food, transit, coffee, and safe area utility later.",
    meta: "Placeholder",
  },
  {
    title: "ORD",
    detail: "Airport and city intel after posting and moderation exist.",
    meta: "Placeholder",
  },
  {
    title: "DEN",
    detail: "Followable Layovers are planned after discovery work.",
    meta: "Placeholder",
  },
];

const loungePreviews: readonly DashboardItem[] = [
  {
    title: "Flight Attendants",
    detail: "Restricted content stays hidden until membership exists.",
    meta: "Locked",
  },
  {
    title: "New Hires",
    detail: "Request and Crew Lead review flows arrive later.",
    meta: "Coming soon",
  },
];

const dfwHubSections: readonly DfwHubSectionItem[] = [
  {
    title: "DFW Today",
    detail:
      "Curated current context for weather, traffic, public airport advisories, app notes, and recently updated sections. No live weather or traffic integration is active yet.",
    meta: "Curated placeholder",
  },
  {
    title: "DFW Base",
    detail:
      "Based-worker utility for commuting, parking, new-to-DFW, base life, and practical airport information without operationally sensitive claims.",
    meta: "Based-worker utility",
  },
  {
    title: "DFW Layover",
    detail:
      "Essentials, Recommendations, Questions, Crew Tips, Getting Around, Food & Coffee, Things To Do, Short Layover, and Long Layover utility inside the Hub.",
    href: "/app/hubs/dfw/layovers",
    meta: "Layover utility",
  },
  {
    title: "DFW Channels",
    detail:
      "Focused scoped discussion for DFW Questions, Commuting & Parking, Food & Coffee, New to DFW, Base Life, Crew Tips, and App Feedback. Request a Channel is a reviewed in-section action.",
    href: "/app/hubs/dfw/baseboard",
    meta: "Scoped discussion",
  },
  {
    title: "Recent Useful Threads",
    detail:
      "High-signal posts from existing safe post/comment/report/moderation primitives. Useful threads appear as verified workers contribute.",
    href: "/app/hubs/dfw/crew-picks",
    meta: "Useful signal",
  },
];

export const dfwHubSectionShells: Record<DfwHubSectionKey, DfwHubSectionShell> = {
  baseboard: {
    key: "baseboard",
    title: "DFW Channels",
    eyebrow: "Focused scoped discussion",
    purpose:
      "Focused DFW discussion channels built on the existing safe post, comment, report, and moderation primitives.",
    placeholders: [
      {
        title: "No useful DFW threads yet.",
        detail:
          "Useful DFW threads will appear here when verified workers contribute and moderators or admins surface high-signal posts.",
        meta: "No useful threads yet",
      },
      {
        title: "Channel post foundation",
        detail:
          "This route supports title and body posting only through the existing server action. Free user-created channels are not live.",
        meta: "Scope boundary",
      },
    ],
  },
  layovers: {
    key: "layovers",
    title: "DFW Layover",
    eyebrow: "Layover utility",
    purpose:
      "Layover utility and future UGC inside DFW Hub: essentials, recommendations, questions, crew tips, getting around, food and coffee, things to do, and short or long layover planning.",
    safetyNotes: [
      "No exact crew hotel exposure.",
      "No live crew movement or location.",
      "No passenger private information.",
      "No airport or security-sensitive procedures.",
      "No company-confidential documents or policies.",
      "No dating or social meetup behavior.",
    ],
    placeholders: [
      {
        title: "Essentials",
        detail: "Basics for passing through DFW will stay curated and safety-reviewed.",
        meta: "Curated later",
      },
      {
        title: "Recommendations",
        detail: "Food, coffee, transport, and practical tips need content and moderation first.",
        meta: "No seed content",
      },
      {
        title: "Questions and Crew Tips",
        detail: "Question and answer flows are not implemented in this shell.",
        meta: "Read-only",
      },
      {
        title: "Getting Around, Things To Do, Short Layover, Long Layover",
        detail: "No live APIs, photo uploads, or separate layover guide product are added here.",
        meta: "Future lane",
      },
    ],
  },
  lounges: {
    key: "lounges",
    title: "DFW Lounges",
    eyebrow: "Restricted spaces",
    purpose:
      "A read-only shell for restricted membership-based spaces associated with the DFW Hub and managed by Crew Leads later.",
    safetyNotes: [
      "Home Base does not grant lounge access.",
      "Board follows do not grant lounge access.",
      "Self-declared profile fields do not grant lounge access.",
      "Lounge request and review flow is not live yet.",
    ],
    placeholders: [
      {
        title: "Flight Attendants Lounge coming later",
        detail: "Access requires future approved membership, not Home Base or follows.",
        meta: "Membership gated",
      },
      {
        title: "Pilots Lounge coming later",
        detail: "Crew Lead review tooling is not implemented in this shell.",
        meta: "Coming later",
      },
      {
        title: "New Hires Lounge coming later",
        detail: "Request access remains future work.",
        meta: "Request flow later",
      },
    ],
  },
  "crew-picks": {
    key: "crew-picks",
    title: "Recent Useful Threads",
    eyebrow: "Useful signal",
    purpose:
      "A read-only shell for high-signal community posts surfaced from safe DFW Hub primitives over time.",
    safetyNotes: [
      "No ranking is live.",
      "No AI surfacing is live.",
      "Lounge-visible content remains access-aware later.",
    ],
    placeholders: [
      {
        title: "No useful threads yet",
        detail:
          "Useful threads will appear as verified workers contribute and moderators or admins surface high-signal posts.",
        meta: "Empty state",
      },
      {
        title: "Existing safety primitives remain",
        detail: "Posts, comments, reports, and moderation controls stay in place for future surfaced threads.",
        meta: "Safety preserved",
      },
      {
        title: "Access-aware content later",
        detail: "Restricted lounge content must stay hidden unless membership permits it.",
        meta: "Access boundary",
      },
    ],
  },
};

function AppHeader({
  subtitle,
  showBackLink = false,
  backHref = "/app",
  backLabel = "Back Home",
}: {
  subtitle?: string;
  showBackLink?: boolean;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className={styles.appHeader}>
      <div>
        <p className={styles.brand}>jmpseat</p>
        {subtitle ? <span>{subtitle}</span> : null}
      </div>
      {showBackLink ? (
        <Link className={styles.backLink} href={backHref}>
          {backLabel}
        </Link>
      ) : (
        <div className={styles.headerTools} aria-hidden="true">
          <span className={styles.headerIcon}>!</span>
          <span className={styles.profileChip}>JS</span>
        </div>
      )}
    </header>
  );
}

function WelcomeBlock({
  hasHomeBase,
  homeBaseName,
}: {
  hasHomeBase: boolean;
  homeBaseName?: string | null;
}) {
  return (
    <section className={styles.welcomeBlock} aria-label="Private app status">
      <p className={styles.welcomeTitle}>Welcome back</p>
      <p className={styles.statusLine}>
        <strong>Verified</strong>
        <span aria-hidden="true">.</span>
        <span>Aviation worker</span>
        <span aria-hidden="true">.</span>
        <span>{hasHomeBase ? (homeBaseName ?? "Home Base set") : "No Home Base set"}</span>
      </p>
    </section>
  );
}

function SearchAffordance({ label = "Search jmpseat" }: { label?: string }) {
  return (
    <section className={styles.searchBand} aria-label={label}>
      <span>{label}...</span>
      <span aria-hidden="true" className={styles.searchIcon}>
        <span aria-hidden="true" className={styles.searchGlyph}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 40 40"
            aria-hidden="true"
            focusable="false"
            className={styles.searchIconSvg}
          >
            <linearGradient
              id="search-ico-gradient"
              x1="31.916"
              x2="25.088"
              y1="31.849"
              y2="26.05"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#7a7a7a" />
              <stop offset=".999" />
            </linearGradient>
            <polygon
              fill="url(#search-ico-gradient)"
              points="29.976,27 24.451,27.176 33.95,36.778 36.778,33.95"
            />
            <path
              fill="#7a7a7a"
              d="M24.313,27c-1.788,1.256-3.962,2-6.313,2c-6.075,0-11-4.925-11-11S11.925,7,18,7s11,4.925,11,11	c0,2.659-0.944,5.098-2.515,7h4.776C32.368,22.909,33,20.53,33,18c0-8.284-6.716-15-15-15S3,9.716,3,18c0,8.284,6.716,15,15,15	c4.903,0,9.243-2.363,11.98-6H24.313z"
            />
          </svg>
        </span>
      </span>
    </section>
  );
}

function HubHeroCard({
  hasDfwHomeBase,
}: {
  hasDfwHomeBase: boolean;
}) {
  return (
    <section className={styles.hubCard} aria-labelledby="home-hub-title">
      <div className={styles.hubCardCopy}>
        <span className={styles.cardLabel}>
          {hasDfwHomeBase ? "Your Hub" : "DFW launch"}
        </span>
        <h1 id="home-hub-title">DFW Hub</h1>
        <p>DFW Today, Base, Layover, Channels, and Recent Useful Threads.</p>
        <Link className={styles.primaryButton} href="/app/hubs/dfw">
          Open DFW Hub
        </Link>
      </div>
      <div className={styles.hubCardArt} aria-hidden="true">
        <Image
          alt=""
          className={styles.hubCardImage}
          fill
          priority
          sizes="140px"
          src="/images/dallas4.jpg"
        />
        <span>DFW</span>
      </div>
    </section>
  );
}

function NoHomeBaseNotice({
  hasLoadError,
  startWithDfwAction,
  startWithDfwError,
}: {
  hasLoadError: boolean;
  startWithDfwAction?: (formData: FormData) => Promise<void>;
  startWithDfwError: boolean;
}) {
  return (
    <section className={styles.noticeCard} aria-labelledby="no-home-base-title">
      <div>
        <span className={styles.cardMeta}>Skip-for-now state</span>
        <h2 id="no-home-base-title">DFW Hub is live first</h2>
        <p>
          Skip for now keeps Home Base unset. No Home Base is a valid initial
          state, and skipping does not fake-assign DFW to your profile or block
          app entry.
        </p>
      </div>
      {startWithDfwAction ? (
        <form action={startWithDfwAction} className={styles.startDfwForm}>
          <button className={styles.startDfwButton} type="submit">
            Start with DFW
          </button>
        </form>
      ) : (
        <button className={styles.disabledButton} type="button" disabled>
          Start with DFW
        </button>
      )}
      {startWithDfwError ? (
        <p className={styles.actionFeedback}>
          jmpseat could not start DFW right now. Try again in a moment.
        </p>
      ) : null}
      {hasLoadError ? (
        <p className={styles.mutedNote}>
          Home Base lookup is unavailable right now, so jmpseat is showing the
          safe no-Home-Base state.
        </p>
      ) : null}
    </section>
  );
}

function QuickActionsSection() {
  return (
    <section className={styles.panelSection} aria-labelledby="quick-actions-title">
      <div className={styles.sectionTitleRow}>
        <h2 id="quick-actions-title">Quick Actions</h2>
      </div>
      <div className={styles.quickGrid}>
        {quickActions.map((action) => (
          <button
            className={styles.quickAction}
            data-tone={action.tone}
            disabled
            key={action.title}
            type="button"
          >
            <span aria-hidden="true" className={styles.quickIcon}>
              {action.title.slice(0, 1)}
            </span>
            <strong>{action.title}</strong>
            <small>{action.detail}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function CrewPicksSection() {
  return (
    <section className={styles.panelSection} aria-labelledby="crew-picks-title">
      <div className={styles.sectionTitleRow}>
        <div>
          <h2 id="crew-picks-title">Crew Picks</h2>
          <p>Useful, not generic trending. Admin-curated until saves and ranking exist.</p>
        </div>
      </div>
      <div className={styles.crewPickList}>
        {crewPicks.map((item) => (
          <article className={styles.compactCard} key={item.title}>
            <span className={styles.cardMeta}>{item.meta}</span>
            <h3>{item.title}</h3>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function LayoversSection() {
  return (
    <section className={styles.railSection} aria-labelledby="layovers-title">
      <div className={styles.sectionTitleRow}>
        <div>
          <h2 id="layovers-title">Layovers</h2>
          <p>Placeholder destination previews. No exact hotel or live-location intel.</p>
        </div>
        <span className={styles.viewAll}>Coming soon</span>
      </div>
      <div className={styles.layoverRail}>
        {layoverPreviews.map((item) => (
          <article className={styles.layoverCard} key={item.title}>
            <span>{item.title}</span>
            <small>{item.meta}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function LoungesSection() {
  return (
    <section className={styles.panelSection} aria-labelledby="lounges-title">
      <div className={styles.sectionTitleRow}>
        <div>
          <h2 id="lounges-title">Your Lounges</h2>
          <p>Restricted spaces stay membership gated.</p>
        </div>
        <span className={styles.viewAll}>Locked</span>
      </div>
      <div className={styles.loungeList}>
        {loungePreviews.map((item) => (
          <article className={styles.loungeRow} key={item.title}>
            <span aria-hidden="true" className={styles.loungeIcon}>
              {item.title.slice(0, 1)}
            </span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </div>
            <span className={styles.rowState}>{item.meta}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function FollowingSection({ hasDfwHomeBase }: { hasDfwHomeBase: boolean }) {
  return (
    <section className={styles.panelSection} aria-labelledby="following-title">
      <div className={styles.sectionTitleRow}>
        <div>
          <h2 id="following-title">Following</h2>
          <p>
            Following initially means boards. It does not grant lounge or
            restricted content access.
          </p>
        </div>
      </div>
      <article className={styles.compactCard}>
        <span className={styles.cardMeta}>
          {hasDfwHomeBase ? "Home Base follow" : "Empty state"}
        </span>
        <h3>{hasDfwHomeBase ? "DFW Hub Channels" : "No followed boards yet"}</h3>
        <p>
          {hasDfwHomeBase
            ? "Auto-followed only when a user explicitly starts with DFW."
            : "Start with DFW or follow boards later when board discovery exists."}
        </p>
      </article>
    </section>
  );
}

function SavedSection() {
  return (
    <section className={styles.panelSection} aria-labelledby="saved-title">
      <div className={styles.sectionTitleRow}>
        <div>
          <h2 id="saved-title">Saved</h2>
          <p>Your personal knowledge library after saves exist.</p>
        </div>
      </div>
      <article className={styles.compactCard}>
        <span className={styles.cardMeta}>Empty state</span>
        <h3>No saved items yet</h3>
        <p>Saved content is future utility state, not an onboarding requirement.</p>
      </article>
    </section>
  );
}

function formatPostMetaValue(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatPostDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getDfwBaseboardPostHref(postId: string) {
  return `/app/hubs/dfw/baseboard/${encodeURIComponent(postId)}`;
}

function getDfwBaseboardReportStatusMessage(
  reportStatus: DfwBaseboardReportStatus | null,
) {
  return reportStatus === DFW_BASEBOARD_REPORT_REPORTED_STATUS
    ? "Thanks — the post was reported for review."
    : reportStatus === DFW_BASEBOARD_REPORT_INVALID_STATUS
      ? "Choose a report reason before submitting."
      : reportStatus === DFW_BASEBOARD_REPORT_FAILED_STATUS
        ? "jmpseat could not submit that report right now. Try again in a moment."
        : null;
}

function getDfwBaseboardCommentStatusMessage(
  commentStatus: DfwBaseboardCommentStatus | null,
) {
  return commentStatus === DFW_BASEBOARD_COMMENT_CREATED_STATUS
    ? "Your comment is live."
    : commentStatus === DFW_BASEBOARD_COMMENT_INVALID_STATUS
      ? "Add a comment before posting. Comments can be up to 2,000 characters."
      : commentStatus === DFW_BASEBOARD_COMMENT_FAILED_STATUS
        ? "jmpseat could not publish that comment right now. Try again in a moment."
        : null;
}

function getDfwBaseboardCommentReportStatusMessage(
  commentReportStatus: DfwBaseboardCommentReportStatus | null,
) {
  return commentReportStatus === DFW_BASEBOARD_COMMENT_REPORT_REPORTED_STATUS
    ? "Thanks — the comment was reported for review."
    : commentReportStatus === DFW_BASEBOARD_COMMENT_REPORT_INVALID_STATUS
      ? "Choose a report reason before submitting."
      : commentReportStatus === DFW_BASEBOARD_COMMENT_REPORT_FAILED_STATUS
        ? "jmpseat could not submit that report right now. Try again in a moment."
        : null;
}

function DfwChannelRequestCallout() {
  return (
    <article className={styles.channelRequestCard}>
      <span className={styles.cardMeta}>Reviewed request</span>
      <h3>Request a Channel</h3>
      <p>
        Request a focused aviation-worker utility channel from inside Channels.
        Admin approval required; free user-created channels are not live.
      </p>
      <button className={styles.disabledButton} type="button" disabled>
        Request a Channel coming soon
      </button>
    </article>
  );
}

function DfwBaseboardReportForm({
  postId,
  reportAction,
}: {
  postId: string;
  reportAction?: (formData: FormData) => Promise<void>;
}) {
  if (!reportAction) {
    return null;
  }

  return (
    <form action={reportAction} className={styles.reportForm}>
      <input name="postId" type="hidden" value={postId} />
      <label className={styles.reportField}>
        <span>Report this post</span>
        <select name="reason" required defaultValue="">
          <option disabled value="">
            Choose a reason
          </option>
          <option value="spam">Spam</option>
          <option value="harassment">Harassment</option>
          <option value="unsafe_info">Unsafe information</option>
          <option value="privacy">Privacy</option>
          <option value="off_topic">Off topic</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className={styles.reportField}>
        <span>Details</span>
        <textarea
          maxLength={1000}
          name="details"
          placeholder="Optional context for review"
          rows={2}
        />
      </label>
      <button className={styles.reportSubmit} type="submit">
        Submit report
      </button>
    </form>
  );
}

function DfwBaseboardCommentReportForm({
  postId,
  commentId,
  reportAction,
}: {
  postId: string;
  commentId: string;
  reportAction?: (formData: FormData) => Promise<void>;
}) {
  if (!reportAction) {
    return null;
  }

  return (
    <form action={reportAction} className={styles.reportForm}>
      <input name="postId" type="hidden" value={postId} />
      <input name="commentId" type="hidden" value={commentId} />
      <label className={styles.reportField}>
        <span>Report this comment</span>
        <select name="reason" required defaultValue="">
          <option disabled value="">
            Choose a reason
          </option>
          <option value="spam">Spam</option>
          <option value="harassment">Harassment</option>
          <option value="unsafe_info">Unsafe information</option>
          <option value="privacy">Privacy</option>
          <option value="off_topic">Off topic</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className={styles.reportField}>
        <span>Details</span>
        <textarea
          maxLength={1000}
          name="details"
          placeholder="Optional context for review"
          rows={2}
        />
      </label>
      <button className={styles.reportSubmit} type="submit">
        Submit report
      </button>
    </form>
  );
}

function DfwBaseboardPostsSection({
  posts = [],
  unavailable = false,
  postStatus = null,
  reportStatus = null,
  createAction,
  reportAction,
}: {
  posts?: readonly BaseboardPostListItem[];
  unavailable?: boolean;
  postStatus?: DfwBaseboardPostStatus | null;
  reportStatus?: DfwBaseboardReportStatus | null;
  createAction?: (formData: FormData) => Promise<void>;
  reportAction?: (formData: FormData) => Promise<void>;
}) {
  const statusMessage =
    postStatus === DFW_BASEBOARD_POST_CREATED_STATUS
      ? "Your DFW Hub post is live."
      : postStatus === DFW_BASEBOARD_POST_INVALID_STATUS
        ? "Add a title and body before posting. Titles can be up to 120 characters and posts up to 4,000 characters."
        : postStatus === DFW_BASEBOARD_POST_FAILED_STATUS
          ? "jmpseat could not publish that post right now. Try again in a moment."
          : null;
  const isSuccessStatus = postStatus === DFW_BASEBOARD_POST_CREATED_STATUS;
  const reportStatusMessage = getDfwBaseboardReportStatusMessage(reportStatus);
  const isReportSuccessStatus = reportStatus === DFW_BASEBOARD_REPORT_REPORTED_STATUS;

  return (
    <section className={styles.hubSurfaceGrid} aria-labelledby="baseboard-posts-title">
      <div className={styles.sectionTitleRow}>
        <div>
          <h2 id="baseboard-posts-title">Recent Useful Threads</h2>
          <p>
            Channel post foundation. Replies, saves, reactions, and search are
            not live.
          </p>
        </div>
      </div>

      {createAction ? (
        <form
          action={createAction}
          aria-labelledby="baseboard-composer-title"
          className={styles.baseboardComposer}
        >
          <div>
            <span className={styles.cardMeta}>Title and body only</span>
            <h3 id="baseboard-composer-title">Post to DFW Channels</h3>
            <p>
              Published channel posts appear here after the existing server
              action completes.
            </p>
          </div>
          <label className={styles.composerField}>
            <span>Title</span>
            <input
              maxLength={120}
              name="title"
              placeholder="Ask a question or share a practical update"
              required
              type="text"
            />
          </label>
          <label className={styles.composerField}>
            <span>Body</span>
            <textarea
              maxLength={4000}
              name="body"
              placeholder="Keep it useful for DFW aviation workers."
              required
              rows={5}
            />
          </label>
          <button className={styles.composerSubmit} type="submit">
            Publish post
          </button>
        </form>
      ) : null}

      {statusMessage ? (
        <p
          className={isSuccessStatus ? styles.actionSuccess : styles.actionFeedback}
          role="status"
        >
          {statusMessage}
        </p>
      ) : null}

      {reportStatusMessage ? (
        <p
          className={isReportSuccessStatus ? styles.actionSuccess : styles.actionFeedback}
          role="status"
        >
          {reportStatusMessage}
        </p>
      ) : null}

      {unavailable ? (
        <p className={styles.actionFeedback}>
          Published DFW Hub posts are unavailable right now.
        </p>
      ) : null}

      {posts.length > 0 ? (
        <div className={styles.postList}>
          {posts.map((post) => (
            <article className={styles.postCard} key={post.id}>
              <div className={styles.postHeader}>
                <span className={styles.cardMeta}>
                  {post.isPinned ? "Pinned" : "Minimal composer foundation"}
                </span>
                <span className={styles.postDate}>{formatPostDate(post.createdAt)}</span>
              </div>
              <h3>
                <Link
                  className={styles.postTitleLink}
                  href={getDfwBaseboardPostHref(post.id)}
                >
                  {post.title}
                </Link>
              </h3>
              <p>{post.body}</p>
              <div className={styles.postMetaRow} aria-label="Post metadata">
                <span>{formatPostMetaValue(post.contentType)}</span>
                <span>{formatPostMetaValue(post.category)}</span>
                <span>{post.authorLabel}</span>
              </div>
              <DfwBaseboardReportForm postId={post.id} reportAction={reportAction} />
            </article>
          ))}
        </div>
      ) : (
        <article className={styles.postEmptyState}>
          <span className={styles.cardMeta}>No posts yet</span>
          <h3>No useful DFW threads yet.</h3>
          <p>
            Useful DFW threads will appear here when verified workers contribute
            and moderators or admins surface high-signal posts. Replies, saves,
            reactions, and search are not live in this channel post foundation.
          </p>
        </article>
      )}
    </section>
  );
}

export function DfwBaseboardPostDetailShell({
  post,
  postUnavailable = false,
  reportStatus = null,
  reportAction,
  comments = [],
  commentsUnavailable = false,
  commentStatus = null,
  commentReportStatus = null,
  createCommentAction,
  reportCommentAction,
}: DfwBaseboardPostDetailShellProps) {
  const reportStatusMessage = getDfwBaseboardReportStatusMessage(reportStatus);
  const isReportSuccessStatus = reportStatus === DFW_BASEBOARD_REPORT_REPORTED_STATUS;
  const commentStatusMessage = getDfwBaseboardCommentStatusMessage(commentStatus);
  const isCommentSuccessStatus =
    commentStatus === DFW_BASEBOARD_COMMENT_CREATED_STATUS;
  const commentReportStatusMessage =
    getDfwBaseboardCommentReportStatusMessage(commentReportStatus);
  const isCommentReportSuccessStatus =
    commentReportStatus === DFW_BASEBOARD_COMMENT_REPORT_REPORTED_STATUS;

  return (
    <main className={styles.shell}>
      <div className={styles.mobileFrame}>
        <AppHeader
          backHref="/app/hubs/dfw/baseboard"
          backLabel="Channels"
          subtitle="DFW Hub thread"
          showBackLink
        />

        <nav className={styles.breadcrumb} aria-label="DFW Hub thread breadcrumb">
          <Link href="/app/hubs/dfw">DFW Hub</Link>
          <span aria-hidden="true">/</span>
          <Link href="/app/hubs/dfw/baseboard">Channels</Link>
          <span aria-hidden="true">/</span>
          <span>Thread</span>
        </nav>

        <section className={styles.postDetailSurface} aria-labelledby="baseboard-post-detail-title">
          <Link className={styles.inlineBackLink} href="/app/hubs/dfw/baseboard">
            Back to DFW Channels
          </Link>

          {reportStatusMessage ? (
            <p
              className={isReportSuccessStatus ? styles.actionSuccess : styles.actionFeedback}
              role="status"
            >
              {reportStatusMessage}
            </p>
          ) : null}

          {post && !postUnavailable ? (
            <article className={styles.postDetailCard}>
              <div className={styles.postHeader}>
                <span className={styles.cardMeta}>
                  {post.isPinned ? "Pinned" : "Read-only post"}
                </span>
                <span className={styles.postDate}>{formatPostDate(post.createdAt)}</span>
              </div>
              <h1 id="baseboard-post-detail-title">{post.title}</h1>
              <div className={styles.postMetaRow} aria-label="Post metadata">
                <span>{formatPostMetaValue(post.contentType)}</span>
                <span>{formatPostMetaValue(post.category)}</span>
                <span>{post.authorLabel}</span>
              </div>
              <p className={styles.postDetailBody}>{post.body}</p>
              {post.updatedAt !== post.createdAt ? (
                <p className={styles.mutedNote}>Updated {formatPostDate(post.updatedAt)}</p>
              ) : null}
              <p className={styles.mutedNote}>
                This detail view supports top-level comments and reporting.
                Nested replies, saves, reactions, search, and public sharing are
                not live.
              </p>
              <DfwBaseboardReportForm postId={post.id} reportAction={reportAction} />
            </article>
          ) : (
            <article className={styles.postEmptyState}>
              <span className={styles.cardMeta}>Unavailable</span>
              <h1 id="baseboard-post-detail-title">That DFW Hub thread is unavailable.</h1>
              <p>
                jmpseat can only show published DFW Hub threads available to
                this private app surface.
              </p>
            </article>
          )}
        </section>

        {post && !postUnavailable ? (
          <DfwBaseboardCommentsSection
            commentReportStatusMessage={commentReportStatusMessage}
            commentStatusMessage={commentStatusMessage}
            comments={comments}
            createCommentAction={createCommentAction}
            isCommentReportSuccessStatus={isCommentReportSuccessStatus}
            isCommentSuccessStatus={isCommentSuccessStatus}
            postId={post.id}
            reportCommentAction={reportCommentAction}
            unavailable={commentsUnavailable}
          />
        ) : null}
      </div>
    </main>
  );
}

function DfwBaseboardCommentsSection({
  comments,
  unavailable,
  postId,
  createCommentAction,
  reportCommentAction,
  commentStatusMessage,
  commentReportStatusMessage,
  isCommentSuccessStatus,
  isCommentReportSuccessStatus,
}: {
  comments: readonly BaseboardPostComment[];
  unavailable: boolean;
  postId: string;
  createCommentAction?: (formData: FormData) => Promise<void>;
  reportCommentAction?: (formData: FormData) => Promise<void>;
  commentStatusMessage: string | null;
  commentReportStatusMessage: string | null;
  isCommentSuccessStatus: boolean;
  isCommentReportSuccessStatus: boolean;
}) {
  return (
    <section className={styles.commentsSection} aria-labelledby="baseboard-comments-title">
      <div className={styles.sectionTitleRow}>
        <div>
          <h2 id="baseboard-comments-title">Comments</h2>
          <p>Top-level comments only. Comment reporting is available for review.</p>
        </div>
      </div>

      {commentStatusMessage ? (
        <p
          className={isCommentSuccessStatus ? styles.actionSuccess : styles.actionFeedback}
          role="status"
        >
          {commentStatusMessage}
        </p>
      ) : null}

      {commentReportStatusMessage ? (
        <p
          className={
            isCommentReportSuccessStatus
              ? styles.actionSuccess
              : styles.actionFeedback
          }
          role="status"
        >
          {commentReportStatusMessage}
        </p>
      ) : null}

      {createCommentAction ? (
        <form
          action={createCommentAction}
          aria-labelledby="baseboard-comment-composer-title"
          className={styles.commentComposer}
        >
          <input name="postId" type="hidden" value={postId} />
          <label className={styles.composerField}>
            <span id="baseboard-comment-composer-title">Post a comment</span>
            <textarea
              maxLength={2000}
              name="commentBody"
              placeholder="Add a useful top-level comment."
              required
              rows={4}
            />
          </label>
          <button className={styles.composerSubmit} type="submit">
            Publish comment
          </button>
        </form>
      ) : null}

      {unavailable ? (
        <p className={styles.actionFeedback}>
          DFW Hub thread comments are unavailable right now.
        </p>
      ) : null}

      {comments.length > 0 ? (
        <div className={styles.commentList}>
          {comments.map((comment) => (
            <article className={styles.commentCard} key={comment.id}>
              <div className={styles.postHeader}>
                <span className={styles.cardMeta}>{comment.authorLabel}</span>
                <span className={styles.postDate}>
                  {formatPostDate(comment.createdAt)}
                </span>
              </div>
              <p>{comment.body}</p>
              {comment.updatedAt !== comment.createdAt ? (
                <p className={styles.mutedNote}>
                  Updated {formatPostDate(comment.updatedAt)}
                </p>
              ) : null}
              <DfwBaseboardCommentReportForm
                commentId={comment.id}
                postId={postId}
                reportAction={reportCommentAction}
              />
            </article>
          ))}
        </div>
      ) : (
        <article className={styles.postEmptyState}>
          <span className={styles.cardMeta}>No comments yet</span>
          <h3>No comments yet.</h3>
          <p>Top-level comments on this DFW Hub thread will appear here.</p>
        </article>
      )}
    </section>
  );
}

function BottomNavVisual() {
  return (
    <nav className={styles.bottomNav} aria-label="Private app visual navigation">
      <span data-active="true">Home</span>
      <span>Boards</span>
      <span>Search</span>
      <span>Saved</span>
      <span>Profile</span>
    </nav>
  );
}

export function HomeHubShell({
  homeBaseCode,
  homeBaseName,
  homeBaseLoadError = false,
  startWithDfwAction,
  startWithDfwError = false,
}: HomeHubShellProps) {
  const normalizedHomeBase = homeBaseCode?.trim().toUpperCase() ?? null;
  const hasHomeBase = Boolean(normalizedHomeBase);
  const hasDfwHomeBase = normalizedHomeBase === "DFW";

  return (
    <main aria-label="Utility dashboard" className={styles.shell}>
      <div className={styles.mobileFrame}>
        <AppHeader />
        <WelcomeBlock hasHomeBase={hasHomeBase} homeBaseName={homeBaseName} />
        <SearchAffordance />
        <HubHeroCard hasDfwHomeBase={hasDfwHomeBase} />

        {hasHomeBase ? (
          <p className={styles.stateNote}>
            Current Home Base preference: {homeBaseName ?? normalizedHomeBase}. This is
            personalization only, not authorization truth.
          </p>
        ) : (
          <NoHomeBaseNotice
            hasLoadError={homeBaseLoadError}
            startWithDfwAction={startWithDfwAction}
            startWithDfwError={startWithDfwError}
          />
        )}

        <QuickActionsSection />
        <CrewPicksSection />
        <LayoversSection />
        <LoungesSection />
        <FollowingSection hasDfwHomeBase={hasDfwHomeBase} />
        <SavedSection />
        <BottomNavVisual />
      </div>
    </main>
  );
}

export function DfwHubReadOnlyShell() {
  return (
    <main className={styles.shell}>
      <div className={styles.mobileFrame}>
        <AppHeader subtitle="DFW Hub read-only shell" showBackLink />

        <section className={styles.destinationHero} aria-labelledby="dfw-hub-title">
          <span className={styles.cardLabel}>Dallas/Fort Worth</span>
          <h1 id="dfw-hub-title">DFW Hub</h1>
          <p>
            A curated, read-heavy utility shell for the first launch Hub with
            scoped community participation underneath.
          </p>
        </section>

        <SearchAffordance label="Search within DFW" />

        <section className={styles.hubSurfaceGrid} aria-labelledby="hub-surfaces-title">
          <div className={styles.sectionTitleRow}>
            <div>
              <h2 id="hub-surfaces-title">Hub surfaces</h2>
              <p>
                DFW Today, Base, Layover, Channels, and Recent Useful Threads
                are the current Hub sections.
              </p>
            </div>
          </div>
          <div className={styles.surfaceGrid}>
            {dfwHubSections.map((item) =>
              item.href ? (
                <Link className={styles.surfaceCard} href={item.href} key={item.title}>
                  <span className={styles.cardMeta}>{item.meta}</span>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </Link>
              ) : (
                <article className={styles.surfaceCard} key={item.title}>
                  <span className={styles.cardMeta}>{item.meta}</span>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </article>
              ),
            )}
          </div>
        </section>

        <section className={styles.hubSurfaceGrid} aria-labelledby="dfw-channels-title">
          <div className={styles.sectionTitleRow}>
            <div>
              <h2 id="dfw-channels-title">DFW Channels</h2>
              <p>Focused discussion spaces with reviewed channel expansion.</p>
            </div>
          </div>
          <div className={styles.surfaceGrid}>
            {[
              "DFW Questions",
              "Commuting & Parking",
              "Food & Coffee",
              "New to DFW",
              "Base Life",
              "Crew Tips",
              "App Feedback",
            ].map((channel) => (
              <article className={styles.surfaceCard} key={channel}>
                <span className={styles.cardMeta}>Default channel</span>
                <h3>{channel}</h3>
                <p>Uses existing safe post/comment/report/moderation primitives.</p>
              </article>
            ))}
            <DfwChannelRequestCallout />
          </div>
        </section>

        <section className={styles.safetyBand} aria-labelledby="hub-safety-title">
          <span className={styles.cardLabel}>Safety boundary</span>
          <h2 id="hub-safety-title">Layover content must stay safe and non-sensitive.</h2>
          <p>
            No exact crew hotel exposure, live crew movement or location,
            passenger private information, airport or security-sensitive
            procedures, company-confidential documents or policies, or dating
            and social meetup behavior belongs in this shell.
          </p>
          <p>
            Existing restricted lounge access remains membership gated and
            available through the preserved{" "}
            <Link href="/app/hubs/dfw/lounges">DFW Lounges route</Link>; it is
            not part of the open Hub section model.
          </p>
        </section>
      </div>
    </main>
  );
}

export function DfwHubSectionReadOnlyShell({
  section,
  baseboardPosts,
  baseboardPostsUnavailable = false,
  baseboardPostStatus = null,
  baseboardReportStatus = null,
  createBaseboardPostAction,
  reportBaseboardPostAction,
}: DfwHubSectionReadOnlyShellProps) {
  return (
    <main className={styles.shell}>
      <div className={styles.mobileFrame}>
        <AppHeader
          backHref="/app/hubs/dfw"
          backLabel="DFW Hub"
          subtitle="DFW Hub section shell"
          showBackLink
        />

        <nav className={styles.breadcrumb} aria-label="DFW Hub breadcrumb">
          <Link href="/app/hubs/dfw">DFW Hub</Link>
          <span aria-hidden="true">/</span>
          <span>{section.title.replace("DFW ", "")}</span>
        </nav>

        <section className={styles.destinationHero} aria-labelledby={`${section.key}-title`}>
          <span className={styles.cardLabel}>{section.eyebrow}</span>
          <h1 id={`${section.key}-title`}>{section.title}</h1>
          <p>{section.purpose}</p>
        </section>

        {section.key === "baseboard" ? (
          <DfwBaseboardPostsSection
            createAction={createBaseboardPostAction}
            postStatus={baseboardPostStatus}
            posts={baseboardPosts}
            reportAction={reportBaseboardPostAction}
            reportStatus={baseboardReportStatus}
            unavailable={baseboardPostsUnavailable}
          />
        ) : (
          <section className={styles.hubSurfaceGrid} aria-labelledby={`${section.key}-coming-title`}>
            <div className={styles.sectionTitleRow}>
              <div>
                <h2 id={`${section.key}-coming-title`}>Coming later</h2>
                <p>This route is a private, read-only placeholder for the DFW Hub section.</p>
              </div>
            </div>
            <div className={styles.surfaceGrid}>
              {section.placeholders.map((item) => (
                <article className={styles.surfaceCard} key={item.title}>
                  <span className={styles.cardMeta}>{item.meta}</span>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {section.safetyNotes ? (
          <section className={styles.safetyBand} aria-labelledby={`${section.key}-safety-title`}>
            <span className={styles.cardLabel}>Safety boundary</span>
            <h2 id={`${section.key}-safety-title`}>Access and safety rules still apply.</h2>
            <ul className={styles.safetyList}>
              {section.safetyNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </main>
  );
}
