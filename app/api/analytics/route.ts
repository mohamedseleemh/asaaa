import { getAnalyticsData, generateTestAnalytics } from "@/lib/database/models/analytics"
import { verifySession } from "@/lib/security/auth"
import { createRateLimitMiddleware } from "@/lib/security/rate-limiter"
import { apiCache } from "@/lib/cache/cache-manager"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const days = Math.min(90, Math.max(1, Number.parseInt(searchParams.get("days") || "14")))

    const cacheKey = `analytics_${days}_${Math.floor(Date.now() / (5 * 60 * 1000))}`

    // Try to get from cache first
    let data = apiCache.get(cacheKey)

    if (!data) {
      data = await getAnalyticsData(days)
      apiCache.set(cacheKey, data, 5 * 60 * 1000, ["analytics", `days_${days}`])
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=60",
        ETag: `"${cacheKey}"`,
        Vary: "Accept-Encoding",
      },
    })
  } catch (error) {
    console.error("Get analytics API error:", error)
    return new Response(JSON.stringify({ error: "حدث خطأ في جلب البيانات التحليلية" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function POST(req: Request) {
  const sessionCacheKey = `session_${req.headers.get("authorization") || "anonymous"}`
  let isAuthorized = apiCache.get(sessionCacheKey)

  if (isAuthorized === null) {
    isAuthorized = verifySession(req)
    apiCache.set(sessionCacheKey, isAuthorized, 60 * 1000, ["sessions"]) // 1 minute cache
  }

  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: "غير مصرح بالوصول" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  const rateLimitResponse = await createRateLimitMiddleware("admin")(req)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { days } = await req.json()
    const daysToGenerate = Math.min(30, Math.max(1, Number.parseInt(days) || 14))

    await generateTestAnalytics(daysToGenerate)

    apiCache.invalidateByTag("analytics")

    return new Response(
      JSON.stringify({
        success: true,
        message: `تم توليد بيانات تحليلية لـ ${daysToGenerate} يوم`,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    )
  } catch (error) {
    console.error("Generate analytics API error:", error)
    return new Response(JSON.stringify({ error: "حدث خطأ في توليد البيانات التحليلية" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
