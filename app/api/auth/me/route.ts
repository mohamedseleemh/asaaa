export async function GET(req: Request) {
  try {
    // التحقق من cookie بسيط
    const cookies = req.headers.get("cookie") || ""
    const unlocked = /(?:^|; )dash_unlock=1(?:;|$)/.test(cookies)

    if (unlocked) {
      // إرجاع مستخدم إدارة افتراضي
      const user = { id: "admin", name: "المدير", email: "admin@kyctrust.com", role: "admin", active: true }
      return new Response(JSON.stringify({ user }), { status: 200 })
    }

    return new Response(JSON.stringify({ error: "غير مصرح" }), { status: 401 })
  } catch (error) {
    console.error("Auth/me API error:", error)
    return new Response(JSON.stringify({ error: "حدث خطأ في التحقق من المستخدم" }), { status: 500 })
  }
}
