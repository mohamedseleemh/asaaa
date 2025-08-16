// فصل محتوى البطل إلى مكون منفصل
"use client"
import Link from "next/link"
import { ArrowRight, MessageCircle, Shield, Star, Users, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollReveal, FadeIn } from "@/components/animate/scroll-reveal"
import { HeroStats } from "./hero-stats"

interface HeroContentProps {
  locale: string
  bundle: any
}

export function HeroContent({ locale, bundle }: HeroContentProps) {
  return (
    <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
      {/* Badges and Rating */}
      <FadeIn delay={0.2}>
        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border-emerald-200 px-4 py-2"
          >
            <Shield className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
            {locale === "ar" ? "موثوق ومضمون" : "Trusted & Secure"}
          </Badge>
          <div className="flex items-center space-x-1 rtl:space-x-reverse text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
            <span className="text-sm text-muted-foreground ml-2 rtl:ml-0 rtl:mr-2">
              {locale === "ar" ? "تقييم 5 نجوم" : "5-Star Rated"}
            </span>
          </div>
        </div>
      </FadeIn>

      {/* Main Title */}
      <ScrollReveal delay={0.3}>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
          {bundle?.hero?.title || (locale === "ar" ? "خدمات تفعيل التطبيقات" : "App Activation Services")}
        </h1>
      </ScrollReveal>

      {/* Subtitle */}
      <ScrollReveal delay={0.4}>
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
          {bundle?.hero?.subtitle ||
            (locale === "ar"
              ? "نقدم خدمات تفعيل آمنة وموثوقة لجميع التطبيقات"
              : "We provide secure and reliable activation services for all applications")}
        </p>
      </ScrollReveal>

      {/* Description */}
      <ScrollReveal delay={0.5}>
        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
          {bundle?.hero?.description ||
            (locale === "ar"
              ? "فريق محترف متاح 24/7 لخدمتكم بأفضل الأسعار"
              : "Professional team available 24/7 to serve you with the best prices")}
        </p>
      </ScrollReveal>

      {/* Stats */}
      <ScrollReveal delay={0.6}>
        <HeroStats locale={locale} />
      </ScrollReveal>

      {/* CTA Buttons */}
      <ScrollReveal delay={0.7}>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white group shadow-xl hover:shadow-2xl transition-all duration-300 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
          >
            <Link
              href={`https://wa.me/971501234567?text=${encodeURIComponent(bundle?.hero?.whatsapp || (locale === "ar" ? "مرحبا، أريد الاستفسار عن خدماتكم" : "Hello, I want to inquire about your services"))}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" />
              {bundle?.hero?.whatsapp || (locale === "ar" ? "تواصل معنا" : "Contact Us")}
              <ArrowRight className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
            onClick={() => {
              document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })
            }}
          >
            {locale === "ar" ? "استكشف الخدمات" : "Explore Services"}
          </Button>
        </div>
      </ScrollReveal>

      {/* Bottom Info */}
      <ScrollReveal delay={0.8}>
        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-8 rtl:space-x-reverse pt-6 lg:pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-muted-foreground">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>{locale === "ar" ? "أكثر من 10,000 عميل" : "10,000+ Customers"}</span>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-muted-foreground">
            <Award className="w-4 h-4 text-blue-600" />
            <span>{locale === "ar" ? "ضمان 100%" : "100% Guarantee"}</span>
          </div>
        </div>
      </ScrollReveal>
    </div>
  )
}
