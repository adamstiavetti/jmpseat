import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminShell } from "../../../../../src/components/admin/AdminShell";
import { AuthCard } from "../../../../../src/components/auth/AuthCard";
import authStyles from "../../../../../src/components/auth/auth.module.css";
import {
  buildAdminNavigation,
  getCurrentOperatorAccess,
} from "../../../../../src/lib/admin/access";
import { AUTH_ROUTES } from "../../../../../src/lib/auth/routes";
import { getCurrentAppAccessContext } from "../../../../../src/lib/betaAccess/server";
import {
  getPrivateAccessEventType,
} from "../../../../../src/lib/securityEvents/securityEvents";
import { recordSecurityEvent } from "../../../../../src/lib/securityEvents/server";
import {
  getPrivateAccessSource,
  getPrivateAppGateResult,
  getPrivateRouteAuditResult,
} from "../../../../../src/lib/privateApp/access";
import { getSupabaseBrowserEnv } from "../../../../../src/lib/supabase/config";
import { getCurrentVerificationReviewerAuthorizationContext } from "../../../../../src/lib/verification/reviewServer";
import styles from "./dfwHubWireframes.module.css";

export const dynamic = "force-dynamic";

const DESIGN_WIREFRAME_ROUTE = "/app/admin/design/dfw-hub-wireframes";

const prototypeScreens = [
  "Home / Dashboard",
  "DFW Hub Overview",
  "DFW Channels Overview",
  "Channel Detail / Thread List",
  "Thread Detail + Reply Composer",
  "Report Flow Preview",
] as const;

const channels = [
  {
    name: "DFW Questions",
    purpose: "Practical questions for verified DFW aviation workers.",
    status: "New",
  },
  {
    name: "Commuting & Parking",
    purpose: "Parking, transit, and commute planning without live ops detail.",
    status: "Recently active",
  },
  {
    name: "Food & Coffee",
    purpose: "Useful food and coffee finds around DFW.",
    status: "Sample threads",
  },
  {
    name: "New to DFW",
    purpose: "Orientation help for people learning the airport rhythm.",
    status: "Coming soon",
  },
  {
    name: "Base Life",
    purpose: "Based-worker utility and practical base information.",
    status: "No threads yet",
  },
  {
    name: "Crew Tips",
    purpose: "Small practical tips that stay inside safety boundaries.",
    status: "New",
  },
  {
    name: "App Feedback",
    purpose: "Feedback on the private beta experience.",
    status: "Recently active",
  },
] as const;

const sampleThreads = [
  {
    title: "Coffee options before an early report",
    excerpt: "Sample thread preview for comparing quick, practical choices.",
    meta: "Verified member - Recently active",
  },
  {
    title: "Good sit-down option during a longer break",
    excerpt: "Sample recommendation prompt with no real venue claim.",
    meta: "Verified member - New",
  },
  {
    title: "What should new DFW folks know about food runs?",
    excerpt: "Sample question row for a compact forum-style list.",
    meta: "Verified member - Unanswered",
  },
] as const;

const commentRows = [
  {
    author: "Verified member",
    body: "Sample reply with practical context and no live operational detail.",
    meta: "Recently active",
  },
  {
    author: "Verified member",
    body: "Another compact reply row showing the intended density.",
    meta: "New",
  },
] as const;

const quickActions = [
  { label: "Open DFW Hub", iconClass: styles.actionHub },
  { label: "Browse Channels", iconClass: styles.actionChannels },
  { label: "Find Layover Info", iconClass: styles.actionLayover },
  { label: "Saved", iconClass: styles.actionSaved },
] as const;

const navItems = [
  { label: "Home", iconClass: styles.navHome },
  { label: "Hubs", iconClass: styles.navHubs },
  { label: "Search", iconClass: styles.navSearch },
  { label: "Saved", iconClass: styles.navSaved },
  { label: "Me", iconClass: styles.navMe },
] as const;

function PhoneFrame({
  title,
  activeNav,
  children,
}: {
  title: string;
  activeNav: "Home" | "Hubs";
  children: ReactNode;
}) {
  return (
    <section className={styles.phonePanel} aria-label={title}>
      <div className={styles.appSurface}>
        <div className={styles.phoneBody}>{children}</div>
        <nav className={styles.bottomNav} aria-label={`${title} prototype navigation`}>
          {navItems.map((item) => (
            <span
              key={item.label}
              className={
                item.label === activeNav
                  ? `${styles.navItem} ${styles.navItemActive}`.trim()
                  : styles.navItem
              }
            >
              <span
                className={`${styles.navIcon} ${item.iconClass}`.trim()}
                aria-hidden="true"
              />
              {item.label}
            </span>
          ))}
        </nav>
      </div>
    </section>
  );
}

