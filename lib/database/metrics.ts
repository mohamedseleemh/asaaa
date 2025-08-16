// فصل مقاييس الأداء
import type { QueryMetrics, ConnectionPoolStats } from "./types"

export class DatabaseMetrics {
  private static queryMetrics = new Map<string, QueryMetrics>()
  private static connectionPoolStats: ConnectionPoolStats = {
    activeConnections: 0,
    totalConnections: 0,
    failedConnections: 0,
    lastHealthCheck: Date.now(),
  }

  static recordQuery(queryHash: string, duration: number, success: boolean): void {
    const existing = this.queryMetrics.get(queryHash) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      lastExecuted: 0,
      errorCount: 0,
    }

    existing.count++
    existing.totalTime += duration
    existing.avgTime = existing.totalTime / existing.count
    existing.lastExecuted = Date.now()

    if (!success) {
      existing.errorCount++
    }

    this.queryMetrics.set(queryHash, existing)

    // Log slow queries
    if (duration > 500) {
      console.warn(
        `🐌 Slow query detected (${duration.toFixed(2)}ms, avg: ${existing.avgTime.toFixed(2)}ms, count: ${existing.count}):`,
        queryHash,
      )
    }
  }

  static incrementActiveConnections(): void {
    this.connectionPoolStats.activeConnections++
    this.connectionPoolStats.totalConnections++
  }

  static decrementActiveConnections(): void {
    this.connectionPoolStats.activeConnections--
  }

  static recordFailedConnection(): void {
    this.connectionPoolStats.failedConnections++
  }

  static updateHealthCheck(): void {
    this.connectionPoolStats.lastHealthCheck = Date.now()
  }

  static getMetrics() {
    return {
      queries: Array.from(this.queryMetrics.entries())
        .map(([query, metrics]) => ({
          query,
          ...metrics,
          errorRate: metrics.count > 0 ? metrics.errorCount / metrics.count : 0,
        }))
        .sort((a, b) => b.avgTime - a.avgTime),
      connectionPool: { ...this.connectionPoolStats },
    }
  }

  static reset(): void {
    this.queryMetrics.clear()
    this.connectionPoolStats = {
      activeConnections: 0,
      totalConnections: 0,
      failedConnections: 0,
      lastHealthCheck: Date.now(),
    }
  }
}
