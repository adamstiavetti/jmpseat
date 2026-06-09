import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const rootDir = new URL("../..", import.meta.url).pathname;

async function readSource(filePath: string) {
  return readFile(path.join(rootDir, filePath), "utf8");
}

test("public Vercel Analytics is installed and mounted through the root layout", async () => {
  const packageJson = await readSource("package.json");
  const layoutSource = await readSource("app/layout.tsx");

  assert.match(packageJson, /"@vercel\/analytics"/);
  assert.match(layoutSource, /PublicVercelAnalytics/);
});

test("public Vercel Analytics is explicitly allowlisted to public marketing routes", async () => {
  const analyticsSource = await readSource(
    "src/components/analytics/PublicVercelAnalytics.tsx",
  );

  assert.match(analyticsSource, /"use client"/);
  assert.match(analyticsSource, /import \{ Analytics \} from "@vercel\/analytics\/next"/);
  assert.match(analyticsSource, /usePathname/);
  assert.match(analyticsSource, /PUBLIC_ANALYTICS_HOSTS/);
  assert.match(analyticsSource, /PUBLIC_ANALYTICS_PATHS/);
  assert.match(analyticsSource, /new Set\(\["jmpseat\.com", "www\.jmpseat\.com"\]\)/);
  assert.match(analyticsSource, /new Set\(\["\/", "\/privacy", "\/terms"\]\)/);
  assert.match(analyticsSource, /shouldRenderPublicVercelAnalytics/);
  assert.match(analyticsSource, /return <Analytics \/>/);

  assert.doesNotMatch(analyticsSource, /"beta\.jmpseat\.com"/);
  assert.doesNotMatch(analyticsSource, /"\/login"/);
  assert.doesNotMatch(analyticsSource, /"\/signup"/);
  assert.doesNotMatch(analyticsSource, /"\/reset-password"/);
  assert.doesNotMatch(analyticsSource, /"\/auth"/);
  assert.doesNotMatch(analyticsSource, /"\/app"/);
  assert.doesNotMatch(analyticsSource, /"\/admin"/);
  assert.doesNotMatch(analyticsSource, /"\/lab"/);
});

test("privacy policy discloses public-site analytics without Google Analytics or cookie claims", async () => {
  const privacySource = await readSource("app/privacy/page.tsx");

  assert.match(privacySource, /public-site analytics/i);
  assert.match(privacySource, /Vercel Web Analytics/);
  assert.match(privacySource, /public waitlist, Privacy, and Terms pages/);
  assert.match(
    privacySource,
    /not enabled on private beta, auth, admin,[\s\S]*app, or lab routes/i,
  );
  assert.match(privacySource, /Google Analytics is not enabled/i);
  assert.doesNotMatch(privacySource, /GA4|GTM|Google Tag Manager|advertising cookie/i);
});
