import { type NextRequest, NextResponse } from "next/server"
import { enhancedLogin, ensureAdminUser } from "@/lib/security/enhanced-auth"
import { createSessionCookie } from "@/lib/security/auth"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "البريد الإلكتروني وكلمة المرور مطلوبان" }, { status: 400 })
    }

    // التأكد من وجود مستخدم المدير
    await ensureAdminUser()

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const userAgent = req.headers.get("user-agent") || "unknown"

    const result = await enhancedLogin(email, password, ipAddress, userAgent)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 })
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user!.id,
        name: result.user!.name,
        email: result.user!.email,
        role: result.user!.role,
      },
    })

    // إعداد كوكي الجلسة
    const sessionCookie = createSessionCookie(result.session!.token, result.session!.expiresAt)
    response.headers.set("Set-Cookie", sessionCookie)

    return response
  } catch (error) {
    console.error("Enhanced login API error:", error)
    return NextResponse.json({ success: false, error: "حدث خطأ في النظام" }, { status: 500 })
  }
}
