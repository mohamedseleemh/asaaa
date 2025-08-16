import { NextResponse } from "next/server"
import { sql } from "@/lib/database/connection"

export async function GET() {
  try {
    // محاكاة تحليل المشاعر - في الإنتاج يمكن استخدام AI حقيقي
    const mockSentimentData = {
      positive: 75,
      neutral: 15,
      negative: 10,
      totalReviews: 150,
      trend: "up" as const,
      keywords: [
        { word: "ممتاز", sentiment: "positive" as const, count: 45 },
        { word: "سريع", sentiment: "positive" as const, count: 38 },
        { word: "موثوق", sentiment: "positive" as const, count: 32 },
        { word: "بطيء", sentiment: "negative" as const, count: 8 },
        { word: "مشكلة", sentiment: "negative" as const, count: 5 },
      ],
    }

    // في الإنتاج، يمكن تحليل المراجعات الفعلية
    if (sql) {
      try {
        const reviews = await sql`
          SELECT content, rating 
          FROM reviews 
          WHERE status = 'approved' 
          AND created_at >= NOW() - INTERVAL '30 days'
          LIMIT 100
        `

        if (reviews.length > 0) {
          // تحليل بسيط للمشاعر بناءً على التقييمات
          const positive = reviews.filter((r) => r.rating >= 4).length
          const neutral = reviews.filter((r) => r.rating === 3).length
          const negative = reviews.filter((r) => r.rating <= 2).length
          const total = reviews.length

          return NextResponse.json({
            positive: Math.round((positive / total) * 100),
            neutral: Math.round((neutral / total) * 100),
            negative: Math.round((negative / total) * 100),
            totalReviews: total,
            trend: positive > negative ? "up" : "down",
            keywords: mockSentimentData.keywords, // يمكن تحليل النصوص الفعلية هنا
          })
        }
      } catch (dbError) {
        console.error("Database sentiment analysis error:", dbError)
      }
    }

    return NextResponse.json(mockSentimentData)
  } catch (error) {
    console.error("Sentiment analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze sentiment" }, { status: 500 })
  }
}
