const requiredEnvVars = ["DATABASE_URL", "NEXTAUTH_SECRET", "ENCRYPTION_KEY", "NEXT_PUBLIC_SITE_URL"] as const

const optionalEnvVars = [
  "GROQ_API_KEY",
  "XAI_API_KEY",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "POSTGRES_URL",
  "STACK_SECRET_SERVER_KEY",
] as const

export function validateEnvironment() {
  const missing: string[] = []
  const warnings: string[] = []

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }

  // Check optional but recommended variables
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      warnings.push(envVar)
    }
  }

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:", missing.join(", "))
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
    }
  }

  if (warnings.length > 0 && process.env.NODE_ENV !== "test") {
    console.warn("⚠️  Missing optional environment variables:", warnings.join(", "))
  }

  // Validate specific formats
  if (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.startsWith("http")) {
    throw new Error("NEXT_PUBLIC_SITE_URL must start with http:// or https://")
  }

  console.log("✅ Environment validation passed")
}

// Auto-validate on import in production
if (process.env.NODE_ENV === "production") {
  validateEnvironment()
}
