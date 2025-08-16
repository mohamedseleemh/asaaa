import { sql } from "@/lib/database/connection"
import { verifyUserPassword, createSession, verifySession, type User, type Session } from "./auth"
import { hasPermission, type Permission, PERMISSIONS } from "./rbac"
import { checkRateLimit } from "./rate-limiter"

export interface AuthContext {
  user: User
  session: Session
  permissions: Permission[]
  canAccess: (permission: Permission) => boolean
}

export interface LoginAttempt {
  email: string
  ipAddress?: string
  userAgent?: string
  timestamp: Date
  success: boolean
  reason?: string
}

// نظام مصادقة محسن مع تتبع المحاولات
export async function enhancedLogin(
  email: string,
  password: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<{ success: boolean; session?: Session; user?: User; error?: string }> {
  try {
    // فحص معدل المحاولات
    const rateLimitResult = await checkRateLimit(ipAddress || "unknown", "auth")
    if (!rateLimitResult.allowed) {
      await logLoginAttempt({
        email,
        ipAddress,
        userAgent,
        timestamp: new Date(),
        success: false,
        reason: "rate_limited",
      })
      return { success: false, error: "تم تجاوز الحد المسموح من المحاولات. يرجى المحاولة لاحقاً." }
    }

    // التحقق من كلمة المرور
    const user = await verifyUserPassword(email, password, ipAddress)
    if (!user) {
      await logLoginAttempt({
        email,
        ipAddress,
        userAgent,
        timestamp: new Date(),
        success: false,
        reason: "invalid_credentials",
      })
      return { success: false, error: "بيانات الدخول غير صحيحة" }
    }

    // إنشاء جلسة جديدة
    const session = await createSession(user.id, ipAddress, userAgent)

    await logLoginAttempt({
      email,
      ipAddress,
      userAgent,
      timestamp: new Date(),
      success: true,
    })

    return { success: true, session, user }
  } catch (error) {
    console.error("Enhanced login error:", error)
    return { success: false, error: "حدث خطأ في النظام" }
  }
}

// إنشاء سياق المصادقة
export async function createAuthContext(req: Request): Promise<AuthContext | null> {
  const sessionData = await verifySession(req)
  if (!sessionData) return null

  const { user, session } = sessionData
  const permissions = getPermissionsForRole(user.role)

  return {
    user,
    session,
    permissions,
    canAccess: (permission: Permission) => hasPermission(user.role, permission),
  }
}

// الحصول على الصلاحيات حسب الدور
function getPermissionsForRole(role: string): Permission[] {
  switch (role) {
    case "admin":
      return Object.values(PERMISSIONS)
    case "editor":
      return [
        PERMISSIONS.CONTENT_READ,
        PERMISSIONS.CONTENT_CREATE,
        PERMISSIONS.CONTENT_UPDATE,
        PERMISSIONS.CONTENT_PUBLISH,
        PERMISSIONS.ANALYTICS_READ,
        PERMISSIONS.USERS_READ,
      ]
    case "viewer":
      return [PERMISSIONS.CONTENT_READ, PERMISSIONS.ANALYTICS_READ, PERMISSIONS.USERS_READ]
    default:
      return []
  }
}

// تسجيل محاولات الدخول
async function logLoginAttempt(attempt: LoginAttempt): Promise<void> {
  try {
    await sql`
      INSERT INTO login_attempts (email, ip_address, user_agent, timestamp, success, reason)
      VALUES (
        ${attempt.email},
        ${attempt.ipAddress},
        ${attempt.userAgent},
        ${attempt.timestamp.toISOString()},
        ${attempt.success},
        ${attempt.reason || null}
      )
    `
  } catch (error) {
    console.error("Failed to log login attempt:", error)
  }
}

// إنشاء مستخدم المدير الافتراضي
export async function ensureAdminUser(): Promise<void> {
  try {
    const existingAdmin = await sql`
      SELECT id FROM users WHERE email = 'admin@kyctrust.com'
    `

    if (existingAdmin.length === 0) {
      await sql`
        INSERT INTO users (name, email, role, active, password_hash, created_at)
        VALUES (
          'مدير النظام',
          'admin@kyctrust.com',
          'admin',
          true,
          crypt('admin123123', gen_salt('bf', 12)),
          NOW()
        )
      `
      console.log("تم إنشاء مستخدم المدير الافتراضي")
    }
  } catch (error) {
    console.error("Error ensuring admin user:", error)
  }
}

// تنظيف الجلسات المنتهية الصلاحية
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    const result = await sql`
      DELETE FROM user_sessions 
      WHERE expires_at < NOW() OR created_at < NOW() - INTERVAL '30 days'
    `
    console.log(`تم حذف ${result.length} جلسة منتهية الصلاحية`)
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error)
  }
}

// إنهاء جميع جلسات المستخدم
export async function terminateAllUserSessions(userId: string, reason = "admin_action"): Promise<boolean> {
  try {
    await sql`
      DELETE FROM user_sessions WHERE user_id = ${userId}
    `

    await sql`
      INSERT INTO audit_logs (action, details, created_at)
      VALUES (
        'sessions_terminated',
        ${JSON.stringify({ userId, reason })},
        NOW()
      )
    `

    return true
  } catch (error) {
    console.error("Error terminating user sessions:", error)
    return false
  }
}

// تحديث آخر نشاط للمستخدم
export async function updateUserActivity(userId: string, activity: string): Promise<void> {
  try {
    await sql`
      UPDATE users 
      SET last_activity = NOW(), last_activity_type = ${activity}
      WHERE id = ${userId}
    `
  } catch (error) {
    console.error("Error updating user activity:", error)
  }
}

// فحص قوة كلمة المرور
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 12) {
    errors.push("كلمة المرور يجب أن تكون 12 حرف على الأقل")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("يجب أن تحتوي على حرف صغير واحد على الأقل")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("يجب أن تحتوي على حرف كبير واحد على الأقل")
  }

  if (!/[0-9]/.test(password)) {
    errors.push("يجب أن تحتوي على رقم واحد على الأقل")
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push("يجب أن تحتوي على رمز خاص واحد على الأقل")
  }

  // فحص الأنماط الشائعة
  const commonPatterns = [
    { pattern: /(.)\1{2,}/, message: "لا يجب تكرار نفس الحرف أكثر من مرتين" },
    { pattern: /123456|abcdef|qwerty/i, message: "لا يجب استخدام تسلسلات شائعة" },
    { pattern: /password|admin|login|kyctrust/i, message: "لا يجب استخدام كلمات شائعة" },
  ]

  for (const { pattern, message } of commonPatterns) {
    if (pattern.test(password)) {
      errors.push(message)
    }
  }

  return { valid: errors.length === 0, errors }
}
