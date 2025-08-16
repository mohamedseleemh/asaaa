import { Redis } from "@upstash/redis"

interface CacheOptions {
  ttl?: number
  tags?: string[]
}

class CacheManager {
  private redis: Redis
  private defaultTTL = 3600 // 1 hour

  constructor() {
    this.redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key)
      return data as T
    } catch (error) {
      console.error("Cache get error:", error)
      return null
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      const ttl = options.ttl || this.defaultTTL
      await this.redis.setex(key, ttl, JSON.stringify(value))

      // Store tags for cache invalidation
      if (options.tags) {
        for (const tag of options.tags) {
          await this.redis.sadd(`tag:${tag}`, key)
        }
      }
    } catch (error) {
      console.error("Cache set error:", error)
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    try {
      const keys = await this.redis.smembers(`tag:${tag}`)
      if (keys.length > 0) {
        await this.redis.del(...keys)
        await this.redis.del(`tag:${tag}`)
      }
    } catch (error) {
      console.error("Cache invalidation error:", error)
    }
  }

  async clear(): Promise<void> {
    try {
      await this.redis.flushall()
    } catch (error) {
      console.error("Cache clear error:", error)
    }
  }
}

export const cacheManager = new CacheManager()
