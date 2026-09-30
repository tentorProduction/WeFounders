import { NextResponse } from "next/server";
import { getSiteOrigin } from "@/lib/site-url";

/**
 * Public Access Protection: Internal development documentation is unexposed.
 * Redirects visitors to the public /about page.
 */
export async function GET() {
  const url = new URL("/about", getSiteOrigin());
  return NextResponse.redirect(url, 307);
}
