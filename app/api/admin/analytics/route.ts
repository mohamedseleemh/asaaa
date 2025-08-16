import { type NextRequest, NextResponse } from "next/server"
import { getAnalytics, trackAnalyticsEvent } from "@/lib/database/supabase"

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cookies = request.headers.get("cookie") || ""
    const isUnlocked = /(?:^|; )dash_unlock=1(?:;|$)/.test(cookies)

    if (!isUnlocked) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")

    const analytics = await getAnalytics(days)
    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_type, page, metadata } = body

    if (!event_type) {
      return NextResponse.json({ error: "Event type is required" }, { status: 400 })
    }

    const userAgent = request.headers.get("user-agent") || undefined
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown"

    await trackAnalyticsEvent({
      event_type,
      page,
      user_agent: userAgent,
      ip_address: ip,
      metadata,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking analytics:", error)
    return NextResponse.json({ error: "Failed to track analytics" }, { status: 500 })
  }
}
