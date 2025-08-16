import { sql } from "@/lib/database/connection"

/**
 * التأكد من وجود جدول المراجعات وإنشاؤه إذا لم يكن موجوداً
 */
export async function ensureReviewsSchema() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        service VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        verified BOOLEAN DEFAULT false,
        ip_address INET,
        user_agent TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        locale VARCHAR(10) DEFAULT 'en',
        metadata JSONB DEFAULT '{}'::jsonb
      )
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_reviews_verified ON reviews(verified)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_reviews_locale ON reviews(locale)
    `

    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `

    await sql`
      DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews
    `

    await sql`
      CREATE TRIGGER update_reviews_updated_at
        BEFORE UPDATE ON reviews
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `

    return { success: true }
  } catch (error) {
    console.error("Error ensuring reviews schema:", error)
    return { success: false, error }
  }
}

/**
 * التحقق من صحة بيانات المراجعة مع دعم محسن للغة العربية
 */
export function validateReviewData(data: any) {
  const errors: string[] = []

  // التحقق من الاسم
  if (!data.name || typeof data.name !== "string") {
    errors.push("Name is required")
  } else if (data.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long")
  } else if (data.name.trim().length > 100) {
    errors.push("Name must be less than 100 characters")
  }

  // التحقق من التقييم
  if (!data.rating || typeof data.rating !== "number") {
    errors.push("Rating is required")
  } else if (data.rating < 1 || data.rating > 5) {
    errors.push("Rating must be between 1 and 5")
  }

  // التحقق من التعليق
  if (!data.comment || typeof data.comment !== "string") {
    errors.push("Comment is required")
  } else if (data.comment.trim().length < 10) {
    errors.push("Comment must be at least 10 characters long")
  } else if (data.comment.trim().length > 1000) {
    errors.push("Comment must be less than 1000 characters")
  }

  // التحقق من الخدمة
  if (!data.service || typeof data.service !== "string") {
    errors.push("Service is required")
  } else if (data.service.trim().length < 2) {
    errors.push("Service must be specified")
  } else if (data.service.trim().length > 100) {
    errors.push("Service name must be less than 100 characters")
  }

  // التحقق من اللغة (اختياري)
  if (data.locale && !["ar", "en"].includes(data.locale)) {
    errors.push("Locale must be either 'ar' or 'en'")
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: {
      name: data.name?.trim(),
      rating: Number(data.rating),
      comment: data.comment?.trim(),
      service: data.service?.trim(),
      locale: data.locale || "en",
    },
  }
}

/**
 * إحصائيات المراجعات
 */
export async function getReviewsStats() {
  try {
    const stats = await sql`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating)::numeric(3,2) as average_rating,
        COUNT(*) FILTER (WHERE verified = true) as verified_reviews,
        COUNT(*) FILTER (WHERE status = 'approved') as approved_reviews,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as recent_reviews
      FROM reviews
    `

    const ratingDistribution = await sql`
      SELECT 
        rating,
        COUNT(*) as count
      FROM reviews 
      WHERE status = 'approved'
      GROUP BY rating 
      ORDER BY rating DESC
    `

    return {
      success: true,
      stats: stats[0],
      ratingDistribution,
    }
  } catch (error) {
    console.error("Error getting reviews stats:", error)
    return { success: false, error }
  }
}
