import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database/connection"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, duration, size, type, url, timestamp } = body

    if (sql) {
      await sql`
        INSERT INTO slow_resources (
          resource_name,
          load_duration,
          resource_size,
          resource_type,
          page_url,
          timestamp,
          created_at
        ) VALUES (
          ${name},
          ${duration},
          ${size || 0},
          ${type},
          ${url},
          to_timestamp(${timestamp / 1000}),
          NOW()
        )
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Slow resource tracking error:", error)
    return NextResponse.json({ error: "Failed to track slow resource" }, { status: 500 })
  }
}

export async function GET() {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 })
    }

    const slowResources = await sql`
      SELECT 
        resource_name,
        resource_type,
        COUNT(*) as occurrence_count,
        AVG(load_duration) as avg_duration,
        MAX(load_duration) as max_duration,
        AVG(resource_size) as avg_size
      FROM slow_resources 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY resource_name, resource_type
      ORDER BY avg_duration DESC
      LIMIT 20
    `

    return NextResponse.json(slowResources)
  } catch (error) {
    console.error("Slow resources stats error:", error)
    return NextResponse.json({ error: "Failed to get slow resources stats" }, { status: 500 })
  }
}
