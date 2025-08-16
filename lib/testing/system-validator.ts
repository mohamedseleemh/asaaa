import { testConnection, checkDatabaseSchema, getSystemStats } from "@/lib/database/connection"
import { apiCache, contentCache, userCache } from "@/lib/cache/cache-manager"

interface ValidationResult {
  category: string
  test: string
  status: "pass" | "fail" | "warning"
  message: string
  details?: any
}

interface SystemValidationReport {
  timestamp: string
  overallStatus: "healthy" | "warning" | "critical"
  score: number
  results: ValidationResult[]
  recommendations: string[]
}

export class SystemValidator {
  private results: ValidationResult[] = []

  async runFullValidation(): Promise<SystemValidationReport> {
    this.results = []

    await this.validateDatabase()

    await this.validatePerformance()

    await this.validateSecurity()

    await this.validateCache()

    await this.validateEnvironment()

    const score = this.calculateScore()
    const overallStatus = this.determineOverallStatus(score)
    const recommendations = this.generateRecommendations()

    return {
      timestamp: new Date().toISOString(),
      overallStatus,
      score,
      results: this.results,
      recommendations,
    }
  }

  private async validateDatabase(): Promise<void> {
    try {
      // Test database connection
      const isConnected = await testConnection()
      this.addResult(
        "Database",
        "Connection Test",
        isConnected ? "pass" : "fail",
        isConnected ? "Database connection successful" : "Database connection failed",
      )

      if (isConnected) {
        // Test database schema
        const schemaCheck = await checkDatabaseSchema()
        this.addResult(
          "Database",
          "Schema Validation",
          schemaCheck.isValid ? "pass" : "fail",
          schemaCheck.isValid ? "All required tables exist" : `Missing tables: ${schemaCheck.missingTables.join(", ")}`,
          schemaCheck,
        )

        // Test system stats
        const stats = await getSystemStats()
        this.addResult(
          "Database",
          "System Stats",
          stats ? "pass" : "warning",
          stats ? "System statistics retrieved successfully" : "Could not retrieve system statistics",
          stats,
        )
      }
    } catch (error) {
      this.addResult("Database", "Database Tests", "fail", `Database validation failed: ${(error as Error).message}`)
    }
  }

  private async validatePerformance(): Promise<void> {
    try {
      // Test API response times
      const startTime = performance.now()
      const response = await fetch("/api/health")
      const endTime = performance.now()
      const responseTime = endTime - startTime

      this.addResult(
        "Performance",
        "API Response Time",
        responseTime < 1000 ? "pass" : responseTime < 2000 ? "warning" : "fail",
        `API response time: ${responseTime.toFixed(2)}ms`,
        { responseTime, threshold: 1000 },
      )

      // Test cache performance
      const cacheStats = {
        api: apiCache.getStats(),
        content: contentCache.getStats(),
        user: userCache.getStats(),
      }

      const avgHitRate = (cacheStats.api.hitRate + cacheStats.content.hitRate + cacheStats.user.hitRate) / 3
      this.addResult(
        "Performance",
        "Cache Hit Rate",
        avgHitRate > 0.7 ? "pass" : avgHitRate > 0.5 ? "warning" : "fail",
        `Average cache hit rate: ${(avgHitRate * 100).toFixed(1)}%`,
        cacheStats,
      )
    } catch (error) {
      this.addResult(
        "Performance",
        "Performance Tests",
        "fail",
        `Performance validation failed: ${(error as Error).message}`,
      )
    }
  }

  private async validateSecurity(): Promise<void> {
    try {
      // Check environment variables
      const requiredEnvVars = ["DATABASE_URL", "ENCRYPTION_KEY", "NEXTAUTH_SECRET", "NEXT_PUBLIC_SITE_URL"]

      const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])
      this.addResult(
        "Security",
        "Environment Variables",
        missingEnvVars.length === 0 ? "pass" : "fail",
        missingEnvVars.length === 0
          ? "All required environment variables are set"
          : `Missing: ${missingEnvVars.join(", ")}`,
        { missing: missingEnvVars, required: requiredEnvVars },
      )

      // Check HTTPS in production
      const isProduction = process.env.NODE_ENV === "production"
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
      const isHttps = siteUrl?.startsWith("https://")

