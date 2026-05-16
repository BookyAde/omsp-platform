import { NextRequest, NextResponse } from "next/server";
import { sendToSentinel } from "@/lib/sentinel";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip =
      forwardedFor?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const userAgent = req.headers.get("user-agent") || "unknown";
    const referer = req.headers.get("referer") || null;
    const origin = req.headers.get("origin") || null;

    await sendToSentinel({
      event_type: body.event_type,
      source: body.source ?? "omsp_frontend",
      priority: body.priority ?? "normal",
      payload: body.payload ?? {},
      metadata: {
        app: "omsp",
        environment: process.env.NODE_ENV ?? "development",
        received_by: "omsp_monitoring_api",
        ip,
        user_agent: userAgent,
        referer,
        origin,
        timestamp: new Date().toISOString(),
        ...(body.metadata ?? {}),
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("OMSP monitoring route failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Monitoring event failed",
      },
      {
        status: 500,
      }
    );
  }
}