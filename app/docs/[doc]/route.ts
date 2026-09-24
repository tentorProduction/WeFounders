import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Page not found" }, { status: 404 });
}
