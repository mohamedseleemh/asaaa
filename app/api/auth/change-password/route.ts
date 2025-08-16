import { changeAdminPassword } from "@/lib/security/auth"
import { verifySession } from "@/lib/security/auth"
import { createRateLimitMiddleware } from "@/lib/security/rate-limiter"

export async function POST(req: Request) {
  // التحقق من الجلسة
  if (!verifySession(req)) {
    return new Response(JSON.stringify({ error: "غير مصرح بالوصول" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  // تطبيق التحكم في المعدل
  const rateLimitResponse = await createRateLimitMiddleware("auth")(req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return new Response(JSON.stringify({ error: "كلمة المرور الحالية والجديدة مطلوبتان" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const result = await changeAdminPassword(currentPassword, newPassword)

    if (result.success) {
      return new Response(JSON.stringify({ success: true, message: result.message }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    } else {
      return new Response(JSON.stringify({ error: result.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
  } catch (error) {
    console.error("Change password API error:", error)
    return new Response(JSON.stringify({ error: "حدث خطأ في تغيير كلمة المرور" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
