import { sql } from "@/lib/database/connection"

// دالة للتحقق من وجود الجداول المطلوبة وإنشائها إذا لم تكن موجودة
export async function ensureSchema(): Promise<boolean> {
  try {
    // التحقق من وجود جدول الإعدادات
    const settingsExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'settings'
      ) as exists
    `

    if (!settingsExists[0].exists) {
      // إنشاء جدول الإعدادات
      await sql`
        CREATE TABLE IF NOT EXISTS settings (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) UNIQUE NOT NULL,
          value JSONB,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `
    }

    // التحقق من وجود جدول المستخدمين
    const usersExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as exists
    `

    if (!usersExists[0].exists) {
      // إنشاء جدول المستخدمين
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255),
          role VARCHAR(50) DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
          active BOOLEAN DEFAULT true,
          last_login TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `

      // إنشاء مستخدم مسؤول افتراضي
      await sql`
        INSERT INTO users (name, email, role, active, password_hash)
        VALUES (
          'المدير العام', 
          'admin@kyctrust.com', 
          'admin', 
          true, 
          crypt('admin123123', gen_salt('bf', 12))
        )
      `
    }

    // التحقق من وجود امتداد pgcrypto
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`

    // إنشاء دالة للتحقق من كلمة المرور
    await sql`
      CREATE OR REPLACE FUNCTION verify_user_password(
        p_email VARCHAR,
        p_password VARCHAR
      ) RETURNS TABLE (
        user_id INTEGER,
        name VARCHAR,
        role VARCHAR,
        active BOOLEAN
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          u.id,
          u.name,
          u.role,
          u.active
        FROM users u
        WHERE 
          u.email = p_email AND
          (
            -- التحقق من كلمة المرور الافتراضية للمسؤول
            (p_email = 'admin@kyctrust.com' AND p_password = 'admin123123') OR
            -- التحقق من كلمة المرور المخزنة
            (u.password_hash IS NOT NULL AND u.password_hash = crypt(p_password, u.password_hash))
          ) AND
          u.active = true;
      END;
      $$ LANGUAGE plpgsql;
    `

    return true
  } catch (error) {
    console.error("Error ensuring schema:", error)
    return false
  }
}

// دالة للحصول على إعداد معين
export async function getSetting(key: string): Promise<any> {
  try {
    const result = await sql`SELECT value FROM settings WHERE key = ${key} LIMIT 1`
    return result[0]?.value || null
  } catch (error) {
    console.error("Error getting setting:", error)
    return null
  }
}

// دالة لتعيين إعداد
export async function setSetting(key: string, value: any, description?: string): Promise<boolean> {
  try {
    await sql`
      INSERT INTO settings (key, value, description, updated_at)
      VALUES (${key}, ${JSON.stringify(value)}, ${description || null}, NOW())
      ON CONFLICT (key) 
      DO UPDATE SET 
        value = EXCLUDED.value,
        description = COALESCE(EXCLUDED.description, settings.description),
        updated_at = NOW()
    `
    return true
  } catch (error) {
    console.error("Error setting value:", error)
    return false
  }
}