function AppHeader({ eyebrow }: { eyebrow?: string }) {
  return (
    <header className={styles.appHeader}>
      <div>
        <p className={styles.wordmark}>jmpseat</p>
        {eyebrow ? <p className={styles.microcopy}>{eyebrow}</p> : null}
      </div>
      <div className={styles.headerActions} aria-label="Prototype account controls">
        <span className={styles.bell} aria-hidden="true" />
        <span className={styles.avatar}>AC</span>
      </div>
    </header>
  );
}

function SearchBox({ label }: { label: string }) {
  return (
    <div className={styles.searchBox} aria-label={label}>
      <span>{label}</span>
      <span className={styles.searchIcon} aria-hidden="true" />
    </div>
  );
}

function HubHero({
  compact = false,
  action = "Open DFW Hub",
}: {
  compact?: boolean;
  action?: string | null;
}) {
  return (
    <section className={compact ? styles.hubHeroCompact : styles.hubHero}>
      <div className={styles.hubHeroText}>
        <p className={styles.kicker}>Your Hub</p>
        <h2>DFW Hub</h2>
        <p>DFW Today - Base - Layover - Channels</p>
        {action ? <span className={styles.heroAction}>{action}</span> : null}
      </div>
      <div className={styles.skylinePanel} aria-hidden="true">
        <span>DFW</span>
      </div>
    </section>
  );
}

function SectionCard({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: string;
}) {
  return (
    <article className={styles.sectionCard}>
      <div>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
      <span>{action}</span>
    </article>
  );
}

function ChannelRows() {
  return (
    <div className={styles.rowList}>
      {channels.map((channel) => (
        <article key={channel.name} className={styles.compactRow}>
          <span className={styles.channelBadge} aria-hidden="true">
            {channel.name.slice(0, 1)}
          </span>
          <div className={styles.rowText}>
            <h3>{channel.name}</h3>
            <p>{channel.purpose}</p>
          </div>
          <span className={styles.statusPill}>{channel.status}</span>
          <span className={styles.rowChevron} aria-hidden="true" />
        </article>
      ))}
    </div>
  );
}

function ThreadRows() {
  return (
    <div className={styles.rowList}>
      {sampleThreads.map((thread) => (
        <article key={thread.title} className={styles.threadRow}>
          <div>
            <h3>{thread.title}</h3>
            <p>{thread.excerpt}</p>
            <small>{thread.meta}</small>
          </div>
          <button type="button" aria-label="More thread actions">
            ...
          </button>
        </article>
      ))}
    </div>
  );
}

