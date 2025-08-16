// فصل وظائف البيئة
export function getBaseUrl(): string {
  if (typeof window !== "undefined") return ""
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development"
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production"
}

export function isTest(): boolean {
  return process.env.NODE_ENV === "test"
}

export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key]
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue
    }
    throw new Error(`Environment variable ${key} is not defined`)
  }
  return value
}
