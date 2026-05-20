import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Certificate generation from submissions is not implemented yet.",
    },
    { status: 501 }
  );
}