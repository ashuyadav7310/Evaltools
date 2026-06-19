import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/evalai" && !request.cookies.has("evalai_user_session")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/admin-dashboard" && !request.cookies.has("evalai_admin_session")) {
    return NextResponse.redirect(new URL("/admin-access", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/evalai", "/admin-dashboard"]
};
