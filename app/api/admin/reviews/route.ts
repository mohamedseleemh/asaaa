import { type NextRequest, NextResponse } from "next/server"
import { getAllReviews, moderateReview } from "@/lib/database/supabase"

export async function GET() {
  try {
    const reviews = await getAllReviews()
    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Error fetching admin reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
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
    const { id, action } = body

    if (!id || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const status = action === "approve" ? "approved" : "rejected"
    const success = await moderateReview(id, status)

    if (!success) {
      return NextResponse.json({ error: "Failed to moderate review" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: `Review ${status} successfully` })
  } catch (error) {
    console.error("Error moderating review:", error)
    return NextResponse.json({ error: "Failed to moderate review" }, { status: 500 })
  }
}
