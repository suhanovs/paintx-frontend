import { NextRequest, NextResponse } from "next/server";

const API = process.env.INTERNAL_API_URL || "http://localhost:8000";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await fetch(`${API}/api/paintings/${id}`);
  const data = await res.json();
  return NextResponse.json(data);
}
