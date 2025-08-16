import type { NextRequest } from "next/server"
import { createAuthContext } from "@/lib/security/enhanced-auth"
import { executeWithMetrics } from "@/lib/database/connection"
import {
  createSuccessResponse,
  createErrorResponse,
  createUnauthorizedResponse,
  createValidationErrorResponse,
} from "@/lib/api/response-helpers"
import { validateRequest } from "@/lib/api/validation"

const contentSchema = {
  locale: { required: true, type: "string" as const, pattern: /^(ar|en)$/ },
  content: { required: true, type: "object" as const },
  design: { type: "object" as const },
  blocks: { type: "array" as const },
}

export async function POST(req: NextRequest) {
  try {
    // التحقق من المصادقة
    const authContext = await createAuthContext(req)
    if (!authContext || !authContext.canAccess({ resource: "content", action: "update" })) {
      return createUnauthorizedResponse()
    }

    const requestData = await req.json()

    // التحقق من صحة البيانات
    const validation = validateRequest(requestData, contentSchema)
    if (!validation.isValid) {
      return createValidationErrorResponse(validation.errors)
    }

    const { locale, content, design, blocks } = requestData

    // حفظ المحتوى في قاعدة البيانات
    await executeWithMetrics(
      `
      INSERT INTO content_versions (
        locale,
        content,
        design,
        blocks,
        created_by,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
    `,
      [locale, JSON.stringify(content), JSON.stringify(design), JSON.stringify(blocks), authContext.user.id],
    )

    // تحديث المحتوى المنشور
    await executeWithMetrics(
      `
      INSERT INTO published_content (locale, content, design, blocks, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (locale) 
      DO UPDATE SET 
        content = EXCLUDED.content,
        design = EXCLUDED.design,
        blocks = EXCLUDED.blocks,
        updated_at = EXCLUDED.updated_at
    `,
      [locale, JSON.stringify(content), JSON.stringify(design), JSON.stringify(blocks)],
    )

    return createSuccessResponse({ saved: true }, "تم حفظ المحتوى بنجاح")
  } catch (error) {
    console.error("Error saving content:", error)
    return createErrorResponse("خطأ في الخادم")
  }
}
