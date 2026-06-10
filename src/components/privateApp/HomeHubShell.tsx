import Link from "next/link";

import styles from "./homeHubShell.module.css";

type HomeHubShellProps = {
  homeBaseCode?: string | null;
  homeBaseName?: string | null;
  homeBaseLoadError?: boolean;
};

type DashboardItem = {
  title: string;
  detail: string;
  meta: string;
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

const dfwHubSections: readonly DashboardItem[] = [
  {
    title: "Baseboard",
    detail: "DFW-based community questions, updates, and practical base knowledge.",
    meta: "Primary hub surface",
  },
  {
    title: "Layovers",
    detail: "Passing-through utility for food, transport, coffee, gyms, and area tips.",
    meta: "Seed content later",
  },
  {
    title: "Lounges",
    detail: "Restricted membership spaces managed by scoped Crew Leads.",
    meta: "Membership gated",
  },
  {
    title: "Crew Picks",
    detail: "Saved-driven and admin-curated useful content for the hub.",
    meta: "Access aware later",
  },
];

function SectionHeader({
  eyebrow,
  title,
  detail,
}: {
  eyebrow: string;
  title: string;
  detail: string;
}) {
  return (
    <div className={styles.sectionHeader}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2>{title}</h2>
      <p>{detail}</p>
    </div>
  );
}

function DashboardCard({ item }: { item: DashboardItem }) {
  return (
    <article className={styles.card}>
      <span className={styles.cardMeta}>{item.meta}</span>
      <h3>{item.title}</h3>
      <p>{item.detail}</p>
    </article>
  );
}

function SearchAffordance() {
  return (
    <section className={styles.searchBand} aria-label="Search jmpseat">
      <div>
        <p className={styles.eyebrow}>Search jmpseat</p>
        <h1>Find useful crew intel fast.</h1>
      </div>
      <div className={styles.searchMock} aria-hidden="true">
        Search boards, guides, lounges, and saved intel
      </div>
    </section>
  );
}

function DfwStartedHomeBaseCard() {
  return (
    <section className={styles.section} aria-labelledby="home-base-title">
      <SectionHeader
        eyebrow="Home Base"
        title="DFW Hub"
        detail="Your Home Base preference points to the DFW Hub for personalization. It does not verify employment, airline, role, or lounge eligibility."
      />
      <Link className={styles.primaryCardLink} href="/app/hubs/dfw">
        <span>Open DFW Hub</span>
        <strong>Baseboard, Layovers, Lounges, and Crew Picks</strong>
      </Link>
    </section>
  );
}

function NoHomeBaseCard({ hasLoadError }: { hasLoadError: boolean }) {
  return (
    <section className={styles.section} aria-labelledby="no-home-base-title">
      <SectionHeader
        eyebrow="Home Base"
        title="Welcome to jmpseat"
        detail="No Home Base is a valid initial state. DFW Hub is live first, but skipping does not fake-assign DFW to your profile."
      />
      <div className={styles.splitCards}>
        <article className={styles.card}>
          <span className={styles.cardMeta}>DFW-only launch</span>
          <h3>DFW Hub is live first</h3>
          <p>
            Start with DFW when you want the app to set Home Base to DFW and
            auto-follow the DFW Baseboard.
          </p>
          <button className={styles.disabledButton} type="button" disabled>
            Start with DFW
          </button>
        </article>
        <article className={styles.card}>
          <span className={styles.cardMeta}>No Home Base</span>
          <h3>Skip for now keeps Home Base unset</h3>
          <p>
            You can enter the app without a Home Base. The dashboard uses an
            exploratory state until you choose a base later.
          </p>
          {hasLoadError ? (
            <p className={styles.mutedNote}>
              Home Base lookup is unavailable right now, so jmpseat is showing
              the safe no-Home-Base state.
            </p>
          ) : null}
        </article>
      </div>
    </section>
  );
}

function CrewPicksSection() {
  return (
    <section className={styles.section} aria-labelledby="crew-picks-title">
      <SectionHeader
        eyebrow="Crew Picks"
        title="Useful, not generic trending."
        detail="Crew Picks will be saved-driven and admin-curated until ranking, saves, posts, and moderation exist."
      />
      <div className={styles.cardGrid}>
        {crewPicks.map((item) => (
          <DashboardCard key={item.title} item={item} />
        ))}
      </div>
    </section>
  );
}

function FollowingSection({ hasDfwHomeBase }: { hasDfwHomeBase: boolean }) {
  return (
    <section className={styles.section} aria-labelledby="following-title">
      <SectionHeader
        eyebrow="Following"
        title={hasDfwHomeBase ? "Boards you follow" : "Following starts empty"}
        detail="Following initially means followed boards. It does not grant lounge access or restricted content access."
      />
      <div className={styles.cardGrid}>
        {hasDfwHomeBase ? (
          <DashboardCard
            item={{
              title: "DFW Baseboard",
              detail: "Auto-followed when a user explicitly starts with DFW.",
              meta: "Home Base follow",
            }}
          />
        ) : (
          <DashboardCard
            item={{
              title: "No followed boards yet",
              detail: "Start with DFW or follow boards later when board discovery exists.",
              meta: "Empty state",
            }}
          />
        )}
      </div>
    </section>
  );
}

function LoungesSection() {
  return (
    <section className={styles.section} aria-labelledby="lounges-title">
      <SectionHeader
        eyebrow="Your Lounges"
        title="Restricted spaces stay membership gated."
        detail="Lounges appear here only when membership and request surfaces are implemented. Home Base and follows do not grant access."
      />
      <DashboardCard
        item={{
          title: "No joined Lounges yet",
          detail: "Request and Crew Lead review flows are separate future work.",
          meta: "Access controlled",
        }}
      />
    </section>
  );
}

function SavedSection() {
  return (
    <section className={styles.section} aria-labelledby="saved-title">
      <SectionHeader
        eyebrow="Saved"
        title="Your personal knowledge library."
        detail="Saved posts, guides, and board intel will appear here after saves exist."
      />
      <DashboardCard
        item={{
          title: "No saved items yet",
          detail: "Saved content is future utility state, not an onboarding requirement.",
          meta: "Empty state",
        }}
      />
    </section>
  );
}

export function HomeHubShell({
  homeBaseCode,
  homeBaseName,
  homeBaseLoadError = false,
}: HomeHubShellProps) {
  const normalizedHomeBase = homeBaseCode?.trim().toUpperCase() ?? null;
  const hasDfwHomeBase = normalizedHomeBase === "DFW";

  return (
    <main className={styles.shell}>
      <div className={styles.frame}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.brand}>jmpseat</p>
            <span>Private app utility dashboard shell</span>
          </div>
          <nav className={styles.topnav} aria-label="Private app shell">
            <span>Home</span>
            <span>Boards</span>
            <span>Search</span>
            <span>Saved</span>
            <span>Profile</span>
          </nav>
        </header>

        <SearchAffordance />

        {hasDfwHomeBase ? (
          <DfwStartedHomeBaseCard />
        ) : (
          <NoHomeBaseCard hasLoadError={homeBaseLoadError} />
        )}

        {hasDfwHomeBase && homeBaseName ? (
          <p className={styles.stateNote}>
            Current Home Base preference: {homeBaseName}. This is
            personalization only, not authorization truth.
          </p>
        ) : null}

        <CrewPicksSection />
        <FollowingSection hasDfwHomeBase={hasDfwHomeBase} />
        <LoungesSection />
        <SavedSection />
      </div>
    </main>
  );
}

export function DfwHubReadOnlyShell() {
  return (
    <main className={styles.shell}>
      <div className={styles.frame}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.brand}>jmpseat</p>
            <span>DFW Hub read-only shell</span>
          </div>
          <Link className={styles.secondaryLink} href="/app">
            Back to Home
          </Link>
        </header>

        <section className={styles.hubHero} aria-labelledby="dfw-hub-title">
          <p className={styles.eyebrow}>DFW Hub</p>
          <h1 id="dfw-hub-title">DFW Hub</h1>
          <p>
            A read-only destination shell for the first launch Hub. This page
            shows the intended surfaces without implementing posts, search,
            saves, lounge requests, or Crew Lead tooling.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="hub-surfaces-title">
          <SectionHeader
            eyebrow="Hub surfaces"
            title="Baseboard, Layovers, Lounges, and Crew Picks"
            detail="These labels are product-facing. Access and content behavior remain deferred to later tickets."
          />
          <div className={styles.cardGrid}>
            {dfwHubSections.map((item) => (
              <DashboardCard key={item.title} item={item} />
            ))}
          </div>
        </section>

        <section className={styles.safetyBand} aria-labelledby="hub-safety-title">
          <p className={styles.eyebrow}>Safety boundary</p>
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
