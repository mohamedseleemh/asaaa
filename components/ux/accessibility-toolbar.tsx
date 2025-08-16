"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Accessibility, Volume2, MousePointer, Keyboard, Palette, Type, Settings, Contrast } from "lucide-react"
import { uxOptimizer, type UserPreferences } from "@/lib/ux/user-experience-optimizer"

export function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>({
    reducedMotion: false,
    highContrast: false,
    fontSize: "medium",
    theme: "auto",
    language: "ar",
  })

  const [accessibilityFeatures, setAccessibilityFeatures] = useState({
    screenReader: false,
    keyboardNavigation: false,
    voiceControl: false,
    touchDevice: false,
  })

  useEffect(() => {
    const currentPrefs = uxOptimizer.getPreferences()
    setPreferences(currentPrefs)

    setAccessibilityFeatures({
      screenReader: detectScreenReader(),
      keyboardNavigation: detectKeyboardUser(),
      voiceControl: detectVoiceControl(),
      touchDevice: detectTouchDevice(),
    })
  }, [])

  const detectScreenReader = () => {
    return !!(
      navigator.userAgent.match(/NVDA|JAWS|VoiceOver|TalkBack|Dragon/i) ||
      window.speechSynthesis ||
      document.querySelector("[aria-live]")
    )
  }

  const detectKeyboardUser = () => {
    return document.documentElement.classList.contains("keyboard-navigation")
  }

  const detectVoiceControl = () => {
    return !!(window as any).webkitSpeechRecognition || !!(window as any).SpeechRecognition
  }

  const detectTouchDevice = () => {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0
  }

  const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
    uxOptimizer.updatePreference(key, value)

    uxOptimizer.announceToScreenReader(`تم تغيير ${getPreferenceLabel(key)} إلى ${value}`)
  }

  const getPreferenceLabel = (key: keyof UserPreferences): string => {
    const labels = {
      reducedMotion: "تقليل الحركة",
      highContrast: "التباين العالي",
      fontSize: "حجم الخط",
      theme: "المظهر",
      language: "اللغة",
    }
    return labels[key]
  }

  const fontSizeOptions = [
    { value: "small", label: "صغير", size: "14px", description: "نص صغير للشاشات الكبيرة" },
    { value: "medium", label: "متوسط", size: "16px", description: "الحجم الافتراضي الموصى به" },
    { value: "large", label: "كبير", size: "18px", description: "نص كبير لسهولة القراءة" },
  ]

  const themeOptions = [
    { value: "light", label: "فاتح", icon: "☀️", description: "مظهر فاتح للإضاءة الجيدة" },
    { value: "dark", label: "داكن", icon: "🌙", description: "مظهر داكن لتقليل إجهاد العين" },
    { value: "auto", label: "تلقائي", icon: "🔄", description: "يتبع إعدادات النظام" },
  ]

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 shadow-lg focus:ring-4 focus:ring-emerald-500/50"
        size="icon"
        aria-label="فتح أدوات إمكانية الوصول - اضغط Enter للفتح"
        aria-describedby="accessibility-toolbar-description"
        title="أدوات إمكانية الوصول"
      >
        <Accessibility className="h-5 w-5" aria-hidden="true" />
      </Button>

      <div id="accessibility-toolbar-description" className="sr-only">
        شريط أدوات إمكانية الوصول يحتوي على خيارات لتخصيص تجربة التصفح حسب احتياجاتك
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="accessibility-toolbar-title"
          onKeyDown={handleKeyDown}
        >
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto focus:outline-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle id="accessibility-toolbar-title" className="flex items-center gap-2">
                <Accessibility className="h-5 w-5" aria-hidden="true" />
                أدوات إمكانية الوصول
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                aria-label="إغلاق أدوات إمكانية الوصول"
                className="focus:ring-2 focus:ring-emerald-500"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {(accessibilityFeatures.screenReader || accessibilityFeatures.keyboardNavigation) && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-2">الميزات المكتشفة</h3>
                  <div className="flex flex-wrap gap-2">
                    {accessibilityFeatures.screenReader && (
                      <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800">
                        <Volume2 className="h-3 w-3 mr-1" aria-hidden="true" />
                        قارئ الشاشة
                      </Badge>
                    )}
                    {accessibilityFeatures.keyboardNavigation && (
                      <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800">
                        <Keyboard className="h-3 w-3 mr-1" aria-hidden="true" />
                        التنقل بلوحة المفاتيح
                      </Badge>
                    )}
                    {accessibilityFeatures.touchDevice && (
                      <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800">
                        <MousePointer className="h-3 w-3 mr-1" aria-hidden="true" />
                        جهاز لمسي
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <MousePointer className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <span className="text-sm font-medium">تقليل الحركة</span>
                    <p className="text-xs text-muted-foreground">تقليل الرسوم المتحركة والانتقالات</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.reducedMotion}
                  onCheckedChange={(checked) => updatePreference("reducedMotion", checked)}
                  aria-label="تفعيل أو إلغاء تقليل الحركة"
                  aria-describedby="motion-description"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Contrast className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <div>
                    <span className="text-sm font-medium">التباين العالي</span>
                    <p className="text-xs text-muted-foreground">زيادة التباين لسهولة القراءة</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.highContrast}
                  onCheckedChange={(checked) => updatePreference("highContrast", checked)}
                  aria-label="تفعيل أو إلغاء التباين العالي"
                  aria-describedby="contrast-description"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm font-medium">حجم الخط</span>
                </div>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="اختيار حجم الخط">
                  {fontSizeOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={preferences.fontSize === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updatePreference("fontSize", option.value as any)}
                      className="text-xs flex flex-col items-center gap-1 h-auto py-2"
                      style={{ fontSize: option.size }}
                      role="radio"
                      aria-checked={preferences.fontSize === option.value}
                      aria-describedby={`font-${option.value}-description`}
                      title={option.description}
                    >
                      <span>Aa</span>
                      <span>{option.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm font-medium">المظهر</span>
                </div>
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="اختيار المظهر">
                  {themeOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={preferences.theme === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updatePreference("theme", option.value as any)}
                      className="text-xs flex items-center gap-1 h-auto py-2"
                      role="radio"
                      aria-checked={preferences.theme === option.value}
                      title={option.description}
                    >
                      <span role="img" aria-hidden="true">
                        {option.icon}
                      </span>
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm font-medium">اللغة</span>
                </div>
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="اختيار اللغة">
                  <Button
                    variant={preferences.language === "ar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updatePreference("language", "ar")}
                    className="text-xs"
                    role="radio"
                    aria-checked={preferences.language === "ar"}
                  >
                    العربية
                  </Button>
                  <Button
                    variant={preferences.language === "en" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updatePreference("language", "en")}
                    className="text-xs"
                    role="radio"
                    aria-checked={preferences.language === "en"}
                  >
                    English
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-3">اختصارات لوحة المفاتيح</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>التنقل:</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Tab</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>التفعيل:</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter / Space</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>الإغلاق:</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">Escape</kbd>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div id="accessibility-announcements" aria-live="polite" aria-atomic="true" className="sr-only" />
    </>
  )
}
