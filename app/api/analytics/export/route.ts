import { type NextRequest, NextResponse } from "next/server"
import { performanceAnalyzer } from "@/lib/analytics/performance-analyzer"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "json"

    if (format !== "json" && format !== "csv") {
      return NextResponse.json({ error: "Invalid format. Use 'json' or 'csv'" }, { status: 400 })
    }

    const reportData = performanceAnalyzer.exportReport(format as "json" | "csv")

    if (!reportData) {
      return NextResponse.json({ error: "No performance data available" }, { status: 404 })
    }

    const headers = {
      "Content-Type": format === "json" ? "application/json" : "text/csv",
      "Content-Disposition": `attachment; filename="performance-report.${format}"`,
    }

    return new Response(reportData, { headers })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export performance data" }, { status: 500 })
  }
}
