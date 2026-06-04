import styles from "./page.module.css";

export default function BoardingPortalEntryPage() {
  return (
    <main className={styles.page} aria-label="jmpseat boarding portal entry atmosphere lab">
      <CinematicAtmosphere />
    </main>
  );
}

function CinematicAtmosphere() {
  return (
    <div className={styles.stage} aria-hidden="true">
      <BackgroundPlate />
      <WakeLayer />
      <VignetteLayer />
    </div>
  );
}

function BackgroundPlate() {
  return <div className={styles.backgroundPlate} />;
}

function WakeLayer() {
  return <div className={styles.wakeLayer} />;
}

function VignetteLayer() {
  return <div className={styles.vignetteLayer} />;
}
