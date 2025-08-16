"use client"
import { Star, Quote } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollReveal, ScaleIn } from "@/components/animate/scroll-reveal"
import { useCMS } from "@/lib/store"
import { motion } from "framer-motion"

export function TestimonialsBlock() {
  const { locale, content } = useCMS()
  const bundle = content[locale]

  return (
    <section id="testimonials" className="py-20 bg-gray-50 dark:bg-gray-900" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            {locale === "ar" ? "آراء العملاء" : "Testimonials"}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {locale === "ar" ? "ماذا يقول عملاؤنا" : "What Our Clients Say"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {locale === "ar"
              ? "اقرأ تجارب عملائنا الحقيقية وتقييماتهم لخدماتنا المتميزة"
              : "Read real experiences from our clients and their reviews of our excellent services"}
          </p>
        </ScrollReveal>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bundle.testimonials.map((testimonial, index) => (
            <ScaleIn key={index} delay={index * 0.1}>
              <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 relative overflow-hidden">
                  {/* Quote Icon */}
                  <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4">
                    <Quote className="w-8 h-8 text-emerald-200 dark:text-emerald-800" />
                  </div>

                  <CardContent className="p-6 space-y-4">
                    {/* Rating */}
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>

                    {/* Content */}
                    <blockquote className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      "{testimonial.content}"
                    </blockquote>

                    {/* Author */}
                    <div className="flex items-center space-x-3 rtl:space-x-reverse pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{testimonial.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </ScaleIn>
          ))}
        </div>

        {/* Bottom Stats */}
        <ScrollReveal delay={0.6} className="mt-16">
          <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-8 text-white text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold mb-2">4.9/5</div>
                <div className="text-emerald-100">{locale === "ar" ? "متوسط التقييم" : "Average Rating"}</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">10,000+</div>
                <div className="text-emerald-100">{locale === "ar" ? "تقييم إيجابي" : "Positive Reviews"}</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">99%</div>
                <div className="text-emerald-100">{locale === "ar" ? "رضا العملاء" : "Customer Satisfaction"}</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
