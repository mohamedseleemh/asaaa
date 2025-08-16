import { type NextRequest, NextResponse } from "next/server"
import { createReview, getApprovedReviews } from "@/lib/database/supabase"

export async function GET() {
  try {
    const reviews = await getApprovedReviews(20)
    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, rating, comment } = body

    // Validation
    if (!name || !rating || !comment) {
      return NextResponse.json({ error: "Name, rating, and comment are required" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    if (comment.length < 10 || comment.length > 500) {
      return NextResponse.json({ error: "Comment must be between 10 and 500 characters" }, { status: 400 })
    }

    // Get IP and user agent for spam protection
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || undefined

    const reviewId = await createReview({
      name,
      email,
      rating,
      comment,
      ip,
      user_agent: userAgent,
    })

    if (!reviewId) {
      return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully and is pending approval",
      id: reviewId,
    })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}
