import { NextRequest, NextResponse } from "next/server";

const API = process.env.INTERNAL_API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.search;
  const rawCookie = request.headers.get("cookie") || "";
  const visitorCookie =
    request.headers.get("x-visitor-cookie") ||
    request.cookies.get("paintx_vid")?.value ||
    decodeURIComponent((rawCookie.match(/(?:^|;\s*)paintx_vid=([^;]+)/)?.[1] ?? ""));
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const lang = host.includes(".ru") ? "ru" : request.headers.get("accept-language") || "en";
  const res = await fetch(`${API}/api/paintings${search}`, {
    headers: {
      "Content-Type": "application/json",
      "x-visitor-cookie": visitorCookie,
      "Accept-Language": lang,
    },
  });
  const data = await res.json();
  return NextResponse.json(data);
}
