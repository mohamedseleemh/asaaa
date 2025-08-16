"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCMS } from "@/lib/store"
import { motion } from "framer-motion"
import { CheckCircle, Star, Users, Shield } from "lucide-react"

export function HeroSection() {
  const { content, locale } = useCMS()
  const heroContent = content.hero

  const stats = [
    {
      icon: Users,
      value: "10,000+",
      label: locale === "ar" ? "عميل راضٍ" : "Happy Clients",
    },
    {
      icon: CheckCircle,
      value: "99.9%",
      label: locale === "ar" ? "معدل النجاح" : "Success Rate",
    },
    {
      icon: Shield,
      value: "24/7",
      label: locale === "ar" ? "دعم فني" : "Support",
    },
  ]

  const handleWhatsAppContact = () => {
    const message =
      locale === "ar" ? "مرحباً، أريد الاستفسار عن خدماتكم" : "Hello, I want to inquire about your services"
    window.open(`https://wa.me/971501234567?text=${encodeURIComponent(message)}`, "_blank")
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%23059669 fillOpacity=0.1%3E%3Ccircle cx=30 cy=30 r=2/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-4 py-2 text-sm font-medium">
              <Star className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
              {locale === "ar" ? "الأفضل في المنطقة" : "Best in Region"}
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              {heroContent.title[locale]}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            {heroContent.subtitle[locale]}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <Button
              onClick={handleWhatsAppContact}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {locale === "ar" ? "ابدأ الآن" : "Get Started"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 bg-transparent"
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
            >
              {locale === "ar" ? "تعرف على خدماتنا" : "Learn More"}
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full mb-3">
                  <stat.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
        </div>
      </motion.div>
    </section>
  )
}
