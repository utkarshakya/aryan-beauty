import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|png|gif|svg|ico|webp|woff2?|ttf|map|json)).*)",
    // Always run for API/TRPC routes
    "/(api|trpc)(.*)",
    // Clerk frontend API
    "/__clerk/(.*)",
  ],
};
