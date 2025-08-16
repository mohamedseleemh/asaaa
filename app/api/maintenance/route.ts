import { runMaintenanceJobs } from "@/lib/database/connection"
import { verifySession } from "@/lib/security/auth"
import { createRateLimitMiddleware } from "@/lib/security/rate-limiter"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  // التحقق من الجلسة
  const session = await verifySession(req)
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })
  }

  // تطبيق التحكم في المعدل
  const rateLimitResponse = await createRateLimitMiddleware("admin")(req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const result = await runMaintenanceJobs()

    return NextResponse.json({
      success: true,
      message: "تم تشغيل مهام الصيانة بنجاح",
      result,
    })
  } catch (error) {
    console.error("Maintenance jobs failed:", error)

    return NextResponse.json(
      {
        error: "فشل في تشغيل مهام الصيانة",
        details: error instanceof Error ? error.message : "خطأ غير معروف",
      },
      { status: 500 },
    )
  }
}

// GET للحصول على حالة مهام الصيانة
export async function GET(req: Request) {
  // التحقق من الجلسة
  const session = await verifySession(req)
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 })
  }

  try {
    const { sql } = await import("@/lib/database/connection")

    const jobs = await sql`
      SELECT 
        job_name,
        description,
        last_run,
        next_run,
        interval_minutes,
        enabled
      FROM maintenance_jobs
      ORDER BY job_name
    `

    return NextResponse.json({
      jobs,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Get maintenance jobs failed:", error)

    return NextResponse.json(
      {
        error: "فشل في جلب مهام الصيانة",
      },
      { status: 500 },
    )
  }
}
