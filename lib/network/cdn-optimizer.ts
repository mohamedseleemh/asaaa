interface CDNConfig {
  baseUrl: string
  regions: string[]
  cacheStrategies: Record<string, CacheStrategy>
}

interface CacheStrategy {
  maxAge: number
  staleWhileRevalidate?: number
  mustRevalidate?: boolean
  public?: boolean
}

class CDNOptimizer {
  private static instance: CDNOptimizer
  private config: CDNConfig

  constructor() {
    this.config = {
      baseUrl: process.env.NEXT_PUBLIC_CDN_URL || process.env.NEXT_PUBLIC_SITE_URL || "",
      regions: ["us-east-1", "eu-west-1", "ap-southeast-1"],
      cacheStrategies: {
        images: {
          maxAge: 31536000, // سنة واحدة
          public: true,
        },
        fonts: {
          maxAge: 31536000,
          public: true,
        },
        css: {
          maxAge: 86400, // يوم واحد
          staleWhileRevalidate: 604800, // أسبوع
          public: true,
        },
        js: {
          maxAge: 86400,
          staleWhileRevalidate: 604800,
          public: true,
        },
        api: {
          maxAge: 300, // 5 دقائق
          staleWhileRevalidate: 86400, // يوم واحد
          public: false,
        },
        html: {
          maxAge: 0,
          staleWhileRevalidate: 86400,
          mustRevalidate: true,
          public: true,
        },
      },
    }
  }

  static getInstance(): CDNOptimizer {
    if (!CDNOptimizer.instance) {
      CDNOptimizer.instance = new CDNOptimizer()
    }
    return CDNOptimizer.instance
  }

  optimizeImageUrl(src: string, options: { width?: number; height?: number; quality?: number } = {}): string {
    if (!src || src.startsWith("data:") || src.startsWith("blob:")) {
      return src
    }

    const { width, height, quality = 85 } = options
    const params = new URLSearchParams()

    if (width) params.set("w", width.toString())
    if (height) params.set("h", height.toString())
    params.set("q", quality.toString())
    params.set("f", "webp")

    // إذا كان الرابط خارجي، استخدم Next.js Image Optimization
    if (src.startsWith("http")) {
      return `/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`
    }

    // للصور المحلية
    return `${this.config.baseUrl}${src}?${params.toString()}`
  }

  generateCacheHeaders(resourceType: keyof CDNConfig["cacheStrategies"]): Record<string, string> {
    const strategy = this.config.cacheStrategies[resourceType]
    if (!strategy) return {}

    const headers: Record<string, string> = {}
    const cacheControl = []

    if (strategy.public) cacheControl.push("public")
    else cacheControl.push("private")

    cacheControl.push(`max-age=${strategy.maxAge}`)

    if (strategy.staleWhileRevalidate) {
      cacheControl.push(`stale-while-revalidate=${strategy.staleWhileRevalidate}`)
    }

    if (strategy.mustRevalidate) {
      cacheControl.push("must-revalidate")
    }

    headers["Cache-Control"] = cacheControl.join(", ")
    headers["Vary"] = "Accept, Accept-Encoding"

    return headers
  }

  preloadCriticalResources(): string[] {
    return [
      `<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>`,
      `<link rel="preload" href="/fonts/cairo-var.woff2" as="font" type="font/woff2" crossorigin>`,
      `<link rel="preload" href="/images/brand/kyctrust-logo.webp" as="image" type="image/webp">`,
      `<link rel="preconnect" href="https://fonts.googleapis.com">`,
      `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
      `<link rel="dns-prefetch" href="https://wa.me">`,
      `<link rel="dns-prefetch" href="https://api.whatsapp.com">`,
    ]
  }

  generateServiceWorkerConfig() {
    return {
      cacheStrategies: {
        // استراتيجية Cache First للموارد الثابتة
        static: {
          urlPattern: /\/_next\/static\/.*/,
          handler: "CacheFirst",
          options: {
            cacheName: "static-resources",
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 31536000, // سنة واحدة
            },
          },
        },
        // استراتيجية Stale While Revalidate للصور
        images: {
          urlPattern: /\/images\/.*/,
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "images",
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 2592000, // شهر واحد
            },
          },
        },
        // استراتيجية Network First للـ API
        api: {
          urlPattern: /\/api\/.*/,
          handler: "NetworkFirst",
          options: {
            cacheName: "api-cache",
            networkTimeoutSeconds: 3,
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 300, // 5 دقائق
            },
          },
        },
        // استراتيجية Network First للصفحات
        pages: {
          urlPattern: /^https:\/\/.*\//,
          handler: "NetworkFirst",
          options: {
            cacheName: "pages",
            networkTimeoutSeconds: 3,
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 86400, // يوم واحد
            },
          },
        },
      },
    }
  }

  async measureNetworkQuality(): Promise<{
    effectiveType: string
    downlink: number
    rtt: number
    saveData: boolean
  }> {
    if (typeof navigator !== "undefined" && "connection" in navigator) {
      const connection = (navigator as any).connection
      return {
        effectiveType: connection.effectiveType || "4g",
        downlink: connection.downlink || 10,
        rtt: connection.rtt || 100,
        saveData: connection.saveData || false,
      }
    }

    // قيم افتراضية
    return {
      effectiveType: "4g",
      downlink: 10,
      rtt: 100,
      saveData: false,
    }
  }

  async adaptToNetworkConditions() {
    const networkInfo = await this.measureNetworkQuality()

    // تقليل جودة الصور للشبكات البطيئة
    if (networkInfo.effectiveType === "slow-2g" || networkInfo.effectiveType === "2g") {
      return {
        imageQuality: 60,
        enableAnimations: false,
        preloadImages: false,
        lazyLoadThreshold: "50px",
      }
    }

    if (networkInfo.effectiveType === "3g") {
      return {
        imageQuality: 75,
        enableAnimations: true,
        preloadImages: false,
        lazyLoadThreshold: "100px",
      }
    }

    // شبكة سريعة
    return {
      imageQuality: 85,
      enableAnimations: true,
      preloadImages: true,
      lazyLoadThreshold: "200px",
    }
  }
}

export const cdnOptimizer = CDNOptimizer.getInstance()
