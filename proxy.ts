import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

// The login form lives at /admin itself; everything below it requires auth.
const isProtectedAdmin = createRouteMatcher([
  "/admin/galleries(.*)",
  "/admin/news(.*)",
  "/admin/pages(.*)",
]);

export const proxy = convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isProtectedAdmin(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/admin");
  }
});

export const config = {
  // Run on everything except Next internals and static files.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
