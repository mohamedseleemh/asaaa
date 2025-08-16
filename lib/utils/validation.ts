/**
 * وظائف التحقق من صحة البيانات
 * تدعم التحقق من البيانات العربية والإنجليزية مع تحسينات متقدمة
 */

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

export function isValidSaudiPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, "")
  // أرقام سعودية: تبدأ بـ +966 أو 966 أو 05
  const saudiRegex = /^(\+966|966|0)?5[0-9]{8}$/
  return saudiRegex.test(cleaned)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[1-9][\d]{7,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return ["http:", "https:"].includes(urlObj.protocol)
  } catch {
    return false
  }
}

export function isStrongPassword(password: string): boolean {
  // 8 أحرف على الأقل، حرف كبير، حرف صغير، رقم، رمز خاص
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return strongPasswordRegex.test(password)
}

export function validateRequired(value: any): boolean {
  if (typeof value === "string") {
    return value.trim().length > 0
  }
  if (Array.isArray(value)) {
    return value.length > 0
  }
  return value !== null && value !== undefined
}

export function validateMinLength(value: string, minLength: number): boolean {
  return value.trim().length >= minLength
}

export function validateMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength
}

export function validateRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

export function isValidSaudiID(id: string): boolean {
  const cleaned = id.replace(/\s/g, "")
  if (!/^\d{10}$/.test(cleaned)) return false

  // خوارزمية التحقق من الهوية السعودية
  let sum = 0
  for (let i = 0; i < 9; i++) {
    const digit = Number.parseInt(cleaned[i])
    if (i % 2 === 0) {
      const doubled = digit * 2
      sum += doubled > 9 ? doubled - 9 : doubled
    } else {
      sum += digit
    }
  }

  const checkDigit = (10 - (sum % 10)) % 10
  return checkDigit === Number.parseInt(cleaned[9])
}

export function containsArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text)
}

export function containsEnglish(text: string): boolean {
  return /[a-zA-Z]/.test(text)
}

export function isValidIBAN(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, "").toUpperCase()
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned)) return false

  // خوارزمية MOD-97 للتحقق من IBAN
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4)
  const numericString = rearranged.replace(/[A-Z]/g, (char) => (char.charCodeAt(0) - 55).toString())

  let remainder = ""
  for (const digit of numericString) {
    remainder = (Number.parseInt(remainder + digit) % 97).toString()
  }

  return Number.parseInt(remainder) === 1
}

export function isValidCreditCard(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, "")
  if (!/^\d{13,19}$/.test(cleaned)) return false

  // خوارزمية Luhn للتحقق من بطاقة الائتمان
  let sum = 0
  let isEven = false

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(cleaned[i])

    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

export function validateArabicText(
  text: string,
  minLength = 2,
  maxLength = 500,
): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!text || text.trim().length === 0) {
    errors.push("النص مطلوب")
  } else {
    if (text.trim().length < minLength) {
      errors.push(`النص يجب أن يكون ${minLength} أحرف على الأقل`)
    }
    if (text.length > maxLength) {
      errors.push(`النص يجب أن يكون أقل من ${maxLength} حرف`)
    }
    if (!containsArabic(text)) {
      errors.push("النص يجب أن يحتوي على أحرف عربية")
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateEnglishText(
  text: string,
  minLength = 2,
  maxLength = 500,
): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!text || text.trim().length === 0) {
    errors.push("Text is required")
  } else {
    if (text.trim().length < minLength) {
      errors.push(`Text must be at least ${minLength} characters`)
    }
    if (text.length > maxLength) {
      errors.push(`Text must be less than ${maxLength} characters`)
    }
    if (!containsEnglish(text)) {
      errors.push("Text must contain English characters")
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // إزالة علامات HTML الأساسية
    .replace(/javascript:/gi, "") // إزالة JavaScript
    .replace(/on\w+=/gi, "") // إزالة معالجات الأحداث
}

export function isValidFileType(fileName: string, allowedTypes: string[]): boolean {
  const extension = fileName.split(".").pop()?.toLowerCase()
  return extension ? allowedTypes.includes(extension) : false
}

export function isValidFileSize(fileSize: number, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return fileSize <= maxSizeInBytes
}