      this.addResult(
        "Security",
        "HTTPS Configuration",
        !isProduction || isHttps ? "pass" : "fail",
        isProduction
          ? isHttps
            ? "HTTPS enabled in production"
            : "HTTPS not configured for production"
          : "Development environment",
        { isProduction, isHttps, siteUrl },
      )
    } catch (error) {
      this.addResult("Security", "Security Tests", "fail", `Security validation failed: ${(error as Error).message}`)
    }
  }

  private async validateCache(): Promise<void> {
    try {
      // Test cache functionality
      const testKey = "validation_test"
      const testValue = { timestamp: Date.now(), test: true }

      apiCache.set(testKey, testValue, 1000)
      const retrieved = apiCache.get(testKey)

      this.addResult(
        "Cache",
        "Cache Functionality",
        retrieved && JSON.stringify(retrieved) === JSON.stringify(testValue) ? "pass" : "fail",
        retrieved ? "Cache read/write operations working" : "Cache operations failed",
      )

      // Clean up test data
      apiCache.invalidate(testKey)

      // Check cache sizes
      const stats = apiCache.getStats()
      this.addResult(
        "Cache",
        "Cache Utilization",
        stats.size < stats.maxSize * 0.9 ? "pass" : "warning",
        `Cache utilization: ${stats.size}/${stats.maxSize} (${((stats.size / stats.maxSize) * 100).toFixed(1)}%)`,
        stats,
      )
    } catch (error) {
      this.addResult("Cache", "Cache Tests", "fail", `Cache validation failed: ${(error as Error).message}`)
    }
  }

  private async validateEnvironment(): Promise<void> {
    try {
      // Check Node.js version
      const nodeVersion = process.version
      const majorVersion = Number.parseInt(nodeVersion.slice(1).split(".")[0])

      this.addResult(
        "Environment",
        "Node.js Version",
        majorVersion >= 18 ? "pass" : "warning",
        `Node.js version: ${nodeVersion}`,
        { version: nodeVersion, majorVersion, minimum: 18 },
      )

      // Check memory usage
      const memoryUsage = process.memoryUsage()
      const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024

      this.addResult(
        "Environment",
        "Memory Usage",
        memoryUsageMB < 512 ? "pass" : memoryUsageMB < 1024 ? "warning" : "fail",
        `Memory usage: ${memoryUsageMB.toFixed(2)} MB`,
        memoryUsage,
      )

      // Check uptime
      const uptime = process.uptime()
      this.addResult(
        "Environment",
        "System Uptime",
        uptime > 0 ? "pass" : "fail",
        `System uptime: ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
        { uptime },
      )
    } catch (error) {
      this.addResult(
        "Environment",
        "Environment Tests",
        "fail",
        `Environment validation failed: ${(error as Error).message}`,
      )
    }
  }

  private addResult(
    category: string,
    test: string,
    status: "pass" | "fail" | "warning",
    message: string,
    details?: any,
  ): void {
    this.results.push({ category, test, status, message, details })
  }

  private calculateScore(): number {
    if (this.results.length === 0) return 0

    const weights = { pass: 100, warning: 70, fail: 0 }
    const totalScore = this.results.reduce((sum, result) => sum + weights[result.status], 0)
    return Math.round(totalScore / this.results.length)
  }

  private determineOverallStatus(score: number): "healthy" | "warning" | "critical" {
    if (score >= 90) return "healthy"
    if (score >= 70) return "warning"
    return "critical"
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    const failedTests = this.results.filter((r) => r.status === "fail")
    const warningTests = this.results.filter((r) => r.status === "warning")

    if (failedTests.length > 0) {
      recommendations.push(`Address ${failedTests.length} critical issues immediately`)
    }

    if (warningTests.length > 0) {
      recommendations.push(`Review ${warningTests.length} warning items for optimization`)
    }

    // Specific recommendations based on test results
    const dbFailed = failedTests.some((t) => t.category === "Database")
    if (dbFailed) {
      recommendations.push("Check database connection and schema integrity")
    }

    const perfWarnings = warningTests.filter((t) => t.category === "Performance")
    if (perfWarnings.length > 0) {
      recommendations.push("Optimize performance bottlenecks and cache configuration")
    }

    const securityIssues = failedTests.filter((t) => t.category === "Security")
    if (securityIssues.length > 0) {
      recommendations.push("Resolve security configuration issues immediately")
    }

    if (recommendations.length === 0) {
      recommendations.push("System is operating optimally - continue regular monitoring")
    }

    return recommendations
  }
}

export const systemValidator = new SystemValidator()
