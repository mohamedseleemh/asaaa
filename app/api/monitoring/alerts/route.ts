import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database/connection"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, health, timestamp } = body

    if (sql) {
      await sql`
        INSERT INTO system_alerts (
          alert_type,
          alert_data,
          severity,
          timestamp,
          created_at
        ) VALUES (
          ${type},
          ${JSON.stringify(health)},
          'critical',
          to_timestamp(${timestamp / 1000}),
          NOW()
        )
      `
    }

    // في الإنتاج، يمكن إرسال تنبيهات عبر البريد الإلكتروني أو Slack
    console.warn("Critical performance issue detected:", { type, health })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Alert tracking error:", error)
    return NextResponse.json({ error: "Failed to track alert" }, { status: 500 })
  }
}

export async function GET() {
  try {
    if (!sql) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 })
    }

    const alerts = await sql`
      SELECT 
        alert_type,
        alert_data,
        severity,
        created_at
      FROM system_alerts 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT 50
    `

    return NextResponse.json(alerts)
  } catch (error) {
    console.error("Alerts fetch error:", error)
    return NextResponse.json({ error: "Failed to get alerts" }, { status: 500 })
  }
}
