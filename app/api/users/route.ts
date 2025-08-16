import { getAllUsers, createUser } from "@/lib/database/models/user"
import { verifySession } from "@/lib/security/auth"
import { createRateLimitMiddleware } from "@/lib/security/rate-limiter"

export async function GET(req: Request) {
  // التحقق من الجلسة
  if (!verifySession(req)) {
    return new Response(JSON.stringify({ error: "غير مصرح بالوصول" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const users = await getAllUsers()
    return new Response(JSON.stringify(users), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Get users API error:", error)
    return new Response(JSON.stringify({ error: "حدث خطأ في جلب المستخدمين" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function POST(req: Request) {
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
    const userData = await req.json()

    if (!userData.name || !userData.email) {
      return new Response(JSON.stringify({ error: "الاسم والبريد الإلكتروني مطلوبان" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const user = await createUser(userData)
    return new Response(JSON.stringify(user), { status: 201, headers: { "Content-Type": "application/json" } })
  } catch (error) {
    console.error("Create user API error:", error)
    return new Response(JSON.stringify({ error: "حدث خطأ في إنشاء المستخدم" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
