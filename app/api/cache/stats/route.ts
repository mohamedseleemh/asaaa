import { type NextRequest, NextResponse } from "next/server"
import { apiCache, contentCache, userCache } from "@/lib/cache/cache-manager"
import { compressionManager } from "@/lib/cache/compression"
import { getQueryMetrics } from "@/lib/database/connection"
import { verifySession } from "@/lib/security/auth"

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    if (!verifySession(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const stats = {
      caches: {
        api: apiCache.getStats(),
        content: contentCache.getStats(),
        user: userCache.getStats(),
      },
      compression: compressionManager.getCacheStats(),
      database: {
        queryMetrics: getQueryMetrics().slice(0, 10), // Top 10 slowest queries
      },
      system: {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
    }

    return NextResponse.json(stats, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Cache stats API error:", error)
    return NextResponse.json({ error: "Failed to fetch cache stats" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin access
    if (!verifySession(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const cacheType = searchParams.get("cache")
    const tag = searchParams.get("tag")
    const pattern = searchParams.get("pattern")

    let cleared = 0

    if (cacheType === "all") {
      apiCache.clear()
      contentCache.clear()
      userCache.clear()
      cleared = 3
    } else if (cacheType === "api") {
      if (tag) {
        cleared = apiCache.invalidateByTag(tag)
      } else if (pattern) {
        cleared = apiCache.invalidateByPattern(new RegExp(pattern))
      } else {
        apiCache.clear()
        cleared = 1
      }
    } else if (cacheType === "content") {
      contentCache.clear()
      cleared = 1
    } else if (cacheType === "user") {
      userCache.clear()
      cleared = 1
    }

    return NextResponse.json({
      success: true,
      message: `Cleared ${cleared} cache(s)`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cache clear API error:", error)
    return NextResponse.json({ error: "Failed to clear cache" }, { status: 500 })
  }
}
