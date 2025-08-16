import { getUserById, updateUser, deleteUser } from "@/lib/database/models/user"
import { verifySession } from "@/lib/security/auth"
import { createRateLimitMiddleware } from "@/lib/security/rate-limiter"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  // التحقق من الجلسة
  if (!verifySession(req)) {
    return new Response(JSON.stringify({ error: "غير مصرح بالوصول" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const user = await getUserById(params.id)

    if (!user) {
      return new Response(JSON.stringify({ error: "المستخدم غير موجود" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify(user), { status: 200, headers: { "Content-Type": "application/json" } })
  } catch (error) {
    console.error("Get user API error:", error)
    return new Response(JSON.stringify({ error: "حدث خطأ في جلب المستخدم" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
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
    const user = await updateUser(params.id, userData)

    if (!user) {
      return new Response(JSON.stringify({ error: "المستخدم غير موجود" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify(user), { status: 200, headers: { "Content-Type": "application/json" } })
  } catch (error) {
    console.error("Update user API error:", error)
    return new Response(JSON.stringify({ error: "حدث خطأ في تحديث المستخدم" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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
    const success = await deleteUser(params.id)

    if (!success) {
      return new Response(JSON.stringify({ error: "المستخدم غير موجود" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ success: true, message: "تم حذف المستخدم بنجاح" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Delete user API error:", error)
    return new Response(JSON.stringify({ error: "حدث خطأ في حذف المستخدم" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
