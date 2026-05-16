"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function getOrCreateVisitorId() {
  let visitorId = localStorage.getItem("omsp_visitor_id");

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem("omsp_visitor_id", visitorId);
  }

  return visitorId;
}

function getOrCreateSessionId() {
  let sessionId = sessionStorage.getItem("omsp_session_id");

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("omsp_session_id", sessionId);
  }

  return sessionId;
}

function getRouteSection(pathname: string) {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/events")) return "events";
  if (pathname.startsWith("/forms")) return "forms";
  if (pathname.startsWith("/gallery")) return "gallery";
  if (pathname.startsWith("/contact")) return "contact";

  return "public";
}

export default function PublicActivityTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MONITORING_ENABLED !== "true") {
      return;
    }

    async function trackNavigation() {
      try {
        const query = searchParams.toString();

        const currentPath = query
          ? `${pathname}?${query}`
          : pathname;

        const previousPath = previousPathRef.current;

        const eventType = previousPath
          ? "page_navigation"
          : "page_view";

        await fetch("/api/monitoring/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          keepalive: true,

          body: JSON.stringify({
            event_type: eventType,

            source: pathname.startsWith("/admin")
              ? "omsp_admin"
              : "omsp_public_site",

            priority: pathname.startsWith("/admin")
              ? "normal"
              : "low",

            payload: {
              from: previousPath,
              to: currentPath,

              pathname,
              query: query || null,

              full_url: window.location.href,

              route_section: getRouteSection(pathname),

              page_title: document.title,

              referrer: document.referrer || null,
            },

            metadata: {
              visitor_id: getOrCreateVisitorId(),
              session_id: getOrCreateSessionId(),

              user_agent: navigator.userAgent,
              language: navigator.language,

              screen_width: window.screen.width,
              screen_height: window.screen.height,

              viewport_width: window.innerWidth,
              viewport_height: window.innerHeight,

              timestamp: new Date().toISOString(),
            },
          }),
        });

        previousPathRef.current = currentPath;
      } catch (error) {
        console.error("Navigation tracking failed:", error);
      }
    }

    trackNavigation();
  }, [pathname, searchParams]);

  return null;
}