import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database/connection"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, value, url, userAgent, timestamp } = body

    if (sql) {
      await sql`
        INSERT INTO performance_issues (
          metric_type, 
          metric_value, 
          page_url, 
          user_agent, 
          timestamp,
          created_at
        ) VALUES (
          ${type}, 
          ${value}, 
          ${url}, 
          ${userAgent}, 
          to_timestamp(${timestamp / 1000}),
          NOW()
        )
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Performance tracking error:", error)
    return NextResponse.json({ error: "Failed to track performance" }, { status: 500 })
  }
}

export async function GET() {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 })
    }

    const stats = await sql`
      SELECT 
        metric_type,
        COUNT(*) as issue_count,
        AVG(metric_value) as avg_value,
        MAX(metric_value) as max_value,
        MIN(created_at) as first_seen,
        MAX(created_at) as last_seen
      FROM performance_issues 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY metric_type
      ORDER BY issue_count DESC
    `

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Performance stats error:", error)
    return NextResponse.json({ error: "Failed to get performance stats" }, { status: 500 })
  }
}
