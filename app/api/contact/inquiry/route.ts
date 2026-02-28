import { NextRequest, NextResponse } from "next/server";

const API = process.env.INTERNAL_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const rawCookie = request.headers.get("cookie") || "";
  const visitorCookie =
    request.headers.get("x-visitor-cookie") ||
    request.cookies.get("paintx_vid")?.value ||
    decodeURIComponent((rawCookie.match(/(?:^|;\s*)paintx_vid=([^;]+)/)?.[1] ?? ""));

  const xff = request.headers.get("x-forwarded-for") || "";
  const xri = request.headers.get("x-real-ip") || "";

  const res = await fetch(`${API}/api/contact/inquiry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-visitor-cookie": visitorCookie,
      "x-forwarded-for": xff,
      "x-real-ip": xri,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
