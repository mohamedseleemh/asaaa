export interface WhatsAppConfig {
  phoneNumber: string
  message?: string
  businessName?: string
}

export function buildWhatsApp(message: string, service: string, locale: "ar" | "en", siteName: string): string {
  const phone = "201062453344" // Remove + and spaces

  const greeting =
    locale === "ar"
      ? `مرحباً، أريد الاستفسار عن ${service === "N/A" ? "خدماتكم" : service}`
      : `Hello, I want to inquire about ${service === "N/A" ? "your services" : service}`

  const fullMessage = `${greeting}\n\n${message}\n\n---\n${siteName}`

  return `https://wa.me/${phone}?text=${encodeURIComponent(fullMessage)}`
}

export function generateWhatsAppURL(config: WhatsAppConfig): string {
  const { phoneNumber, message = "", businessName = "KYCtrust" } = config

  // Clean phone number (remove spaces, dashes, etc.)
  const cleanPhone = phoneNumber.replace(/[^\d+]/g, "")

  // Default message if none provided
  const defaultMessage = `مرحباً، أود الاستفسار عن خدمات ${businessName}`
  const finalMessage = message || defaultMessage

  // Encode the message for URL
  const encodedMessage = encodeURIComponent(finalMessage)

  // Generate WhatsApp URL
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

export function openWhatsApp(config: WhatsAppConfig): void {
  const url = generateWhatsAppURL(config)
  window.open(url, "_blank", "noopener,noreferrer")
}

export function getWhatsAppButtonProps(config: WhatsAppConfig) {
  return {
    onClick: () => openWhatsApp(config),
    "aria-label": `تواصل عبر واتساب مع ${config.businessName || "KYCtrust"}`,
  }
}

// Predefined messages for different contexts
export const WhatsAppMessages = {
  general: "مرحباً، أود الاستفسار عن خدماتكم",
  services: "مرحباً، أود معرفة المزيد عن الخدمات المتاحة",
  support: "مرحباً، أحتاج مساعدة في",
  pricing: "مرحباً، أود الاستفسار عن الأسعار",
  consultation: "مرحباً، أود حجز استشارة مجانية",
} as const

export type WhatsAppMessageType = keyof typeof WhatsAppMessages
