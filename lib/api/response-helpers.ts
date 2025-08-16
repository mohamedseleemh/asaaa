// مساعدات الاستجابة للـ API
import { NextResponse } from "next/server"

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp?: string
}

export function createSuccessResponse<T>(data: T, message?: string): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  }
  return NextResponse.json(response)
}

export function createErrorResponse(error: string, status = 500, details?: any): NextResponse {
  const response: ApiResponse = {
    success: false,
    error,
    timestamp: new Date().toISOString(),
    ...(details && { details }),
  }
  return NextResponse.json(response, { status })
}

export function createValidationErrorResponse(errors: Record<string, string>): NextResponse {
  return createErrorResponse("Validation failed", 400, { validationErrors: errors })
}

export function createUnauthorizedResponse(message = "غير مصرح"): NextResponse {
  return createErrorResponse(message, 401)
}

export function createForbiddenResponse(message = "ممنوع"): NextResponse {
  return createErrorResponse(message, 403)
}

export function createNotFoundResponse(message = "غير موجود"): NextResponse {
  return createErrorResponse(message, 404)
}
