"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCMS } from "@/lib/store"
import { motion } from "framer-motion"
import {
  PayPalIcon,
  PayoneerIcon,
  WiseIcon,
  SkrillIcon,
  NetellerIcon,
  BitcoinIcon,
  EthereumIcon,
  BinanceIcon,
} from "@/components/icons/service-icons"
import { CheckCircle, Clock, Shield, Star } from "lucide-react"

const serviceIcons = {
  paypal: PayPalIcon,
  payoneer: PayoneerIcon,
  wise: WiseIcon,
  skrill: SkrillIcon,
  neteller: NetellerIcon,
  bitcoin: BitcoinIcon,
  ethereum: EthereumIcon,
  binance: BinanceIcon,
}

export function ServicesSection() {
  const { content, locale } = useCMS()
  const servicesContent = content.services

  const handleServiceContact = (serviceName: string) => {
    const message =
      locale === "ar"
        ? `مرحباً، أريد الاستفسار عن خدمة ${serviceName}`
        : `Hello, I want to inquire about ${serviceName} service`
    window.open(`https://wa.me/971501234567?text=${encodeURIComponent(message)}`, "_blank")
  }

  return (
    <section id="services" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-emerald-100 text-emerald-800 mb-4">
              {locale === "ar" ? "خدماتنا" : "Our Services"}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {servicesContent.title[locale]}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {servicesContent.subtitle[locale]}
            </p>
          </motion.div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {servicesContent.items.map((service, index) => {
            const IconComponent = serviceIcons[service.icon as keyof typeof serviceIcons]

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:scale-105 group">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      {IconComponent && <IconComponent className="w-10 h-10" />}
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                      {service.name[locale]}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Price */}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                          ${service.price}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {locale === "ar" ? "يبدأ من" : "Starting from"}
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2">
                        {service.features[locale].map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className="flex items-center text-sm text-gray-600 dark:text-gray-300"
                          >
                            <CheckCircle className="w-4 h-4 text-emerald-500 mr-2 rtl:mr-0 rtl:ml-2 flex-shrink-0" />
                            {feature}
                          </div>
                        ))}
                      </div>

                      {/* Timing */}
                      <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg py-2">
                        <Clock className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                        {service.timing[locale]}
                      </div>

                      {/* CTA Button */}
                      <Button
                        onClick={() => handleServiceContact(service.name[locale])}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition-colors duration-300"
                      >
                        {locale === "ar" ? "اطلب الآن" : "Order Now"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2 text-emerald-500" />
              <span className="text-sm font-medium">{locale === "ar" ? "آمن ومضمون" : "Safe & Secure"}</span>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2 text-emerald-500" />
              <span className="text-sm font-medium">{locale === "ar" ? "تقييم 5 نجوم" : "5-Star Rated"}</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2 text-emerald-500" />
              <span className="text-sm font-medium">{locale === "ar" ? "ضمان الاسترداد" : "Money Back Guarantee"}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
