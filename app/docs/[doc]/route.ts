import { NextResponse } from "next/server";

/**
 * Public Access Protection: Internal development documentation is unexposed.
 * Redirects visitors to the public /about page.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  url.pathname = "/about";
  return NextResponse.redirect(url, 307);
}
