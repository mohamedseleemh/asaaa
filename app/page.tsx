"use client"

import { useEffect } from "react"
import { useCMS } from "@/lib/store"
import { BlocksRenderer } from "@/components/blocks/blocks-renderer"
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget"

export default function HomePage() {
  const { locale } = useCMS()

  useEffect(() => {
    // Set document direction based on locale
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = locale
  }, [locale])

  return (
    <div className="min-h-screen bg-background">
      <BlocksRenderer />
      <ChatbotWidget />
    </div>
  )
}
