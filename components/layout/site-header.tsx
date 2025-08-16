"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X, Shield, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useCMS } from "@/lib/store"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const { locale, setLocale, content } = useCMS()

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navigation = [
    { name: locale === "ar" ? "الرئيسية" : "Home", href: "#home" },
    { name: locale === "ar" ? "الخدمات" : "Services", href: "#services" },
    { name: locale === "ar" ? "من نحن" : "About", href: "#about" },
    { name: locale === "ar" ? "التقييمات" : "Reviews", href: "#testimonials" },
    { name: locale === "ar" ? "الأسئلة الشائعة" : "FAQ", href: "#faq" },
    { name: locale === "ar" ? "اتصل بنا" : "Contact", href: "#contact" },
  ]

  const toggleLanguage = () => {
    setLocale(locale === "ar" ? "en" : "ar")
  }

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false)
    // Smooth scroll to section
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-background/95 backdrop-blur-md border-b shadow-sm" : "bg-transparent",
      )}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse group">
            <Shield className="h-8 w-8 lg:h-10 lg:w-10 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
            <span className="text-xl lg:text-2xl font-bold text-foreground group-hover:text-emerald-600 transition-colors">
              KYC Trust
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 rtl:space-x-reverse">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 relative group"
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick(item.href)
                }}
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-200 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse lg:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="hidden sm:flex items-center space-x-1 rtl:space-x-reverse hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            >
              <Globe className="h-4 w-4" />
              <span className="text-sm font-medium">{locale === "ar" ? "EN" : "العربية"}</span>
            </Button>

            <ThemeToggle />

            {/* WhatsApp Button */}
            <Button
              asChild
              className="hidden sm:inline-flex bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Link
                href={`https://wa.me/971501234567?text=${encodeURIComponent(content[locale].hero.whatsapp)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {content[locale].hero.cta}
              </Link>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden border-t bg-background/98 backdrop-blur-md animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1 p-4 pb-6">
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-base font-medium text-muted-foreground hover:text-foreground hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200 px-3 py-3 rounded-lg"
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavClick(item.href)
                  }}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {item.name}
                </Link>
              ))}

              <div className="flex flex-col space-y-3 pt-6 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleLanguage}
                    className="flex items-center space-x-2 rtl:space-x-reverse hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                  >
                    <Globe className="h-4 w-4" />
                    <span>{locale === "ar" ? "English" : "العربية"}</span>
                  </Button>
                  <ThemeToggle />
                </div>

                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Link
                    href={`https://wa.me/971501234567?text=${encodeURIComponent(content[locale].hero.whatsapp)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {content[locale].hero.cta}
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
