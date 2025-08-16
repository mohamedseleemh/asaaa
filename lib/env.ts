// Environment variables validation
export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  VERCEL_URL: process.env.VERCEL_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // Analytics
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,

  // API Keys
  API_SECRET_KEY: process.env.API_SECRET_KEY,
} as const

// Validate required environment variables
export function validateEnv() {
  const required = ["NEXT_PUBLIC_SITE_URL"] as const

  for (const key of required) {
    if (!env[key]) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
  }
}

// Get site URL
export function getSiteUrl() {
  if (env.VERCEL_URL) {
    return `https://${env.VERCEL_URL}`
  }

  return env.NEXT_PUBLIC_SITE_URL
}
