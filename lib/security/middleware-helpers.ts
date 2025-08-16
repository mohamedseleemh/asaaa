import { type NextRequest, NextResponse } from "next/server"
import { checkRateLimit, RATE_LIMITS } from "./rate-limiter"

export async function applyRateLimit(
  request: NextRequest,
  identifier: string,
  limitType: keyof typeof RATE_LIMITS = "API",
): Promise<NextResponse | null> {
  const rateLimitConfig = RATE_LIMITS[limitType]
  const result = await checkRateLimit(identifier, rateLimitConfig)

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": result.remaining.toString(),
          "X-RateLimit-Reset": result.resetTime.toString(),
          "Retry-After": result.retryAfter?.toString() || "60",
        },
      },
    )
  }

  // Add rate limit headers to successful responses
  const response = NextResponse.next()
  response.headers.set("X-RateLimit-Limit", result.limit.toString())
  response.headers.set("X-RateLimit-Remaining", result.remaining.toString())
  response.headers.set("X-RateLimit-Reset", result.resetTime.toString())

  return null // Continue with the request
}

export function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from session/token first
  const userId = request.headers.get("x-user-id")
  if (userId) return `user:${userId}`

  // Fall back to IP address
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : request.ip || "unknown"
  return `ip:${ip}`
}
