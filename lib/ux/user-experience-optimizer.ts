interface UserPreferences {
  reducedMotion: boolean
  highContrast: boolean
  fontSize: "small" | "medium" | "large"
  theme: "light" | "dark" | "auto"
  language: "ar" | "en"
}

interface InteractionMetrics {
  clickAccuracy: number
  scrollSpeed: number
  dwellTime: number
  errorRate: number
  completionRate: number
}

interface AccessibilityFeatures {
  screenReader: boolean
  keyboardNavigation: boolean
  voiceControl: boolean
  touchAssistance: boolean
}

class UserExperienceOptimizer {
  private static instance: UserExperienceOptimizer
  private preferences: UserPreferences
  private metrics: InteractionMetrics
  private accessibility: AccessibilityFeatures
  private observers: Map<string, IntersectionObserver | ResizeObserver> = new Map()

  constructor() {
    this.preferences = this.getDefaultPreferences()
    this.metrics = this.getDefaultMetrics()
    this.accessibility = this.detectAccessibilityFeatures()
  }

  static getInstance(): UserExperienceOptimizer {
    if (!UserExperienceOptimizer.instance) {
      UserExperienceOptimizer.instance = new UserExperienceOptimizer()
    }
    return UserExperienceOptimizer.instance
  }

  initialize() {
    if (typeof window === "undefined") return

    this.detectUserPreferences()
    this.setupAccessibilityFeatures()
    this.initializeInteractionTracking()
    this.setupResponsiveObservers()
    this.optimizeForDevice()
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      reducedMotion: false,
      highContrast: false,
      fontSize: "medium",
      theme: "auto",
      language: "ar",
    }
  }

  private getDefaultMetrics(): InteractionMetrics {
    return {
      clickAccuracy: 0,
      scrollSpeed: 0,
      dwellTime: 0,
      errorRate: 0,
      completionRate: 0,
    }
  }

  private detectAccessibilityFeatures(): AccessibilityFeatures {
    if (typeof window === "undefined") {
      return {
        screenReader: false,
        keyboardNavigation: false,
        voiceControl: false,
        touchAssistance: false,
      }
    }

    return {
      screenReader: this.detectScreenReader(),
      keyboardNavigation: this.detectKeyboardNavigation(),
      voiceControl: this.detectVoiceControl(),
      touchAssistance: this.detectTouchDevice(),
    }
  }

  private detectUserPreferences() {
    // كشف تفضيلات الحركة
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    this.preferences.reducedMotion = prefersReducedMotion.matches
    prefersReducedMotion.addEventListener("change", (e) => {
      this.preferences.reducedMotion = e.matches
      this.applyMotionPreferences()
    })

    // كشف تفضيلات التباين
    const prefersHighContrast = window.matchMedia("(prefers-contrast: high)")
    this.preferences.highContrast = prefersHighContrast.matches
    prefersHighContrast.addEventListener("change", (e) => {
      this.preferences.highContrast = e.matches
      this.applyContrastPreferences()
    })

    // كشف تفضيلات الألوان
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)")
    this.preferences.theme = prefersDark.matches ? "dark" : "light"
    prefersDark.addEventListener("change", (e) => {
      this.preferences.theme = e.matches ? "dark" : "light"
      this.applyThemePreferences()
    })
  }

  private detectScreenReader(): boolean {
    // كشف قارئ الشاشة من خلال عدة طرق
    return !!(
      navigator.userAgent.match(/NVDA|JAWS|VoiceOver|TalkBack|Dragon/i) ||
      window.speechSynthesis ||
      document.querySelector("[aria-live]")
    )
  }

  private detectKeyboardNavigation(): boolean {
    let keyboardUser = false

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        keyboardUser = true
        document.documentElement.classList.add("keyboard-navigation")
        document.removeEventListener("keydown", handleKeyDown)
      }
    }

    const handleMouseDown = () => {
      keyboardUser = false
      document.documentElement.classList.remove("keyboard-navigation")
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleMouseDown)

    return keyboardUser
  }

  private detectVoiceControl(): boolean {
    return !!(window as any).webkitSpeechRecognition || !!(window as any).SpeechRecognition
  }

  private detectTouchDevice(): boolean {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0
  }

  private setupAccessibilityFeatures() {
    // تحسين التنقل بلوحة المفاتيح
    if (this.accessibility.keyboardNavigation) {
      this.enhanceKeyboardNavigation()
    }

    // تحسين دعم قارئ الشاشة
    if (this.accessibility.screenReader) {
      this.enhanceScreenReaderSupport()
    }

    // تحسين دعم اللمس
    if (this.accessibility.touchAssistance) {
      this.enhanceTouchInteractions()
    }
  }

  private enhanceKeyboardNavigation() {
    // إضافة مؤشرات التركيز المحسنة
    const style = document.createElement("style")
    style.textContent = `
      .keyboard-navigation *:focus-visible {
        outline: 3px solid hsl(var(--ring));
        outline-offset: 2px;
        border-radius: 4px;
      }
      
      .keyboard-navigation button:focus-visible,
      .keyboard-navigation a:focus-visible {
        box-shadow: 0 0 0 3px hsl(var(--ring) / 0.3);
      }
    `
    document.head.appendChild(style)

    // تحسين ترتيب التبويب
    this.optimizeTabOrder()
  }

  private enhanceScreenReaderSupport() {
    // إضافة تسميات ARIA المحسنة
    document.querySelectorAll("button, a, input, select, textarea").forEach((element) => {
      if (!element.getAttribute("aria-label") && !element.getAttribute("aria-labelledby")) {
        const text = element.textContent?.trim()
        if (text) {
          element.setAttribute("aria-label", text)
        }
      }
    })

    // إضافة معلومات الحالة
    this.addLiveRegions()
  }

  private enhanceTouchInteractions() {
    // زيادة حجم أهداف اللمس
    const style = document.createElement("style")
    style.textContent = `
      @media (pointer: coarse) {
        button, a, input, select {
          min-height: 44px;
          min-width: 44px;
          padding: 12px;
        }
        
        .touch-target {
          padding: 16px;
        }
      }
    `
    document.head.appendChild(style)

    // إضافة ردود فعل اللمس
    this.addTouchFeedback()
  }

  private initializeInteractionTracking() {
    let clickCount = 0
    let accurateClicks = 0
    let scrollStartTime = 0
    let totalScrollTime = 0
    let scrollCount = 0

    // تتبع دقة النقرات
    document.addEventListener("click", (e) => {
      clickCount++
      const target = e.target as Element
      const rect = target.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distance = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2))

      if (distance < 20) {
        accurateClicks++
      }

      this.metrics.clickAccuracy = (accurateClicks / clickCount) * 100
    })

    // تتبع سرعة التمرير
    document.addEventListener("scroll", () => {
      if (scrollStartTime === 0) {
        scrollStartTime = Date.now()
      }
    })

    document.addEventListener("scrollend", () => {
      if (scrollStartTime > 0) {
        totalScrollTime += Date.now() - scrollStartTime
        scrollCount++
        this.metrics.scrollSpeed = totalScrollTime / scrollCount
        scrollStartTime = 0
      }
    })

    // تتبع وقت البقاء
    this.trackDwellTime()
  }

  private trackDwellTime() {
    let startTime = Date.now()
    let totalTime = 0
    let sessions = 0

    const updateDwellTime = () => {
      totalTime += Date.now() - startTime
      sessions++
      this.metrics.dwellTime = totalTime / sessions
      startTime = Date.now()
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        updateDwellTime()
      } else {
        startTime = Date.now()
      }
    })

    window.addEventListener("beforeunload", updateDwellTime)
  }

  private setupResponsiveObservers() {
    // مراقب تغيير حجم الشاشة
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        this.optimizeForViewport(entry.contentRect)
      })
    })

    resizeObserver.observe(document.documentElement)
    this.observers.set("resize", resizeObserver)

    // مراقب الرؤية للتحميل الكسول
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.optimizeVisibleContent(entry.target)
          }
        })
      },
      { rootMargin: "50px" },
    )

    // مراقبة العناصر القابلة للتحميل الكسول
    document.querySelectorAll("[data-lazy]").forEach((element) => {
      intersectionObserver.observe(element)
    })

    this.observers.set("intersection", intersectionObserver)
  }

  private optimizeForDevice() {
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent)
    const isDesktop = !isMobile && !isTablet

    if (isMobile) {
      this.optimizeForMobile()
    } else if (isTablet) {
      this.optimizeForTablet()
    } else if (isDesktop) {
      this.optimizeForDesktop()
    }
  }

  private optimizeForMobile() {
    document.documentElement.classList.add("mobile-device")

    // تحسين الخطوط للشاشات الصغيرة
    const style = document.createElement("style")
    style.textContent = `
      @media (max-width: 768px) {
        body { font-size: 16px; line-height: 1.6; }
        h1 { font-size: 1.75rem; }
        h2 { font-size: 1.5rem; }
        h3 { font-size: 1.25rem; }
        button { min-height: 48px; }
      }
    `
    document.head.appendChild(style)
  }

  private optimizeForTablet() {
    document.documentElement.classList.add("tablet-device")

    // تحسين التخطيط للأجهزة اللوحية
    const style = document.createElement("style")
    style.textContent = `
      @media (min-width: 768px) and (max-width: 1024px) {
        .container { max-width: 90%; }
        .grid { grid-template-columns: repeat(2, 1fr); }
      }
    `
    document.head.appendChild(style)
  }

  private optimizeForDesktop() {
    document.documentElement.classList.add("desktop-device")

    // تحسين التفاعلات للسطح المكتب
    const style = document.createElement("style")
    style.textContent = `
      @media (min-width: 1024px) {
        .hover\\:scale-105:hover { transform: scale(1.05); }
        .hover\\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
      }
    `
    document.head.appendChild(style)
  }

  private applyMotionPreferences() {
    if (this.preferences.reducedMotion) {
      document.documentElement.classList.add("reduce-motion")
      const style = document.createElement("style")
      style.textContent = `
        .reduce-motion *, .reduce-motion *::before, .reduce-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `
      document.head.appendChild(style)
    } else {
      document.documentElement.classList.remove("reduce-motion")
    }
  }

  private applyContrastPreferences() {
    if (this.preferences.highContrast) {
      document.documentElement.classList.add("high-contrast")
      const style = document.createElement("style")
      style.textContent = `
        .high-contrast {
          --background: 0 0% 0%;
          --foreground: 0 0% 100%;
          --border: 0 0% 100%;
        }
      `
      document.head.appendChild(style)
    } else {
      document.documentElement.classList.remove("high-contrast")
    }
  }

  private applyThemePreferences() {
    document.documentElement.setAttribute("data-theme", this.preferences.theme)
  }

  private optimizeTabOrder() {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )

    focusableElements.forEach((element, index) => {
      if (!element.getAttribute("tabindex")) {
        element.setAttribute("tabindex", (index + 1).toString())
      }
    })
  }

  private addLiveRegions() {
    if (!document.querySelector('[aria-live="polite"]')) {
      const liveRegion = document.createElement("div")
      liveRegion.setAttribute("aria-live", "polite")
      liveRegion.setAttribute("aria-atomic", "true")
      liveRegion.className = "sr-only"
      liveRegion.id = "live-region"
      document.body.appendChild(liveRegion)
    }
  }

  private addTouchFeedback() {
    document.addEventListener("touchstart", (e) => {
      const target = e.target as Element
      if (target.matches("button, a, [role='button']")) {
        target.classList.add("touch-active")
        setTimeout(() => target.classList.remove("touch-active"), 150)
      }
    })

    const style = document.createElement("style")
    style.textContent = `
      .touch-active {
        transform: scale(0.95);
        opacity: 0.8;
        transition: all 0.1s ease;
      }
    `
    document.head.appendChild(style)
  }

  private optimizeForViewport(rect: DOMRectReadOnly) {
    const isSmall = rect.width < 640
    const isMedium = rect.width >= 640 && rect.width < 1024
    const isLarge = rect.width >= 1024

    document.documentElement.classList.toggle("viewport-small", isSmall)
    document.documentElement.classList.toggle("viewport-medium", isMedium)
    document.documentElement.classList.toggle("viewport-large", isLarge)
  }

  private optimizeVisibleContent(element: Element) {
    // تحميل المحتوى الكسول
    if (element.hasAttribute("data-lazy")) {
      const src = element.getAttribute("data-lazy")
      if (src && element.tagName === "IMG") {
        ;(element as HTMLImageElement).src = src
        element.removeAttribute("data-lazy")
      }
    }

    // تشغيل الرسوم المتحركة
    if (element.hasAttribute("data-animate")) {
      element.classList.add("animate-in")
    }
  }

  announceToScreenReader(message: string) {
    const liveRegion = document.getElementById("live-region")
    if (liveRegion) {
      liveRegion.textContent = message
      setTimeout(() => {
        liveRegion.textContent = ""
      }, 1000)
    }
  }

  getMetrics(): InteractionMetrics {
    return { ...this.metrics }
  }

  getPreferences(): UserPreferences {
    return { ...this.preferences }
  }

  updatePreference<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    this.preferences[key] = value
    this.savePreferences()
    this.applyPreferences()
  }

  private savePreferences() {
    try {
      localStorage.setItem("ux-preferences", JSON.stringify(this.preferences))
    } catch (error) {
      console.warn("Could not save user preferences:", error)
    }
  }

  private loadPreferences() {
    try {
      const saved = localStorage.getItem("ux-preferences")
      if (saved) {
        this.preferences = { ...this.preferences, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.warn("Could not load user preferences:", error)
    }
  }

  private applyPreferences() {
    this.applyMotionPreferences()
    this.applyContrastPreferences()
    this.applyThemePreferences()
  }

  cleanup() {
    this.observers.forEach((observer) => {
      observer.disconnect()
    })
    this.observers.clear()
  }
}

export const uxOptimizer = UserExperienceOptimizer.getInstance()
export type { UserPreferences, InteractionMetrics, AccessibilityFeatures }
