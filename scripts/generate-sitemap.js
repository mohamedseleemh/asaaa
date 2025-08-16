const fs = require("fs")
const path = require("path")

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kyctrust.vercel.app"

const staticPages = ["", "/ar", "/en", "/about", "/services", "/contact", "/privacy", "/terms"]

const generateSitemap = () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === "" ? "1.0" : "0.8"}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`

  fs.writeFileSync(path.join(process.cwd(), "public", "sitemap.xml"), sitemap)
  console.log("✅ Sitemap generated successfully!")
}

generateSitemap()
