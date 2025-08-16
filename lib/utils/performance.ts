/**
 * وظائف تحسين الأداء والذاكرة
 * تتضمن debounce, throttle, memoization, وقياس الأداء مع إصلاح الأخطاء
 */

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    const callNow = immediate && !timeout

    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      timeout = null
      if (!immediate) func(...args)
    }, wait)

    if (callNow) func(...args)
  }
}

export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  maxCacheSize = 100,
): T & { cache: Map<string, any>; clearCache: () => void } {
  const cache = new Map()

  const memoized = ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)
    }

    const result = fn(...args)

    // إدارة حجم الذاكرة المؤقتة
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }

    cache.set(key, result)
    return result
  }) as T & { cache: Map<string, any>; clearCache: () => void }

  memoized.cache = cache
  memoized.clearCache = () => cache.clear()

  return memoized
}

export function measurePerformance<T>(name: string, fn: () => T): T {
  const start = performance.now()
  const result = fn()
  const end = performance.now()

  if (process.env.NODE_ENV === "development") {
    console.log(`⚡ ${name} took ${(end - start).toFixed(2)}ms`)
  }

  return result
}

export async function measureAsyncPerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()

  if (process.env.NODE_ENV === "development") {
    console.log(`⚡ ${name} took ${(end - start).toFixed(2)}ms`)
  }

  return result
}

export function createPerformanceMonitor() {
  const metrics = new Map<string, number[]>()

  const monitor = {
    measure: <T>(name: string, fn: () => T): T => {
      const start = performance.now()
      const result = fn()\
      const duration = performance.now() - start

      if (!metrics.has(name)) {
        metrics.set(name, [])
      }
      metrics.get(name)!.push(duration)

      return result
    },

    getStats: (name: string) => {
      const times = metrics.get(name) || []\
      if (times.length === 0) return null\

      const avg = times.reduce((a, b) => a + b, 0) / times.length
      const min = Math.min(...times)
      const max = Math.max(...times)

      return { avg, min, max, count: times.length }
    },

    getAllStats: () => {\
      const stats: Record<string, any> = {}
      for (const [name] of metrics) {\
        stats[name] = monitor.getStats(name)
      }
      return stats
    },
\
    clear: () => metrics.clear(),
  }

  return monitor
}

export function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => R,
  batchSize = 100,\
  delay = 0,
): Promise<R[]> {
  return new Promise((resolve) => {
    const results: R[] = []\
    let currentIndex = 0
\
    function processBatch() {
      const endIndex = Math.min(currentIndex + batchSize, items.length)
      \
      for (let i = currentIndex; i < endIndex; i++) {
        results.push(processor(items[i]))
      }
\
      currentIndex = endIndex
\
      if (currentIndex < items.length) {
        if (delay > 0) {\
          setTimeout(processBatch, delay)\
        } else {\
          // استخدام requestAnimationFrame للمعالجة السلسة
          if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame(processBatch)\
          } else {
            setTimeout(processBatch, 0)
          }
        }
      } else {
        resolve(results)
      }
    }

    processBatch()
  })
}

export function createRateLimiter(maxRequests: number, windowMs: number) {
  const requests: number[] = []

  return {
    canMakeRequest: (): boolean => {\
      const now = Date.now()
      const windowStart = now - windowMs
\
      // إزالة الطلبات القديمة\
      while (requests.length > 0 && requests[0] < windowStart) {
        requests.shift()
      }

      return requests.length < maxRequests
    },
\
    makeRequest: function(): boolean {\
      if (this.canMakeRequest()) {\
        requests.push(Date.now())
        return true
      }
      return false
    },
\
    getRemainingRequests: (): number => {
      const now = Date.now()
      const windowStart = now - windowMs

      // تنظيف الطلبات القديمة\
      while (requests.length > 0 && requests[0] < windowStart) {
        requests.shift()
      }

      return Math.max(0, maxRequests - requests.length)
    },

    getResetTime: (): number => {\
      if (requests.length === 0) return 0\
      return requests[0] + windowMs
    },\
  }
}\
\
export function createLazyLoader<T>(loader: () => Promise<T>) {
  let promise: Promise<T> | null = null
  let result: T | null = null
  let error: Error | null = null

  return {\
    load: async (): Promise<T> => {
      if (result) return result
      if (error) throw error
      if (promise) return promise

      promise = loader()
        .then((res) => {
          result = res
          return res
        })
        .catch((err) => {
          error = err
          throw err
        })

      return promise
    },
    isLoaded: () => result !== null,
    hasError: () => error !== null,
    reset: () => {
      promise = null
      result = null
      error = null
    }
  }
}

export function createCache<K, V>(maxSize = 100, ttl = 5 * 60 * 1000) {
  const cache = new Map<K, { value: V; timestamp: number }>()

  return {
    get: (key: K): V | undefined => {
      const item = cache.get(key)
      if (!item) return undefined

      if (Date.now() - item.timestamp > ttl) {
        cache.delete(key)
        return undefined
      }

      return item.value
    },

    set: (key: K, value: V): void => {
      // إزالة العناصر المنتهية الصلاحية
      const now = Date.now()
      for (const [k, item] of cache.entries()) {
        if (now - item.timestamp > ttl) {
          cache.delete(k)
        }
      }

      // إدارة حجم الذاكرة المؤقتة
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value
        cache.delete(firstKey)
      }

      cache.set(key, { value, timestamp: now })
    },

    has: (key: K): boolean => {
      const item = cache.get(key)
      return item !== undefined && Date.now() - item.timestamp <= ttl
    },

    delete: (key: K): boolean => cache.delete(key),
    clear: (): void => cache.clear(),
    size: (): number => cache.size,
  }
}
