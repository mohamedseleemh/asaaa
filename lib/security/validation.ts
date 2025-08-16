export const securityValidation = {
  // التحقق من صحة البريد الإلكتروني
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254
  },

  // التحقق من صحة رقم الهاتف
  validatePhone: (phone: string): boolean => {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/\s/g, ""))
  },

  // تنظيف النص من الأكواد الضارة
  sanitizeText: (text: string): string => {
    return text
      .replace(/[<>]/g, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+=/gi, "")
      .trim()
  },

  // التحقق من قوة كلمة المرور
  validatePassword: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push("كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("يجب أن تحتوي على حرف كبير واحد على الأقل")
    }

    if (!/[a-z]/.test(password)) {
      errors.push("يجب أن تحتوي على حرف صغير واحد على الأقل")
    }

    if (!/\d/.test(password)) {
      errors.push("يجب أن تحتوي على رقم واحد على الأقل")
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  },

  // التحقق من الـ URL
  validateURL: (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },
}
