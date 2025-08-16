import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const adminToken = request.cookies.get("admin_token")?.value

    if (adminToken) {
      // يمكن إضافة تسجيل نشاط هنا إذا لزم الأمر
      console.log("Admin logout:", { timestamp: new Date().toISOString() })
    }

    const response = NextResponse.json({ success: true, message: "تم تسجيل الخروج بنجاح" })

    response.cookies.delete("admin_token")
    response.cookies.delete("dash_unlock")

    return response
  } catch (error) {
    console.error("Logout API error:", error)
    return NextResponse.json({ error: "حدث خطأ في تسجيل الخروج" }, { status: 500 })
  }
}
