import { type NextRequest, NextResponse } from "next/server"
import { createAuthContext } from "@/lib/security/enhanced-auth"
import { sql } from "@/lib/database/connection"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authContext = await createAuthContext(req)
    if (!authContext || !authContext.canAccess({ resource: "users", action: "read" })) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
    }

    const userId = params.id
    const { searchParams } = new URL(req.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const activities = await sql`
      SELECT 
        al.id,
        al.action,
        al.details,
        al.created_at as timestamp,
        al.ip_address,
        u.name as user_name,
        u.id as user_id,
        'success' as status
      FROM audit_logs al
      JOIN users u ON al.user_id = u.id::text
      WHERE al.user_id = ${userId}
      ORDER BY al.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    return NextResponse.json(activities)
  } catch (error) {
    console.error("Error fetching user activities:", error)
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 })
  }
}
