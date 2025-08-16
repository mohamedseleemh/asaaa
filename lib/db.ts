import { neon } from "@neondatabase/serverless"

const POSTGRES_URL = process.env.POSTGRES_URL || process.env.DATABASE_URL
if (!POSTGRES_URL) {
  console.error("Missing required environment variable: POSTGRES_URL or DATABASE_URL")
}

export const sql = POSTGRES_URL
  ? neon(POSTGRES_URL, {
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      maxUses: 7500,
      fetchConnectionCache: true,
      fullResults: false,
      arrayMode: false,
    })
  : null

export async function executeWithMetrics<T = any>(query: string, params: any[] = []): Promise<T[]> {
  if (!sql) {
    throw new Error("Database not connected")
  }

  const startTime = performance.now()
  try {
    const result = await sql(query, params)
    const duration = performance.now() - startTime

    // Only log slow queries in development
    if (duration > 100 && process.env.NODE_ENV === "development") {
      console.warn(`Slow query detected (${duration.toFixed(2)}ms):`, query.substring(0, 100))
    }

    return result as T[]
  } catch (error) {
    const duration = performance.now() - startTime
    console.error(`Query failed after ${duration.toFixed(2)}ms:`, error)
    throw error
  }
}
