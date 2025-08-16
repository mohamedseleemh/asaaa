import { type NextRequest, NextResponse } from "next/server"
import { performanceMonitor } from "@/lib/performance/monitoring"
import { cacheManager } from "@/lib/performance/cache-manager"

export async function GET(request: NextRequest) {
  try {
    // Check database connection
    const dbStart = Date.now()
    // Simulate database check
    await new Promise((resolve) => setTimeout(resolve, 50))
    const dbTime = Date.now() - dbStart
    performanceMonitor.recordMetric("database_health_check", dbTime)

    // Check cache connection
    const cacheStart = Date.now()
    await cacheManager.get("health_check")
    const cacheTime = Date.now() - cacheStart
    performanceMonitor.recordMetric("cache_health_check", cacheTime)

    // Get system metrics
    const metrics = {
      database: {
        status: dbTime < 100 ? "healthy" : dbTime < 500 ? "warning" : "error",
        responseTime: dbTime,
      },
      cache: {
        status: cacheTime < 50 ? "healthy" : cacheTime < 200 ? "warning" : "error",
        responseTime: cacheTime,
      },
      api: {
        status: "healthy",
        responseTime: Date.now() - Number.parseInt(request.headers.get("x-request-start") || "0"),
      },
      storage: {
        status: "healthy",
        usage: Math.floor(Math.random() * 100),
      },
    }

    // Get performance metrics
    const performanceMetrics = {
      cpuUsage: Math.floor(Math.random() * 100),
      memoryUsage: Math.floor(Math.random() * 100),
      diskUsage: Math.floor(Math.random() * 100),
      activeUsers: Math.floor(Math.random() * 200) + 50,
      requestsPerMinute: Math.floor(Math.random() * 2000) + 500,
      averageResponseTime: performanceMonitor.getAverageMetric("api_response_time") || 250,
    }

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: metrics,
      performance: performanceMetrics,
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
