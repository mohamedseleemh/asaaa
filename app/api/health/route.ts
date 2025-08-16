import { testConnection, checkDatabaseSchema } from "@/lib/database/connection"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // فحص الاتصال بقاعدة البيانات
    const dbConnected = await testConnection()

    // فحص مخطط قاعدة البيانات
    const schemaCheck = await checkDatabaseSchema()

    // فحص متغيرات البيئة المهمة
    const envVars = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      ENCRYPTION_KEY: !!process.env.ENCRYPTION_KEY,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    }

    const isHealthy = dbConnected && schemaCheck.isValid && envVars.DATABASE_URL

    const healthData = {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        schema: schemaCheck,
      },
      environment: envVars,
      version: "1.0.0",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
    }

    return NextResponse.json(healthData, {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Health check failed:", error)

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: process.env.NODE_ENV === "development" ? (error as Error).message : "Health check failed",
        version: "1.0.0",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    )
  }
}
