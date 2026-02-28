import { NextRequest, NextResponse } from "next/server";

const API = process.env.INTERNAL_API_URL || "http://localhost:8000";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const xff = request.headers.get("x-forwarded-for") || "";
  const xri = request.headers.get("x-real-ip") || "";

  const res = await fetch(`${API}/api/paintings/${id}/details-click`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": xff,
      "x-real-ip": xri,
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
