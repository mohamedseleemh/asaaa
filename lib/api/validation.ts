// مساعدات التحقق للـ API
export interface ValidationRule {
  required?: boolean
  type?: "string" | "number" | "boolean" | "array" | "object"
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

export interface ValidationSchema {
  [key: string]: ValidationRule
}

export function validateRequest(
  data: any,
  schema: ValidationSchema,
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  for (const [field, rule] of Object.entries(schema)) {
    const value = data[field]

    // Check required
    if (rule.required && (value === undefined || value === null || value === "")) {
      errors[field] = `${field} is required`
      continue
    }

    // Skip validation if field is not required and empty
    if (!rule.required && (value === undefined || value === null || value === "")) {
      continue
    }

    // Check type
    if (rule.type && typeof value !== rule.type) {
      errors[field] = `${field} must be of type ${rule.type}`
      continue
    }

    // Check string length
    if (rule.type === "string" && typeof value === "string") {
      if (rule.minLength && value.length < rule.minLength) {
        errors[field] = `${field} must be at least ${rule.minLength} characters`
        continue
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors[field] = `${field} must be no more than ${rule.maxLength} characters`
        continue
      }
    }

    // Check pattern
    if (rule.pattern && typeof value === "string" && !rule.pattern.test(value)) {
      errors[field] = `${field} format is invalid`
      continue
    }

    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(value)
      if (customResult !== true) {
        errors[field] = typeof customResult === "string" ? customResult : `${field} is invalid`
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
