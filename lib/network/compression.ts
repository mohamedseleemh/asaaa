import { type NextRequest, NextResponse } from "next/server"

interface CompressionOptions {
  threshold: number
  level: number
  types: string[]
}

class CompressionManager {
  private static instance: CompressionManager
  private options: CompressionOptions

  constructor() {
    this.options = {
      threshold: 1024, // 1KB
      level: 6, // مستوى الضغط (1-9)
      types: [
        "text/html",
        "text/css",
        "text/javascript",
        "application/javascript",
        "application/json",
        "text/xml",
        "application/xml",
        "image/svg+xml",
        "text/plain",
      ],
    }
  }

  static getInstance(): CompressionManager {
    if (!CompressionManager.instance) {
      CompressionManager.instance = new CompressionManager()
    }
    return CompressionManager.instance
  }

  shouldCompress(contentType: string, contentLength: number): boolean {
    return contentLength >= this.options.threshold && this.options.types.some((type) => contentType.includes(type))
  }

  getCompressionHeaders(acceptEncoding: string): Record<string, string> {
    const headers: Record<string, string> = {}

    if (acceptEncoding.includes("br")) {
      headers["Content-Encoding"] = "br"
    } else if (acceptEncoding.includes("gzip")) {
      headers["Content-Encoding"] = "gzip"
    }

    if (headers["Content-Encoding"]) {
      headers["Vary"] = "Accept-Encoding"
    }

    return headers
  }

  async compressResponse(response: NextResponse, request: NextRequest): Promise<NextResponse> {
    const contentType = response.headers.get("content-type") || ""
    const contentLength = Number.parseInt(response.headers.get("content-length") || "0")
    const acceptEncoding = request.headers.get("accept-encoding") || ""

    if (!this.shouldCompress(contentType, contentLength)) {
      return response
    }

    const compressionHeaders = this.getCompressionHeaders(acceptEncoding)
    Object.entries(compressionHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }

  generateCompressionMiddleware() {
    return async (request: NextRequest) => {
      const response = NextResponse.next()

      // إضافة headers الضغط
      const acceptEncoding = request.headers.get("accept-encoding") || ""
      const compressionHeaders = this.getCompressionHeaders(acceptEncoding)

      Object.entries(compressionHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      return response
    }
  }
}

export const compressionManager = CompressionManager.getInstance()
