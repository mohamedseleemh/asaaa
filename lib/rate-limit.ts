interface RateLimitEntry {
  count: number
  resetTime: number
  firstRequest: number
}

class MemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup()
      },
      5 * 60 * 1000,
    )
  }

  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key)
        cleaned++
      }
    }

    // Only log cleanup in development mode
    if (cleaned > 0 && process.env.NODE_ENV === "development") {
      console.log(`Rate limiter cleaned up ${cleaned} expired entries`)
    }
  }

  async rateLimit(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<{
    success: boolean
    remaining: number
    resetTime: number
    totalHits: number
  }> {
    const now = Date.now()
    const windowStart = now - windowMs

    const current = this.store.get(key)

    if (!current || current.resetTime < now) {
      // First request or window expired
      const entry: RateLimitEntry = {
        count: 1,
        resetTime: now + windowMs,
        firstRequest: now,
      }
      this.store.set(key, entry)

      return {
        success: true,
        remaining: limit - 1,
        resetTime: entry.resetTime,
        totalHits: 1,
      }
    }

    if (current.count >= limit) {
      return {
        success: false,
        remaining: 0,
        resetTime: current.resetTime,
        totalHits: current.count,
      }
    }

    current.count++
    return {
      success: true,
      remaining: limit - current.count,
      resetTime: current.resetTime,
      totalHits: current.count,
    }
  }

  async getStatus(key: string): Promise<{
    remaining: number
    resetTime: number
    totalHits: number
  } | null> {
    const current = this.store.get(key)
    if (!current || current.resetTime < Date.now()) {
      return null
    }

    return {
      remaining: Math.max(0, 100 - current.count), // Assuming default limit of 100
      resetTime: current.resetTime,
      totalHits: current.count,
    }
  }

  async clear(key: string): Promise<void> {
    this.store.delete(key)
  }

  getStats(): { totalKeys: number; memoryUsage: number } {
    return {
      totalKeys: this.store.size,
      memoryUsage: JSON.stringify([...this.store.entries()]).length,
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.store.clear()
  }
}

const rateLimiter = new MemoryRateLimiter()

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ success: boolean; remaining: number }> {
  const result = await rateLimiter.rateLimit(key, limit, windowMs)
  return {
    success: result.success,
    remaining: result.remaining,
  }
}

export { rateLimiter }

process.on("SIGTERM", () => {
  rateLimiter.destroy()
})

process.on("SIGINT", () => {
  rateLimiter.destroy()
})
