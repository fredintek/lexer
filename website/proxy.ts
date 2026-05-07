// middleware.ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

// 1. Define your route groups
const protectedRoutes = ["/profile", "/trade"];
const authRoutes = ["/auth/"];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from cookies
  // Check for both raw and next-intl prefixed paths
  const token = request.cookies.get("refreshToken")?.value;

  // 2. Determine if the current path is protected or an auth page
  // We remove the locale prefix (e.g., /en/profile -> /profile) to check easily
  const pathWithoutLocale = pathname.replace(/^\/(en|es|fr|de|tr)/, "") || "/";

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathWithoutLocale.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) =>
    pathWithoutLocale.startsWith(route),
  );

  // 3. Logic: If trying to access /profile without a token -> Redirect to Login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Logic: If trying to access /login with a token -> Redirect to Trade
  if (isAuthRoute && token) {
    const profileUrl = new URL("/trade", request.url);
    return NextResponse.redirect(profileUrl);
  }

  // 5. If everything is fine, let next-intl handle the localization
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for internal Next.js/Vercel paths and files with dots
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
