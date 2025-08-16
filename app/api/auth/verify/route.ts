import { type NextRequest, NextResponse } from "next/server"
import { getAdminFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getAdminFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        lastLogin: user.lastLogin,
      },
    })
  } catch (error) {
    console.error("Verify error:", error)
    return NextResponse.json({ error: "حدث خطأ في التحقق" }, { status: 500 })
  }
}
