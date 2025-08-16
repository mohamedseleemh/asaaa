// فصل وظائف كلمات المرور
import { createHash } from "crypto"

export function isPasswordStrong(password: string): boolean {
  if (password.length < 12) return false
  if (!/[a-z]/.test(password)) return false
  if (!/[A-Z]/.test(password)) return false
  if (!/[0-9]/.test(password)) return false
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) return false

  // Check for common patterns
  const commonPatterns = [
    /(.)\1{2,}/, // Repeated characters
    /123456|abcdef|qwerty/i, // Common sequences
    /password|admin|login/i, // Common words
  ]

  return !commonPatterns.some((pattern) => pattern.test(password))
}

export function hashPassword(password: string): string {
  return createHash("sha256")
    .update(password + process.env.PASSWORD_SALT)
    .digest("hex")
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

export function generateSecurePassword(length = 16): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-="
  let password = ""

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)

    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length]
    }
  } else {
    throw new Error("Secure random generation not available")
  }

  return password
}
