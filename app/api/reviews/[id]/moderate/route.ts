import { moderateReview } from "@/lib/database/models/review"
import { verifySession } from "@/lib/security/auth"
import { createRateLimitMiddleware } from "@/lib/security/rate-limiter"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  // التحقق من الجلسة
  if (!verifySession(req)) {
    return new Response(JSON.stringify({ error: "غير مصرح بالوصول" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  // تطبيق التحكم في المعدل
  const rateLimitResponse = await createRateLimitMiddleware("admin")(req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { status, moderatedBy } = await req.json()

    if (!["approved", "rejected"].includes(status)) {
      return new Response(JSON.stringify({ error: "حالة غير صالحة" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const success = await moderateReview(params.id, status, moderatedBy || "admin")

    if (!success) {
      return new Response(JSON.stringify({ error: "التقييم غير موجود" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `تم ${status === "approved" ? "قبول" : "رفض"} التقييم بنجاح`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    console.error("Moderate review API error:", error)
    return new Response(JSON.stringify({ error: "حدث خطأ في إدارة التقييم" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
