// فصل التحقق من مخطط قاعدة البيانات
import { executeQuery } from "./connection"
import { REQUIRED_TABLES } from "./config"

export interface SchemaValidationResult {
  isValid: boolean
  missingTables: string[]
  version?: string
  errors?: string[]
}

export async function validateDatabaseSchema(): Promise<SchemaValidationResult> {
  try {
    // Check if tables exist
    const existingTables = await executeQuery(
      `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = ANY($1)
    `,
      [REQUIRED_TABLES],
    )

    const existingTableNames = existingTables.map((t: any) => t.table_name)
    const missingTables = REQUIRED_TABLES.filter((table) => !existingTableNames.includes(table))

    // Get schema version
    let version = "unknown"
    try {
      const versionResult = await executeQuery(`
        SELECT value->>'version' as version 
        FROM settings 
        WHERE key = 'installation_completed'
      `)
      version = versionResult[0]?.version || "unknown"
    } catch {
      // Settings table might not exist yet
    }

    return {
      isValid: missingTables.length === 0,
      missingTables,
      version,
    }
  } catch (error) {
    console.error("Schema validation failed:", error)
    return {
      isValid: false,
      missingTables: [],
      version: "error",
      errors: [(error as Error).message],
    }
  }
}

export async function createMissingTables(missingTables: string[]): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = []

  for (const table of missingTables) {
    try {
      await createTable(table)
    } catch (error) {
      errors.push(`Failed to create table ${table}: ${(error as Error).message}`)
    }
  }

  return {
    success: errors.length === 0,
    errors,
  }
}

async function createTable(tableName: string): Promise<void> {
  const tableSchemas: Record<string, string> = {
    settings: `
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(255) PRIMARY KEY,
        value JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `,
    users: `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        role VARCHAR(50) DEFAULT 'viewer',
        active BOOLEAN DEFAULT true,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP,
        last_login_at TIMESTAMP,
        password_changed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `,
    user_sessions: `
      CREATE TABLE IF NOT EXISTS user_sessions (
        token VARCHAR(255) PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMP NOT NULL,
        ip_address INET,
        user_agent TEXT,
        device_fingerprint VARCHAR(255),
        last_activity TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,
    // Add more table schemas as needed
  }

  const schema = tableSchemas[tableName]
  if (!schema) {
    throw new Error(`No schema defined for table: ${tableName}`)
  }

  await executeQuery(schema)
}
