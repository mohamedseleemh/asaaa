export const SITE_CONFIG = {
  name: "KYC Trust",
  description: "خدمات التحقق من الهوية والامتثال المالي",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ogImage: "/images/og-image.jpg",
  links: {
    twitter: "https://twitter.com/kyctrust",
    github: "https://github.com/kyctrust",
    linkedin: "https://linkedin.com/company/kyctrust",
  },
} as const

export const NAVIGATION_ITEMS = [
  {
    title: "الرئيسية",
    href: "/",
  },
  {
    title: "الخدمات",
    href: "/services",
  },
  {
    title: "من نحن",
    href: "/about",
  },
  {
    title: "اتصل بنا",
    href: "/contact",
  },
] as const

export const CONTACT_INFO = {
  email: "info@kyctrust.com",
  phone: "+966 11 123 4567",
  address: "الرياض، المملكة العربية السعودية",
} as const
