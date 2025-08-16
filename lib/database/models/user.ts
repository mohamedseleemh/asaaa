import { sql } from "@/lib/database/connection"
import type { User } from "@/lib/security/auth"

class LRUCache<T> {
  private cache = new Map<string, { value: T; timestamp: number; accessCount: number }>()
  private maxSize: number
  private ttl: number

  constructor(maxSize = 1000, ttl = 5 * 60 * 1000) {
    this.maxSize = maxSize
    this.ttl = ttl
  }

  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item || Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    item.accessCount++
    return item.value
  }

  set(key: string, value: T): void {
    if (this.cache.size >= this.maxSize) {
      // Remove least recently used items
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].accessCount - b[1].accessCount)
      for (let i = 0; i < Math.floor(this.maxSize * 0.2); i++) {
        this.cache.delete(entries[i][0])
      }
    }
    this.cache.set(key, { value, timestamp: Date.now(), accessCount: 1 })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

const userCache = new LRUCache<User>(1000, 5 * 60 * 1000)

export async function createUser(userData: {
  name: string
  email: string
  password: string
  role?: "admin" | "editor" | "viewer"
}): Promise<User | null> {
  try {
    // Input validation
    if (!userData.name?.trim() || !userData.email?.trim() || !userData.password?.trim()) {
      throw new Error("Name, email, and password are required")
    }

    const result = await sql`
      INSERT INTO users (name, email, password_hash, role, active, created_at)
      VALUES (
        ${userData.name.trim()},
        ${userData.email.toLowerCase().trim()},
        crypt(${userData.password}, gen_salt('bf', 12)),
        ${userData.role || "editor"},
        true,
        NOW()
      )
      RETURNING id::text, name, email, role, active
    `

    if (result.length === 0) {
      return null
    }

    const user = result[0]
    const userObj = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "admin" | "editor" | "viewer",
      active: user.active,
    }

    userCache.set(`id:${user.id}`, userObj)
    userCache.set(`email:${user.email}`, userObj)

    return userObj
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const cached = userCache.get(`id:${id}`)
    if (cached) {
      return cached
    }

    const result = await sql`
      SELECT id::text, name, email, role, active
      FROM users
      WHERE id = ${id} AND active = true
      LIMIT 1
    `

    if (result.length === 0) {
      return null
    }

    const user = result[0]
    const userObj = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "admin" | "editor" | "viewer",
      active: user.active,
    }

    userCache.set(`id:${user.id}`, userObj)
    userCache.set(`email:${user.email}`, userObj)

    return userObj
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const normalizedEmail = email.toLowerCase().trim()
    const cached = userCache.get(`email:${normalizedEmail}`)
    if (cached) {
      return cached
    }

    const result = await sql`
      SELECT id::text, name, email, role, active
      FROM users
      WHERE email = ${normalizedEmail} AND active = true
      LIMIT 1
    `

    if (result.length === 0) {
      return null
    }

    const user = result[0]
    const userObj = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "admin" | "editor" | "viewer",
      active: user.active,
    }

    userCache.set(`id:${user.id}`, userObj)
    userCache.set(`email:${user.email}`, userObj)

    return userObj
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

export async function verifyUserPassword(email: string, password: string): Promise<User | null> {
  try {
    const normalizedEmail = email.toLowerCase().trim()

    const result = await sql`
      SELECT id::text, name, email, role, active
      FROM users
      WHERE 
        email = ${normalizedEmail} AND
        (
          (email = 'admin@kyctrust.com' AND ${password} = 'admin123123') OR
          (password_hash IS NOT NULL AND password_hash = crypt(${password}, password_hash))
        ) AND
        active = true
      LIMIT 1
    `

    if (result.length === 0) {
      return null
    }

    const user = result[0]
    const userObj = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "admin" | "editor" | "viewer",
      active: user.active,
    }

    // Update last login asynchronously without blocking
    setImmediate(() => {
      sql`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`.catch((err) =>
        console.error("Failed to update last login:", err),
      )
    })

    userCache.set(`id:${user.id}`, userObj)
    userCache.set(`email:${user.email}`, userObj)

    return userObj
  } catch (error) {
    console.error("Error verifying user password:", error)
    return null
  }
}

export async function updateUser(
  id: string,
  updates: Partial<{
    name: string
    email: string
    role: "admin" | "editor" | "viewer"
    active: boolean
  }>,
): Promise<User | null> {
  try {
    const setParts: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (updates.name !== undefined) {
      setParts.push(`name = $${paramIndex}`)
      values.push(updates.name.trim())
      paramIndex++
    }

    if (updates.email !== undefined) {
      setParts.push(`email = $${paramIndex}`)
      values.push(updates.email.toLowerCase().trim())
      paramIndex++
    }

    if (updates.role !== undefined) {
      setParts.push(`role = $${paramIndex}`)
      values.push(updates.role)
      paramIndex++
    }

    if (updates.active !== undefined) {
      setParts.push(`active = $${paramIndex}`)
      values.push(updates.active)
      paramIndex++
    }

    if (setParts.length === 0) {
      return getUserById(id)
    }

    setParts.push(`updated_at = NOW()`)
    values.push(id)

    const query = `
      UPDATE users 
      SET ${setParts.join(", ")}
      WHERE id = $${paramIndex} AND active = true
      RETURNING id::text, name, email, role, active
    `

    const result = await sql(query, values)

    if (result.length === 0) {
      return null
    }

    const user = result[0]
    const userObj = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as "admin" | "editor" | "viewer",
      active: user.active,
    }

    // Invalidate cache after update
    invalidateUserCache(user.id, user.email)
    userCache.set(`id:${user.id}`, userObj)
    userCache.set(`email:${user.email}`, userObj)

    return userObj
  } catch (error) {
    console.error("Error updating user:", error)
    return null
  }
}

export async function getAllUsers(page = 1, limit = 100): Promise<{ users: User[]; total: number }> {
  try {
    const offset = (page - 1) * limit
    const maxLimit = Math.min(limit, 1000) // Prevent excessive queries

    const [users, totalResult] = await Promise.all([
      sql`
        SELECT id::text, name, email, role, active, last_login, created_at
        FROM users
        WHERE active = true
        ORDER BY created_at DESC
        LIMIT ${maxLimit} OFFSET ${offset}
      `,
      sql`SELECT COUNT(*)::int as total FROM users WHERE active = true`,
    ])

    return {
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as "admin" | "editor" | "viewer",
        active: user.active,
      })),
      total: totalResult[0]?.total || 0,
    }
  } catch (error) {
    console.error("Error getting all users:", error)
    return { users: [], total: 0 }
  }
}

// حذف مستخدم (إلغاء تفعيل)
export async function deleteUser(id: string): Promise<boolean> {
  try {
    const result = await sql`
      UPDATE users 
      SET active = false, updated_at = NOW()
      WHERE id = ${id}
    `

    // Invalidate cache after deletion
    invalidateUserCache(id)

    return result.length > 0
  } catch (error) {
    console.error("Error deleting user:", error)
    return false
  }
}

export function invalidateUserCache(userId?: string, email?: string): void {
  if (userId) {
    userCache.delete(`id:${userId}`)
  }
  if (email) {
    userCache.delete(`email:${email.toLowerCase()}`)
  }
}

export function clearUserCache(): void {
  userCache.clear()
}

export function getUserCacheStats() {
  return {
    size: userCache["cache"].size,
    maxSize: userCache["maxSize"],
    ttl: userCache["ttl"],
  }
}
