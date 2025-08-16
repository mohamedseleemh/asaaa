import type { Metadata } from "next"
import { seoManager } from "./seo-utils"

interface PageSEOProps {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  noindex?: boolean
  locale?: "ar" | "en"
  ogImage?: string
}

export function generatePageMetadata({
  title,
  description,
  keywords = [],
  canonical,
  noindex = false,
  locale = "en",
  ogImage,
}: PageSEOProps): Metadata {
  return seoManager.generateMetadata(locale, {
    title: title || seoManager["defaultConfig"][locale].title,
    description: description || seoManager["defaultConfig"][locale].description,
    keywords: keywords.length > 0 ? keywords : seoManager["defaultConfig"][locale].keywords,
    canonical,
    noindex,
    ogImage,
  })
}

export function generateServicePageMetadata(serviceName: string, locale: "ar" | "en" = "en"): Metadata {
  const serviceNames = {
    paypal: {
      ar: "تفعيل PayPal",
      en: "PayPal Activation",
    },
    payoneer: {
      ar: "تفعيل Payoneer",
      en: "Payoneer Activation",
    },
    wise: {
      ar: "تفعيل Wise",
      en: "Wise Activation",
    },
    skrill: {
      ar: "تفعيل Skrill",
      en: "Skrill Activation",
    },
  }

  const service = serviceNames[serviceName as keyof typeof serviceNames]
  if (!service) return generatePageMetadata({ locale })

  const title =
    locale === "ar"
      ? `${service.ar} - خدمة آمنة وسريعة | KYC Trust`
      : `${service.en} - Secure & Fast Service | KYC Trust`

  const description =
    locale === "ar"
      ? `احصل على ${service.ar} بأمان وسرعة مع KYC Trust. خدمة موثوقة مع ضمان كامل ودعم 24/7.`
      : `Get ${service.en} safely and quickly with KYC Trust. Trusted service with full guarantee and 24/7 support.`

  return generatePageMetadata({
    title,
    description,
    keywords:
      locale === "ar"
        ? [service.ar, "خدمات مالية", "تحقق الهوية", "آمن", "سريع"]
        : [service.en, "financial services", "identity verification", "secure", "fast"],
    locale,
    canonical: `/${locale}/services/${serviceName}`,
  })
}
