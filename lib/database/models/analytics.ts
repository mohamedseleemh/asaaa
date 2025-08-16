import { sql } from "../connection"

export interface AnalyticsData {
  day: string
  visitors: number
  leads: number
  orders: number
  conversion_rate: number
}

export interface AnalyticsSummary {
  total_visitors: number
  total_leads: number
  total_orders: number
  avg_conversion_rate: number
  period_days: number
}

class AnalyticsCache {
  private cache = new Map<string, { data: any; timestamp: number; hits: number }>()
  private readonly ttl = 10 * 60 * 1000 // 10 minutes
  private readonly maxSize = 500

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item || Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    item.hits++
    return item.data as T
  }

  set(key: string, data: any): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entries
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      for (let i = 0; i < Math.floor(this.maxSize * 0.2); i++) {
        this.cache.delete(entries[i][0])
      }
    }
    this.cache.set(key, { data, timestamp: Date.now(), hits: 0 })
  }

  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  clear(): void {
    this.cache.clear()
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        age: Date.now() - value.timestamp,
        hits: value.hits,
      })),
    }
  }
}

const analyticsCache = new AnalyticsCache()

export async function getAnalyticsData(days = 14): Promise<AnalyticsData[]> {
  try {
    const cacheKey = `analytics:${days}`
    const cached = analyticsCache.get<AnalyticsData[]>(cacheKey)
    if (cached) {
      return cached
    }

    const maxDays = Math.min(days, 365) // Prevent excessive queries

    const data = await sql<AnalyticsData[]>`
      SELECT 
        day::text, 
        visitors, 
        leads, 
        orders, 
        conversion_rate
      FROM analytics_daily
      WHERE day >= CURRENT_DATE - INTERVAL '${maxDays} days'
      ORDER BY day ASC
    `

    analyticsCache.set(cacheKey, data)
    return data
  } catch (error) {
    console.error("Failed to get analytics data:", error)
    throw error
  }
}

export async function getAnalyticsSummary(days = 30): Promise<AnalyticsSummary> {
  try {
    const cacheKey = `summary:${days}`
    const cached = analyticsCache.get<AnalyticsSummary>(cacheKey)
    if (cached) {
      return cached
    }

    const maxDays = Math.min(days, 365)

    const result = await sql<[AnalyticsSummary]>`
      SELECT 
        COALESCE(SUM(visitors), 0)::int as total_visitors,
        COALESCE(SUM(leads), 0)::int as total_leads,
        COALESCE(SUM(orders), 0)::int as total_orders,
        COALESCE(ROUND(AVG(conversion_rate), 2), 0)::numeric(5,2) as avg_conversion_rate,
        COUNT(*)::int as period_days
      FROM analytics_daily
      WHERE day >= CURRENT_DATE - INTERVAL '${maxDays} days'
    `

    const summary = result[0] || {
      total_visitors: 0,
      total_leads: 0,
      total_orders: 0,
      avg_conversion_rate: 0,
      period_days: 0,
    }

    analyticsCache.set(cacheKey, summary)
    return summary
  } catch (error) {
    console.error("Failed to get analytics summary:", error)
    throw error
  }
}

export async function addAnalyticsData(data: Omit<AnalyticsData, "day"> & { day?: string }): Promise<void> {
  try {
    const day = data.day || new Date().toISOString().split("T")[0]

    await sql`
      INSERT INTO analytics_daily (day, visitors, leads, orders, conversion_rate, updated_at)
      VALUES (${day}, ${data.visitors}, ${data.leads}, ${data.orders}, ${data.conversion_rate}, NOW())
      ON CONFLICT (day) 
      DO UPDATE SET
        visitors = EXCLUDED.visitors,
        leads = EXCLUDED.leads,
        orders = EXCLUDED.orders,
        conversion_rate = EXCLUDED.conversion_rate,
        updated_at = NOW()
    `

    // Invalidate related caches
    analyticsCache.invalidatePattern("analytics:")
    analyticsCache.invalidatePattern("summary:")
  } catch (error) {
    console.error("Failed to add analytics data:", error)
    throw error
  }
}

export async function generateTestAnalytics(days = 14): Promise<void> {
  try {
    const maxDays = Math.min(days, 90) // Prevent excessive generation
    const batchSize = 50
    const batches: string[][] = []
    let currentBatch: string[] = []

    for (let i = maxDays - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const day = date.toISOString().split("T")[0]

      const visitors = Math.floor(400 + Math.random() * 600)
      const leads = Math.floor(visitors * (0.04 + Math.random() * 0.03))
      const orders = Math.floor(leads * (0.35 + Math.random() * 0.15))
      const conversion_rate = Number.parseFloat(((orders / visitors) * 100).toFixed(2))

      currentBatch.push(`('${day}', ${visitors}, ${leads}, ${orders}, ${conversion_rate}, NOW())`)

      if (currentBatch.length >= batchSize || i === 0) {
        batches.push([...currentBatch])
        currentBatch = []
      }
    }

    // Process batches sequentially to avoid overwhelming the database
    for (const batch of batches) {
      await sql`
        INSERT INTO analytics_daily (day, visitors, leads, orders, conversion_rate, updated_at)
        VALUES ${sql.unsafe(batch.join(","))}
        ON CONFLICT (day) DO NOTHING
      `
    }

    // Clear caches after generation
    analyticsCache.clear()
  } catch (error) {
    console.error("Failed to generate test analytics:", error)
    throw error
  }
}

export async function getAnalyticsPerformanceStats() {
  try {
    const stats = await sql`
      SELECT 
        COUNT(*) as total_records,
        MIN(day) as earliest_date,
        MAX(day) as latest_date,
        AVG(visitors) as avg_daily_visitors,
        MAX(visitors) as peak_visitors
      FROM analytics_daily
    `

    return {
      ...stats[0],
      cache_stats: analyticsCache.getStats(),
    }
  } catch (error) {
    console.error("Failed to get analytics performance stats:", error)
    return null
  }
}

export { analyticsCache }
