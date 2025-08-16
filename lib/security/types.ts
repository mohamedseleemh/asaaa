// تعريف أنواع البيانات الأمنية
export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "editor" | "viewer"
  active: boolean
  lastLoginAt?: Date
  failedLoginAttempts?: number
  lockedUntil?: Date
}

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: Date
  ipAddress?: string
  userAgent?: string
  isActive: boolean
}

export interface SecurityEvent {
  event: string
  details: Record<string, any>
  ipAddress?: string
  timestamp: Date
}

export interface LoginAttempt {
  email: string
  success: boolean
  ipAddress?: string
  userAgent?: string
  timestamp: Date
  reason?: string
}

export interface AuthResult {
  success: boolean
  user?: User
  session?: Session
  error?: string
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
}
