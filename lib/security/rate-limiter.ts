import { sql } from "@/lib/database/connection"
import { createHash } from "crypto"

interface RateLimitConfig {
  windowMs: number // نافذة زمنية بالميلي ثانية
  maxRequests: number // أقصى عدد طلبات
  keyGenerator?: (req: Request) => string // دالة لتوليد المفتاح
  skipSuccessfulRequests?: boolean // تجاهل الطلبات الناجحة
  skipFailedRequests?: boolean // تجاهل الطلبات الفاشلة
}

export const RATE_LIMITS = {
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    maxRequests: 5, // 5 محاولات تسجيل دخول
    skipSuccessfulRequests: true,
  },
  API: {
    windowMs: 60 * 1000, // دقيقة واحدة
    maxRequests: 100, // 100 طلب
  },
  CONTACT: {
    windowMs: 60 * 60 * 1000, // ساعة واحدة
    maxRequests: 3, // 3 رسائل
  },
  ADMIN: {
    windowMs: 5 * 60 * 1000, // 5 دقائق
    maxRequests: 20, // 20 طلب إداري
  },
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // ساعة واحدة
    maxRequests: 10, // 10 رفع ملف
  },
} as const

const defaultConfigs: Record<string, RateLimitConfig> = {
  auth: RATE_LIMITS.AUTH,
  api: RATE_LIMITS.API,
  contact: RATE_LIMITS.CONTACT,
  admin: RATE_LIMITS.ADMIN,
  upload: RATE_LIMITS.UPLOAD,
}

export function createRateLimitMiddleware(type: keyof typeof defaultConfigs) {
  const config = defaultConfigs[type]

  return async (req: Request): Promise<Response | null> => {
    try {
      const key = generateRateLimitKey(req, type)
      const now = new Date()
      const windowStart = new Date(now.getTime() - config.windowMs)

      if (await isWhitelisted(req)) {
        return null // Allow whitelisted IPs
      }

      const suspiciousActivity = await detectSuspiciousActivity(key, type)
      if (suspiciousActivity) {
        await logSecurityEvent("suspicious_activity_detected", {
          key,
          type,
          pattern: suspiciousActivity,
          ip: getClientIP(req),
        })

        return createRateLimitResponse(
          "Suspicious activity detected",
          config.windowMs * 2, // Double the penalty
          429,
        )
      }

      // حذف الطلبات القديمة
      await sql`
        DELETE FROM rate_limits 
        WHERE key = ${key} AND created_at < ${windowStart.toISOString()}
      `

      // عد الطلبات الحالية
      const currentRequests = await sql`
        SELECT COUNT(*) as count, MAX(created_at) as last_request
        FROM rate_limits 
        WHERE key = ${key} AND created_at >= ${windowStart.toISOString()}
      `

      const requestCount = Number.parseInt(currentRequests[0].count)
      const lastRequest = currentRequests[0].last_request

      if (requestCount >= config.maxRequests) {
        const penaltyMultiplier = Math.min(Math.floor(requestCount / config.maxRequests), 5)
        const penaltyTime = config.windowMs * penaltyMultiplier

        await logSecurityEvent("rate_limit_exceeded", {
          key,
          type,
          requestCount,
          maxRequests: config.maxRequests,
          penaltyMultiplier,
          ip: getClientIP(req),
        })

        return createRateLimitResponse("تم تجاوز الحد المسموح من الطلبات", Math.ceil(penaltyTime / 1000), 429)
      }

      if (lastRequest) {
        const timeSinceLastRequest = now.getTime() - new Date(lastRequest).getTime()
        if (timeSinceLastRequest < 100) {
          // Less than 100ms between requests
          await logSecurityEvent("rapid_fire_detected", {
            key,
            type,
            timeBetweenRequests: timeSinceLastRequest,
            ip: getClientIP(req),
          })

          return createRateLimitResponse(
            "Requests too frequent",
            60, // 1 minute penalty
            429,
          )
        }
      }

      // تسجيل الطلب الحالي
      await sql`
        INSERT INTO rate_limits (key, type, created_at, ip_address, user_agent)
        VALUES (${key}, ${type}, ${now.toISOString()}, ${getClientIP(req)}, ${req.headers.get("user-agent") || "unknown"})
      `

      return null // السماح بالطلب
    } catch (error) {
      console.error("Rate limiting error:", error)
      return null // السماح بالطلب في حالة الخطأ
    }
  }
}

function generateRateLimitKey(req: Request, type: string): string {
  const ip = getClientIP(req)
  const userAgent = req.headers.get("user-agent") || "unknown"
  const acceptLanguage = req.headers.get("accept-language") || "unknown"

  // Create a more sophisticated fingerprint
  const fingerprint = createHash("sha256")
    .update(`${ip}:${userAgent.substring(0, 100)}:${acceptLanguage}`)
    .digest("hex")
    .substring(0, 16)

  return `${type}:${fingerprint}`
}

function getClientIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  )
}

async function isWhitelisted(req: Request): Promise<boolean> {
  const ip = getClientIP(req)

  try {
    const result = await sql`
      SELECT COUNT(*) as count 
      FROM ip_whitelist 
      WHERE ip_address = ${ip} AND is_active = true
    `
    return Number(result[0].count) > 0
  } catch (error) {
    console.error("Error checking whitelist:", error)
    return false
  }
}

