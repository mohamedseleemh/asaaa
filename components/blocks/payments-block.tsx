"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollReveal } from "@/components/animate/scroll-reveal"
import { useCMS } from "@/lib/store"
import type { Bundle } from "@/lib/types"
import type { paletteGrad } from "@/lib/palette"

export function PaymentsBlock({
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
    <section className="py-16 bg-gradient-to-br from-blue-50 via-emerald-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        {enable ? (
          <ScrollReveal y={30 * k}>
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                💳 {isRTL ? "طرق الدفع" : "Payment Methods"}
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  {isRTL ? "طرق الدفع المتاحة" : "Available Payment Methods"}
                </span>
              </h2>
              <p className="text-muted-foreground">
                {isRTL ? "ندعم جميع طرق الدفع الآمنة والسريعة" : "We support all secure and fast payment methods"}
              </p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              💳 {isRTL ? "طرق الدفع" : "Payment Methods"}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                {isRTL ? "طرق الدفع المتاحة" : "Available Payment Methods"}
              </span>
            </h2>
            <p className="text-muted-foreground">
              {isRTL ? "ندعم جميع طرق الدفع الآمنة والسريعة" : "We support all secure and fast payment methods"}
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {data.payments.map((payment, index) => (
            <div key={index}>
              {enable ? (
                <ScrollReveal y={20 * k} delay={index * 0.1}>
                  <PaymentCard payment={payment} />
                </ScrollReveal>
              ) : (
                <PaymentCard payment={payment} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PaymentCard({ payment }: { payment: { label: string; value: string; icon: string; color: "red" | "green" } }) {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 border-0 shadow-lg group overflow-hidden relative">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${payment.color === "green" ? "from-emerald-500/5 to-green-500/5" : "from-red-500/5 to-pink-500/5"} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />
      <CardContent className="p-8 text-center relative z-10">
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{payment.icon}</div>
        <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">{payment.label}</h3>
        <Badge
          variant={payment.color === "green" ? "default" : "destructive"}
          className={`text-sm px-4 py-2 font-mono ${
            payment.color === "green"
              ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
              : "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
          } border-0 shadow-md`}
        >
          {payment.value}
        </Badge>
      </CardContent>
    </Card>
  )
}
