import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// Public routes and APIs
const PUBLIC_ROUTES = [
  "/",
  "/demo",
  "/login",
  "/signup",
  "/auth/admin/login",
  "/auth/client/login",
  "/restricted",
];
const PUBLIC_API_ROUTES = ["/api/public-data"];
// Admin routes
const ADMIN_ROUTES = ["/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // ✅ Allow CORS preflight requests (OPTIONS)
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // Check if the route is public (login, signup, etc.)
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_API_ROUTES.includes(pathname)
  ) {
    // If user is authenticated, redirect them away from login/signup pages
    if (token) {
      if (pathname === "/login" || pathname === "/auth/admin/login") {
        return NextResponse.redirect(
          new URL(token.role === "admin" ? "/admin" : "/", req.url)
        );
      }

      if (pathname === "/auth/client/login") {
        return NextResponse.redirect(new URL("/", req.url));
      }

      if (pathname === "/signup") {
        return new NextResponse(
          "You are logged in and cannot create a new account",
          { status: 403 }
        );
      }
    }
    return NextResponse.next();
  }

  // For all other routes (protected routes)
  if (!token) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/auth/admin/login", req.url));
    }
    return NextResponse.redirect(new URL("/auth/client/login", req.url));
  }

  // Admin-specific route protection (protect all /admin pages and subpages)
  if (pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/restricted", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|static|_next|.*\\..*).*)"],
};