function ScreenHeader({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  return (
    <div className={styles.screenHeader}>
      <p>{label}</p>
      <h2>{title}</h2>
      <span>{body}</span>
    </div>
  );
}

function HomeScreen() {
  return (
    <PhoneFrame title="Home / Dashboard" activeNav="Home">
      <AppHeader />
      <section className={styles.welcomeBlock}>
        <h2>Welcome back, Alex</h2>
        <p>Verified - Flight Attendant - AUS Base</p>
      </section>
      <SearchBox label="Search jmpseat..." />
      <HubHero />
      <section className={styles.quickActions} aria-label="Quick actions">
        {quickActions.map((action) => (
          <span key={action.label}>
            <span
              className={`${styles.quickActionIcon} ${action.iconClass}`.trim()}
              aria-hidden="true"
            />
            {action.label}
          </span>
        ))}
      </section>
      <SectionCard
        title="Recent Useful Threads"
        body="Useful DFW threads will appear after verified workers contribute and operators surface high-signal posts."
        action="No threads yet"
      />
      <section className={styles.listBlock}>
        <div className={styles.blockHeading}>
          <h3>Suggested Channels</h3>
          <span>Browse</span>
        </div>
        {channels.slice(0, 3).map((channel) => (
          <article key={channel.name} className={styles.miniRow}>
            <span className={styles.miniBadge} aria-hidden="true">
              {channel.name.slice(0, 1)}
            </span>
            <strong>{channel.name}</strong>
            <span>{channel.status}</span>
          </article>
        ))}
      </section>
    </PhoneFrame>
  );
}

function HubOverviewScreen() {
  return (
    <PhoneFrame title="DFW Hub Overview" activeNav="Hubs">
      <AppHeader eyebrow="Dallas/Fort Worth" />
      <HubHero compact action="Browse sections" />
      <SearchBox label="Search within DFW..." />
      <div className={styles.cardGrid}>
        <SectionCard
          title="DFW Today"
          body="Curated current info placeholders. Live integrations are not active."
          action="View DFW Today"
        />
        <SectionCard
          title="Base"
          body="Commuting, parking, new-to-DFW, and practical base information."
          action="View Base"
        />
        <SectionCard
          title="Layover"
          body="Essentials, recommendations, questions, crew tips, food, and getting around."
          action="View Layover"
        />
        <SectionCard
          title="Channels"
          body="Focused discussion spaces for DFW aviation-worker utility."
          action="Browse Channels"
        />
      </div>
      <SectionCard
        title="Recent Useful Threads"
        body="High-signal thread previews belong here, not a raw chronological feed."
        action="Coming soon"
      />
    </PhoneFrame>
  );
}

function ChannelsScreen() {
  return (
    <PhoneFrame title="DFW Channels Overview" activeNav="Hubs">
      <AppHeader eyebrow="DFW Hub" />
      <ScreenHeader
        label="Channels"
        title="DFW Channels"
        body="Focused discussion spaces for verified aviation workers."
      />
      <SearchBox label="Search Channels..." />
      <ChannelRows />
      <aside className={styles.secondaryAction}>
        <h3>Request a Channel</h3>
        <p>Need a focused place for another aviation-worker topic? Request a Channel.</p>
        <span>Reviewed by admins before anything is created.</span>
      </aside>
    </PhoneFrame>
  );
}

function ChannelDetailScreen() {
  return (
    <PhoneFrame title="Channel Detail / Thread List" activeNav="Hubs">
      <AppHeader eyebrow="DFW Hub / Channels" />
      <ScreenHeader
        label="Food & Coffee"
        title="Useful food and coffee around DFW"
        body="Share practical finds, questions, and tips without live ops detail."
      />
      <aside className={styles.safetyNote}>
        Keep it useful: no passenger private information, exact crew hotel
        exposure, live ops-sensitive content, or security-sensitive procedures.
      </aside>
      <button className={styles.primaryButton} type="button">
        Start a Thread
      </button>
      <div className={styles.filterRow} aria-label="Thread filters">
        {["Useful", "Recent", "Unanswered"].map((filter) => (
          <span key={filter}>{filter}</span>
        ))}
      </div>
      <ThreadRows />
    </PhoneFrame>
  );
}

function ThreadDetailScreen() {
  return (
    <PhoneFrame title="Thread Detail + Reply Composer" activeNav="Hubs">
      <AppHeader eyebrow="DFW Hub / Channels / Food & Coffee" />
      <article className={styles.threadDetail}>
        <p className={styles.breadcrumb}>DFW Hub / Channels / Food & Coffee</p>
        <h2>Coffee options before an early report</h2>
        <p>
          Sample thread body showing the reading layout for concise,
          practical worker utility without real user content.
        </p>
        <div className={styles.threadMeta}>
          <span>Verified member</span>
          <button type="button">Report thread</button>
        </div>
      </article>
      <section className={styles.listBlock}>
        <div className={styles.blockHeading}>
          <h3>Replies</h3>
          <span>Sample threads</span>
        </div>
        {commentRows.map((comment) => (
          <article key={comment.body} className={styles.commentRow}>
            <strong>{comment.author}</strong>
            <p>{comment.body}</p>
            <span>{comment.meta}</span>
            <button type="button">Report</button>
          </article>
        ))}
      </section>
      <section className={styles.replyComposer} aria-label="Reply composer">
        <label htmlFor="prototype-reply">Reply</label>
        <textarea
          id="prototype-reply"
          placeholder="Add a useful reply..."
          rows={3}
          readOnly
        />
        <p>No passenger private information, exact crew hotel exposure, or live ops-sensitive content.</p>
        <button type="button">Reply</button>
      </section>
    </PhoneFrame>
  );
}

function ReportFlowScreen() {
  return (
    <PhoneFrame title="Report Flow Preview" activeNav="Hubs">
      <AppHeader eyebrow="Safety flow" />
      <ScreenHeader
        label="Report"
        title="Report a thread"
        body="Secondary safety action for review. Prototype only."
      />
      <section className={styles.reportCard}>
        <label htmlFor="prototype-reason">Reason</label>
        <select id="prototype-reason" defaultValue="unsafe_info">
          <option value="spam">Spam</option>
          <option value="harassment">Harassment</option>
          <option value="unsafe_info">Unsafe information</option>
          <option value="privacy">Privacy</option>
          <option value="off_topic">Off topic</option>
          <option value="other">Other</option>
        </select>
        <label htmlFor="prototype-details">Optional details</label>
        <textarea
          id="prototype-details"
          placeholder="Add context for review..."
          rows={4}
          readOnly
        />
        <button type="button">Submit report</button>
        <p className={styles.formHint}>
          Prototype form state only. Confirmation should appear as a separate
          state during implementation review.
        </p>
      </section>
    </PhoneFrame>
  );
}

export default async function DfwHubWireframesPage() {
  const env = getSupabaseBrowserEnv();

  if (!env.enabled) {
    return (
      <AuthCard
        eyebrow="Design Prototype"
        title="DFW Hub wireframes need Supabase auth"
        description="This admin-only design prototype uses the same Supabase auth configuration as the private app."
        error="Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to exercise runtime admin gating."
      >
        <p className={authStyles.hint}>
          The prototype itself is static. Auth configuration is only needed to
          verify the protected admin route behavior at runtime.
        </p>
      </AuthCard>
    );
  }

  const appContext = await getCurrentAppAccessContext();
  const gate = getPrivateAppGateResult({
    routeKind: "private-child",
    nextPath: DESIGN_WIREFRAME_ROUTE,
    context: appContext,
  });

  await recordSecurityEvent({
    userId: appContext.user?.id,
    eventType: getPrivateAccessEventType(gate),
    route: DESIGN_WIREFRAME_ROUTE,
    result: getPrivateRouteAuditResult(gate, appContext),
    metadata: {
      route_kind: "private-child",
      section: "admin-design-dfw-hub-wireframes",
      access_source: getPrivateAccessSource(gate),
      ...(getPrivateAccessSource(gate) === "operator_internal"
        ? { operator_private_app_access: true }
        : {}),
    },
  });

  if (gate.kind === "redirect") {
    redirect(gate.path);
  }

  const reviewerContext =
    await getCurrentVerificationReviewerAuthorizationContext();
  const operatorContext = await getCurrentOperatorAccess();
  const navigation = buildAdminNavigation({
    reviewerAuthorized: reviewerContext.reviewerAuthorized,
    operatorScopes: operatorContext.scopes,
  });

  if (!reviewerContext.reviewerAuthorized && !operatorContext.operatorGranted) {
    await recordSecurityEvent({
      userId: appContext.user?.id,
      eventType: "operator_audit.unauthorized_attempt",
      route: DESIGN_WIREFRAME_ROUTE,
      result: "denied",
      metadata: {
        reason_code: "missing_admin_authorization",
        required_authorization: "reviewer_scope_or_operator_grant",
      },
    });
    redirect(AUTH_ROUTES.accessRestricted);
  }

  return (
    <AdminShell
      eyebrow="Design Prototype"
      title="DFW Hub mobile wireframes"
      description="Static, fake-data-only mobile wireframe prototype for reviewing the approved post-pivot DFW Hub direction inside the admin environment."
      currentPath={DESIGN_WIREFRAME_ROUTE}
      navigation={navigation}
      error={operatorContext.loadError ?? undefined}
      message="This protected prototype does not load live content, call content RPCs, or mutate runtime data."
      footer={
        <p className={authStyles.hint}>
          T23B is a review surface only. It does not implement real Channels,
          live search, saves, reactions, media, weather, traffic, or migrations.
        </p>
      }
    >
      <div className={styles.prototypeShell}>
        <section className={styles.prototypeIntro} aria-labelledby="prototype-title">
          <div>
            <p className={styles.prototypeLabel}>FBMVP-T23B</p>
            <h2 id="prototype-title">Protected static Hub prototype</h2>
            <p>
              Six static mobile screens translate the approved T23A direction
              into a reviewable in-app prototype. All content below is fake
              placeholder content for design review.
            </p>
          </div>
          <ul aria-label="Prototype screen index">
            {prototypeScreens.map((screen) => (
              <li key={screen}>{screen}</li>
            ))}
          </ul>
        </section>

        <div className={styles.screenGrid}>
          <HomeScreen />
          <HubOverviewScreen />
          <ChannelsScreen />
          <ChannelDetailScreen />
          <ThreadDetailScreen />
          <ReportFlowScreen />
        </div>
      </div>
    </AdminShell>
  );
}
