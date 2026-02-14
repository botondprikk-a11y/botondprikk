import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

const roleRedirects: Record<string, string> = {
  TRAINER: "/app/trainer/dashboard",
  CLIENT: "/app/client/home",
  ADMIN: "/app/admin"
};

function roleFromPath(pathname: string) {
  if (pathname.startsWith("/app/trainer")) return "TRAINER";
  if (pathname.startsWith("/app/client")) return "CLIENT";
  if (pathname.startsWith("/app/admin")) return "ADMIN";
  return null;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const expectedRole = roleFromPath(pathname);

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!expectedRole) {
    return NextResponse.next();
  }

  if (session.role !== expectedRole) {
    const redirectTo = roleRedirects[session.role] || "/login";
    return NextResponse.redirect(new URL(redirectTo, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"]
};
