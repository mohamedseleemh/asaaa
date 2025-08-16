// فصل الاستعلامات المعقدة
import type { SystemStats, CleanupResults } from "./types"
import { executeWithMetrics } from "./connection"
import { CLEANUP_INTERVALS } from "./config"

export async function getSystemStats(): Promise<SystemStats | null> {
  try {
    const stats = await executeWithMetrics(
      `
      WITH RECURSIVE stats AS (
        SELECT 
          (SELECT COUNT(*) FROM users WHERE active = true) as active_users,
          (SELECT COUNT(*) FROM reviews WHERE status = 'approved') as approved_reviews,
          (SELECT COUNT(*) FROM content_snapshots WHERE is_published = true) as published_content,
          (SELECT COUNT(*) FROM analytics_daily WHERE day >= CURRENT_DATE - INTERVAL '30 days') as recent_analytics,
          (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE status = 'approved' AND rating IS NOT NULL) as avg_rating,
          (SELECT COUNT(*) FROM sessions WHERE expires_at > NOW()) as active_sessions,
          (SELECT pg_database_size(current_database())) as db_size
      )
      SELECT *, 
        EXTRACT(EPOCH FROM NOW()) as timestamp,
        version() as pg_version
      FROM stats
    `,
      [],
      "system_stats_enhanced",
    )

    return stats[0] || null
  } catch (error) {
    console.error("Failed to get system stats:", error)
    return null
  }
}

export async function cleanupExpiredSessions(): Promise<number> {
  const result = await executeWithMetrics(
    `WITH deleted AS (DELETE FROM sessions WHERE expires_at < NOW() - INTERVAL '${CLEANUP_INTERVALS.EXPIRED_SESSIONS}' RETURNING id) SELECT COUNT(*) as count FROM deleted`,
    [],
    "cleanup_sessions",
  )
  return result[0]?.count || 0
}

export async function cleanupOldRateLimits(): Promise<number> {
  const result = await executeWithMetrics(
    `WITH deleted AS (DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '${CLEANUP_INTERVALS.OLD_RATE_LIMITS}' RETURNING id) SELECT COUNT(*) as count FROM deleted`,
    [],
    "cleanup_rate_limits",
  )
  return result[0]?.count || 0
}

export async function cleanupOldAuditLogs(): Promise<number> {
  const result = await executeWithMetrics(
    `WITH deleted AS (DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '${CLEANUP_INTERVALS.OLD_AUDIT_LOGS}' RETURNING id) SELECT COUNT(*) as count FROM deleted`,
    [],
    "cleanup_audit_logs",
  )
  return result[0]?.count || 0
}

export async function archiveOldAnalytics(): Promise<number> {
  const result = await executeWithMetrics(
    `WITH archived AS (
      UPDATE analytics_daily 
      SET archived = true 
      WHERE day < CURRENT_DATE - INTERVAL '${CLEANUP_INTERVALS.OLD_ANALYTICS}' 
      AND archived = false 
      RETURNING id
    ) SELECT COUNT(*) as count FROM archived`,
    [],
    "archive_old_analytics",
  )
  return result[0]?.count || 0
}

export async function performCleanup(): Promise<CleanupResults> {
  const [sessionsDeleted, rateLimitsDeleted, auditLogsDeleted, analyticsArchived] = await Promise.all([
    cleanupExpiredSessions(),
    cleanupOldRateLimits(),
    cleanupOldAuditLogs(),
    archiveOldAnalytics(),
  ])

  return {
    sessionsDeleted,
    rateLimitsDeleted,
    auditLogsDeleted,
    analyticsArchived,
  }
}

export async function getPublishedContent(): Promise<Record<string, any> | null> {
  try {
    const content = await executeWithMetrics(
      `
      SELECT locale, content, design, published_at
      FROM content_snapshots 
      WHERE is_published = true 
      ORDER BY published_at DESC
    `,
      [],
      "published_content",
    )

    const result: any = {}
    for (const row of content) {
      result[row.locale] = {
        content: row.content,
        design: row.design,
        published_at: row.published_at,
      }
    }

    return result
  } catch (error) {
    console.error("Failed to get published content:", error)
    return null
  }
}
