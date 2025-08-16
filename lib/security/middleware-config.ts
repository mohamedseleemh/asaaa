// فصل إعدادات الوسطاء
export interface SecurityHeaders {
  [key: string]: string
}

export function getSecurityHeaders(nonce: string): SecurityHeaders {
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://vercel.live`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.groq.com https://api.openai.com https://*.supabase.co wss:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "media-src 'self'",
    "worker-src 'self'",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ")

  return {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-XSS-Protection": "1; mode=block",
    "X-DNS-Prefetch-Control": "on",
    "X-Permitted-Cross-Domain-Policies": "none",
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Content-Security-Policy": csp,
    "X-CSP-Nonce": nonce,
  }
}

export function getCacheHeaders(pathname: string): Record<string, string> {
  if (pathname.startsWith("/api/")) {
    if (pathname.includes("/analytics") || pathname.includes("/content/published")) {
      return { "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=1800" }
    } else if (pathname.includes("/health") || pathname.includes("/monitoring")) {
      return {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      }
    } else if (pathname.includes("/admin") || pathname.includes("/auth")) {
      return {
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
        Pragma: "no-cache",
        Expires: "0",
      }
    } else {
      return { "Cache-Control": "public, max-age=60, s-maxage=300" }
    }
  } else if (pathname.startsWith("/_next/static/")) {
    return { "Cache-Control": "public, max-age=31536000, immutable" }
  } else if (pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|ico|svg)$/)) {
    return { "Cache-Control": "public, max-age=86400, s-maxage=2592000" }
  } else if (pathname.match(/\.(css|js|woff|woff2|ttf|eot)$/)) {
    return { "Cache-Control": "public, max-age=2592000, immutable" }
  } else if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    return {
      "Cache-Control": "no-cache, no-store, must-revalidate, private",
      Pragma: "no-cache",
      Expires: "0",
    }
  } else {
    return { "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=3600" }
  }
}

export function generateNonce(): string {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
  }

  // Fallback for environments without crypto
  return Math.random().toString(36).substring(2, 18)
}
