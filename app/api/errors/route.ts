import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database/connection"

export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json()

    // حفظ الخطأ في قاعدة البيانات
    if (sql) {
      await sql`
        INSERT INTO error_logs (
          error_name,
          error_message,
          error_stack,
          url,
          user_agent,
          user_id,
          timestamp,
          additional_info
        ) VALUES (
          ${errorData.error.name},
          ${errorData.error.message},
          ${errorData.error.stack},
          ${errorData.url},
          ${errorData.userAgent},
          ${errorData.userId || null},
          ${errorData.timestamp},
          ${JSON.stringify(errorData.errorInfo || {})}
        )
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to log error:", error)
    return NextResponse.json({ error: "Failed to log error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ errors: [] })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const errors = await sql`
      SELECT 
        id,
        error_name,
        error_message,
        url,
        user_id,
        timestamp,
        COUNT(*) OVER() as total_count
      FROM error_logs
      ORDER BY timestamp DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    return NextResponse.json({
      errors,
      total: errors[0]?.total_count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Failed to fetch errors:", error)
    return NextResponse.json({ error: "Failed to fetch errors" }, { status: 500 })
  }
}
