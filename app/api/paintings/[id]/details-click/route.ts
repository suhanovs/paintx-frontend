import { NextRequest, NextResponse } from "next/server";

const API = process.env.INTERNAL_API_URL || "http://localhost:8000";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const xff = request.headers.get("x-forwarded-for") || "";
  const xri = request.headers.get("x-real-ip") || "";
  const rawCookie = request.headers.get("cookie") || "";
  const visitorCookie =
    request.cookies.get("paintx_vid")?.value ||
    decodeURIComponent((rawCookie.match(/(?:^|;\s*)paintx_vid=([^;]+)/)?.[1] ?? ""));

  const res = await fetch(`${API}/api/paintings/${id}/details-click`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": xff,
      "x-real-ip": xri,
      "x-visitor-cookie": visitorCookie,
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
