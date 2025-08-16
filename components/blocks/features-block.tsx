"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ScrollReveal } from "@/components/animate/scroll-reveal"
import { FeatureIcon } from "@/components/icons"
import { useCMS } from "@/lib/store"
import type { Bundle } from "@/lib/types"
import type { paletteGrad } from "@/lib/palette"

export function FeaturesBlock({
  data,
  isRTL,
  palette,
}: {
  data: Bundle
  isRTL: boolean
  palette: ReturnType<typeof paletteGrad>
}) {
  const { design } = useCMS()
  const enable = design.anim?.enableReveal !== false
  const k = design.anim?.intensity ?? 1

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {enable ? (
          <ScrollReveal y={30 * k}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className={`bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`}>
                  {isRTL ? "لماذا تختارنا؟" : "Why Choose Us?"}
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {isRTL
                  ? "نقدم أفضل الخدمات المالية الرقمية مع ضمان الأمان والسرعة"
                  : "We provide the best digital financial services with guaranteed security and speed"}
              </p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className={`bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`}>
                {isRTL ? "لماذا تختارنا؟" : "Why Choose Us?"}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isRTL
                ? "نقدم أفضل الخدمات المالية الرقمية مع ضمان الأمان والسرعة"
                : "We provide the best digital financial services with guaranteed security and speed"}
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.features.map((feature, index) => (
            <div key={index}>
              {enable ? (
                <ScrollReveal y={20 * k} delay={index * 0.1}>
                  <FeatureCard feature={feature} palette={palette} />
                </ScrollReveal>
              ) : (
                <FeatureCard feature={feature} palette={palette} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  feature,
  palette,
}: {
  feature: { title: string; desc: string; icon: string }
  palette: ReturnType<typeof paletteGrad>
}) {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-background/60 backdrop-blur">
      <CardContent className="p-6 text-center">
        <div className="mb-4">
          <div
            className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${palette.accent} flex items-center justify-center text-white shadow-lg`}
          >
            <FeatureIcon name={feature.icon} className="w-8 h-8" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
      </CardContent>
    </Card>
  )
}
