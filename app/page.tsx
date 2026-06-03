const waitlistFormUrl = process.env.NEXT_PUBLIC_WAITLIST_FORM_URL?.trim();

const problemCards = [
  {
    icon: "CH",
    title: "Scattered across group chats",
    copy: "Important info gets buried, lost, or disappears when chats do.",
  },
  {
    icon: "FB",
    title: "Buried in Facebook groups",
    copy: "Search is messy and answers are hit or miss.",
  },
  {
    icon: "RD",
    title: "Reddit threads aren't built for us",
    copy: "Great sometimes, but not private, verified, or crew-first.",
  },
  {
    icon: "WM",
    title: "Word of mouth isn't scalable",
    copy: "Reps change, details fade, and new crews miss out.",
  },
];

const featureCards = [
  {
    title: "Base Boards",
    label: "ATL",
    meta: "Hartsfield-Jackson",
    tag: "Active",
    copy: "Base-specific intel, updates, bid info, and crew-to-crew knowledge.",
    featured: true,
    details: ["Reserve life", "Parking notes", "Commute tips"],
  },
  {
    title: "Layover Boards",
    label: "LAX",
    meta: "Los Angeles",
    tag: "Crew intel",
    copy: "Layover tips, transportation, local recommendations, and crew-reviewed city intel.",
    featured: true,
    details: ["Crew food", "Transportation", "Focus and local intel"],
  },
  {
    title: "Crew Rooms",
    label: "842",
    meta: "Active threads",
    copy: "Topic-based rooms for real conversations with fellow crew.",
    details: ["Widebody", "Regional", "New hires"],
  },
  {
    title: "Jumpseat Brief",
    label: "JFK",
    meta: "AI-assisted",
    copy: "AI-assisted layover planning and crew-life reminders, grounded in community knowledge.",
    details: ["Weather", "Food", "Transit"],
  },
  {
    title: "Ready Room",
    label: "PRO",
    meta: "Career utility",
    copy: "Career, interview, new-hire, and professional guidance for aviation workers.",
    details: ["Interview prep", "Travel alerts", "Ops notes"],
  },
  {
    title: "NonRev Deals",
    label: "MCO > LAS",
    meta: "Perks layer",
    copy: "Crew-friendly perks and discounts as a supporting layer, not the core wedge.",
    details: ["Hotel", "Food", "Local perks"],
  },
];

const verifiedItems = [
  {
    title: "Right people",
    copy: "Verification keeps the community limited to aviation workers.",
  },
  {
    title: "Better info",
    copy: "Crew-shared intel from people who are actually there.",
  },
  {
    title: "Safe conversations",
    copy: "Private by design so you can speak honestly without worry.",
  },
  {
    title: "Accountable community",
    copy: "Clear standards and reporting keep things respectful and useful.",
  },
];

const boundaryItems = [
  "No airline portal login",
  "No schedule scraping",
  "No public crew tracking",
  "No exact crew hotel exposure",
  "No badge uploads on the waitlist",
];

