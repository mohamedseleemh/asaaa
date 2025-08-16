import { type NextRequest, NextResponse } from "next/server"
import { authenticateAdmin, logAdminActivity } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "البريد الإلكتروني وكلمة المرور مطلوبان" }, { status: 400 })
    }

    const result = await authenticateAdmin(email, password, ip)

    if (result.success && result.user && result.token) {
      await logAdminActivity(result.user.id, "login", { ip, email })

      const response = NextResponse.json({
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          permissions: result.user.permissions,
        },
      })

      response.cookies.set("admin_token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours
        path: "/",
      })

      response.cookies.set("dash_unlock", "1", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60,
        path: "/",
      })

      return response
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "فشل في تسجيل الدخول",
          remainingAttempts: result.remainingAttempts,
        },
        { status: 401 },
      )
    }
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ في النظام" }, { status: 500 })
  }
}
