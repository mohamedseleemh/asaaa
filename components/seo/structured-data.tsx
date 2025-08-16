"use client"

import { useCMS } from "@/lib/store"
import { seoManager } from "@/lib/seo/seo-utils"

interface StructuredDataProps {
  type: "organization" | "website" | "service" | "faq"
  data?: any
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const { locale, content } = useCMS()
  const currentLocale = locale as "ar" | "en"

  const structuredData = seoManager.generateStructuredData(currentLocale, type, data)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}

export function OrganizationStructuredData() {
  return <StructuredData type="organization" />
}

export function WebsiteStructuredData() {
  return <StructuredData type="website" />
}

export function ServiceStructuredData() {
  return <StructuredData type="service" />
}

export function FAQStructuredData({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  return <StructuredData type="faq" data={{ faqs }} />
}
