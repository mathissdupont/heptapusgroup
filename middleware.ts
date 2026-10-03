import { NextRequest, NextResponse } from "next/server";
import { parseToken, cookiesOptions } from "@/lib/auth";
import { isTrustedMutation } from "@/lib/request-security";
import { subdomainFromHost } from "@/lib/hostname";

const PROTECTED = [/^\/admin($|\/)/, /^\/api\/admin($|\/)/];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  const hostname = req.headers.get('host') || '';

  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && url.startsWith("/api/")) {
    if (!isTrustedMutation(req)) {
      return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
    }
  }

  if (url.startsWith("/api/") && ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const contentLength = Number(req.headers.get("content-length") || 0);
    const maxBytes = url === "/api/upload" || url === "/api/media"
      ? 55 * 1024 * 1024 : url.startsWith("/api/auth/") ? 16 * 1024 : 1024 * 1024;
    if (!Number.isFinite(contentLength) || contentLength < 0 || contentLength > maxBytes) {
      return NextResponse.json({ error: "İstek boyutu izin verilen sınırı aşıyor." }, { status: 413 });
    }
  }

  // /uploads/ istekleri next.config.ts beforeFiles rewrite ile
  // /api/serve-uploads/ route handler'ına yönlendirilir
  
  // Extract subdomain from hostname
  const subdomain = subdomainFromHost(hostname);
  
  // If on subdomain, add subdomain info to headers for app to access
  if (subdomain) {
    const response = NextResponse.next();
    response.headers.set('x-subdomain', subdomain);
    
    // Yönetim paneli ve API'leri yalnızca ana alan adından kullanılabilir.
    if (url.startsWith('/api/admin')) {
      return NextResponse.json({ error: "Yönetim API'si bu alan adında kullanılamaz." }, { status: 403 });
    }
    if (url.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    return response;
  }
  
  // Authentication check for protected routes (only on main domain)
  const needsAuth = PROTECTED.some((r) => r.test(url));
  if (!needsAuth) return NextResponse.next();

  const isAdminApi = url.startsWith("/api/admin");
  const token = req.cookies.get(cookiesOptions.name)?.value;
  if (!token) {
    return isAdminApi
      ? NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 })
      : NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const user = await parseToken(token);
    // role check örnek: admin sayfası sadece ADMIN/EDITOR'a açık olsun
    if (!["ADMIN", "EDITOR"].includes(user.role)) {
      return isAdminApi
        ? NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 })
        : NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  } catch {
    return isAdminApi
      ? NextResponse.json({ error: "Oturumunuz geçersiz veya süresi dolmuş." }, { status: 401 })
      : NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
