// فصل وظائف الرموز المميزة
import { createHash } from "crypto"

export function generateSecureToken(): string {
  // Use crypto.randomUUID if available (Node.js 14.17+)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "")
  }

  // Fallback to crypto.getRandomValues for better security than Math.random
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    const token = Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")

    const entropy = calculateEntropy(token)
    if (entropy < 4.0) {
      console.warn("Low entropy token detected, regenerating...")
      return generateSecureToken()
    }

    return token
  }

  // Last resort fallback (not recommended for production)
  console.warn("Using insecure token generation - crypto API not available")
  throw new Error("Secure token generation not available")
}

export function createDeviceFingerprint(ipAddress?: string | null, userAgent?: string | null): string {
  const data = `${ipAddress || "unknown"}:${userAgent || "unknown"}`
  return createHash("sha256").update(data).digest("hex").substring(0, 16)
}

export function extractTokenFromRequest(req: Request): string | null {
  // محاولة استخراج الرمز من الكوكيز
  const cookies = req.headers.get("cookie") || ""
  const sessionTokenMatch = cookies.match(/session_token=([^;]+)/)
  if (sessionTokenMatch) {
    return sessionTokenMatch[1]
  }

  // محاولة استخراج الرمز من Authorization header
  const authHeader = req.headers.get("authorization") || ""
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }

  return null
}

function calculateEntropy(str: string): number {
  const freq: Record<string, number> = {}
  for (const char of str) {
    freq[char] = (freq[char] || 0) + 1
  }

  let entropy = 0
  const len = str.length
  for (const count of Object.values(freq)) {
    const p = count / len
    entropy -= p * Math.log2(p)
  }

  return entropy
}
