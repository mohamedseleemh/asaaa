"use client"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollReveal } from "@/components/animate/scroll-reveal"
import { useCMS } from "@/lib/store"

export function FAQBlock() {
  const { locale, content } = useCMS()
  const bundle = content[locale]

  return (
    <section id="faq" className="py-20 bg-white dark:bg-gray-800" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            {locale === "ar" ? "الأسئلة الشائعة" : "FAQ"}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {locale === "ar" ? "الأسئلة الأكثر شيوعاً" : "Frequently Asked Questions"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {locale === "ar"
              ? "إجابات على الأسئلة الأكثر شيوعاً حول خدماتنا وطريقة عملنا"
              : "Answers to the most common questions about our services and how we work"}
          </p>
        </ScrollReveal>

        {/* FAQ Accordion */}
        <ScrollReveal delay={0.2} className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {bundle.faq.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg border-0 px-6"
              >
                <AccordionTrigger className="text-left rtl:text-right hover:no-underline py-6">
                  <span className="font-semibold text-gray-900 dark:text-white">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>

        {/* Contact CTA */}
        <ScrollReveal delay={0.4} className="text-center mt-16">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {locale === "ar" ? "لم تجد إجابة لسؤالك؟" : "Didn't find an answer to your question?"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {locale === "ar"
                ? "تواصل معنا مباشرة وسيقوم فريقنا بالإجابة على جميع استفساراتك"
                : "Contact us directly and our team will answer all your questions"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`https://wa.me/971501234567?text=${encodeURIComponent(
                  locale === "ar" ? "مرحباً، لدي سؤال حول خدماتكم" : "Hello, I have a question about your services",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
              >
                {locale === "ar" ? "تواصل عبر واتساب" : "Contact via WhatsApp"}
              </a>
              <a
                href={`mailto:${bundle.contact.email}`}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
              >
                {locale === "ar" ? "راسلنا بالإيميل" : "Send Email"}
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
