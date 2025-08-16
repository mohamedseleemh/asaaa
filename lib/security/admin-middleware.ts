import { type NextRequest, NextResponse } from "next/server"
import { createAuthContext } from "./enhanced-auth"
import { canAccessRoute } from "./rbac"

export async function adminMiddleware(req: NextRequest): Promise<NextResponse | null> {
  const { pathname } = req.nextUrl

  // تحقق من المسارات الإدارية
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/dashboard")) {
    return null
  }

  try {
    // إنشاء سياق المصادقة
    const authContext = await createAuthContext(req)

    if (!authContext) {
      // إعادة توجيه لصفحة تسجيل الدخول
      const loginUrl = new URL("/admin/login", req.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // فحص صلاحية الوصول للمسار
    if (!canAccessRoute(authContext.user.role, pathname)) {
      return new NextResponse("غير مصرح لك بالوصول لهذه الصفحة", { status: 403 })
    }

    // إضافة معلومات المستخدم للرؤوس
    const response = NextResponse.next()
    response.headers.set("X-User-ID", authContext.user.id)
    response.headers.set("X-User-Role", authContext.user.role)
    response.headers.set("X-Session-ID", authContext.session.id)

    return response
  } catch (error) {
    console.error("Admin middleware error:", error)
    return new NextResponse("خطأ في النظام", { status: 500 })
  }
}
