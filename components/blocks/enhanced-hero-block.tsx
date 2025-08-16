"use client"

import Link from "next/link"
import { ArrowRight, MessageCircle, Shield, Star, Users, CheckCircle, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollReveal, FadeIn } from "@/components/animate/scroll-reveal"
import { InteractiveButton } from "@/components/ui/interactive-button"
import { GradientText } from "@/components/ui/gradient-text"
import { ProgressRing } from "@/components/ui/progress-ring"
import { FloatingElements } from "@/components/ui/floating-elements"
import { ParticleBackground } from "@/components/ui/particle-background"
import { useCMS } from "@/lib/store"
import { motion } from "framer-motion"

export function EnhancedHeroBlock() {
  const { locale, content } = useCMS()
  const bundle = content[locale]

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {/* Enhanced Background Effects */}
      <ParticleBackground count={15} />
      <FloatingElements />
      
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        
        {/* Enhanced Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fillRule=\"evenodd\"%3E%3Cg fill=\"%23000000\" fillOpacity=\"0.03\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Enhanced Content */}
          <div className="space-y-8">
            <FadeIn delay={0.2}>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border-emerald-200 hover:scale-105 transition-transform"
                >
                  <Shield className="w-3 h-3 mr-1 rtl:mr-0 rtl:ml-1" />
                  {locale === "ar" ? "موثوق ومضمون" : "Trusted & Secure"}
                </Badge>
                <motion.div 
                  className="flex items-center space-x-1 rtl:space-x-reverse text-yellow-500"
                  whileHover={{ scale: 1.05 }}
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </motion.div>
                  ))}
                  <span className="text-sm text-muted-foreground ml-1 rtl:ml-0 rtl:mr-1">
                    {locale === "ar" ? "تقييم 5 نجوم" : "5-Star Rated"}
                  </span>
                </motion.div>
              </div>
            </FadeIn>

            <ScrollReveal delay={0.3}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <GradientText gradient="rainbow" animate>
                  {bundle.hero.title}
                </GradientText>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">{bundle.hero.subtitle}</p>
            </ScrollReveal>

            <ScrollReveal delay={0.5}>
              <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">{bundle.hero.description}</p>
            </ScrollReveal>

            {/* Enhanced Stats Grid */}
            <ScrollReveal delay={0.6}>
              <div className="grid grid-cols-3 gap-6 py-6">
                <motion.div 
                  className="text-center p-4 rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-emerald-100 dark:border-emerald-800 hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-emerald-600 mr-1" />
                    <GradientText gradient="emerald" className="text-2xl font-bold">10K+</GradientText>
                  </div>
                  <div className="text-sm text-muted-foreground">{locale === "ar" ? "عميل راضٍ" : "Happy Clients"}</div>
                </motion.div>
                
                <motion.div 
                  className="text-center p-4 rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-blue-100 dark:border-blue-800 hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-1" />
                    <GradientText gradient="blue" className="text-2xl font-bold">99%</GradientText>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {locale === "ar" ? "معدل النجاح" : "Success Rate"}
                  </div>
                </motion.div>
                
                <motion.div 
                  className="text-center p-4 rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-purple-100 dark:border-purple-800 hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="w-5 h-5 text-purple-600 mr-1" />
                    <GradientText gradient="purple" className="text-2xl font-bold">24/7</GradientText>
                  </div>
                  <div className="text-sm text-muted-foreground">{locale === "ar" ? "دعم فني" : "Support"}</div>
                </motion.div>
              </div>
            </ScrollReveal>

            {/* Enhanced Action Buttons */}
            <ScrollReveal delay={0.7}>
              <div className="flex flex-col sm:flex-row gap-4">
                <InteractiveButton 
                  asChild 
                  size="lg" 
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg"
                  glow
                  ripple
                >
                  <Link
                    href={`https://wa.me/971501234567?text=${encodeURIComponent(bundle.hero.whatsapp)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" />
                    {bundle.hero.whatsapp}
                    <ArrowRight className="w-4 h-4 ml-2 rtl:ml-0 rtl:mr-2" />
                  </Link>
                </InteractiveButton>
                
                <InteractiveButton
                  variant="outline"
                  size="lg"
                  className="border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/20 bg-transparent"
                  onClick={() => {
                    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  {locale === "ar" ? "استكشف الخدمات" : "Explore Services"}
                </InteractiveButton>
              </div>
            </ScrollReveal>

          </div>

          {/* Enhanced Visual Card */}
          <div className="relative">
            <ScrollReveal delay={0.9} direction="right">
              <div className="relative">
                <motion.div
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-200/50 dark:border-gray-700/50"
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {locale === "ar" ? "تفعيل آمن" : "Secure Activation"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {locale === "ar" ? "خدمة موثوقة" : "Trusted Service"}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {locale === "ar" ? "نشط" : "Active"}
                      </Badge>
                    </div>

                    {/* Enhanced Progress Ring */}
                    <div className="flex justify-center">
                      <ProgressRing progress={99} size={120}>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-600">99%</div>
                          <div className="text-xs text-muted-foreground">
                            {locale === "ar" ? "نجاح" : "Success"}
                          </div>
                        </div>
                      </ProgressRing>
                    </div>

                  </div>
                </motion.div>

                {/* ... existing floating elements ... */}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        <motion.div 
          className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center cursor-pointer"
          whileHover={{ scale: 1.1 }}
          onClick={() => {
            document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })
          }}
        >
          <motion.div 
            className="w-1 h-3 bg-gradient-to-b from-emerald-500 to-blue-500 rounded-full mt-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          />
        </motion.div>
      </motion.div>
    </section>
  )
}
