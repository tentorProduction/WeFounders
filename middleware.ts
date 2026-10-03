import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest, type NextFetchEvent } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

const isClerkConfigured = Boolean(
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY) &&
    process.env.CLERK_SECRET_KEY
);

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  if (!isClerkConfigured) {
    if (isAdminRoute(request)) return NextResponse.redirect(new URL("/?error=authentication_unavailable", request.url));
    return NextResponse.next();
  }

  try {
    return await clerkMiddleware(async (auth, req) => {
      if (isAdminRoute(req)) {
        const { userId } = await auth();
        if (userId) return;
        const signInUrl = new URL(
          process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in",
          req.url
        );
        signInUrl.searchParams.set("redirect_url", req.url);
        return NextResponse.redirect(signInUrl);
      }
    })(request, event);
  } catch (error) {
    console.error("[middleware] Clerk invocation failed:", error);
    return new NextResponse("Authentication is temporarily unavailable. Please retry.", { status: 503 });
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
