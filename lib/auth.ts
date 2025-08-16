import { getSetting } from "./database/supabase"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")
const ADMIN_SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

interface AdminUser {
  id: string
  email: string
  role: "admin" | "super_admin"
  permissions: string[]
  lastLogin: string
  loginAttempts: number
  lockedUntil?: string
}

interface LoginAttempt {
  ip: string
  timestamp: number
  success: boolean
}

const loginAttempts = new Map<string, LoginAttempt[]>()

export async function verifyPassword(password: string): Promise<boolean> {
  try {
    const storedPassword = await getSetting("admin_password")
    return storedPassword === password
  } catch (error) {
    console.error("Error verifying password:", error)
    return false
  }
}

export async function verifyAdminAccess(request: Request): Promise<boolean> {
  try {
    const cookies = request.headers.get("cookie") || ""
    return /(?:^|; )dash_unlock=1(?:;|$)/.test(cookies)
  } catch (error) {
    console.error("Error verifying admin access:", error)
    return false
  }
}

export async function createAdminToken(user: Omit<AdminUser, "loginAttempts" | "lockedUntil">): Promise<string> {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor((Date.now() + ADMIN_SESSION_DURATION) / 1000),
  }

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET)
}

export async function verifyAdminToken(token: string): Promise<AdminUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      id: payload.id as string,
      email: payload.email as string,
      role: payload.role as "admin" | "super_admin",
      permissions: payload.permissions as string[],
      lastLogin: new Date().toISOString(),
      loginAttempts: 0,
    }
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export async function authenticateAdmin(
  email: string,
  password: string,
  ip: string,
): Promise<{
  success: boolean
  user?: AdminUser
  token?: string
  error?: string
  remainingAttempts?: number
}> {
  try {
    const attempts = loginAttempts.get(ip) || []
    const recentAttempts = attempts.filter(
      (attempt) => Date.now() - attempt.timestamp < LOCKOUT_DURATION && !attempt.success,
    )

    if (recentAttempts.length >= MAX_LOGIN_ATTEMPTS) {
      return {
        success: false,
        error: "تم قفل الحساب مؤقتاً بسبب محاولات تسجيل دخول متعددة فاشلة",
        remainingAttempts: 0,
      }
    }

    const defaultAdmins = [
      {
        email: "admin@kyctrust.com",
        password: "KYC@Trust2024!Admin",
        role: "super_admin" as const,
        permissions: ["all"],
      },
      {
        email: "manager@kyctrust.com",
        password: "KYC@Manager2024!",
        role: "admin" as const,
        permissions: ["content", "users", "analytics"],
      },
    ]

    const admin = defaultAdmins.find((a) => a.email === email)

    if (!admin || admin.password !== password) {
      const newAttempt: LoginAttempt = {
        ip,
        timestamp: Date.now(),
        success: false,
      }

      const updatedAttempts = [...attempts, newAttempt].slice(-10) // Keep last 10 attempts
      loginAttempts.set(ip, updatedAttempts)

      return {
        success: false,
        error: "بيانات تسجيل الدخول غير صحيحة",
        remainingAttempts: MAX_LOGIN_ATTEMPTS - recentAttempts.length - 1,
      }
    }

    const user: AdminUser = {
      id: `admin_${Date.now()}`,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      lastLogin: new Date().toISOString(),
      loginAttempts: 0,
    }

    const token = await createAdminToken(user)

    const successAttempt: LoginAttempt = {
      ip,
      timestamp: Date.now(),
      success: true,
    }

    const updatedAttempts = [...attempts, successAttempt].slice(-10)
    loginAttempts.set(ip, updatedAttempts)

    return {
      success: true,
      user,
      token,
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return {
      success: false,
      error: "حدث خطأ في النظام",
    }
  }
}

export async function getAdminFromRequest(request: NextRequest): Promise<AdminUser | null> {
  try {
    const cookieStore = cookies()
    let token = cookieStore.get("admin_token")?.value

    if (!token) {
      const authHeader = request.headers.get("authorization")
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return null
    }

    return await verifyAdminToken(token)
  } catch (error) {
    console.error("Error getting admin from request:", error)
    return null
  }
}

export function hasPermission(user: AdminUser, permission: string): boolean {
  if (user.role === "super_admin" || user.permissions.includes("all")) {
    return true
  }

  return user.permissions.includes(permission)
}

export async function logAdminActivity(userId: string, action: string, details?: any): Promise<void> {
  try {
    console.log(`Admin Activity - User: ${userId}, Action: ${action}`, details)

    // يمكن إضافة حفظ في قاعدة البيانات هنا
    // await saveAdminLog({ userId, action, details, timestamp: new Date() })
  } catch (error) {
    console.error("Error logging admin activity:", error)
  }
}

export function generateSecurePassword(length = 16): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""

  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  return password
}

export function validatePasswordStrength(password: string): {
  isValid: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score += 1
  else feedback.push("يجب أن تكون كلمة المرور 8 أحرف على الأقل")

  if (/[a-z]/.test(password)) score += 1
  else feedback.push("يجب أن تحتوي على حرف صغير")

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push("يجب أن تحتوي على حرف كبير")

  if (/\d/.test(password)) score += 1
  else feedback.push("يجب أن تحتوي على رقم")

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
  else feedback.push("يجب أن تحتوي على رمز خاص")

  return {
    isValid: score >= 4,
    score,
    feedback,
  }
}
