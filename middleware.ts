import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// Prefix-based public routes. Any pathname starting with one of these
// prefixes (or matching exactly for "/") is considered public so dynamic
// routes like /product/[id] and /checkout/esewa-success work.
const PUBLIC_PREFIXES = [
  "/demo",
  "/login",
  "/signup",
  "/auth",
  "/restricted",
  "/shop",
  "/product",
  "/cart",
  "/checkout",
  "/collections",
  "/about",
  "/events",
  "/order-tracking",
];
const PUBLIC_API_ROUTES = ["/api/public-data"];

function isPublic(pathname: string) {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

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

  if (isPublic(pathname) || PUBLIC_API_ROUTES.includes(pathname)) {
    if (token) {
      if (pathname === "/login" || pathname === "/auth/admin/login") {
        return NextResponse.redirect(
          new URL(token.role === "admin" ? "/admin" : "/", req.url),
        );
      }
      if (pathname === "/auth/client/login") {
        return NextResponse.redirect(new URL("/", req.url));
      }
      if (pathname === "/signup" || pathname === "/auth/client/signup") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
    return NextResponse.next();
  }

  if (!token) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/auth/admin/login", req.url));
    }
    return NextResponse.redirect(new URL("/auth/client/login", req.url));
  }

  if (pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/restricted", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|static|_next|.*\\..*).*)"],
};
