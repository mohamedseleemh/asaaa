// فصل إدارة الجلسات
import { sql } from "@/lib/database/connection"
import type { Session, User } from "./types"
import { generateSecureToken, createDeviceFingerprint, extractTokenFromRequest } from "./token"
import { logSecurityEvent } from "./audit-logger"

export async function createSession(userId: string, ipAddress?: string, userAgent?: string): Promise<Session> {
  const token = generateSecureToken()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 أيام

  const deviceFingerprint = createDeviceFingerprint(ipAddress, userAgent)

  try {
    // تنظيف الجلسات القديمة
    await sql`
      DELETE FROM user_sessions 
      WHERE user_id = ${userId} 
      AND created_at < NOW() - INTERVAL '30 days'
    `

    // التحقق من عدد الجلسات النشطة
    const activeSessions = await sql`
      SELECT COUNT(*) as count 
      FROM user_sessions 
      WHERE user_id = ${userId} AND expires_at > NOW()
    `

    if (Number(activeSessions[0].count) >= 5) {
      await sql`
        DELETE FROM user_sessions 
        WHERE user_id = ${userId} 
        AND token = (
          SELECT token FROM user_sessions 
          WHERE user_id = ${userId} 
          ORDER BY created_at ASC 
          LIMIT 1
        )
      `
    }

    await sql`
      INSERT INTO user_sessions (user_id, token, expires_at, ip_address, user_agent, device_fingerprint, created_at)
      VALUES (${userId}, ${token}, ${expiresAt.toISOString()}, ${ipAddress}, ${userAgent}, ${deviceFingerprint}, NOW())
    `

    await logSecurityEvent("session_created", { userId, ipAddress, deviceFingerprint })

    return {
      id: token,
      userId,
      token,
      expiresAt,
      ipAddress,
      userAgent,
      isActive: true,
    }
  } catch (error) {
    console.error("Error creating session:", error)
    throw new Error("Failed to create session")
  }
}

export async function verifySession(req: Request): Promise<{ user: User; session: Session } | null> {
  try {
    const token = extractTokenFromRequest(req)
    if (!token) {
      return null
    }

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip")
    const userAgent = req.headers.get("user-agent")
    const currentFingerprint = createDeviceFingerprint(ipAddress, userAgent)

    const result = await sql`
      SELECT 
        s.user_id,
        s.token,
        s.expires_at,
        s.ip_address,
        s.user_agent,
        s.device_fingerprint,
        s.created_at,
        u.id::text as user_id,
        u.name,
        u.email,
        u.role,
        u.active,
        u.last_login_at
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id::text
      WHERE s.token = ${token} AND s.expires_at > NOW() AND u.active = true
    `

    if (result.length === 0) {
      await logSecurityEvent("invalid_session", { token: token.substring(0, 8) + "...", ipAddress })
      return null
    }

    const row = result[0]

    if (row.device_fingerprint && row.device_fingerprint !== currentFingerprint) {
      await logSecurityEvent("session_fingerprint_mismatch", {
        userId: row.user_id,
        ipAddress,
        storedFingerprint: row.device_fingerprint,
        currentFingerprint,
      })
    }

    await sql`
      UPDATE user_sessions 
      SET last_activity = NOW() 
      WHERE token = ${token}
    `

    return {
      user: {
        id: row.user_id,
        name: row.name,
        email: row.email,
        role: row.role as "admin" | "editor" | "viewer",
        active: row.active,
        lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
      },
      session: {
        id: row.token,
        userId: row.user_id,
        token: row.token,
        expiresAt: new Date(row.expires_at),
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        isActive: true,
      },
    }
  } catch (error) {
    console.error("Error verifying session:", error)
    return null
  }
}

export async function deleteSession(token: string, reason?: string): Promise<boolean> {
  try {
    const sessionInfo = await sql`
      SELECT user_id, ip_address 
      FROM user_sessions 
      WHERE token = ${token}
    `

    await sql`DELETE FROM user_sessions WHERE token = ${token}`

    if (sessionInfo.length > 0) {
      await logSecurityEvent("session_deleted", {
        userId: sessionInfo[0].user_id,
        reason: reason || "manual_logout",
        ipAddress: sessionInfo[0].ip_address,
      })
    }

    return true
  } catch (error) {
    console.error("Error deleting session:", error)
    return false
  }
}

export function createSessionCookie(token: string, expiresAt: Date): string {
  const isProduction = process.env.NODE_ENV === "production"
  const secureFlag = isProduction ? "Secure; " : ""

  return `session_token=${token}; Path=/; HttpOnly; ${secureFlag}SameSite=Strict; Expires=${expiresAt.toUTCString()}`
}

export function deleteSessionCookie(): string {
  const isProduction = process.env.NODE_ENV === "production"
  const secureFlag = isProduction ? "Secure; " : ""

  return `session_token=; Path=/; HttpOnly; ${secureFlag}SameSite=Strict; Max-Age=0`
}
