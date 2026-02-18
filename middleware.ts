import { NextRequest, NextResponse } from "next/server";
import { parseToken, cookiesOptions } from "@/lib/auth";

const PROTECTED = [/^\/admin($|\/)/, /^\/api\/admin($|\/)/];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  const hostname = req.headers.get('host') || '';

  // /uploads/ istekleri next.config.ts beforeFiles rewrite ile
  // /api/serve-uploads/ route handler'ına yönlendirilir
  
  // Extract subdomain from hostname
  let subdomain: string | null = null;
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'www') {
      subdomain = parts[0];
    }
  } else {
    const parts = hostname.split('.');
    if (parts.length >= 3 && parts[0] !== 'www') {
      subdomain = parts[0];
    }
  }
  
  // If on subdomain, add subdomain info to headers for app to access
  if (subdomain) {
    const response = NextResponse.next();
    response.headers.set('x-subdomain', subdomain);
    
    // Don't allow admin access on subdomains
    if (url.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    return response;
  }
  
  // Authentication check for protected routes (only on main domain)
  const needsAuth = PROTECTED.some((r) => r.test(url));
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(cookiesOptions.name)?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  try {
    const user = await parseToken(token);
    // role check örnek: admin sayfası sadece ADMIN/EDITOR'a açık olsun
    if (url.startsWith("/admin") && !["ADMIN", "EDITOR"].includes(user.role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
