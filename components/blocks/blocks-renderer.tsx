// تحسين مكون عارض الأقسام
"use client"
import { useCMS } from "@/lib/store"
import { lazy, Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

const HeroBlock = lazy(() => import("./hero-block"))
const AppIconsBlock = lazy(() => import("./app-icons-block").then((m) => ({ default: m.AppIconsBlock })))
const FeaturesBlock = lazy(() => import("./features-block").then((m) => ({ default: m.FeaturesBlock })))
const ServicesBlock = lazy(() => import("./services-block").then((m) => ({ default: m.ServicesBlock })))
const PaymentsBlock = lazy(() => import("./payments-block").then((m) => ({ default: m.PaymentsBlock })))
const TestimonialsBlock = lazy(() => import("./testimonials-block").then((m) => ({ default: m.TestimonialsBlock })))
const FAQBlock = lazy(() => import("./faq-block").then((m) => ({ default: m.FAQBlock })))
const ContactBlock = lazy(() => import("./contact-block").then((m) => ({ default: m.ContactBlock })))
const CTABlock = lazy(() => import("./cta-block").then((m) => ({ default: m.CTABlock })))

function BlockSkeleton() {
  return (
    <div className="w-full py-16">
      <div className="container mx-auto px-4">
        <Skeleton className="h-8 w-64 mx-auto mb-4" />
        <Skeleton className="h-4 w-96 mx-auto mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function BlocksRenderer() {
  const { blocks } = useCMS()

  const blockComponents = {
    hero: () => <HeroBlock />,
    logos: () => <AppIconsBlock />,
    features: () => <FeaturesBlock />,
    services: () => <ServicesBlock />,
    payments: () => <PaymentsBlock />,
    testimonials: () => <TestimonialsBlock />,
    faq: () => <FAQBlock />,
    contact: () => <ContactBlock />,
    cta: () => <CTABlock />,
  }

  return (
    <div>
      {blocks
        .filter((block) => block.enabled)
        .map((block) => {
          const Component = blockComponents[block.type]
          return Component ? (
            <div key={block.id}>
              <Suspense fallback={<BlockSkeleton />}>{Component()}</Suspense>
            </div>
          ) : null
        })}
    </div>
  )
}
