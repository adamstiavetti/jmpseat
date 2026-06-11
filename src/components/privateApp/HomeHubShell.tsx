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
import type { HubChannelListItem } from "../../lib/community/hubChannels";

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
  cta?: string;
  icon: "today" | "base" | "layover" | "channels" | "threads";
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

type DfwChannelsOverviewShellProps = {
  channels?: readonly HubChannelListItem[];
  channelsUnavailable?: boolean;
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
  href?: string;
  icon: "plane" | "chat" | "pin" | "bookmark";
  tone: "hub" | "channels" | "layover" | "saved";
};

type SuggestedChannel = DashboardItem & {
  href: string;
  icon: "question" | "coffee" | "crew";
};

const suggestedChannels: readonly SuggestedChannel[] = [
  {
    title: "DFW Q&A",
    detail: "General questions when a topic does not fit a specific channel.",
    href: "/app/hubs/dfw/channels",
    icon: "question",
    meta: "Channel preview",
  },
  {
    title: "Commuting & Parking",
    detail: "Employee parking, commuting, transit, and practical access questions.",
    href: "/app/hubs/dfw/channels",
    icon: "coffee",
    meta: "Channel preview",
  },
  {
    title: "DFW Layover & Local",
    detail: "Safe local recommendations without exact crew hotel exposure.",
    href: "/app/hubs/dfw/channels",
    icon: "crew",
    meta: "Channel preview",
  },
];

const quickActions: readonly QuickAction[] = [
  {
    title: "Open DFW Hub",
    detail: "Your Hub",
    href: "/app/hubs/dfw",
    icon: "plane",
    tone: "hub",
  },
  {
    title: "Browse Channels",
    detail: "Scoped threads",
    href: "/app/hubs/dfw/channels",
    icon: "chat",
    tone: "channels",
  },
  {
    title: "Find Layover Info",
    detail: "DFW utility",
    href: "/app/hubs/dfw/layovers",
    icon: "pin",
    tone: "layover",
  },
  {
    title: "Saved",
    detail: "Coming later",
    icon: "bookmark",
    tone: "saved",
  },
];

