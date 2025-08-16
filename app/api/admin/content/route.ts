import { type NextRequest, NextResponse } from "next/server"
import { setPublishedContent, createSnapshot } from "@/lib/database/supabase"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookies = request.headers.get("cookie") || ""
    const isUnlocked = /(?:^|; )dash_unlock=1(?:;|$)/.test(cookies)

    if (!isUnlocked) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { content, action, description } = body

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    if (action === "save") {
      // Save content as draft
      const success = await createSnapshot(content, description || "Auto-save")
      if (!success) {
        return NextResponse.json({ error: "Failed to save content" }, { status: 500 })
      }
      return NextResponse.json({ success: true, message: "Content saved successfully" })
    } else if (action === "publish") {
      // Publish content
      const success = await setPublishedContent(content)
      if (!success) {
        return NextResponse.json({ error: "Failed to publish content" }, { status: 500 })
      }

      await createSnapshot(content, "Published version")

      return NextResponse.json({ success: true, message: "Content published successfully" })
    } else if (action === "snapshot") {
      // Create snapshot
      const snapshotId = await createSnapshot(content, description)
      if (!snapshotId) {
        return NextResponse.json({ error: "Failed to create snapshot" }, { status: 500 })
      }
      return NextResponse.json({ success: true, message: "Snapshot created successfully", id: snapshotId })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in admin content API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie") || ""
    const isUnlocked = /(?:^|; )dash_unlock=1(?:;|$)/.test(cookies)

    if (!isUnlocked) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const action = url.searchParams.get("action")

    if (action === "history") {
      // Return content history (placeholder implementation)
      const history = [
        {
          id: "1",
          description: "تحديث قسم البطل الرئيسي",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          author: "المدير",
        },
        {
          id: "2",
          description: "إضافة خدمة جديدة",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          author: "المدير",
        },
      ]

      return NextResponse.json({ history })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in admin content GET API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
