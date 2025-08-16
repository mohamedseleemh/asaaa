/**
 * وظائف التنسيق والتحويل
 * تدعم اللغة العربية والإنجليزية مع تحسينات الأداء
 */

export function formatDate(date: Date, locale = "ar-SA"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

export function formatDateTime(date: Date, locale = "ar-SA"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function formatRelativeTime(date: Date, locale = "ar-SA"): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
  const now = new Date()
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000)

  const intervals = [
    { unit: "year" as const, seconds: 31536000 },
    { unit: "month" as const, seconds: 2592000 },
    { unit: "day" as const, seconds: 86400 },
    { unit: "hour" as const, seconds: 3600 },
    { unit: "minute" as const, seconds: 60 },
  ]

  for (const interval of intervals) {
    const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds)
    if (count >= 1) {
      return rtf.format(diffInSeconds < 0 ? -count : count, interval.unit)
    }
  }

  return rtf.format(0, "second")
}

export function formatCurrency(amount: number, currency = "USD", locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(num: number, locale = "ar-SA"): string {
  return new Intl.NumberFormat(locale).format(num)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function formatPhoneNumber(phone: string, format: "international" | "national" = "international"): string {
  const cleaned = phone.replace(/\D/g, "")

  if (format === "international") {
    return `+${cleaned}`
  }

  // تنسيق محلي محسن للأرقام السعودية
  if (cleaned.startsWith("966")) {
    const localNumber = cleaned.slice(3)
    if (localNumber.length === 9) {
      return `0${localNumber.slice(0, 2)} ${localNumber.slice(2, 5)} ${localNumber.slice(5)}`
    }
  }

  // تنسيق عام للأرقام المحلية
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }

  return phone
}

export function truncate(text: string, length: number, suffix = "..."): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + suffix
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\u0600-\u06FF]/g, "") // إزالة الأحرف العربية
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter((n) => n.length > 0)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function capitalizeWords(text: string): string {
  return text
    .split(" ")
    .map((word) => capitalizeFirst(word))
    .join(" ")
}

export function formatArabicNumber(num: number): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٣", "٤", "٥"]
  return num.toString().replace(/\d/g, (digit) => arabicDigits[Number.parseInt(digit)])
}

export function formatBilingualDate(date: Date, locale: string): string {
  if (locale === "ar") {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      calendar: "gregory",
    }).format(date)
  }
  return formatDate(date, "en-US")
}

export function formatCurrencyBilingual(amount: number, currency = "USD", locale = "en-US"): string {
  const currencyMap: Record<string, { ar: string; en: string }> = {
    USD: { ar: "دولار أمريكي", en: "USD" },
    SAR: { ar: "ريال سعودي", en: "SAR" },
    AED: { ar: "درهم إماراتي", en: "AED" },
    EUR: { ar: "يورو", en: "EUR" },
  }

  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  if (locale === "ar" && currencyMap[currency]) {
    return `${formatArabicNumber(amount)} ${currencyMap[currency].ar}`
  }

  return formatted
}
