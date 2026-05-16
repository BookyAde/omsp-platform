type SentinelPriority = "low" | "normal" | "high" | "critical";

export type SentinelEvent = {
  event_type: string;
  source?: string;
  priority?: SentinelPriority;

  payload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

function getSessionId() {
  if (typeof window === "undefined") return "server";

  let sessionId = sessionStorage.getItem("omsp_session_id");

  if (!sessionId) {
    sessionId =
      crypto.randomUUID?.() ??
      `session_${Date.now()}_${Math.random()}`;

    sessionStorage.setItem("omsp_session_id", sessionId);
  }

  return sessionId;
}

function getVisitorId() {
  if (typeof window === "undefined") return "server";

  let visitorId = localStorage.getItem("omsp_visitor_id");

  if (!visitorId) {
    visitorId =
      crypto.randomUUID?.() ??
      `visitor_${Date.now()}_${Math.random()}`;

    localStorage.setItem("omsp_visitor_id", visitorId);
  }

  return visitorId;
}

function getEnvironment() {
  return process.env.NODE_ENV || "development";
}

export async function sendToSentinel(event: SentinelEvent) {
  const ingestUrl = process.env.SENTINELSTREAM_INGEST_URL;
  const apiKey = process.env.SENTINELSTREAM_API_KEY;

  if (!ingestUrl || !apiKey) {
    console.error("Missing SentinelStream environment variables.");
    return;
  }

  try {
    const metadata = {
      app: "omsp",
      environment: getEnvironment(),

      session_id: getSessionId(),
      visitor_id: getVisitorId(),

      timestamp: new Date().toISOString(),

      pathname:
        typeof window !== "undefined"
          ? window.location.pathname
          : null,

      url:
        typeof window !== "undefined"
          ? window.location.href
          : null,

      referrer:
        typeof document !== "undefined"
          ? document.referrer
          : null,

      user_agent:
        typeof navigator !== "undefined"
          ? navigator.userAgent
          : null,

      ...event.metadata,
    };

    const payload = {
      ...event.payload,
    };

    const response = await fetch(ingestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${apiKey}`,
        "x-api-key": apiKey,
      },

      body: JSON.stringify({
        event_type: event.event_type,
        source: event.source ?? "omsp_frontend",
        priority: event.priority ?? "normal",

        payload,
        metadata,
      }),
    });

    if (!response.ok) {
      const text = await response.text();

      console.error("SentinelStream error:", {
        status: response.status,
        body: text,
      });

      return;
    }

    console.log("Sentinel event tracked:", event.event_type);
  } catch (error) {
    console.error("SentinelStream tracking failed:", error);
  }
}