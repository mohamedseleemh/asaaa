"use client"

import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/animate/scroll-reveal"
import { ArrowRight, MessageCircle } from "lucide-react"
import { useCMS } from "@/lib/store"
import { buildWhatsApp } from "@/lib/whatsapp"
import type { Bundle } from "@/lib/types"
import type { paletteGrad } from "@/lib/palette"

export function CtaBlock({
  data,
  isRTL,
  palette,
}: {
  data: Bundle
  isRTL: boolean
  palette: ReturnType<typeof paletteGrad>
}) {
  const { design, locale } = useCMS()
  const enable = design.anim?.enableReveal !== false
  const k = design.anim?.intensity ?? 1

  if (!data.cta) return null

  const handlePrimaryAction = () => {
    const message = isRTL ? "مرحباً، أريد البدء الآن" : "Hello, I want to get started now"
    const whatsappUrl = buildWhatsApp(message, "CTA Section", locale, data.site.name)
    window.open(whatsappUrl, "_blank", "noopener,noreferrer")
  }

  const handleSecondaryAction = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className={`py-20 bg-gradient-to-r ${palette.range} text-white relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {enable ? (
            <ScrollReveal y={30 * k}>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">{data.cta.title}</h2>
            </ScrollReveal>
          ) : (
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{data.cta.title}</h2>
          )}

          {data.cta.subtitle && (
            <>
              {enable ? (
                <ScrollReveal y={20 * k} delay={0.1}>
                  <p className="text-xl mb-8 opacity-90">{data.cta.subtitle}</p>
                </ScrollReveal>
              ) : (
                <p className="text-xl mb-8 opacity-90">{data.cta.subtitle}</p>
              )}
            </>
          )}

          {enable ? (
            <ScrollReveal y={20 * k} delay={0.2}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handlePrimaryAction}
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 px-8 py-3 text-lg font-semibold"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {data.cta.primaryText}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                {data.cta.secondaryText && (
                  <Button
                    onClick={handleSecondaryAction}
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-lg font-semibold bg-transparent"
                  >
                    {data.cta.secondaryText}
                  </Button>
                )}
              </div>
            </ScrollReveal>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handlePrimaryAction}
                size="lg"
                className="bg-white text-primary hover:bg-white/90 px-8 py-3 text-lg font-semibold"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {data.cta.primaryText}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              {data.cta.secondaryText && (
                <Button
                  onClick={handleSecondaryAction}
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-lg font-semibold bg-transparent"
                >
                  {data.cta.secondaryText}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// Export as CTABlock for compatibility
export { CtaBlock as CTABlock }
