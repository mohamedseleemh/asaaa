import type React from "react"
// تعريف أنواع البيانات للمكونات
export interface BlockProps {
  locale: string
  content: any
}

export interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  value: string
  label: string
  color: string
  delay?: number
}

export interface HeroStats {
  clients: string
  successRate: string
  support: string
}
