import { NextResponse } from "next/server"
import { systemValidator } from "@/lib/testing/system-validator"

export async function GET() {
  try {
    const report = await systemValidator.runFullValidation()

    return NextResponse.json(report, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("System validation failed:", error)

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        overallStatus: "critical",
        score: 0,
        results: [],
        recommendations: ["System validation failed - check server logs"],
        error: process.env.NODE_ENV === "development" ? (error as Error).message : "Validation failed",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    )
  }
}
