import Image from "next/image";
import Link from "next/link";
import {
  DFW_BASEBOARD_POST_CREATED_STATUS,
  DFW_BASEBOARD_POST_FAILED_STATUS,
  DFW_BASEBOARD_POST_INVALID_STATUS,
  type DfwBaseboardPostStatus,
} from "../../lib/community/boardPostActionState";
import type { BaseboardPostListItem } from "../../lib/community/boardPostReads";

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
  href: string;
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
  createBaseboardPostAction?: (formData: FormData) => Promise<void>;
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
    title: "Ask Baseboard",
    detail: "Posting later",
    tone: "ask",
  },
  {
    title: "Find Layovers",
    detail: "Discovery later",
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
    title: "Baseboard",
    detail: "DFW-based community questions, updates, and practical base knowledge.",
    href: "/app/hubs/dfw/baseboard",
    meta: "Primary hub surface",
  },
  {
    title: "Layovers",
    detail: "Passing-through utility for food, transport, coffee, gyms, and area tips.",
    href: "/app/hubs/dfw/layovers",
    meta: "Seed content later",
  },
  {
    title: "Lounges",
    detail: "Restricted membership spaces managed by scoped Crew Leads.",
    href: "/app/hubs/dfw/lounges",
    meta: "Membership gated",
  },
  {
    title: "Crew Picks",
    detail: "Saved-driven and admin-curated useful content for the hub.",
    href: "/app/hubs/dfw/crew-picks",
    meta: "Access aware later",
  },
];

export const dfwHubSectionShells: Record<DfwHubSectionKey, DfwHubSectionShell> = {
  baseboard: {
    key: "baseboard",
    title: "DFW Baseboard",
    eyebrow: "Based-there community",
    purpose:
      "A minimal posting surface for published DFW aviation-worker Q&A, updates, practical notes, and useful discussion.",
    placeholders: [
      {
        title: "No DFW Baseboard posts yet.",
        detail:
          "Published DFW Baseboard posts will appear here when they exist. Replies, saves, reactions, and search are not live in this minimal composer foundation.",
        meta: "No posts yet",
      },
      {
        title: "Minimal composer foundation",
        detail: "This route supports title and body posting only. Replies and richer post tools remain outside this UI.",
        meta: "Scope boundary",
      },
    ],
  },
  layovers: {
    key: "layovers",
    title: "DFW Layovers",
    eyebrow: "Passing-through utility",
    purpose:
      "A read-only shell for crew layover utility: food, coffee, gyms, transportation basics, weather basics, quick recommendations, and Q&A.",
    safetyNotes: [
      "No exact crew hotel locations.",
      "No live crew tracking.",
      "No security-sensitive or operationally sensitive information.",
    ],
    placeholders: [
      {
        title: "Recommendations coming later",
        detail: "Food, coffee, transport, and practical tips need content and moderation first.",
        meta: "No seed content",
      },
      {
        title: "Layover Q&A coming later",
        detail: "Question and answer flows are not implemented in this shell.",
        meta: "Read-only",
      },
      {
        title: "Seeded destination strategy remains future",
        detail: "No layover content was added by this ticket.",
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
    title: "DFW Crew Picks",
    eyebrow: "Useful signal",
    purpose:
      "A read-only shell for high-signal useful content curated by admins or saved-driven over time.",
    safetyNotes: [
      "No ranking is live.",
      "No AI surfacing is live.",
      "Lounge-visible content remains access-aware later.",
    ],
    placeholders: [
      {
        title: "Useful posts coming later",
        detail: "Posts and guides need the content foundation before they can appear here.",
        meta: "No posts yet",
      },
      {
        title: "Layover picks coming later",
        detail: "Layover recommendations require seeded content and safety review.",
        meta: "Future lane",
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
        <p>Baseboard, Layovers, Lounges, and Crew Picks.</p>
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
        <h3>{hasDfwHomeBase ? "DFW Baseboard" : "No followed boards yet"}</h3>
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

function DfwBaseboardPostsSection({
  posts = [],
  unavailable = false,
  postStatus = null,
  createAction,
}: {
  posts?: readonly BaseboardPostListItem[];
  unavailable?: boolean;
  postStatus?: DfwBaseboardPostStatus | null;
  createAction?: (formData: FormData) => Promise<void>;
}) {
  const statusMessage =
    postStatus === DFW_BASEBOARD_POST_CREATED_STATUS
      ? "Your DFW Baseboard post is live."
      : postStatus === DFW_BASEBOARD_POST_INVALID_STATUS
        ? "Add a title and body before posting. Titles can be up to 120 characters and posts up to 4,000 characters."
        : postStatus === DFW_BASEBOARD_POST_FAILED_STATUS
          ? "jmpseat could not publish that post right now. Try again in a moment."
          : null;
  const isSuccessStatus = postStatus === DFW_BASEBOARD_POST_CREATED_STATUS;

  return (
    <section className={styles.hubSurfaceGrid} aria-labelledby="baseboard-posts-title">
      <div className={styles.sectionTitleRow}>
        <div>
          <h2 id="baseboard-posts-title">Recent Baseboard posts</h2>
          <p>Minimal composer foundation. Replies, saves, reactions, and search are not live.</p>
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
            <h3 id="baseboard-composer-title">Post to DFW Baseboard</h3>
            <p>Published posts appear here after the server action completes.</p>
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

      {unavailable ? (
        <p className={styles.actionFeedback}>
          Published DFW Baseboard posts are unavailable right now.
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
              <h3>{post.title}</h3>
              <p>{post.body}</p>
              <div className={styles.postMetaRow} aria-label="Post metadata">
                <span>{formatPostMetaValue(post.contentType)}</span>
                <span>{formatPostMetaValue(post.category)}</span>
                <span>{post.authorLabel}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <article className={styles.postEmptyState}>
          <span className={styles.cardMeta}>No posts yet</span>
          <h3>No DFW Baseboard posts yet.</h3>
          <p>
            Published DFW Baseboard posts will appear here when they exist.
            Replies, saves, reactions, and search are not live in this minimal
            composer foundation.
          </p>
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
            A read-only destination shell for the first launch Hub. This page
            shows the intended surfaces without implementing posts, search,
            saves, lounge requests, or Crew Lead tooling.
          </p>
        </section>

        <SearchAffordance label="Search within DFW" />

        <section className={styles.hubSurfaceGrid} aria-labelledby="hub-surfaces-title">
          <div className={styles.sectionTitleRow}>
            <div>
              <h2 id="hub-surfaces-title">Hub surfaces</h2>
              <p>Baseboard, Layovers, Lounges, and Crew Picks are read-only here.</p>
            </div>
          </div>
          <div className={styles.surfaceGrid}>
            {dfwHubSections.map((item) => (
              <Link className={styles.surfaceCard} href={item.href} key={item.title}>
                <span className={styles.cardMeta}>{item.meta}</span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.safetyBand} aria-labelledby="hub-safety-title">
          <span className={styles.cardLabel}>Safety boundary</span>
          <h2 id="hub-safety-title">Layovers must stay safe and non-sensitive.</h2>
          <p>
            No exact crew hotel exposure, live location tracking, passenger
            private information, airport security procedures, or operationally
            sensitive information belongs in this shell.
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
  createBaseboardPostAction,
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
