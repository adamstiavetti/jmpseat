export const PERF_BUDGETS = {
  maxRendererCount: 1,
  maxCanvasCount: 1,
  maxMobileDpr: 1.35,
  warnMobileDpr: 1.25,
  minMobileFps: 30,
  warnFrameMs: 33,
  badFrameMs: 50,
  maxIdleRenderMsAfterScroll: 500,
  maxDrawCallsMobile: 900,
  maxTexturesMobile: 36,
  maxTrianglesMobile: 700_000,
} as const;

export type PerfBudgets = typeof PERF_BUDGETS;
