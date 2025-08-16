export const performanceOptimizations = {
  // تحسين الصور
  imageOptimization: {
    formats: ["webp", "avif"],
    sizes: [640, 750, 828, 1080, 1200, 1920],
    quality: 85,
    placeholder: "blur",
  },

  // تحسين الخطوط
  fontOptimization: {
    preload: true,
    display: "swap",
    fallback: ["system-ui", "arial"],
  },

  // تحسين الشبكة
  networkOptimization: {
    compression: true,
    caching: {
      static: "31536000", // سنة واحدة
      dynamic: "3600", // ساعة واحدة
    },
  },

  // تحسين JavaScript
  jsOptimization: {
    minify: true,
    treeshaking: true,
    codesplitting: true,
  },
}

// دالة لقياس الأداء
export function measurePerformance(name: string, fn: () => void) {
  if (typeof window !== "undefined" && "performance" in window) {
    const start = performance.now()
    fn()
    const end = performance.now()
    console.log(`${name} took ${end - start} milliseconds`)
  } else {
    fn()
  }
}

// دالة لتحسين الصور
export function optimizeImage(src: string, width?: number, quality?: number) {
  if (!src) return "/placeholder.svg"

  const params = new URLSearchParams()
  if (width) params.set("w", width.toString())
  if (quality) params.set("q", quality.toString())

  return `${src}?${params.toString()}`
}

// دالة لتأخير التحميل
export function lazyLoad(callback: () => void, delay = 100) {
  if (typeof window !== "undefined") {
    setTimeout(callback, delay)
  } else {
    callback()
  }
}
