import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getAdminFromRequest } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl

  const securityHeaders = {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-XSS-Protection": "1; mode=block",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  }

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  if (process.env.NODE_ENV === "production") {
    response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    // السماح بصفحة تسجيل الدخول
    if (pathname === "/admin/login" || pathname.startsWith("/api/auth/login")) {
      response.headers.set("X-Robots-Tag", "noindex, nofollow")
      return response
    }

    // التحقق من المصادقة للمسارات الأخرى
    const user = await getAdminFromRequest(request)

    if (!user) {
      // إعادة توجيه إلى صفحة تسجيل الدخول
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    const protectedRoutes = {
      "/admin/users": ["users", "all"],
      "/admin/settings": ["settings", "all"],
      "/admin/database": ["database", "all"],
      "/admin/security": ["security", "all"],
    }

    const requiredPermissions = protectedRoutes[pathname as keyof typeof protectedRoutes]
    if (requiredPermissions && !requiredPermissions.some((perm) => user.permissions.includes(perm))) {
      return NextResponse.json({ error: "ليس لديك صلاحية للوصول إلى هذه الصفحة" }, { status: 403 })
    }

    response.headers.set("X-Robots-Tag", "noindex, nofollow")
  }

  if (pathname === "/" || pathname === "/ar" || pathname === "/en") {
    response.headers.set(
      "Link",
      [
        "<https://fonts.googleapis.com>; rel=preconnect",
        "<https://fonts.gstatic.com>; rel=preconnect; crossorigin",
      ].join(", "),
    )
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)", "/api/(.*)"],
}
