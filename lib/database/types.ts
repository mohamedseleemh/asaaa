// تعريف أنواع البيانات لقاعدة البيانات
export interface DatabaseConfig {
  connectionTimeoutMillis: number
  idleTimeoutMillis: number
  maxUses: number
  fetchConnectionCache: boolean
  fullResults: boolean
  arrayMode: boolean
  pipelineConnect: boolean
}

export interface QueryMetrics {
  count: number
  totalTime: number
  avgTime: number
  lastExecuted: number
  errorCount: number
  errorRate?: number
}

export interface ConnectionPoolStats {
  activeConnections: number
  totalConnections: number
  failedConnections: number
  lastHealthCheck: number
}

export interface SystemStats {
  active_users: number
  approved_reviews: number
  published_content: number
  recent_analytics: number
  avg_rating: number
  active_sessions: number
  db_size: number
  timestamp: number
  pg_version: string
}

export interface CleanupResults {
  sessionsDeleted: number
  rateLimitsDeleted: number
  auditLogsDeleted: number
  analyticsArchived: number
}

export interface HealthCheckResult {
  isHealthy: boolean
  latency: number
  poolStats: ConnectionPoolStats
  lastCheck: string
}

export interface SchemaValidationResult {
  isValid: boolean
  missingTables: string[]
  errors: string[]
  warnings?: string[]
}

export interface MaintenanceJobResult {
  completed: string[]
  failed: string[]
  duration: number
  timestamp: Date
}

export interface DatabaseMetricsSnapshot {
  queries: {
    total: number
    successful: number
    failed: number
    averageLatency: number
    errorRate: number
    slowQueries: Array<{ query: string; avgDuration: number; count: number }>
  }
  connectionPool: ConnectionPoolStats
  lastUpdated: Date
}
