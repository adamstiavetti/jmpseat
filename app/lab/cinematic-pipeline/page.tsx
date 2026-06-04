import styles from "./page.module.css";

const cameraNotes = [
  "Mobile lock: vertical frame, globe dominant in upper half, scanner under globe, ticket projecting toward viewer.",
  "Desktop lock: wide cinematic frame, globe centered above scanner, ticket spreads across foreground with CTA at front center.",
  "Previs required: validate silhouette, scale, lighting, and object contact before final Three.js/R3F animation work.",
];

const assetNeeds = [
  "Globe shader with dark Earth, city lights, and restrained atmosphere shell",
  "Scanner/printer GLB with slot geometry, bevels, internal light, and contact shadows",
  "Small aircraft GLB plus guide curves for thin flight arcs",
  "Ticket geometry or DOM overlay aligned to scanner slot with integrated ENTER CTA",
];

const loaderPlaceholders = [
  "/cinematic/models/jmpseat-scanner-printer.glb",
  "/cinematic/models/jmpseat-ticket-plane.glb",
  "/cinematic/models/jmpseat-aircraft.glb",
  "/cinematic/models/jmpseat-globe-helpers.glb",
  "/cinematic/models/jmpseat-route-guides.glb",
];

export default function CinematicPipelinePage() {
  return <CinematicHeroLab />;
}

function CinematicHeroLab() {
  return (
    <main className={styles.page} aria-labelledby="lab-title">
      <section className={styles.heroLab}>
        <SceneRoot />
        <CameraNotesPanel />
      </section>
    </main>
  );
}

function SceneRoot() {
  return (
    <div className={styles.sceneRoot} aria-label="Cinematic hero pipeline scaffold">
      <div className={styles.canvasFrame} aria-hidden="true">
        <div className={styles.environmentGrid} />
        <GlobePlaceholder />
        <RoutePlaceholder />
        <AircraftPlaceholder />
        <ScannerPlaceholder />
        <TicketOverlay />
      </div>
    </div>
  );
}

function GlobePlaceholder() {
  // TODO(R3F): Replace this CSS placeholder with GlobeSystem shader layers and optional globe helper GLB fallback.
  return (
    <div className={styles.globeSystem}>
      <div className={styles.globeShell}>
        <span className={styles.globeSurface} />
        <span className={styles.cityLightLayer} />
        <span className={styles.atmosphereShell} />
      </div>
      <span className={styles.systemLabel}>GlobeSystem placeholder</span>
    </div>
  );
}

function RoutePlaceholder() {
  // TODO(R3F): Use thin native curves, optionally seeded by /cinematic/models/jmpseat-route-guides.glb.
  return (
    <svg className={styles.routeSystem} viewBox="0 0 1000 620" role="img" aria-label="RouteSystem placeholder arcs">
      <path d="M154 316 C288 118 680 106 846 272" />
      <path d="M184 412 C370 542 672 522 838 350" />
      <path d="M286 208 C476 360 608 404 746 488" />
      <text x="500" y="82" textAnchor="middle">
        RouteSystem placeholder
      </text>
    </svg>
  );
}

function AircraftPlaceholder() {
  // TODO(R3F): Load /cinematic/models/jmpseat-aircraft.glb behind a safe missing-asset fallback.
  return (
    <div className={styles.aircraftSystem} aria-label="AircraftSystem placeholder markers">
      <span className={`${styles.aircraftMarker} ${styles.aircraftOne}`}>AircraftSystem</span>
      <span className={`${styles.aircraftMarker} ${styles.aircraftTwo}`}>GLB</span>
      <span className={`${styles.aircraftMarker} ${styles.aircraftThree}`}>Scale test</span>
    </div>
  );
}

function ScannerPlaceholder() {
  // TODO(R3F): Load /cinematic/models/jmpseat-scanner-printer.glb behind a safe missing-asset fallback.
  return (
    <div className={styles.scannerSystem}>
      <div className={styles.scannerBody}>
        <span className={styles.scannerSlot} />
        <span className={styles.scanLightLeft} />
        <span className={styles.scanLightRight} />
      </div>
      <span className={styles.systemLabel}>ScannerSystem GLB placeholder</span>
    </div>
  );
}

function TicketOverlay() {
  // TODO(R3F): Align DOM ticket text/CTA with /cinematic/models/jmpseat-ticket-plane.glb or scene geometry.
  return (
    <article className={styles.ticketSystem} aria-label="TicketSystem placeholder with integrated ENTER CTA">
      <div className={styles.ticketTopRow}>
        <span>
          <small>Passenger</small>
          Aviation Worker
        </span>
        <span>
          <small>Date</small>
          24 May 2026
        </span>
        <span>
          <small>Flight</small>
          AWC-2026
        </span>
      </div>
      <div className={styles.ticketRoute}>
        <strong>JFK</strong>
        <span>to</span>
        <strong>CDG</strong>
      </div>
      <button className={styles.enterButton} type="button">
        Enter
      </button>
      <span className={styles.systemLabel}>TicketSystem overlay placeholder</span>
    </article>
  );
}

function CameraNotesPanel() {
  return (
    <aside className={styles.notesPanel} aria-labelledby="lab-title">
      <p className={styles.kicker}>Cinematic pipeline lab</p>
      <h1 id="lab-title">jmpseat hero composition scaffold</h1>
      <p>
        This route is intentionally a foundation layer. It exposes the component boundaries for the
        future asset-driven Three.js/R3F scene without pretending the placeholders are final art.
      </p>

      <h2>Camera notes</h2>
      <ul>
        {cameraNotes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>

      <h2>Assets required next</h2>
      <ul>
        {assetNeeds.map((asset) => (
          <li key={asset}>{asset}</li>
        ))}
      </ul>

      <h2>Loader placeholders</h2>
      <ul>
        {loaderPlaceholders.map((path) => (
          <li key={path}>{path}</li>
        ))}
      </ul>
    </aside>
  );
}
