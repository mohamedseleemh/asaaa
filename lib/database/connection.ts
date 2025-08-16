// تبسيط ملف الاتصال الرئيسي
import { neon } from "@neondatabase/serverless"
import { getDatabaseUrl, DATABASE_CONFIG } from "./config"
import { DatabaseMetrics } from "./metrics"
import type { HealthCheckResult } from "./types"

const POSTGRES_URL = getDatabaseUrl()

if (!POSTGRES_URL) {
  console.error("Missing required environment variable: POSTGRES_URL or DATABASE_URL")
}

export const sql = POSTGRES_URL ? neon(POSTGRES_URL, DATABASE_CONFIG) : null

export async function executeWithMetrics<T = any>(query: string, params: any[] = [], cacheKey?: string): Promise<T[]> {
  if (!sql) {
    throw new Error("Database connection not initialized")
  }

  const startTime = performance.now()
  const queryHash = query.substring(0, 50).replace(/\s+/g, " ").trim()

  try {
    DatabaseMetrics.incrementActiveConnections()

    const result = await sql(query, params)
    const duration = performance.now() - startTime

    DatabaseMetrics.recordQuery(queryHash, duration, true)
    DatabaseMetrics.decrementActiveConnections()

    return result as T[]
  } catch (error) {
    const duration = performance.now() - startTime

    DatabaseMetrics.decrementActiveConnections()
    DatabaseMetrics.recordFailedConnection()
    DatabaseMetrics.recordQuery(queryHash, duration, false)

    console.error(`❌ Query failed after ${duration.toFixed(2)}ms:`, queryHash, error)
    throw error
  }
}

export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  try {
    if (!sql) {
      throw new Error("Database not connected")
    }
    const result = await sql(query, params)
    return result as T[]
  } catch (error) {
    console.error("Query execution failed:", error)
    throw error
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    if (!sql) {
      console.error("Database connection not initialized - missing POSTGRES_URL")
      return false
    }
    await sql`SELECT 1`
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

export async function checkConnectionHealth(): Promise<HealthCheckResult> {
  const startTime = performance.now()

  try {
    if (!sql) {
      return {
        isHealthy: false,
        latency: -1,
        poolStats: DatabaseMetrics.getMetrics().connectionPool,
        lastCheck: new Date().toISOString(),
      }
    }

    await sql`SELECT 1 as health_check`
    const latency = performance.now() - startTime

    DatabaseMetrics.updateHealthCheck()

    return {
      isHealthy: true,
      latency,
      poolStats: DatabaseMetrics.getMetrics().connectionPool,
      lastCheck: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Health check failed:", error)
    return {
      isHealthy: false,
      latency: performance.now() - startTime,
      poolStats: DatabaseMetrics.getMetrics().connectionPool,
      lastCheck: new Date().toISOString(),
    }
  }
}

export async function checkDatabaseSchema(): Promise<{ isValid: boolean; missingTables: string[]; errors: string[] }> {
  try {
    if (!sql) {
      return {
        isValid: false,
        missingTables: [],
        errors: ["Database connection not initialized"],
      }
    }

    const requiredTables = [
      "users",
      "user_sessions",
      "content_blocks",
      "reviews",
      "analytics_events",
      "settings",
      "audit_logs",
    ]

    const existingTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `

    const existingTableNames = existingTables.map((t) => t.table_name)
    const missingTables = requiredTables.filter((table) => !existingTableNames.includes(table))

    return {
      isValid: missingTables.length === 0,
      missingTables,
      errors: [],
    }
  } catch (error) {
    console.error("Schema validation failed:", error)
    return {
      isValid: false,
      missingTables: [],
      errors: [(error as Error).message],
    }
  }
}

export async function runMaintenanceJobs(): Promise<{ completed: string[]; failed: string[]; duration: number }> {
  const startTime = performance.now()
  const completed: string[] = []
  const failed: string[] = []

  try {
    if (!sql) {
      failed.push("Database connection not available")
      return { completed, failed, duration: 0 }
    }

    // Clean old sessions
    try {
      await sql`DELETE FROM user_sessions WHERE expires_at < NOW()`
      completed.push("Cleaned expired sessions")
    } catch (error) {
      failed.push(`Session cleanup failed: ${(error as Error).message}`)
    }

    // Clean old audit logs (keep last 30 days)
    try {
      await sql`DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '30 days'`
      completed.push("Cleaned old audit logs")
    } catch (error) {
      failed.push(`Audit log cleanup failed: ${(error as Error).message}`)
    }

    // Update analytics aggregations
    try {
      await sql`
        INSERT INTO analytics_daily_stats (date, page_views, unique_visitors)
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as page_views,
          COUNT(DISTINCT ip_address) as unique_visitors
        FROM analytics_events 
        WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
        AND event_type = 'page_view'
        ON CONFLICT (date) DO UPDATE SET
          page_views = EXCLUDED.page_views,
          unique_visitors = EXCLUDED.unique_visitors
      `
      completed.push("Updated analytics aggregations")
    } catch (error) {
      failed.push(`Analytics update failed: ${(error as Error).message}`)
    }

    // Vacuum analyze for performance
    try {
      await sql`VACUUM ANALYZE`
      completed.push("Database vacuum completed")
    } catch (error) {
      failed.push(`Database vacuum failed: ${(error as Error).message}`)
    }
  } catch (error) {
    failed.push(`Maintenance job failed: ${(error as Error).message}`)
  }

  const duration = performance.now() - startTime
  return { completed, failed, duration }
}

export async function getQueryMetrics(): Promise<{
  totalQueries: number
  averageLatency: number
  errorRate: number
  activeConnections: number
  slowQueries: Array<{ query: string; avgDuration: number; count: number }>
}> {
  try {
    const metrics = DatabaseMetrics.getMetrics()

    return {
      totalQueries: metrics.queries.total,
      averageLatency: metrics.queries.averageLatency,
      errorRate: metrics.queries.errorRate,
      activeConnections: metrics.connectionPool.active,
      slowQueries: metrics.queries.slowQueries || [],
    }
  } catch (error) {
    console.error("Failed to get query metrics:", error)
    return {
      totalQueries: 0,
      averageLatency: 0,
      errorRate: 0,
      activeConnections: 0,
      slowQueries: [],
    }
  }
}

// إعادة تصدير الوظائف من الملفات المنفصلة
export { getSystemStats, performCleanup, getPublishedContent } from "./queries"
export { validateDatabaseSchema, createMissingTables } from "./schema-validator"
export { DatabaseMetrics } from "./metrics"
