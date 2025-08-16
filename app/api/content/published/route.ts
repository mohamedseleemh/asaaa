import { type NextRequest, NextResponse } from "next/server"
import { getPublishedContent, trackAnalyticsEvent } from "@/lib/database/supabase"

export async function GET(request: NextRequest) {
  try {
    const content = await getPublishedContent()

    // Try to track analytics, but don't fail if it doesn't work
    try {
      const userAgent = request.headers.get("user-agent") || undefined
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown"

      await trackAnalyticsEvent({
        event_type: "api_content_fetch",
        page: "/api/content/published",
        user_agent: userAgent,
        ip_address: ip,
      })
    } catch (analyticsError) {
      // Silently fail analytics tracking
      console.warn("Analytics tracking failed:", analyticsError)
    }

    return NextResponse.json(content, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error fetching published content:", error)
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookies = request.headers.get("cookie") || ""
    const isUnlocked = /(?:^|; )dash_unlock=1(?:;|$)/.test(cookies)

    if (!isUnlocked) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { content } = body

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Import the function here to avoid circular dependencies
    const { setPublishedContent } = await import("@/lib/database/supabase")
    const success = await setPublishedContent(content)

    if (!success) {
      return NextResponse.json({ error: "Failed to publish content" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Content published successfully" })
  } catch (error) {
    console.error("Failed to publish content:", error)
    return NextResponse.json({ error: "Failed to publish content" }, { status: 500 })
  }
}
