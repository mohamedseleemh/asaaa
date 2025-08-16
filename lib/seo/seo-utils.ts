interface SEOConfig {
  title: string
  description: string
  keywords: string[]
  canonical?: string
  noindex?: boolean
  ogImage?: string
  twitterCard?: "summary" | "summary_large_image"
  structuredData?: any
}

interface LocalizedSEO {
  ar: SEOConfig
  en: SEOConfig
}

export class SEOManager {
  private static instance: SEOManager
  private baseUrl: string
  private defaultConfig: LocalizedSEO

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kyctrust.com"
    this.defaultConfig = {
      ar: {
        title: "KYC Trust - خدمات مالية آمنة | تفعيل المحافظ الإلكترونية",
        description:
          "شريكك الموثوق للمعاملات المالية الآمنة وخدمات التحقق من الهوية. تفعيل PayPal، Payoneer، Wise، Skrill بأمان وسرعة.",
        keywords: [
          "تفعيل بايبال",
          "تفعيل بايونير",
          "محافظ إلكترونية",
          "خدمات مالية",
          "KYC",
          "تحقق الهوية",
          "معاملات آمنة",
        ],
        ogImage: "/images/og/og-image-ar.jpg",
        twitterCard: "summary_large_image",
      },
      en: {
        title: "KYC Trust - Secure Financial Services | E-Wallet Activation",
        description:
          "Your trusted partner for secure financial transactions and KYC verification services. PayPal, Payoneer, Wise, Skrill activation with security and speed.",
        keywords: [
          "PayPal activation",
          "Payoneer activation",
          "e-wallets",
          "financial services",
          "KYC",
          "identity verification",
          "secure transactions",
        ],
        ogImage: "/images/og/og-image-en.jpg",
        twitterCard: "summary_large_image",
      },
    }
  }

  static getInstance(): SEOManager {
    if (!SEOManager.instance) {
      SEOManager.instance = new SEOManager()
    }
    return SEOManager.instance
  }

  generateMetadata(locale: "ar" | "en", pageConfig?: Partial<SEOConfig>) {
    const config = { ...this.defaultConfig[locale], ...pageConfig }

    return {
      title: config.title,
      description: config.description,
      keywords: config.keywords.join(", "),
      robots: config.noindex ? "noindex, nofollow" : "index, follow",
      canonical: config.canonical || this.baseUrl,
      openGraph: {
        type: "website",
        locale: locale === "ar" ? "ar_SA" : "en_US",
        url: config.canonical || this.baseUrl,
        title: config.title,
        description: config.description,
        siteName: "KYC Trust",
        images: [
          {
            url: config.ogImage || this.defaultConfig[locale].ogImage,
            width: 1200,
            height: 630,
            alt: config.title,
          },
        ],
      },
      twitter: {
        card: config.twitterCard || "summary_large_image",
        title: config.title,
        description: config.description,
        images: [config.ogImage || this.defaultConfig[locale].ogImage],
        creator: "@kyctrust",
      },
      alternates: {
        canonical: config.canonical || this.baseUrl,
        languages: {
          "ar-SA": `${this.baseUrl}/ar`,
          "en-US": `${this.baseUrl}/en`,
        },
      },
    }
  }

  generateStructuredData(locale: "ar" | "en", type: "organization" | "website" | "service" | "faq", data?: any) {
    const baseData = {
      "@context": "https://schema.org",
      "@type":
        type === "organization"
          ? "Organization"
          : type === "website"
            ? "WebSite"
            : type === "service"
              ? "Service"
              : "FAQPage",
    }

    switch (type) {
      case "organization":
        return {
          ...baseData,
          name: "KYC Trust",
          url: this.baseUrl,
          logo: `${this.baseUrl}/images/brand/kyctrust-logo.png`,
          description:
            locale === "ar"
              ? "شركة متخصصة في خدمات التحقق من الهوية والمعاملات المالية الآمنة"
              : "Specialized company in KYC verification and secure financial transactions",
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+20-106-245-3344",
            contactType: "customer service",
            availableLanguage: ["Arabic", "English"],
          },
          sameAs: ["https://wa.me/201062453344"],
        }

      case "website":
        return {
          ...baseData,
          name: "KYC Trust",
          url: this.baseUrl,
          inLanguage: locale,
          potentialAction: {
            "@type": "SearchAction",
            target: `${this.baseUrl}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }

      case "service":
        return {
          ...baseData,
          name: locale === "ar" ? "خدمات تفعيل المحافظ الإلكترونية" : "E-Wallet Activation Services",
          description:
            locale === "ar"
              ? "خدمات تفعيل وتحقق المحافظ الإلكترونية مثل PayPal و Payoneer و Wise"
              : "E-wallet activation and verification services for PayPal, Payoneer, Wise",
          provider: {
            "@type": "Organization",
            name: "KYC Trust",
          },
          serviceType: locale === "ar" ? "خدمات مالية" : "Financial Services",
          areaServed: "Worldwide",
        }

      case "faq":
        return {
          ...baseData,
          mainEntity:
            data?.faqs?.map((faq: any) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })) || [],
        }

      default:
        return baseData
    }
  }

  generateSitemap() {
    const pages = [
      { url: "/", priority: 1.0, changefreq: "weekly" },
      { url: "/ar", priority: 1.0, changefreq: "weekly" },
      { url: "/en", priority: 1.0, changefreq: "weekly" },
      { url: "/services", priority: 0.8, changefreq: "monthly" },
      { url: "/about", priority: 0.6, changefreq: "monthly" },
      { url: "/contact", priority: 0.7, changefreq: "monthly" },
    ]

    return pages.map((page) => ({
      url: `${this.baseUrl}${page.url}`,
      lastModified: new Date().toISOString(),
      changeFrequency: page.changefreq as any,
      priority: page.priority,
    }))
  }
}

export const seoManager = SEOManager.getInstance()
