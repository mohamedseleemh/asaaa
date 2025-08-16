import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database/connection"

export async function GET() {
  try {
    let notifications = []
    let unreadCount = 0

    if (sql) {
      try {
        const result = await sql`
          SELECT 
            id,
            title,
            message,
            type,
            timestamp,
            read,
            priority,
            action_url
          FROM notifications 
          WHERE created_at >= NOW() - INTERVAL '7 days'
          ORDER BY timestamp DESC, priority DESC
          LIMIT 50
        `

        notifications = result.map((row) => ({
          ...row,
          timestamp: new Date(row.timestamp),
        }))

        const unreadResult = await sql`
          SELECT COUNT(*) as count 
          FROM notifications 
          WHERE read = false AND created_at >= NOW() - INTERVAL '7 days'
        `
        unreadCount = unreadResult[0]?.count || 0
      } catch (dbError) {
        console.error("Database error:", dbError)
        // Fall back to demo data
        notifications = generateDemoNotifications()
        unreadCount = notifications.filter((n) => !n.read).length
      }
    } else {
      notifications = generateDemoNotifications()
      unreadCount = notifications.filter((n) => !n.read).length
    }

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("Notifications API error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, message, type, priority = "medium", actionUrl } = body

    if (sql) {
      await sql`
        INSERT INTO notifications (
          title, message, type, priority, action_url, timestamp, read, created_at
        ) VALUES (
          ${title}, ${message}, ${type}, ${priority}, ${actionUrl || null}, 
          NOW(), false, NOW()
        )
      `
    }

    // wsManager.broadcast('notification', { title, message, type, priority })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Create notification error:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}

function generateDemoNotifications() {
  return [
    {
      id: "1",
      title: "مستخدم جديد مسجل",
      message: "انضم مستخدم جديد إلى النظام",
      type: "success",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      priority: "medium",
    },
    {
      id: "2",
      title: "تحديث أمني",
      message: "تم تحديث إعدادات الأمان بنجاح",
      type: "info",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
      priority: "high",
    },
    {
      id: "3",
      title: "تحذير من الأداء",
      message: "استخدام المعالج مرتفع (85%)",
      type: "warning",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true,
      priority: "high",
    },
    {
      id: "4",
      title: "نسخة احتياطية مكتملة",
      message: "تم إنشاء النسخة الاحتياطية اليومية بنجاح",
      type: "success",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
      priority: "low",
    },
  ]
}
