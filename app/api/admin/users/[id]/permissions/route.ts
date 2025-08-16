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

    const result = await sql`
      SELECT permissions 
      FROM user_permissions 
      WHERE user_id = ${userId}
    `

    const permissions = result.length > 0 ? result[0].permissions : []

    return NextResponse.json({ permissions })
  } catch (error) {
    console.error("Error fetching user permissions:", error)
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authContext = await createAuthContext(req)
    if (!authContext || !authContext.canAccess({ resource: "users", action: "update" })) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
    }

    const userId = params.id
    const { permissions } = await req.json()

    if (!Array.isArray(permissions)) {
      return NextResponse.json({ error: "صيغة الصلاحيات غير صحيحة" }, { status: 400 })
    }

    // تحديث أو إدراج الصلاحيات
    await sql`
      INSERT INTO user_permissions (user_id, permissions, updated_by, updated_at)
      VALUES (${userId}, ${JSON.stringify(permissions)}, ${authContext.user.id}, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        permissions = EXCLUDED.permissions,
        updated_by = EXCLUDED.updated_by,
        updated_at = EXCLUDED.updated_at
    `

    // تسجيل النشاط
    await sql`
      INSERT INTO audit_logs (action, details, created_at, user_id, ip_address)
      VALUES (
        'permissions_updated',
        ${JSON.stringify({ target_user: userId, permissions })},
        NOW(),
        ${authContext.user.id},
        ${req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip")}
      )
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user permissions:", error)
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 })
  }
}
