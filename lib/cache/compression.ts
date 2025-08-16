import { gzip, deflate } from "zlib"
import { promisify } from "util"

const gzipAsync = promisify(gzip)
const deflateAsync = promisify(deflate)

export interface CompressionOptions {
  threshold?: number // Minimum size to compress (bytes)
  level?: number // Compression level (1-9)
  chunkSize?: number // Chunk size for streaming
}

export class CompressionManager {
  private static instance: CompressionManager
  private compressionCache = new Map<string, { data: Buffer; encoding: string; timestamp: number }>()
  private readonly cacheTTL = 10 * 60 * 1000 // 10 minutes

  static getInstance(): CompressionManager {
    if (!CompressionManager.instance) {
      CompressionManager.instance = new CompressionManager()
    }
    return CompressionManager.instance
  }

  async compressResponse(
    data: string | Buffer,
    acceptEncoding: string,
    options: CompressionOptions = {},
  ): Promise<{ data: Buffer; encoding: string } | null> {
    const { threshold = 1024, level = 6 } = options
    const input = typeof data === "string" ? Buffer.from(data, "utf8") : data

    // Don't compress small responses
    if (input.length < threshold) {
      return null
    }

    // Check cache first
    const cacheKey = this.getCacheKey(input, acceptEncoding, level)
    const cached = this.compressionCache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return { data: cached.data, encoding: cached.encoding }
    }

    try {
      let compressed: Buffer
      let encoding: string

      if (acceptEncoding.includes("gzip")) {
        compressed = await gzipAsync(input, { level })
        encoding = "gzip"
      } else if (acceptEncoding.includes("deflate")) {
        compressed = await deflateAsync(input, { level })
        encoding = "deflate"
      } else {
        return null
      }

      // Only use compression if it actually reduces size
      if (compressed.length >= input.length * 0.9) {
        return null
      }

      // Cache the result
      this.compressionCache.set(cacheKey, {
        data: compressed,
        encoding,
        timestamp: Date.now(),
      })

      // Cleanup old cache entries
      this.cleanupCache()

      return { data: compressed, encoding }
    } catch (error) {
      console.error("Compression failed:", error)
      return null
    }
  }

  private getCacheKey(data: Buffer, acceptEncoding: string, level: number): string {
    const hash = require("crypto").createHash("md5").update(data).digest("hex")
    return `${hash}-${acceptEncoding}-${level}`
  }

  private cleanupCache(): void {
    const now = Date.now()
    for (const [key, entry] of this.compressionCache.entries()) {
      if (now - entry.timestamp > this.cacheTTL) {
        this.compressionCache.delete(key)
      }
    }
  }

  getCacheStats() {
    return {
      size: this.compressionCache.size,
      entries: Array.from(this.compressionCache.entries()).map(([key, entry]) => ({
        key,
        size: entry.data.length,
        encoding: entry.encoding,
        age: Date.now() - entry.timestamp,
      })),
    }
  }
}

export const compressionManager = CompressionManager.getInstance()

// Helper function for API routes
export async function compressApiResponse(
  data: any,
  request: Request,
  options?: CompressionOptions,
): Promise<{ body: Buffer | string; headers: Record<string, string> }> {
  const jsonString = JSON.stringify(data)
  const acceptEncoding = request.headers.get("accept-encoding") || ""

  const compressed = await compressionManager.compressResponse(jsonString, acceptEncoding, options)

  if (compressed) {
    return {
      body: compressed.data,
      headers: {
        "Content-Type": "application/json",
        "Content-Encoding": compressed.encoding,
        "Content-Length": compressed.data.length.toString(),
        Vary: "Accept-Encoding",
      },
    }
  }

  return {
    body: jsonString,
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(jsonString, "utf8").toString(),
    },
  }
}
