// فصل أنواع البيانات الخاصة بـ CMS
export type Locale = "ar" | "en"

export interface Service {
  id: string
  title: string
  description: string
  icon: string
  price?: string
  features?: string[]
}

export interface Bundle {
  hero: {
    title: string
    subtitle: string
    description: string
    cta: string
    whatsapp: string
  }
  services: Service[]
  about: {
    title: string
    description: string
    features: string[]
  }
  contact: {
    title: string
    description: string
    phone: string
    email: string
    address: string
  }
  faq: Array<{
    question: string
    answer: string
  }>
  testimonials: Array<{
    name: string
    role: string
    content: string
    rating: number
  }>
}

export interface Design {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  borderRadius: string
  spacing: string
  palette: string
}

export interface Block {
  id: string
  name: string
  type: string
  enabled: boolean
  order: number
}

export interface CMSState {
  locale: Locale
  content: Record<Locale, Bundle>
  design: Design
  blocks: Block[]
}
