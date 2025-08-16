export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kyctrust.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/ar",
          "/en",
          "/services/*",
          "/about",
          "/contact",
          "/faq",
          "/support",
          "/blog/*",
          "/guides/*",
          "/testimonials",
          "/privacy-policy",
          "/terms-of-service",
          "/security",
        ],
        disallow: [
          "/dashboard/*",
          "/admin/*",
          "/api/*",
          "/_next/*",
          "/scripts/*",
          "/temp/*",
          "*.json$",
          "/install/*",
          "/test/*",
          "/dev/*",
        ],
        crawlDelay: 1,
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/ar",
          "/en",
          "/services/*",
          "/about",
          "/contact",
          "/faq",
          "/support",
          "/blog/*",
          "/guides/*",
          "/testimonials",
        ],
        disallow: ["/dashboard/*", "/admin/*", "/api/*"],
        crawlDelay: 0.5,
      },
      {
        userAgent: "Bingbot",
        allow: ["/", "/ar", "/en", "/services/*", "/about", "/contact", "/faq", "/support"],
        disallow: ["/dashboard/*", "/admin/*", "/api/*"],
        crawlDelay: 2,
      },
      {
        userAgent: "Yandex",
        allow: ["/", "/ar", "/en", "/services/*", "/about", "/contact"],
        disallow: ["/dashboard/*", "/admin/*", "/api/*"],
        crawlDelay: 3,
      },
      {
        userAgent: "DuckDuckBot",
        allow: ["/", "/services/*", "/about", "/contact", "/faq"],
        disallow: ["/dashboard/*", "/admin/*", "/api/*"],
        crawlDelay: 2,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
