"use client";

import { Analytics } from "@vercel/analytics/next";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

const PUBLIC_ANALYTICS_HOSTS = new Set(["jmpseat.com", "www.jmpseat.com"]);
const PUBLIC_ANALYTICS_PATHS = new Set(["/", "/privacy", "/terms"]);

export function shouldRenderPublicVercelAnalytics(input: {
  hostname: string;
  pathname: string | null;
}) {
  return (
    PUBLIC_ANALYTICS_HOSTS.has(input.hostname) &&
    input.pathname !== null &&
    PUBLIC_ANALYTICS_PATHS.has(input.pathname)
  );
}

function subscribeToHostnameChange() {
  return () => {};
}

function getClientHostname() {
  return window.location.hostname;
}

function getServerHostname() {
  return "";
}

export function PublicVercelAnalytics() {
  const pathname = usePathname();
  const hostname = useSyncExternalStore(
    subscribeToHostnameChange,
    getClientHostname,
    getServerHostname,
  );

  if (!shouldRenderPublicVercelAnalytics({ hostname, pathname })) {
    return null;
  }

  return <Analytics />;
}
