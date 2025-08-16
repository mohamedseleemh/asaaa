"use client"

import Image from "next/image"
import { useCallback } from "react"
import { ScrollReveal } from "@/components/animate/scroll-reveal"
import { useCMS } from "@/lib/store"
import { motion } from "framer-motion"
import { paletteGrad } from "@/lib/palette"

const realServiceIcons = [
  { name: "PayPal", src: "/paypal-logo.png", url: "https://paypal.com" },
  { name: "Payoneer", src: "/payoneer-logo.png", url: "https://payoneer.com" },
  { name: "Wise", src: "/wise-logo.png", url: "https://wise.com" },
  { name: "Skrill", src: "/skrill-logo.png", url: "https://skrill.com" },
  { name: "Neteller", src: "/neteller-logo.png", url: "https://neteller.com" },
  { name: "Revolut", src: "/revolut-logo.png", url: "https://revolut.com" },
  { name: "Binance", src: "/binance-logo.png", url: "https://binance.com" },
  { name: "Coinbase", src: "/partners/coinbase-logo.png", url: "https://coinbase.com" },
  { name: "OKX", src: "/okx-logo.png", url: "https://okx.com" },
  { name: "Bybit", src: "/bybit-logo.png", url: "https://bybit.com" },
  { name: "KuCoin", src: "/placeholder.svg?height=48&width=48", url: "https://kucoin.com" },
  { name: "Bitget", src: "/placeholder.svg?height=48&width=48", url: "https://bitget.com" },
]

export function AppIconsBlock() {
  const { design, locale } = useCMS()
  const enable = design.anim?.enableReveal !== false
  const k = design.anim?.intensity ?? 1
  const isRTL = locale === "ar"
  const palette = paletteGrad(design.palette)

  // Use real service icons instead of generic logos
  const logos = realServiceIcons

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        {enable ? (
          <ScrollReveal y={30 * k}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className={`bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`}>
                  {isRTL ? "الخدمات المدعومة" : "Supported Services"}
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {isRTL
                  ? "نتعامل مع أفضل المنصات المالية العالمية لضمان أفضل خدمة لعملائنا"
                  : "We work with the world's leading financial platforms to ensure the best service for our clients"}
              </p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className={`bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`}>
                {isRTL ? "الخدمات المدعومة" : "Supported Services"}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isRTL
                ? "نتعامل مع أفضل المنصات المالية العالمية لضمان أفضل خدمة لعملائنا"
                : "We work with the world's leading financial platforms to ensure the best service for our clients"}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {logos.map((logo, index) => (
            <div key={index}>
              {enable ? (
                <ScrollReveal y={20 * k} delay={index * 0.05}>
                  <LogoCard logo={logo} index={index} />
                </ScrollReveal>
              ) : (
                <LogoCard logo={logo} index={index} />
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-8 rtl:space-x-reverse bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-8 py-4 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isRTL ? "جميع الخدمات متاحة" : "All Services Available"}
              </span>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isRTL ? "دعم 24/7" : "24/7 Support"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function LogoCard({ logo, index }: { logo: { name: string; src: string; url?: string }; index: number }) {
  const handleClick = useCallback(() => {
    if (logo.url) {
      window.open(logo.url, "_blank", "noopener,noreferrer")
    }
  }, [logo.url])

  const content = (
    <motion.div
      className="group p-6 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 will-change-transform cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className="aspect-square flex items-center justify-center mb-3">
        <Image
          src={logo.src || "/placeholder.svg"}
          alt={`${logo.name} logo`}
          width={48}
          height={48}
          className="w-12 h-12 object-contain grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-110"
          loading="lazy"
          sizes="48px"
        />
      </div>
      <p className="text-sm font-medium text-center text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
        {logo.name}
      </p>
    </motion.div>
  )

  if (logo.url) {
    return (
      <button onClick={handleClick} className="block w-full">
        {content}
      </button>
    )
  }

  return content
}

export { AppIconsBlock as LogosBlock }
