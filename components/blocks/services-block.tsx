"use client"
import Link from "next/link"
import { ArrowRight, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollReveal, ScaleIn } from "@/components/animate/scroll-reveal"
import { useCMS } from "@/lib/store"
import { motion } from "framer-motion"

const serviceIcons = {
  paypal: "💰",
  payoneer: "💳",
  wise: "🌍",
  skrill: "🚀",
  neteller: "🔒",
  kast: "⚡",
  redotpay: "🔴",
  okx: "₿",
  worldfirst: "🌐",
  bybit: "📈",
  bitget: "🎯",
  kucoin: "🏆",
  crypto: "💎",
}

export function ServicesBlock() {
  const { locale, content } = useCMS()
  const bundle = content[locale]

  return (
    <section
      id="services"
      className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-4 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
          >
            💼 {locale === "ar" ? "خدماتنا" : "Our Services"}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-4">
            {locale === "ar" ? "خدمات التفعيل المتخصصة" : "Specialized Activation Services"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {locale === "ar"
              ? "نقدم خدمات تفعيل شاملة لجميع المحافظ الإلكترونية والمنصات المالية بأعلى معايير الأمان والجودة"
              : "We provide comprehensive activation services for all e-wallets and financial platforms with the highest standards of security and quality"}
          </p>
        </ScrollReveal>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {bundle.services.map((service, index) => {
            const serviceIcon = serviceIcons[service.icon as keyof typeof serviceIcons] || service.icon || "💎"

            return (
              <ScaleIn key={service.id} delay={index * 0.05}>
                <motion.div whileHover={{ y: -8, scale: 1.02 }} transition={{ duration: 0.3 }}>
                  <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 group overflow-hidden relative">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <CardHeader className="text-center pb-4 relative z-10">
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        {serviceIcon}
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {service.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                        {service.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4 relative z-10">
                      {/* Price */}
                      <div className="text-center">
                        <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-1">
                          {service.price}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {locale === "ar" ? "سعر تنافسي" : "Competitive Price"}
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2">
                        {service.features?.slice(0, 3).map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center space-x-2 rtl:space-x-reverse text-xs">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
                            <span className="text-gray-600 dark:text-gray-300 line-clamp-1">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <div className="pt-4">
                        <Button
                          asChild
                          size="sm"
                          className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white group/btn border-0"
                        >
                          <Link
                            href={`https://wa.me/971501234567?text=${encodeURIComponent(
                              `${locale === "ar" ? "مرحباً، أريد الاستفسار عن" : "Hello, I want to inquire about"} ${service.title}`,
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                            {locale === "ar" ? "اطلب الآن" : "Order Now"}
                            <ArrowRight className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2 group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </ScaleIn>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <ScrollReveal delay={0.8} className="text-center mt-16">
          <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative z-10">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-4">
                {locale === "ar" ? "لم تجد الخدمة التي تبحث عنها؟" : "Can't find the service you're looking for?"}
              </h3>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                {locale === "ar"
                  ? "تواصل معنا مباشرة عبر واتساب وسنساعدك في إيجاد الحل المناسب لاحتياجاتك المالية"
                  : "Contact us directly via WhatsApp and we'll help you find the right solution for your financial needs"}
              </p>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg"
              >
                <Link
                  href={`https://wa.me/971501234567?text=${encodeURIComponent(
                    locale === "ar"
                      ? "مرحباً، أريد الاستفسار عن خدمة مخصصة"
                      : "Hello, I want to inquire about a custom service",
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" />
                  {locale === "ar" ? "تواصل معنا الآن" : "Contact Us Now"}
                </Link>
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
