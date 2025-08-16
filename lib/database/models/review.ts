import { sql } from "../connection"
import { createHash } from "crypto"

export interface Review {
  id: string
  name: string
  rating: number
  comment: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
}

export interface CreateReviewData {
  name: string
  email?: string
  rating: number
  comment: string
  ipAddress?: string
  userAgent?: string
}

export interface ReviewStats {
  total_reviews: number
  avg_rating: number
  rating_distribution: {
    "5": number
    "4": number
    "3": number
    "2": number
    "1": number
  }
}

// دالة تشفير البيانات الحساسة
function hashData(data: string): string {
  return createHash("sha256").update(data).digest("hex")
}

// الحصول على التقييمات المعتمدة للعرض العام
export async function getApprovedReviews(
  page = 1,
  limit = 10,
): Promise<{
  reviews: Review[]
  total: number
  stats: ReviewStats
}> {
  try {
    const offset = (page - 1) * limit

    // الحصول على التقييمات
    const reviews = await sql<Review[]>`
      SELECT id::text, name, rating, comment, status, created_at, updated_at
      FROM reviews
      WHERE status = 'approved'
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    // الحصول على العدد الإجمالي
    const totalResult = await sql<[{ count: number }]>`
      SELECT COUNT(*)::int as count
      FROM reviews
      WHERE status = 'approved'
    `

    // الحصول على الإحصائيات
    const statsResult = await sql<[ReviewStats]>`
      SELECT * FROM get_reviews_statistics()
    `

    return {
      reviews,
      total: totalResult[0]?.count || 0,
      stats: statsResult[0] || {
        total_reviews: 0,
        avg_rating: 0,
        rating_distribution: { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 },
      },
    }
  } catch (error) {
    console.error("Failed to get approved reviews:", error)
    throw error
  }
}

// الحصول على جميع التقييمات للإدارة
export async function getAllReviews(): Promise<Review[]> {
  try {
    const reviews = await sql<Review[]>`
      SELECT id::text, name, rating, comment, status, created_at, updated_at
      FROM reviews
      ORDER BY created_at DESC
    `
    return reviews
  } catch (error) {
    console.error("Failed to get all reviews:", error)
    throw error
  }
}

// إنشاء تقييم جديد
export async function createReview(reviewData: CreateReviewData): Promise<string> {
  try {
    const emailHash = reviewData.email ? hashData(reviewData.email) : null
    const ipHash = reviewData.ipAddress ? hashData(reviewData.ipAddress) : null
    const uaHash = reviewData.userAgent ? hashData(reviewData.userAgent) : null

    const result = await sql<[{ id: string }]>`
      INSERT INTO reviews (name, email_encrypted, rating, comment, ip_hash, user_agent_hash)
      VALUES (${reviewData.name}, ${emailHash}, ${reviewData.rating}, ${reviewData.comment}, ${ipHash}, ${uaHash})
      RETURNING id::text
    `

    return result[0]?.id || ""
  } catch (error) {
    console.error("Failed to create review:", error)
    throw error
  }
}

// تحديث حالة التقييم (الإشراف)
export async function moderateReview(
  id: string,
  status: "approved" | "rejected",
  moderatedBy?: string,
): Promise<boolean> {
  try {
    const result = await sql`
      UPDATE reviews
      SET status = ${status}, moderated_by = ${moderatedBy || "system"}, moderated_at = NOW()
      WHERE id = ${Number.parseInt(id)}
    `
    return result.count > 0
  } catch (error) {
    console.error(`Failed to moderate review ${id}:`, error)
    throw error
  }
}

// حذف تقييم
export async function deleteReview(id: string): Promise<boolean> {
  try {
    const result = await sql`DELETE FROM reviews WHERE id = ${Number.parseInt(id)}`
    return result.count > 0
  } catch (error) {
    console.error(`Failed to delete review ${id}:`, error)
    throw error
  }
}
