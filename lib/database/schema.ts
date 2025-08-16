import { sql } from "./connection"

// دالة ضمان وجود المخطط
export async function ensureSchema(): Promise<void> {
  try {
    // التحقق من وجود الجداول الأساسية
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('settings', 'users', 'reviews', 'content_snapshots')
    `

    if (tables.length < 4) {
      throw new Error("Database schema is incomplete. Please run the SQL migration scripts.")
    }
  } catch (error) {
    console.error("Schema validation failed:", error)
    throw error
  }
}

// دالة الحصول على إعداد
export async function getSetting<T = any>(key: string): Promise<T | null> {
  try {
    const result = await sql`SELECT get_setting(${key}) as value`
    const value = result[0]?.value
    return value === null || value === "null" ? null : value
  } catch (error) {
    console.error(`Failed to get setting ${key}:`, error)
    return null
  }
}

// دالة تعيين إعداد
export async function setSetting(key: string, value: any): Promise<void> {
  try {
    await sql`SELECT set_setting(${key}, ${JSON.stringify(value)}::jsonb)`
  } catch (error) {
    console.error(`Failed to set setting ${key}:`, error)
    throw error
  }
}

// دالة نشر المحتوى
export async function publishContent(content: any): Promise<boolean> {
  try {
    const result = await sql`SELECT publish_content(${JSON.stringify(content)}::jsonb) as success`
    return result[0]?.success || false
  } catch (error) {
    console.error("Failed to publish content:", error)
    throw error
  }
}

// دالة إنشاء لقطة
export async function createSnapshot(locale: "ar" | "en", content: any): Promise<string> {
  try {
    const result = await sql`SELECT create_snapshot(${locale}, ${JSON.stringify(content)}::jsonb) as id`
    return result[0]?.id?.toString() || ""
  } catch (error) {
    console.error("Failed to create snapshot:", error)
    throw error
  }
}

// دالة استعادة من لقطة
export async function restoreFromSnapshot(snapshotId: string): Promise<boolean> {
  try {
    const result = await sql`SELECT restore_from_snapshot(${Number.parseInt(snapshotId)}) as success`
    return result[0]?.success || false
  } catch (error) {
    console.error("Failed to restore from snapshot:", error)
    throw error
  }
}
