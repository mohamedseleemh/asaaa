"use client"

import * as React from "react"
import Link from "next/link"
import { Shield, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCMS } from "@/lib/store"

export function SiteFooter() {
  const [email, setEmail] = React.useState("")
  const { locale, content } = useCMS()

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      // Handle newsletter subscription logic here
      setEmail("")
    }
  }

  const quickLinks = [
    { name: locale === "ar" ? "الرئيسية" : "Home", href: "#home" },
    { name: locale === "ar" ? "الخدمات" : "Services", href: "#services" },
    { name: locale === "ar" ? "من نحن" : "About", href: "#about" },
    { name: locale === "ar" ? "التقييمات" : "Reviews", href: "#testimonials" },
    { name: locale === "ar" ? "الأسئلة الشائعة" : "FAQ", href: "#faq" },
    { name: locale === "ar" ? "اتصل بنا" : "Contact", href: "#contact" },
  ]

  return (
    <footer className="bg-gray-900 text-white" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Shield className="h-8 w-8 text-emerald-400" />
              <span className="text-xl font-bold">KYC Trust</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{content[locale].about.description}</p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-emerald-400">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-emerald-400">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-emerald-400">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-emerald-400">
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">
              {locale === "ar" ? "روابط سريعة" : "Quick Links"}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">{locale === "ar" ? "خدماتنا" : "Our Services"}</h3>
            <ul className="space-y-2">
              {content[locale].services.slice(0, 6).map((service) => (
                <li key={service.id}>
                  <span className="text-gray-300 text-sm">{service.title}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">{content[locale].contact.title}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Phone className="h-4 w-4 text-emerald-400" />
                <span className="text-gray-300 text-sm">{content[locale].contact.phone}</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Mail className="h-4 w-4 text-emerald-400" />
                <span className="text-gray-300 text-sm">{content[locale].contact.email}</span>
              </div>
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span className="text-gray-300 text-sm">{content[locale].contact.address}</span>
              </div>
            </div>

            {/* Newsletter */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-emerald-400">
                {locale === "ar" ? "اشترك في النشرة الإخبارية" : "Subscribe to Newsletter"}
              </h4>
              <form onSubmit={handleNewsletterSubmit} className="flex space-x-2 rtl:space-x-reverse">
                <Input
                  type="email"
                  placeholder={locale === "ar" ? "بريدك الإلكتروني" : "Your email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
                  required
                />
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  {locale === "ar" ? "اشترك" : "Subscribe"}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2024 KYC Trust. {locale === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"}.
            </p>
            <div className="flex space-x-6 rtl:space-x-reverse">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-emerald-400 text-sm transition-colors duration-200"
              >
                {locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-emerald-400 text-sm transition-colors duration-200"
              >
                {locale === "ar" ? "شروط الاستخدام" : "Terms of Service"}
              </Link>
              <Link
                href="/cookies"
                className="text-gray-400 hover:text-emerald-400 text-sm transition-colors duration-200"
              >
                {locale === "ar" ? "سياسة ملفات تعريف الارتباط" : "Cookie Policy"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
