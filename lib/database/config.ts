// فصل إعدادات قاعدة البيانات
import type { DatabaseConfig } from "./types"

export const DATABASE_CONFIG: DatabaseConfig = {
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  maxUses: 7500,
  fetchConnectionCache: true,
  fullResults: false,
  arrayMode: false,
  pipelineConnect: true,
}

export const REQUIRED_TABLES = [
  "settings",
  "users",
  "sessions",
  "analytics_daily",
  "audit_logs",
  "rate_limits",
  "reviews",
  "review_stats",
  "content_snapshots",
  "content_publish_history",
  "user_sessions",
  "published_content",
  "content_versions",
] as const

export const CLEANUP_INTERVALS = {
  EXPIRED_SESSIONS: "1 day",
  OLD_RATE_LIMITS: "2 hours",
  OLD_AUDIT_LOGS: "90 days",
  OLD_ANALYTICS: "365 days",
} as const

export function getDatabaseUrl(): string | null {
  return process.env.POSTGRES_URL || process.env.DATABASE_URL || null
}

export function validateDatabaseConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  const url = getDatabaseUrl()

  if (!url) {
    errors.push("Missing required environment variable: POSTGRES_URL or DATABASE_URL")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
