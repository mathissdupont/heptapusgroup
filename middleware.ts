import { NextRequest, NextResponse } from "next/server";
import { parseToken, cookiesOptions } from "@/lib/auth";

const PROTECTED = [/^\/admin($|\/)/, /^\/api\/admin($|\/)/];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  const needsAuth = PROTECTED.some((r) => r.test(url));
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(cookiesOptions.name)?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  try {
    const user = await parseToken(token);
    // role check örnek: admin sayfası sadece ADMIN/EDITOR’a açık olsun
    if (url.startsWith("/admin") && !["ADMIN", "EDITOR"].includes(user.role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

