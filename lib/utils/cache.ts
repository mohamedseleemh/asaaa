interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class Cache {
  private storage = new Map<string, CacheItem<any>>()
  private readonly defaultTTL = 5 * 60 * 1000 // 5 دقائق

  set<T>(key: string, data: T, ttl = this.defaultTTL): void {
    this.storage.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const item = this.storage.get(key)

    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.storage.delete(key)
      return null
    }

    return item.data
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.storage.delete(key)
  }

  clear(): void {
    this.storage.clear()
  }

  size(): number {
    return this.storage.size
  }

  // تنظيف العناصر المنتهية الصلاحية
  cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.storage.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.storage.delete(key)
      }
    }
  }
}

export const cache = new Cache()

// تنظيف دوري كل 10 دقائق
if (typeof window !== "undefined") {
  setInterval(() => cache.cleanup(), 10 * 60 * 1000)
}
