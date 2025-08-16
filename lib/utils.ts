import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * دالة لدمج أسماء الفئات مع دعم Tailwind CSS
 * تستخدم clsx لمعالجة الشروط و tailwind-merge لحل التعارضات
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * دالة debounce لتأخير تنفيذ الوظائف
 * مفيدة لتحسين الأداء في البحث والتفاعلات المتكررة
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * تنسيق التاريخ مع دعم اللغة العربية
 */
export function formatDate(date: Date, locale = "ar-SA"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

/**
 * تنسيق التاريخ والوقت
 */
export function formatDateTime(date: Date, locale = "ar-SA"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

/**
 * تنسيق الأرقام
 */
export function formatNumber(num: number, locale = "ar-SA"): string {
  return new Intl.NumberFormat(locale).format(num)
}

/**
 * اقتطاع النص
 */
export function truncate(text: string, length: number, suffix = "..."): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + suffix
}

/**
 * تحويل النص إلى slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\u0600-\u06FF]/g, "") // إزالة الأحرف العربية
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * الحصول على الأحرف الأولى من الاسم
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter((n) => n.length > 0)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/**
 * التحقق من صحة البريد الإلكتروني
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * التحقق من صحة رقم الهاتف
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

/**
 * تحسين الصور
 */
export function optimizeImageUrl(url: string, width?: number, height?: number, quality = 80): string {
  if (!url) return ""

  // إذا كان الرابط محلي، أضف معاملات التحسين
  if (url.startsWith("/")) {
    const params = new URLSearchParams()
    if (width) params.set("w", width.toString())
    if (height) params.set("h", height.toString())
    params.set("q", quality.toString())

    return `${url}?${params.toString()}`
  }

  return url
}
