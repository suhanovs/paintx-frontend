import { NextRequest, NextResponse } from "next/server";

const API = process.env.INTERNAL_API_URL || "http://localhost:8000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const lang = host.includes(".ru") ? "ru" : request.headers.get("accept-language") || "en";
  const res = await fetch(`${API}/api/paintings/${id}`, { headers: { "Accept-Language": lang } });
  const data = await res.json();
  return NextResponse.json(data);
}
