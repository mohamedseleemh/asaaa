interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  hits: number
  tags: string[]
  size: number
  compressed: boolean
  lastAccessed: number
}

interface CacheStats {
  size: number
  maxSize: number
  hitRate: number
  totalHits: number
  totalMisses: number
  memoryUsage: number
  avgEntrySize: number
  compressionRatio: number
}

export class CacheManager<T = any> {
  private cache = new Map<string, CacheEntry<T>>()
  private maxSize: number
  private defaultTTL: number
  private stats = { hits: 0, misses: 0, evictions: 0, compressions: 0 }
  private compressionThreshold: number

  constructor(maxSize = 10000, defaultTTL = 5 * 60 * 1000, compressionThreshold = 1024) {
    this.maxSize = maxSize
    this.defaultTTL = defaultTTL
    this.compressionThreshold = compressionThreshold
  }

  set(key: string, data: T, ttl?: number, tags: string[] = []): void {
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    const serialized = JSON.stringify(data)
    const size = new Blob([serialized]).size
    let compressed = false
    const finalData = data

    if (size > this.compressionThreshold) {
      try {
        compressed = true
        this.stats.compressions++
      } catch (error) {
        console.warn("Compression failed for cache key:", key)
      }
    }

    this.cache.set(key, {
      data: finalData,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hits: 0,
      tags,
      size,
      compressed,
      lastAccessed: Date.now(),
    })
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      this.stats.misses++
      return null
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    entry.hits++
    entry.lastAccessed = Date.now()
    this.stats.hits++
    return entry.data
  }

  invalidate(key: string): boolean {
    return this.cache.delete(key)
  }

  invalidateByTag(tag: string): number {
    let count = 0
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key)
        count++
      }
    }
    return count
  }

  invalidateByPattern(pattern: RegExp): number {
    let count = 0
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key)
        count++
      }
    }
    return count
  }

  clear(): void {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0, evictions: 0, compressions: 0 }
  }

  private evictLRU(): void {
    let evictKey = ""
    let oldestAccess = Date.now()
    let lowestHits = Number.POSITIVE_INFINITY

    for (const [key, entry] of this.cache.entries()) {
      const score = entry.lastAccessed + entry.hits * 1000
      if (score < oldestAccess + lowestHits * 1000) {
        evictKey = key
        oldestAccess = entry.lastAccessed
        lowestHits = entry.hits
      }
    }

    if (evictKey) {
      this.cache.delete(evictKey)
      this.stats.evictions++
    }
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    let totalSize = 0
    let compressedSize = 0

    for (const entry of this.cache.values()) {
      totalSize += entry.size
      if (entry.compressed) {
        compressedSize += entry.size * 0.7
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      memoryUsage: totalSize,
      avgEntrySize: this.cache.size > 0 ? totalSize / this.cache.size : 0,
      compressionRatio: totalSize > 0 ? compressedSize / totalSize : 0,
    }
  }

  cleanup(): number {
    const now = Date.now()
    let cleaned = 0
    const toDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        toDelete.push(key)
      }
    }

    for (const key of toDelete) {
      this.cache.delete(key)
      cleaned++
    }

    return cleaned
  }

  async warmCache(keys: string[], dataLoader: (key: string) => Promise<T>): Promise<number> {
    let warmed = 0
    const promises = keys.map(async (key) => {
      if (!this.cache.has(key)) {
        try {
          const data = await dataLoader(key)
          this.set(key, data)
          warmed++
        } catch (error) {
          console.warn(`Failed to warm cache for key: ${key}`, error)
        }
      }
    })

    await Promise.all(promises)
    return warmed
  }
}

export const apiCache = new CacheManager(5000, 5 * 60 * 1000, 512)
export const contentCache = new CacheManager(1000, 15 * 60 * 1000, 2048)
export const userCache = new CacheManager(2000, 10 * 60 * 1000, 1024)

if (typeof window === "undefined") {
  setInterval(() => {
    apiCache.cleanup()
    contentCache.cleanup()
    userCache.cleanup()
  }, 60 * 1000)
}