const dfwHubSections: readonly DfwHubSectionItem[] = [
  {
    title: "DFW Today",
    detail:
      "Curated current info: weather placeholder, public advisories, and app notes. No live weather or traffic integration is active yet.",
    icon: "today",
    meta: "Curated current info",
  },
  {
    title: "Base",
    detail:
      "Commuting, parking, new-to-DFW, and base life utility without operationally sensitive claims.",
    icon: "base",
    meta: "Based-worker utility",
  },
  {
    title: "Layover",
    detail:
      "Essentials, Food & Coffee, Getting Around, and Crew Tips for safe layover utility.",
    cta: "View Layover",
    href: "/app/hubs/dfw/layovers",
    icon: "layover",
    meta: "Layover utility",
  },
  {
    title: "Channels",
    detail:
      "Browse active DFW channel spaces backed by Hub child board metadata.",
    cta: "Browse Channels",
    href: "/app/hubs/dfw/channels",
    icon: "channels",
    meta: "Scoped discussion",
  },
  {
    title: "Recent Useful Threads",
    detail:
      "No useful DFW threads yet. Helpful discussions will appear as verified workers contribute.",
    cta: "View Threads",
    href: "/app/hubs/dfw/crew-picks",
    icon: "threads",
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

function AppIcon({
  name,
  className,
}: {
  name: QuickAction["icon"] | SuggestedChannel["icon"] | DfwHubSectionItem["icon"] | "bell" | "search";
  className?: string;
}) {
  const commonProps = {
    "aria-hidden": true,
    className,
    focusable: false,
    viewBox: "0 0 24 24",
  } as const;

  switch (name) {
    case "bell":
      return (
        <svg {...commonProps}>
          <path d="M15.7 17.2H8.3a2.1 2.1 0 0 0 3.7 1.2 2.1 2.1 0 0 0 3.7-1.2Z" />
          <path d="M5.5 16.2h13l-1.4-2.3v-3.5a5.1 5.1 0 0 0-3.7-4.9 1.5 1.5 0 0 0-2.8 0 5.1 5.1 0 0 0-3.7 4.9v3.5l-1.4 2.3Z" />
        </svg>
      );
    case "search":
      return (
        <svg {...commonProps}>
          <circle cx="10.7" cy="10.7" r="5.9" />
          <path d="m15.1 15.1 4 4" />
        </svg>
      );
    case "plane":
      return (
        <svg {...commonProps}>
          <path d="m3.5 13.2 7.2-1.8 5.8-6.8c.7-.8 2-.2 1.8.9l-1.1 5.9 3.7 3.5-4.7 1.1-2.2 4.5-2.1-4-5.7 1.3-2.7-4.6Z" />
        </svg>
      );
    case "chat":
      return (
        <svg {...commonProps}>
          <path d="M5.2 5.8h13.6v9.5H9.1l-3.9 3.2V5.8Z" />
          <path d="M8.8 10.2h.1M12 10.2h.1M15.2 10.2h.1" />
        </svg>
      );
    case "pin":
      return (
        <svg {...commonProps}>
          <path d="M12 21s6.2-5.9 6.2-11a6.2 6.2 0 1 0-12.4 0C5.8 15.1 12 21 12 21Z" />
          <circle cx="12" cy="10" r="2.2" />
        </svg>
      );
    case "bookmark":
      return (
        <svg {...commonProps}>
          <path d="M7 4.5h10v15l-5-3.2-5 3.2v-15Z" />
        </svg>
      );
    case "today":
      return (
        <svg {...commonProps}>
          <path d="M7.3 15.8a5.4 5.4 0 0 1 10.5 0" />
          <path d="M12.5 5.4v2M5.4 8.5l1.4 1.4M19.6 8.5l-1.4 1.4M4.7 16.2h14.8" />
        </svg>
      );
    case "base":
      return (
        <svg {...commonProps}>
          <path d="M6.2 10.3 8 6h8l1.8 4.3" />
          <path d="M5.5 10.3h13v6.2h-13v-6.2ZM7.4 16.5v1.8M16.6 16.5v1.8" />
          <circle cx="8.2" cy="13.4" r=".9" />
          <circle cx="15.8" cy="13.4" r=".9" />
        </svg>
      );
    case "layover":
      return (
        <svg {...commonProps}>
          <path d="M8 4.5h8l.8 3H7.2l.8-3ZM6.5 7.5h11v12h-11v-12Z" />
          <path d="M9.2 19.5v1.8M14.8 19.5v1.8M10 10.2h4" />
        </svg>
      );
    case "channels":
    case "crew":
      return (
        <svg {...commonProps}>
          <circle cx="8.5" cy="9" r="2.4" />
          <circle cx="15.5" cy="9" r="2.4" />
          <path d="M4.5 18a4.1 4.1 0 0 1 8 0M11.5 18a4.1 4.1 0 0 1 8 0" />
        </svg>
      );
    case "threads":
      return (
        <svg {...commonProps}>
          <path d="M5 5.8h14v9.4H9.4L5 18.3V5.8Z" />
        </svg>
      );
    case "question":
      return (
        <svg {...commonProps}>
          <path d="M9.1 8.3a3.2 3.2 0 1 1 4.2 3c-.9.4-1.3 1-1.3 2" />
          <path d="M12 17h.1" />
        </svg>
      );
    case "coffee":
      return (
        <svg {...commonProps}>
          <path d="M6.8 8.2h9.4v5.4a4.7 4.7 0 0 1-9.4 0V8.2Z" />
          <path d="M16.2 9.7h1.1a2.2 2.2 0 0 1 0 4.4h-1.1M8.5 4.2v2M12 4.2v2" />
        </svg>
      );
  }

  return null;
}

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
          <span className={styles.headerIcon}>
            <AppIcon name="bell" className={styles.inlineIcon} />
          </span>
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
        <span aria-hidden="true" className={styles.verifiedDot}>V</span>
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
      <span aria-hidden="true" className={styles.searchIcon}>
        <AppIcon name="search" className={styles.inlineIcon} />
      </span>
      <span>{label}...</span>
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
      <Image
        alt=""
        className={styles.hubCardImage}
        fill
        priority
        sizes="(max-width: 460px) 100vw, 460px"
        src="/images/dallas4.jpg"
      />
      <div className={styles.hubCardCopy}>
        <span className={styles.cardLabel}>
          {hasDfwHomeBase ? "Your Hub" : "DFW launch"}
        </span>
        <strong className={styles.heroCode}>DFW</strong>
        <h1 id="home-hub-title">DFW Hub</h1>
        <p>DFW Today · Base · Layover · Channels</p>
        <Link className={styles.primaryButton} href="/app/hubs/dfw">
          <span>Open DFW Hub</span>
          <span aria-hidden="true">&gt;</span>
        </Link>
      </div>
      <span aria-hidden="true" className={styles.heroPlane}>
        <AppIcon name="plane" className={styles.inlineIcon} />
      </span>
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
        {quickActions.map((action) => {
          if (action.href) {
            return (
              <Link
                className={styles.quickAction}
                data-tone={action.tone}
                href={action.href}
                key={action.title}
              >
                <span aria-hidden="true" className={styles.quickIcon}>
                  <AppIcon name={action.icon} className={styles.inlineIcon} />
                </span>
                <strong>{action.title}</strong>
                <small>{action.detail}</small>
              </Link>
            );
          }

          return (
            <button
              className={styles.quickAction}
              data-tone={action.tone}
              disabled
              key={action.title}
              type="button"
            >
              <span aria-hidden="true" className={styles.quickIcon}>
                <AppIcon name={action.icon} className={styles.inlineIcon} />
              </span>
              <strong>{action.title}</strong>
              <small>{action.detail}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function RecentUsefulThreadsSection() {
  return (
    <section className={styles.panelSection} aria-labelledby="recent-useful-threads-title">
      <div className={styles.sectionTitleRow}>
        <h2 id="recent-useful-threads-title">Recent Useful Threads</h2>
      </div>
      <article className={styles.emptyUsefulCard}>
        <span aria-hidden="true" className={styles.emptyUsefulIcon}>
          <AppIcon name="threads" className={styles.inlineIcon} />
        </span>
        <h3>No recent threads yet</h3>
        <p>Useful threads from across DFW Hub will appear here when verified aviation workers contribute.</p>
      </article>
    </section>
  );
}

function SuggestedChannelsSection() {
  return (
    <section className={styles.panelSection} aria-labelledby="suggested-channels-title">
      <div className={styles.sectionTitleRow}>
        <h2 id="suggested-channels-title">Suggested Channels</h2>
        <Link className={styles.viewAll} href="/app/hubs/dfw/channels">
          View all
        </Link>
      </div>
      <div className={styles.suggestedChannelList}>
        {suggestedChannels.map((item) => (
          <Link className={styles.suggestedChannelRow} href={item.href} key={item.title}>
            <span aria-hidden="true" className={styles.channelIcon} data-channel={item.icon}>
              <AppIcon name={item.icon} className={styles.inlineIcon} />
            </span>
            <span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </span>
            <span aria-hidden="true" className={styles.rowChevron}>
              &gt;
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function DfwChannelsRequestFooter() {
  return (
    <article className={styles.channelRequestCard}>
      <span className={styles.cardMeta}>Reviewed request</span>
      <h3>Request a Channel</h3>
      <p>Need a focused place for another aviation-worker topic? Request a Channel.</p>
      <button className={styles.disabledButton} type="button" disabled>
        Request workflow coming later
      </button>
    </article>
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

      <DfwChannelRequestCallout />
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

function BottomNavVisual({ active }: { active: "Home" | "Hubs" }) {
  const navItems = ["Home", "Hubs", "Search", "Saved", "Me"] as const;

  return (
    <nav className={styles.bottomNav} aria-label="Private app visual navigation">
      {navItems.map((item) => (
        <span data-active={item === active ? "true" : undefined} key={item}>
          {item}
        </span>
      ))}
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
        <RecentUsefulThreadsSection />
        <SuggestedChannelsSection />
        <BottomNavVisual active="Home" />
      </div>
    </main>
  );
}

export function DfwHubReadOnlyShell() {
  return (
    <main className={styles.shell}>
      <div className={styles.mobileFrame}>
        <AppHeader />

        <nav className={styles.hubTitleBar} aria-label="DFW Hub navigation">
          <Link className={styles.inlineBackLink} href="/app">
            Back
          </Link>
          <span>DFW Hub</span>
        </nav>

        <section className={styles.destinationHero} aria-labelledby="dfw-hub-title">
          <Image
            alt=""
            className={styles.destinationHeroImage}
            fill
            priority
            sizes="(max-width: 460px) 100vw, 460px"
            src="/images/dallas4.jpg"
          />
          <div className={styles.destinationHeroCopy}>
            <strong className={styles.heroCode}>DFW</strong>
            <span className={styles.cardLabel}>Dallas/Fort Worth</span>
            <h1 id="dfw-hub-title">DFW Hub</h1>
            <p>A utility home for DFW aviation workers.</p>
            <a className={styles.secondaryHeroButton} href="#dfw-hub-sections">
              <span>Browse Hub Sections</span>
              <span aria-hidden="true">&gt;</span>
            </a>
          </div>
        </section>

        <SearchAffordance label="Search within DFW" />

        <section
          className={styles.hubSurfaceGrid}
          aria-labelledby="hub-surfaces-title"
          id="dfw-hub-sections"
        >
          <h2 className={styles.visuallyHidden} id="hub-surfaces-title">
            DFW Hub sections
          </h2>
          <div className={styles.sectionList}>
            {dfwHubSections.map((item) =>
              item.href ? (
                <Link className={styles.sectionCard} href={item.href} key={item.title}>
                  <span aria-hidden="true" className={styles.sectionIcon} data-section={item.icon}>
                    <AppIcon name={item.icon} className={styles.inlineIcon} />
                  </span>
                  <span className={styles.sectionCardBody}>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                    <small>{item.meta}</small>
                  </span>
                  <span className={styles.sectionCta}>{item.cta ?? "View"}</span>
                  <span aria-hidden="true" className={styles.rowChevron}>
                    &gt;
                  </span>
                </Link>
              ) : (
                <article className={styles.sectionCard} key={item.title}>
                  <span aria-hidden="true" className={styles.sectionIcon} data-section={item.icon}>
                    <AppIcon name={item.icon} className={styles.inlineIcon} />
                  </span>
                  <span className={styles.sectionCardBody}>
                    <h3>{item.title}</h3>
                    <p>{item.detail}</p>
                    <small>{item.meta}</small>
                  </span>
                  <span className={styles.sectionCta}>Coming soon</span>
                  <span aria-hidden="true" className={styles.rowChevron}>
                    &gt;
                  </span>
                </article>
              ),
            )}
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
        <BottomNavVisual active="Hubs" />
      </div>
    </main>
  );
}

export function DfwChannelsOverviewShell({
  channels = [],
  channelsUnavailable = false,
}: DfwChannelsOverviewShellProps) {
  return (
    <main className={styles.shell}>
      <div className={styles.mobileFrame}>
        <AppHeader
          backHref="/app/hubs/dfw"
          backLabel="DFW Hub"
          subtitle="DFW Hub Channels"
          showBackLink
        />

        <nav className={styles.breadcrumb} aria-label="DFW Channels breadcrumb">
          <Link href="/app/hubs/dfw">DFW Hub</Link>
          <span aria-hidden="true">/</span>
          <span>Channels</span>
        </nav>

            <section className={styles.destinationHero} aria-labelledby="dfw-channels-title">
              <span className={styles.cardLabel}>Browse-first Channels</span>
              <h1 id="dfw-channels-title">DFW Channels</h1>
              <p>focused spaces for verified aviation workers.</p>
            </section>

        <section className={styles.hubSurfaceGrid} aria-labelledby="dfw-channel-list-title">
          <div className={styles.sectionTitleRow}>
            <div>
              <h2 id="dfw-channel-list-title">Available Channels</h2>
              <p>
                Active DFW channel metadata from the Hub board foundation.
                Posts, comments, and channel creation are not live here yet.
              </p>
            </div>
          </div>

          {channelsUnavailable ? (
            <p className={styles.actionFeedback}>
              DFW Channels are unavailable right now.
            </p>
          ) : null}

          {channels.length > 0 ? (
            <div className={styles.channelList}>
              {channels.map((channel) => (
                <article className={styles.channelRow} key={channel.slug}>
                  <span className={styles.channelShortName}>{channel.shortName}</span>
                  <span className={styles.channelRowBody}>
                    <h3>{channel.name}</h3>
                    <p>{channel.description}</p>
                  </span>
                  <span className={styles.rowState}>Active</span>
                </article>
              ))}
            </div>
          ) : (
            <article className={styles.postEmptyState}>
              <span className={styles.cardMeta}>No channels available</span>
              <h3>No DFW Channels are available yet.</h3>
              <p>
                Active DFW channel rows will appear after the channel metadata
                migration is applied and available to this private app surface.
              </p>
            </article>
          )}

          <DfwChannelsRequestFooter />
        </section>

        <BottomNavVisual active="Hubs" />
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
