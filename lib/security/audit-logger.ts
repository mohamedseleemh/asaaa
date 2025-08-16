// فصل تسجيل الأحداث الأمنية
import { sql } from "@/lib/database/connection"
import type { SecurityEvent } from "./types"

export async function logSecurityEvent(event: string, details: Record<string, any>): Promise<void> {
  try {
    await sql`
      INSERT INTO audit_logs (action, details, created_at, ip_address)
      VALUES (
        ${`security_${event}`},
        ${JSON.stringify(details)},
        NOW(),
        ${details.ipAddress || null}
      )
    `
  } catch (error) {
    console.error("Failed to log security event:", error)
  }
}

export async function getSecurityEvents(limit = 100): Promise<SecurityEvent[]> {
  try {
    const result = await sql`
      SELECT action, details, created_at, ip_address
      FROM audit_logs
      WHERE action LIKE 'security_%'
      ORDER BY created_at DESC
      LIMIT ${limit}
    `

    return result.map((row) => ({
      event: row.action.replace("security_", ""),
      details: typeof row.details === "string" ? JSON.parse(row.details) : row.details,
      ipAddress: row.ip_address,
      timestamp: new Date(row.created_at),
    }))
  } catch (error) {
    console.error("Failed to get security events:", error)
    return []
  }
}

export async function getFailedLoginAttempts(timeframe = 24): Promise<any[]> {
  try {
    const result = await sql`
      SELECT 
        details->>'email' as email,
        details->>'ipAddress' as ip_address,
        COUNT(*) as attempts,
        MAX(created_at) as last_attempt
      FROM audit_logs
      WHERE action = 'security_failed_login'
      AND created_at > NOW() - INTERVAL '${timeframe} hours'
      GROUP BY details->>'email', details->>'ipAddress'
      ORDER BY attempts DESC, last_attempt DESC
    `

    return result
  } catch (error) {
    console.error("Failed to get failed login attempts:", error)
    return []
  }
}
