"use client"

import * as React from "react"
import { Phone, Mail, MapPin, MessageCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollReveal, FadeIn } from "@/components/animate/scroll-reveal"
import { useCMS } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

export function ContactBlock() {
  const { locale, content } = useCMS()
  const bundle = content[locale]
  const { toast } = useToast()

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: locale === "ar" ? "تم إرسال الرسالة" : "Message Sent",
        description:
          locale === "ar"
            ? "شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن."
            : "Thank you for contacting us. We'll get back to you as soon as possible.",
      })

      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "",
        message: "",
      })
    } catch (error) {
      toast({
        title: locale === "ar" ? "خطأ في الإرسال" : "Sending Error",
        description:
          locale === "ar"
            ? "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى."
            : "An error occurred while sending the message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Phone,
      label: locale === "ar" ? "الهاتف" : "Phone",
      value: bundle.contact.phone,
      href: `tel:${bundle.contact.phone}`,
    },
    {
      icon: Mail,
      label: locale === "ar" ? "البريد الإلكتروني" : "Email",
      value: bundle.contact.email,
      href: `mailto:${bundle.contact.email}`,
    },
    {
      icon: MapPin,
      label: locale === "ar" ? "العنوان" : "Address",
      value: bundle.contact.address,
      href: "#",
    },
  ]

  return (
    <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-900" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <ScrollReveal className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            {bundle.contact.title}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {locale === "ar" ? "تواصل معنا الآن" : "Get In Touch"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{bundle.contact.description}</p>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <ScrollReveal>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  {locale === "ar" ? "أرسل لنا رسالة" : "Send us a message"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{locale === "ar" ? "الاسم" : "Name"} *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={locale === "ar" ? "اسمك الكامل" : "Your full name"}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{locale === "ar" ? "البريد الإلكتروني" : "Email"} *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder={locale === "ar" ? "بريدك الإلكتروني" : "Your email address"}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{locale === "ar" ? "رقم الهاتف" : "Phone"}</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder={locale === "ar" ? "رقم هاتفك" : "Your phone number"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service">{locale === "ar" ? "الخدمة المطلوبة" : "Service Needed"}</Label>
                      <Input
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleInputChange}
                        placeholder={locale === "ar" ? "نوع الخدمة" : "Type of service"}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{locale === "ar" ? "الرسالة" : "Message"} *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder={locale === "ar" ? "اكتب رسالتك هنا..." : "Write your message here..."}
                      rows={5}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 rtl:mr-0 rtl:ml-2" />
                        {locale === "ar" ? "جاري الإرسال..." : "Sending..."}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                        {locale === "ar" ? "إرسال الرسالة" : "Send Message"}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Contact Info & WhatsApp */}
          <div className="space-y-8">
            {/* Contact Information */}
            <ScrollReveal delay={0.2}>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <FadeIn key={index} delay={index * 0.1}>
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{info.label}</div>
                        <div className="text-muted-foreground">
                          {info.href.startsWith("tel:") || info.href.startsWith("mailto:") ? (
                            <a href={info.href} className="hover:text-emerald-600 transition-colors">
                              {info.value}
                            </a>
                          ) : (
                            info.value
                          )}
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </ScrollReveal>

            {/* WhatsApp CTA */}
            <ScrollReveal delay={0.4}>
              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
                <CardContent className="p-8 text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-90" />
                  <h3 className="text-xl font-bold mb-2">
                    {locale === "ar" ? "تواصل فوري عبر واتساب" : "Instant WhatsApp Contact"}
                  </h3>
                  <p className="text-emerald-100 mb-6">
                    {locale === "ar" ? "احصل على رد سريع خلال دقائق معدودة" : "Get a quick response within minutes"}
                  </p>
                  <Button asChild variant="secondary" size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
                    <a
                      href={`https://wa.me/971501234567?text=${encodeURIComponent(
                        locale === "ar"
                          ? "مرحباً، أريد الاستفسار عن خدماتكم"
                          : "Hello, I want to inquire about your services",
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" />
                      {locale === "ar" ? "ابدأ المحادثة" : "Start Chat"}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Business Hours */}
            <ScrollReveal delay={0.6}>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                    {locale === "ar" ? "ساعات العمل" : "Business Hours"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      {locale === "ar" ? "الأحد - الخميس" : "Sunday - Thursday"}
                    </span>
                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      {locale === "ar" ? "الجمعة - السبت" : "Friday - Saturday"}
                    </span>
                    <span className="font-medium">10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600 font-medium">
                        {locale === "ar" ? "متاح الآن للدعم الفوري" : "Available now for instant support"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