export default function Home() {
  return (
    <main className="page-shell">
      <div className="airport-grid" aria-hidden="true" />
      <div className="page-frame">
        <header className="site-header" aria-label="Primary navigation">
          <a className="brand" href="#top" aria-label="Deadhead Club home">
            <span className="brand-wings" aria-hidden="true">
              DC
            </span>
            <span>
              <span className="brand-name">Deadhead Club</span>
              <span className="brand-kicker">Working name</span>
            </span>
          </a>
          <nav className="nav-links" aria-label="Landing page sections">
            <a href="#features">Features</a>
            <a href="#verified">Why Verified</a>
            <a href="#waitlist">Waitlist</a>
            <a href="#faq">FAQ</a>
          </nav>
          <span className="crew-badge">
            <span aria-hidden="true" />
            For verified aviation workers
          </span>
        </header>

        <section id="top" className="hero" aria-labelledby="hero-title">
          <div className="hero-skyline" aria-hidden="true">
            <span className="tower" />
            <span className="runway-light runway-light-one" />
            <span className="runway-light runway-light-two" />
            <span className="runway-light runway-light-three" />
          </div>
          <div className="route-map" aria-hidden="true">
            <span className="airport-code code-dal">DAL {"->"} LAX</span>
            <span className="airport-code code-ord">ORD C17</span>
            <span className="airport-code code-jfk">JFK T5</span>
          </div>

          <div className="hero-copy">
            <p className="terminal-label">TERMINAL DHC / GATE M1A / NOW BOARDING</p>
            <h1 id="hero-title">The off-duty network for airline people.</h1>
            <p className="hero-subtitle">
              Base intel, layover knowledge, and honest crew talk — built for
              verified aviation workers.
            </p>
            <div className="hero-actions" aria-label="Primary calls to action">
              <a className="button button-primary" href="#waitlist">
                <span aria-hidden="true">{"->"}</span>
                Join the Waitlist
              </a>
              <a className="button button-secondary" href="#features">
                <span aria-hidden="true">▷</span>
                See the Vision
              </a>
            </div>
            <div className="route-strip" aria-label="Example route accents">
              <span>DAL {"->"} LAX</span>
              <span>ORD</span>
              <span>JFK</span>
              <span>CREW MODE</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="Deadhead Club preview">
            <article className="app-preview" aria-label="Mock Deadhead Club app preview">
              <div className="preview-header">
                <div>
                  <h2>Welcome back, Crew.</h2>
                  <p>What&apos;s active now</p>
                </div>
                <div className="preview-actions" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className="metric-grid">
                <div>
                  <span className="metric-value">28</span>
                  <span className="metric-label">Bases</span>
                </div>
                <div>
                  <span className="metric-value">117</span>
                  <span className="metric-label">Layovers</span>
                </div>
                <div>
                  <span className="metric-value">842</span>
                  <span className="metric-label">Crew Rooms</span>
                </div>
              </div>
              <div className="activity-board">
                <p>Recent activity</p>
                <span>
                  <strong>LAX Layover Board</strong>
                  <small>New PHL crew hotels and shuttle update</small>
                </span>
                <span>
                  <strong>DFW Base Board</strong>
                  <small>Feb bid pack notes and ODL updates</small>
                </span>
                <span>
                  <strong>Crew Room - Widebody</strong>
                  <small>Thread: Jumpseat etiquette worldwide</small>
                </span>
              </div>
            </article>

            <article className="boarding-pass" aria-label="Boarding pass style preview card">
              <div className="boarding-pass-header">
                <span>DEADHEAD CLUB</span>
                <small>BOARDING PASS</small>
              </div>
              <dl>
                <div>
                  <dt>BASE</dt>
                  <dd>YOU</dd>
                </div>
                <div>
                  <dt>NEXT</dt>
                  <dd>LAYOVER</dd>
                </div>
                <div>
                  <dt>PRIORITY</dt>
                  <dd>CREW</dd>
                </div>
                <div>
                  <dt>BOARDING</dt>
                  <dd>ANYTIME</dd>
                </div>
              </dl>
              <div className="barcode" aria-hidden="true" />
            </article>
          </div>
        </section>

        <section className="trust-strip" aria-labelledby="trust-title">
          <span className="trust-icon" aria-hidden="true" />
          <div>
            <h2 id="trust-title">Verified privately. Anonymous publicly. Accountable internally.</h2>
            <p>No airline portal login. No schedule scraping. No public nearby crew tracking.</p>
          </div>
          <span className="lock-icon" aria-hidden="true" />
        </section>

        <section className="section-block" aria-labelledby="problem-title">
          <div className="section-heading">
            <h2 id="problem-title">Why crews need this</h2>
          </div>
          <div className="problem-grid">
            {problemCards.map((card) => (
              <article className="problem-card" key={card.title}>
                <span className="card-icon" aria-hidden="true">
                  {card.icon}
                </span>
                <h3>{card.title}</h3>
                <p>{card.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="features" className="section-block" aria-labelledby="features-title">
          <div className="section-heading">
            <h2 id="features-title">What you&apos;ll find inside Deadhead Club</h2>
          </div>
          <div className="feature-grid">
            {featureCards.map((feature) => (
              <article
                className={feature.featured ? "feature-card feature-card-featured" : "feature-card"}
                key={feature.title}
              >
                <div className="feature-topline">
                  <h3>{feature.title}</h3>
                  {feature.tag ? <span>{feature.tag}</span> : null}
                </div>
                <div className="feature-display" aria-hidden="true">
                  <strong>{feature.label}</strong>
                  <small>{feature.meta}</small>
                  <div className="display-lines">
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
                <ul>
                  {feature.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
                <p>{feature.copy}</p>
                <span className="card-arrow" aria-hidden="true">
                  {"->"}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section id="verified" className="verified-section" aria-labelledby="verified-title">
          <div className="verified-intro">
            <span className="shield-mark" aria-hidden="true" />
            <div>
              <h2 id="verified-title">Why verified matters</h2>
              <p>
                Deadhead Club is built for airline people, by people who get it.
                Verification keeps our community helpful, relevant, and safe —
                so you can talk freely and trust the info you see.
              </p>
            </div>
          </div>
          <div className="verified-grid">
            {verifiedItems.map((item) => (
              <article key={item.title}>
                <span aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="lower-grid" aria-label="Privacy and waitlist">
          <div className="privacy-panel" aria-labelledby="boundaries-title">
            <div className="privacy-runway" aria-hidden="true">
              <span />
            </div>
            <h2 id="boundaries-title">Built with privacy boundaries</h2>
            <ul className="boundary-list" aria-label="Privacy boundaries">
              {boundaryItems.map((item) => (
                <li key={item}>
                  <span aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <section id="waitlist" className="waitlist-panel" aria-labelledby="waitlist-title">
            <div className="ticket-stub" aria-hidden="true">
              <p>Your next stop:</p>
              <strong>Better crew mode</strong>
              <span className="mini-barcode" />
            </div>
            <div className="waitlist-card">
              <p className="terminal-label">BOARDING GROUP / PRIVATE BETA</p>
              <h2 id="waitlist-title">Your next stop: better crew mode</h2>
              <p>Join the private beta waitlist and be first in.</p>
              <div className="mock-fields" aria-hidden="true">
                <span>Email address</span>
                <span>Role</span>
                <span>Base / Airport</span>
              </div>
              {waitlistFormUrl ? (
                <a className="button button-primary" href={waitlistFormUrl}>
                  Join the Private Beta Waitlist
                  <span aria-hidden="true">{"->"}</span>
                </a>
              ) : (
                <p className="waitlist-fallback" role="status">
                  Waitlist form coming soon.
                </p>
              )}
            </div>
          </section>
        </section>

        <section className="ambassador-card" aria-labelledby="ambassador-title">
          <span className="ambassador-icon" aria-hidden="true" />
          <div>
            <h2 id="ambassador-title">Help seed the first base community.</h2>
            <p>Ambassadors get early access and help shape what Deadhead Club becomes.</p>
          </div>
          <a href="#waitlist">Learn more about the Ambassador Program {"->"}</a>
        </section>

        <section id="faq" className="faq-section" aria-labelledby="faq-title">
          <div className="section-heading">
            <h2 id="faq-title">Before boarding</h2>
          </div>
          <div className="faq-grid">
            <article>
              <h3>Is this an airline product?</h3>
              <p>No. Deadhead Club is not affiliated with or endorsed by any airline, airport, union, or employer.</p>
            </article>
            <article>
              <h3>Can I upload my badge here?</h3>
              <p>No. The public waitlist does not collect badge uploads, IDs, schedules, portal credentials, exact hotel details, or passenger information.</p>
            </article>
          </div>
        </section>

        <footer className="site-footer">
          <p>
            Not affiliated with or endorsed by any airline, airport, union, or employer.
            Working name pending legal/trademark clearance.
          </p>
          <p>© 2026 Deadhead Club (Working Name). All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
