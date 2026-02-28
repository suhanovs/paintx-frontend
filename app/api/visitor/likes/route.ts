import { NextRequest, NextResponse } from "next/server";

const API = process.env.INTERNAL_API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  const rawCookie = request.headers.get("cookie") || "";
  const visitorCookie =
    request.headers.get("x-visitor-cookie") ||
    request.cookies.get("paintx_vid")?.value ||
    decodeURIComponent((rawCookie.match(/(?:^|;\s*)paintx_vid=([^;]+)/)?.[1] ?? ""));

  const res = await fetch(`${API}/api/visitor/likes`, {
    headers: {
      "Content-Type": "application/json",
      "x-visitor-cookie": visitorCookie,
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
