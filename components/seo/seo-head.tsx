"use client"

import Head from "next/head"
import { useMemo } from "react"
import { useCMS } from "@/lib/store"

function jsonLd(obj: unknown) {
  try {
    return JSON.stringify(obj)
  } catch {
    return "{}"
  }
}

export function SEOHead() {
  const { locale, content } = useCMS()
  const data = content[locale]
  const siteUrl =
    (typeof process !== "undefined" && (process as any).env?.NEXT_PUBLIC_SITE_URL) ||
    (typeof window !== "undefined" ? window.location.origin : "https://example.com")
  const canonical = siteUrl
  const title = `${data.site.name} — ${data.hero.subtitle || data.site.tagline || ""}`.trim()
  const description = data.site.description || data.hero.description || data.site.tagline
  const logo = data.site.logoSrc || "/generic-brand-logo.png"
  const alternateAr = `${siteUrl}/?lang=ar`
  const alternateEn = `${siteUrl}/?lang=en`

  const organizationLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: data.site.name,
      url: siteUrl,
      logo: `${siteUrl}${logo.startsWith("/") ? logo : `/${logo}`}`,
      description: description,
      foundingDate: "2020",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+971501234567",
        contactType: "customer service",
        availableLanguage: ["Arabic", "English"],
        hoursAvailable: "Mo-Su 00:00-23:59",
      },
      address: {
        "@type": "PostalAddress",
        addressCountry: "AE",
        addressRegion: "Dubai",
      },
      sameAs: ["https://wa.me/971501234567", "https://t.me/kyctrust"],
      serviceType: "Financial Services",
      areaServed: ["AE", "SA", "EG", "JO", "LB", "KW", "QA", "BH", "OM"],
    }),
    [data.site.name, siteUrl, logo, description],
  )

  const websiteLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: data.site.name,
      url: siteUrl,
      description: description,
      inLanguage: locale === "ar" ? "ar" : "en",
      publisher: {
        "@type": "Organization",
        name: data.site.name,
        logo: `${siteUrl}${logo.startsWith("/") ? logo : `/${logo}`}`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    }),
    [data.site.name, siteUrl, locale, description, logo],
  )

  const serviceSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Service",
      name: "KYC Verification and E-Wallet Activation Services",
      description:
        "Professional KYC verification and e-wallet activation services for PayPal, Payoneer, Wise, Skrill, and more",
      provider: {
        "@type": "Organization",
        name: data.site.name,
        url: siteUrl,
      },
      serviceType: "Financial Technology Services",
      category: "Financial Services",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "E-Wallet Activation Services",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "PayPal Account Activation",
              description: "Professional PayPal account activation and verification service",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Payoneer Account Setup",
              description: "Complete Payoneer account setup and verification assistance",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Wise Account Verification",
              description: "Wise (formerly TransferWise) account verification and setup",
            },
          },
        ],
      },
      areaServed: ["AE", "SA", "EG", "JO", "LB", "KW", "QA", "BH", "OM"],
      availableLanguage: ["Arabic", "English"],
    }),
    [data.site.name, siteUrl],
  )

  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: locale === "ar" ? "كم يستغرق تفعيل الحساب؟" : "How long does account activation take?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              locale === "ar"
                ? "عادة ما يستغرق تفعيل الحساب من 24 إلى 72 ساعة حسب نوع الخدمة والمتطلبات."
                : "Account activation typically takes 24-72 hours depending on the service type and requirements.",
          },
        },
        {
          "@type": "Question",
          name: locale === "ar" ? "هل الخدمة آمنة؟" : "Is the service secure?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              locale === "ar"
                ? "نعم، نحن نستخدم أحدث تقنيات الأمان والتشفير لحماية بياناتك الشخصية والمالية."
                : "Yes, we use the latest security and encryption technologies to protect your personal and financial data.",
          },
        },
      ],
    }),
    [locale],
  )

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />

      <meta
        name="keywords"
        content={
          locale === "ar"
            ? "تفعيل بايبال, تفعيل بايونير, محافظ إلكترونية, خدمات مالية, تحقق الهوية, KYC, تفعيل وايز, تفعيل سكريل"
            : "PayPal activation, Payoneer setup, e-wallet services, financial services, KYC verification, Wise activation, Skrill setup"
        }
      />
      <meta name="author" content="KYC Trust Team" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="ar" href={alternateAr} />
      <link rel="alternate" hrefLang="en" href={alternateEn} />
      <link rel="alternate" hrefLang="x-default" href={siteUrl} />

      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <meta name="theme-color" content="#10b981" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#059669" media="(prefers-color-scheme: dark)" />
      <meta name="color-scheme" content="light dark" />

      <meta property="og:type" content="website" />
      <meta property="og:locale" content={locale === "ar" ? "ar_AR" : "en_US"} />
      <meta property="og:locale:alternate" content={locale === "ar" ? "en_US" : "ar_AR"} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={data.site.name} />
      <meta property="og:image" content={`${siteUrl}/images/og/og-image-main.jpg`} />
      <meta property="og:image:secure_url" content={`${siteUrl}/images/og/og-image-main.jpg`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${data.site.name} - ${description}`} />
      <meta property="og:image:type" content="image/jpeg" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@kyctrust" />
      <meta name="twitter:creator" content="@kyctrust" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}/images/og/og-image-main.jpg`} />
      <meta name="twitter:image:alt" content={`${data.site.name} - ${description}`} />

      <meta name="application-name" content={data.site.name} />
      <meta name="apple-mobile-web-app-title" content={data.site.name} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-TileColor" content="#10b981" />
      <meta name="msapplication-config" content="/browserconfig.xml" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organizationLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
    </Head>
  )
}
