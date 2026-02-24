import { NextRequest, NextResponse } from "next/server";

const API = process.env.INTERNAL_API_URL || "http://localhost:8000";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.search;
  const res = await fetch(`${API}/api/paintings${search}`, {
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  return NextResponse.json(data);
}
