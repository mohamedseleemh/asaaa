"use client"
import { Shield, Users, Clock, Award, CheckCircle, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollReveal } from "@/components/animate/scroll-reveal"
import { useCMS } from "@/lib/store"
import { motion } from "framer-motion"

export function AboutBlock() {
  const { locale, content } = useCMS()
  const bundle = content[locale]

  const stats = [
    {
      icon: Users,
      value: "10,000+",
      label: locale === "ar" ? "عميل راضٍ" : "Happy Clients",
      color: "text-blue-600",
    },
    {
      icon: Award,
      value: "99%",
      label: locale === "ar" ? "معدل النجاح" : "Success Rate",
      color: "text-emerald-600",
    },
    {
      icon: Clock,
      value: "24/7",
      label: locale === "ar" ? "دعم فني" : "Support",
      color: "text-purple-600",
    },
    {
      icon: Shield,
      value: "100%",
      label: locale === "ar" ? "أمان مضمون" : "Secure",
      color: "text-orange-600",
    },
  ]

  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-800" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <ScrollReveal>
              <Badge variant="secondary" className="mb-4">
                {bundle.about.title}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {locale === "ar"
                  ? "شريكك الموثوق في الخدمات المالية الرقمية"
                  : "Your Trusted Partner in Digital Financial Services"}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">{bundle.about.description}</p>
            </ScrollReveal>

            {/* Features */}
            <ScrollReveal delay={0.2}>
              <div className="space-y-4">
                {bundle.about.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-3 rtl:space-x-reverse"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>

            {/* Additional Info */}
            <ScrollReveal delay={0.4}>
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl p-6">
                <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
                  <Star className="w-6 h-6 text-yellow-500 fill-current" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {locale === "ar" ? "لماذا نحن الأفضل؟" : "Why Choose Us?"}
                  </h3>
                </div>
                <p className="text-muted-foreground">
                  {locale === "ar"
                    ? "نحن نجمع بين الخبرة الطويلة والتقنيات الحديثة لنقدم لك أفضل خدمة ممكنة. فريقنا المتخصص متاح على مدار الساعة لضمان حصولك على الدعم الذي تحتاجه."
                    : "We combine extensive experience with modern technology to provide you with the best possible service. Our specialized team is available 24/7 to ensure you get the support you need."}
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* Stats Cards */}
          <div className="space-y-6">
            <ScrollReveal delay={0.3} direction="right">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <motion.div key={index} whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
                    <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="space-y-4">
                        <div
                          className={`w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${stat.color}`}
                        >
                          <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                          <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollReveal>

            {/* Trust Badge */}
            <ScrollReveal delay={0.5} direction="right">
              <Card className="bg-gradient-to-br from-emerald-500 to-blue-600 text-white border-0 shadow-xl">
                <CardContent className="p-8 text-center">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-90" />
                  <h3 className="text-xl font-bold mb-2">{locale === "ar" ? "ضمان الجودة" : "Quality Guarantee"}</h3>
                  <p className="text-emerald-100">
                    {locale === "ar"
                      ? "نضمن لك جودة الخدمة أو نعيد أموالك كاملة"
                      : "We guarantee service quality or your money back"}
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