async function detectSuspiciousActivity(key: string, type: string): Promise<string | null> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    const recentActivity = await sql`
      SELECT ip_address, COUNT(*) as count
      FROM rate_limits 
      WHERE key LIKE ${`${type}:%`} 
      AND created_at >= ${oneHourAgo.toISOString()}
      GROUP BY ip_address
      HAVING COUNT(*) > 100
    `

    if (recentActivity.length > 0) {
      return "distributed_attack"
    }

    const userAgentPattern = await sql`
      SELECT user_agent, COUNT(*) as count
      FROM rate_limits 
      WHERE key = ${key}
      AND created_at >= ${oneHourAgo.toISOString()}
      GROUP BY user_agent
      HAVING COUNT(*) > 50
    `

    if (userAgentPattern.length > 0) {
      const ua = userAgentPattern[0].user_agent
      if (!ua || ua.length < 10 || !/Mozilla|Chrome|Safari|Firefox/.test(ua)) {
        return "suspicious_user_agent"
      }
    }

    return null
  } catch (error) {
    console.error("Error detecting suspicious activity:", error)
    return null
  }
}

function createRateLimitResponse(message: string, retryAfter: number, status = 429): Response {
  return new Response(
    JSON.stringify({
      error: message,
      retryAfter,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": retryAfter.toString(),
        "X-RateLimit-Limit": "Exceeded",
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": new Date(Date.now() + retryAfter * 1000).toISOString(),
      },
    },
  )
}

async function logSecurityEvent(event: string, details: Record<string, any>): Promise<void> {
  try {
    await sql`
      INSERT INTO audit_logs (action, details, created_at, ip_address)
      VALUES (
        ${`rate_limit_${event}`},
        ${JSON.stringify(details)},
        NOW(),
        ${details.ip || null}
      )
    `
  } catch (error) {
    console.error("Failed to log security event:", error)
  }
}

export async function cleanupRateLimits(): Promise<void> {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const result = await sql`
      DELETE FROM rate_limits 
      WHERE created_at < ${oneDayAgo.toISOString()}
    `

    console.log(`Cleaned up ${result.length} old rate limit records`)
  } catch (error) {
    console.error("Error cleaning up rate limits:", error)
  }
}

export async function getRateLimitStatus(
  req: Request,
  type: keyof typeof defaultConfigs,
): Promise<{
  remaining: number
  resetTime: Date
  total: number
}> {
  const config = defaultConfigs[type]
  const key = generateRateLimitKey(req, type)
  const windowStart = new Date(Date.now() - config.windowMs)

  try {
    const currentRequests = await sql`
      SELECT COUNT(*) as count 
      FROM rate_limits 
      WHERE key = ${key} AND created_at >= ${windowStart.toISOString()}
    `

    const used = Number.parseInt(currentRequests[0].count)
    const remaining = Math.max(0, config.maxRequests - used)
    const resetTime = new Date(Date.now() + config.windowMs)

    return {
      remaining,
      resetTime,
      total: config.maxRequests,
    }
  } catch (error) {
    console.error("Error getting rate limit status:", error)
    return {
      remaining: config.maxRequests,
      resetTime: new Date(Date.now() + config.windowMs),
      total: config.maxRequests,
    }
  }
}

export async function checkRateLimit(
  identifier: string,
  config: { windowMs: number; maxRequests: number },
): Promise<{
  success: boolean
  limit: number
  remaining: number
  resetTime: number
  retryAfter?: number
}> {
  try {
    const now = new Date()
    const windowStart = new Date(now.getTime() - config.windowMs)
    const key = `rate_limit:${identifier}`

    // حذف الطلبات القديمة
    await sql`
      DELETE FROM rate_limits 
      WHERE key = ${key} AND created_at < ${windowStart.toISOString()}
    `

    // عد الطلبات الحالية
    const currentRequests = await sql`
      SELECT COUNT(*) as count
      FROM rate_limits 
      WHERE key = ${key} AND created_at >= ${windowStart.toISOString()}
    `

    const requestCount = Number.parseInt(currentRequests[0].count)
    const remaining = Math.max(0, config.maxRequests - requestCount)
    const resetTime = Math.ceil((now.getTime() + config.windowMs) / 1000)

    if (requestCount >= config.maxRequests) {
      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        resetTime,
        retryAfter: Math.ceil(config.windowMs / 1000),
      }
    }

    // تسجيل الطلب الحالي
    await sql`
      INSERT INTO rate_limits (key, type, created_at, ip_address)
      VALUES (${key}, 'api', ${now.toISOString()}, ${identifier})
    `

    return {
      success: true,
      limit: config.maxRequests,
      remaining: remaining - 1, // نقص واحد للطلب الحالي
      resetTime,
    }
  } catch (error) {
    console.error("Rate limit check error:", error)
    // في حالة الخطأ، نسمح بالطلب
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      resetTime: Math.ceil((Date.now() + config.windowMs) / 1000),
    }
  }
}
