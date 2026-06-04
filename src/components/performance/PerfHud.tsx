"use client";

import { useMemo, useState, useSyncExternalStore, type CSSProperties } from "react";

import {
  exportWebglPerfRecording,
  getWebglPerfSnapshot,
  getWebglPerfSummary,
  setWebglPerfDebugFlag,
  startWebglPerfRecording,
  stopWebglPerfRecording,
  subscribeWebglPerfMonitor,
} from "@/src/lib/performance/webglPerfMonitor";
import { PERF_BUDGETS } from "@/src/lib/performance/perfBudgets";

type PerfHudProps = {
  enabled: boolean;
};

type MetricTone = "good" | "warn" | "bad" | "neutral";

const toneColors: Record<MetricTone, string> = {
  good: "#8effc2",
  warn: "#ffd68a",
  bad: "#ff8c8c",
  neutral: "#dcefff",
};

export function PerfHud({ enabled }: PerfHudProps) {
  const snapshot = useSyncExternalStore(subscribeWebglPerfMonitor, getWebglPerfSnapshot, getWebglPerfSnapshot);
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const warnings = useMemo(() => snapshot.warnings, [snapshot.warnings]);
  const isMobileTier = snapshot.qualityTier === "mobile";
  const fpsTone: MetricTone =
    snapshot.fpsAvg < PERF_BUDGETS.minMobileFps ? "bad" : snapshot.fpsAvg < PERF_BUDGETS.minMobileFps + 12 ? "warn" : "good";
  const frameMsTone: MetricTone =
    snapshot.frameMs >= PERF_BUDGETS.badFrameMs ? "bad" : snapshot.frameMs >= PERF_BUDGETS.warnFrameMs ? "warn" : "good";
  const avgFrameMsTone: MetricTone =
    snapshot.frameMsAvg >= PERF_BUDGETS.badFrameMs ? "bad" : snapshot.frameMsAvg >= PERF_BUDGETS.warnFrameMs ? "warn" : "good";
  const worstFrameTone: MetricTone =
    snapshot.worstFrameMs >= PERF_BUDGETS.badFrameMs ? "bad" : snapshot.worstFrameMs >= PERF_BUDGETS.warnFrameMs ? "warn" : "good";
  const rendererCountTone: MetricTone = snapshot.rendererCount > PERF_BUDGETS.maxRendererCount ? "bad" : "good";
  const canvasCountTone: MetricTone = snapshot.canvasCount > PERF_BUDGETS.maxCanvasCount ? "bad" : "good";
  const dprTone: MetricTone = !isMobileTier
    ? "neutral"
    : snapshot.devicePixelRatio > PERF_BUDGETS.maxMobileDpr
      ? "bad"
      : snapshot.devicePixelRatio > PERF_BUDGETS.warnMobileDpr
        ? "warn"
        : "good";
  const drawCallsTone: MetricTone = !isMobileTier
    ? "neutral"
    : snapshot.drawCalls > PERF_BUDGETS.maxDrawCallsMobile
      ? "bad"
      : snapshot.drawCalls > PERF_BUDGETS.maxDrawCallsMobile * 0.8
        ? "warn"
        : "good";
  const trianglesTone: MetricTone = !isMobileTier
    ? "neutral"
    : snapshot.triangles > PERF_BUDGETS.maxTrianglesMobile
      ? "bad"
      : snapshot.triangles > PERF_BUDGETS.maxTrianglesMobile * 0.8
        ? "warn"
        : "good";
  const texturesTone: MetricTone = !isMobileTier
    ? "neutral"
    : snapshot.textures > PERF_BUDGETS.maxTexturesMobile
      ? "bad"
      : snapshot.textures > PERF_BUDGETS.maxTexturesMobile * 0.8
        ? "warn"
        : "good";
  const loopTone: MetricTone =
    snapshot.renderLoopActive && snapshot.scrollPhase === "idle" ? "bad" : snapshot.renderLoopPaused ? "neutral" : "good";
  const postTone: MetricTone =
    snapshot.postprocessingEnabled && snapshot.scrollPhase === "idle" ? "warn" : snapshot.postprocessingEnabled ? "good" : "neutral";

  if (!enabled) {
    return null;
  }

  const toggleFlag = (flag: keyof typeof snapshot.debugFlags) => {
    const current = snapshot.debugFlags[flag];
    if (typeof current === "boolean") {
      setWebglPerfDebugFlag(flag, !current);
    }
  };

  const forceManualRender = () => {
    setWebglPerfDebugFlag("manualRenderNonce", Date.now());
  };

  const copySummary = async () => {
    const payload = JSON.stringify(getWebglPerfSummary(), null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  const downloadRecording = () => {
    const payload = exportWebglPerfRecording();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `jmpseat-perf-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const cardStyle: CSSProperties = {
    position: "fixed",
    left: 10,
    bottom: 10,
    zIndex: 99999,
    width: expanded ? "min(360px, calc(100vw - 20px))" : 144,
    maxHeight: expanded ? "70vh" : "unset",
    overflow: expanded ? "auto" : "hidden",
    background: "rgba(2, 7, 18, 0.86)",
    color: "#dcefff",
    border: "1px solid rgba(56,189,248,0.35)",
    borderRadius: 10,
    boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 11,
    lineHeight: 1.3,
    pointerEvents: "auto",
    touchAction: "pan-y",
  };

  const sectionTitleStyle: CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: "#7fd8ff",
    marginBottom: 4,
  };

  const metricRow = (label: string, value: string | number, tone: MetricTone = "neutral") => (
    <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
      <span style={{ opacity: 0.75 }}>{label}</span>
      <span style={{ color: toneColors[tone] }}>{value}</span>
    </div>
  );

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderBottom: "1px solid rgba(127,216,255,0.22)" }}>
        <strong style={{ fontSize: 12 }}>jmpseat Perf HUD</strong>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          style={{ background: "transparent", border: "1px solid rgba(127,216,255,0.35)", borderRadius: 6, color: "#dcefff", padding: "2px 6px", cursor: "pointer" }}
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
      </div>

      {expanded ? (
        <div style={{ padding: 10, display: "grid", gap: 10 }}>
          <section>
            <div style={sectionTitleStyle}>Frame Health</div>
            {metricRow("FPS", snapshot.fps.toFixed(1), fpsTone)}
            {metricRow("FPS avg", snapshot.fpsAvg.toFixed(1), fpsTone)}
            {metricRow("Frame ms", snapshot.frameMs.toFixed(2), frameMsTone)}
            {metricRow("Frame ms avg", snapshot.frameMsAvg.toFixed(2), avgFrameMsTone)}
            {metricRow("Worst frame", `${snapshot.worstFrameMs.toFixed(2)} ms`, worstFrameTone)}
            {metricRow("Long frames", snapshot.longFrameCount, snapshot.longFrameCount > 0 ? "warn" : "good")}
            {metricRow("Loop", snapshot.renderLoopPaused ? "paused" : snapshot.renderLoopActive ? "active" : "idle", loopTone)}
          </section>

          <section>
            <div style={sectionTitleStyle}>Renderer</div>
            {metricRow("Renderer count", snapshot.rendererCount, rendererCountTone)}
            {metricRow("Canvas count", snapshot.canvasCount, canvasCountTone)}
            {metricRow("Device DPR", snapshot.devicePixelRatio.toFixed(2), dprTone)}
            {metricRow("Renderer DPR", snapshot.rendererPixelRatio.toFixed(2))}
            {metricRow("Canvas CSS", `${snapshot.canvasCssWidth}x${snapshot.canvasCssHeight}`)}
            {metricRow("Buffer", `${snapshot.drawingBufferWidth}x${snapshot.drawingBufferHeight}`)}
            {metricRow(
              "Pixels",
              snapshot.estimatedRenderedPixels.toLocaleString(),
              snapshot.estimatedRenderedPixels > 8_000_000 ? "bad" : snapshot.estimatedRenderedPixels > 5_000_000 ? "warn" : "good",
            )}
            {metricRow("Quality", snapshot.qualityTier)}
            {metricRow("Post scale", snapshot.postprocessingScale.toFixed(2))}
          </section>

          <section>
            <div style={sectionTitleStyle}>Three Stats</div>
            {metricRow("Draw calls", snapshot.drawCalls, drawCallsTone)}
            {metricRow("Triangles", snapshot.triangles.toLocaleString(), trianglesTone)}
            {metricRow("Points", snapshot.points.toLocaleString())}
            {metricRow("Lines", snapshot.lines.toLocaleString())}
            {metricRow("Geometries", snapshot.geometries)}
            {metricRow("Textures", snapshot.textures, texturesTone)}
            {metricRow("Programs", snapshot.shaderPrograms)}
          </section>

          <section>
            <div style={sectionTitleStyle}>Scene State</div>
            {metricRow("Scroll phase", snapshot.scrollPhase)}
            {metricRow("Scroll progress", snapshot.scrollProgress.toFixed(3))}
            {metricRow("Globe visible", snapshot.globeVisible ? "on" : "off")}
            {metricRow("Globe rotating", snapshot.globeRotating ? "on" : "off")}
            {metricRow("Routes", snapshot.globeRoutesEnabled ? "on" : "off")}
            {metricRow("City lights", snapshot.globeCityLightsEnabled ? "on" : "off")}
            {metricRow("Atmosphere", snapshot.globeAtmosphereEnabled ? "on" : "off")}
            {metricRow("Stars", snapshot.starfieldEnabled ? "on" : "off")}
            {metricRow("Haze", snapshot.hazeEnabled ? "on" : "off")}
            {metricRow("Grid", snapshot.gridEnabled ? "on" : "off")}
            {metricRow("Page visibility", snapshot.pageVisible ? "visible" : "hidden")}
            {metricRow("Scene onscreen", snapshot.sceneOnscreen ? "yes" : "no")}
          </section>

          <section>
            <div style={sectionTitleStyle}>Postprocessing</div>
            {metricRow("Post", snapshot.postprocessingEnabled ? "on" : "off", postTone)}
            {metricRow("Bloom", snapshot.bloomEnabled ? "on" : "off")}
            {metricRow("Frost", snapshot.frostEnabled ? "on" : "off")}
            {metricRow("Chromatic", snapshot.chromaticEnabled ? "on" : "off")}
            <div style={{ marginTop: 2, opacity: 0.8 }}>
              Passes: {snapshot.activePostprocessingPasses.length > 0 ? snapshot.activePostprocessingPasses.join(", ") : "none"}
            </div>
          </section>

          <section>
            <div style={sectionTitleStyle}>Debug Toggles</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <button type="button" onClick={() => toggleFlag("pauseRenderLoop")}>Pause Loop</button>
              <button type="button" onClick={forceManualRender}>Manual Render</button>
              <button type="button" onClick={() => toggleFlag("postprocessing")}>Post</button>
              <button type="button" onClick={() => toggleFlag("bloom")}>Bloom</button>
              <button type="button" onClick={() => toggleFlag("frost")}>Frost</button>
              <button type="button" onClick={() => toggleFlag("chromatic")}>Chromatic</button>
              <button type="button" onClick={() => toggleFlag("starfield")}>Stars</button>
              <button type="button" onClick={() => toggleFlag("haze")}>Haze</button>
              <button type="button" onClick={() => toggleFlag("grid")}>Grid</button>
              <button type="button" onClick={() => toggleFlag("globeAtmosphere")}>Atmosphere</button>
              <button type="button" onClick={() => toggleFlag("globeRoutes")}>Routes</button>
              <button type="button" onClick={() => toggleFlag("globeCities")}>Cities</button>
              <button type="button" onClick={() => toggleFlag("globeRotation")}>Rotation</button>
              <button type="button" onClick={() => toggleFlag("globeVisible")}>Hide Globe</button>
              <button type="button" onClick={() => toggleFlag("forceMobileQuality")}>Force Mobile</button>
              <button type="button" onClick={() => toggleFlag("forceDesktopQuality")}>Force Desktop</button>
              <button type="button" onClick={() => toggleFlag("showWarnings")}>Warnings</button>
            </div>
          </section>

          <section>
            <div style={sectionTitleStyle}>Recording</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button type="button" onClick={startWebglPerfRecording}>Start</button>
              <button type="button" onClick={stopWebglPerfRecording}>Stop</button>
              <button type="button" onClick={copySummary}>Copy Summary</button>
              <button type="button" onClick={downloadRecording}>Download JSON</button>
            </div>
            <div style={{ marginTop: 4, opacity: 0.8 }}>
              {snapshot.recording ? "Recording..." : "Idle"} ({snapshot.recordingSamples} samples)
            </div>
            {copied ? <div style={{ color: "#8effc2" }}>Summary copied</div> : null}
          </section>

          {snapshot.debugFlags.showWarnings ? (
            <section>
              <div style={sectionTitleStyle}>Warnings</div>
              {warnings.length === 0 ? <div style={{ color: "#8effc2" }}>No warnings</div> : null}
              {warnings.map((warning) => (
                <div
                  key={warning}
                  style={{ color: /exceed|below|active while idle|Large drawing buffer load|remount/i.test(warning) ? "#ff8c8c" : "#ffd68a" }}
                >
                  {warning}
                </div>
              ))}
            </section>
          ) : null}
        </div>
      ) : (
        <div style={{ padding: "6px 10px" }}>
          <div>FPS {snapshot.fps.toFixed(1)}</div>
          <div>{snapshot.frameMs.toFixed(1)}ms</div>
        </div>
      )}
    </div>
  );
}
