import type { Metadata } from "next"

const siteConfig = {
  name: "KYC Trust",
  description:
    "Your trusted partner for secure financial transactions and KYC verification services. PayPal, Payoneer, Wise, Skrill activation services with guaranteed security and 24/7 support.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://kyctrust.com",
  ogImage: "/images/og/og-image-main.jpg",
  creator: "@kyctrust",
}

const keywords = [
  "KYC",
  "financial services",
  "PayPal activation",
  "Payoneer",
  "Wise",
  "Skrill",
  "Neteller",
  "secure transactions",
  "verification",
  "تفعيل بايبال",
  "تفعيل بايونير",
  "محافظ إلكترونية",
  "خدمات مالية",
  "تحقق الهوية",
  "معاملات آمنة",
  "e-wallet activation",
  "digital payments",
]

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - Secure Financial Services | تفعيل المحافظ الإلكترونية`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords,
  authors: [{ name: "KYC Trust Team", url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: `${siteConfig.name} - Secure Financial Services`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: "/images/og/og-image-main.jpg",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Secure Financial Services`,
        type: "image/jpeg",
      },
      {
        url: "/images/og/og-image-square.jpg",
        width: 400,
        height: 400,
        alt: `${siteConfig.name} Logo`,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} - Secure Financial Services`,
    description: siteConfig.description,
    creator: siteConfig.creator,
    site: siteConfig.creator,
    images: [
      {
        url: siteConfig.ogImage,
        alt: `${siteConfig.name} - Secure Financial Services`,
      },
    ],
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en",
      "ar-SA": "/ar",
      "x-default": "/",
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    other: {
      "msvalidate.01": process.env.BING_SITE_VERIFICATION || "",
    },
  },
  category: "Financial Services",
  classification: "Business",
}
