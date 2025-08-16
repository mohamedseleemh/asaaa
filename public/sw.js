// Service Worker للتخزين المؤقت المتقدم
const CACHE_NAME = "kyctrust-v1"
const STATIC_CACHE = "static-v1"
const DYNAMIC_CACHE = "dynamic-v1"
const IMAGE_CACHE = "images-v1"

const STATIC_ASSETS = [
  "/",
  "/ar",
  "/en",
  "/manifest.json",
  "/images/brand/kyctrust-logo.webp",
  "/fonts/inter-var.woff2",
  "/fonts/cairo-var.woff2",
]

// تثبيت Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }),
  )
  self.skipWaiting()
})

// تفعيل Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== STATIC_CACHE &&
            cacheName !== DYNAMIC_CACHE &&
            cacheName !== IMAGE_CACHE
          ) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// استراتيجيات التخزين المؤقت
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // الموارد الثابتة - Cache First
  if (
    request.url.includes("/_next/static/") ||
    request.url.includes("/fonts/") ||
    STATIC_ASSETS.includes(url.pathname)
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // الصور - Stale While Revalidate
  if (request.url.includes("/images/") || request.destination === "image") {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE))
    return
  }

  // API - Network First
  if (request.url.includes("/api/")) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE))
    return
  }

  // الصفحات - Network First مع fallback
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE))
    return
  }
})

// استراتيجية Cache First
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  if (cached) {
    return cached
  }

  try {
    const response = await fetch(request)
    if (response.status === 200) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    return new Response("Offline", { status: 503 })
  }
}

// استراتيجية Network First
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)

  try {
    const response = await fetch(request)
    if (response.status === 200) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await cache.match(request)
    return cached || new Response("Offline", { status: 503 })
  }
}

// استراتيجية Stale While Revalidate
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)

  const fetchPromise = fetch(request).then((response) => {
    if (response.status === 200) {
      cache.put(request, response.clone())
    }
    return response
  })

  return cached || fetchPromise
}
