import { supabaseAdmin } from "@/lib/supabase/client"

// Get published content from settings table
export async function getPublishedContent() {
  try {
    const { data, error } = await supabaseAdmin.from("settings").select("value").eq("key", "published_content").single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching published content:", error)
      return getDefaultContent()
    }

    return data?.value || getDefaultContent()
  } catch (error) {
    console.error("Error in getPublishedContent:", error)
    return getDefaultContent()
  }
}

// Set published content
export async function setPublishedContent(content: any) {
  try {
    const { error } = await supabaseAdmin.from("settings").upsert({
      key: "published_content",
      value: content,
      updated_at: new Date().toISOString(),
    })

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error setting published content:", error)
    return false
  }
}

// Get setting by key
export async function getSetting(key: string) {
  try {
    const { data, error } = await supabaseAdmin.from("settings").select("value").eq("key", key).single()

    if (error && error.code !== "PGRST116") throw error
    return data?.value || null
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error)
    return null
  }
}

// Set setting
export async function setSetting(key: string, value: any) {
  try {
    const { error } = await supabaseAdmin.from("settings").upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
    })

    if (error) throw error
    return true
  } catch (error) {
    console.error(`Error setting ${key}:`, error)
    return false
  }
}

// Get approved reviews
export async function getApprovedReviews(limit = 10) {
  try {
    const { data, error } = await supabaseAdmin
      .from("reviews")
      .select("id, name, rating, comment, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error getting approved reviews:", error)
    return []
  }
}

// Create review
export async function createReview(review: {
  name: string
  email?: string
  rating: number
  comment: string
  ip?: string
  user_agent?: string
}) {
  try {
    const { data, error } = await supabaseAdmin
      .from("reviews")
      .insert({
        name: review.name,
        email_hash: review.email ? await hashString(review.email) : null,
        rating: review.rating,
        comment: review.comment,
        status: "pending",
        ip_address: review.ip || null,
        user_agent: review.user_agent || null,
      })
      .select("id")
      .single()

    if (error) throw error
    return data?.id
  } catch (error) {
    console.error("Error creating review:", error)
    return null
  }
}

// Get all reviews for admin
export async function getAllReviews() {
  try {
    const { data, error } = await supabaseAdmin
      .from("reviews")
      .select("id, name, rating, comment, status, created_at")
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error getting all reviews:", error)
    return []
  }
}

// Moderate review
export async function moderateReview(id: string, status: "approved" | "rejected") {
  try {
    const { error } = await supabaseAdmin
      .from("reviews")
      .update({
        status,
        moderated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error moderating review:", error)
    return false
  }
}

// Track analytics event (with error handling)
export async function trackAnalyticsEvent(event: {
  event_type: string
  page?: string
  user_agent?: string
  ip_address?: string
  metadata?: any
}) {
  try {
    // Check if analytics_events table exists first
    const { error } = await supabaseAdmin.from("analytics_events").insert({
      event_type: event.event_type,
      page: event.page,
      user_agent: event.user_agent,
      ip_address: event.ip_address,
      metadata: event.metadata,
      timestamp: new Date().toISOString(),
    })

    if (error) {
      // If table doesn't exist, silently fail
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        console.warn("Analytics table not found, skipping analytics tracking")
        return
      }
      console.error("Analytics tracking error:", error)
    }
  } catch (error) {
    console.error("Error tracking analytics:", error)
  }
}

// Get analytics data
export async function getAnalytics(days = 30) {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabaseAdmin
      .from("analytics_events")
      .select("*")
      .gte("timestamp", startDate)
      .order("timestamp", { ascending: false })

    if (error) {
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        console.warn("Analytics table not found")
        return []
      }
      throw error
    }
    return data || []
  } catch (error) {
    console.error("Error getting analytics:", error)
    return []
  }
}

// Create content snapshot
export async function createSnapshot(content: any, description?: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("content_snapshots")
      .insert({
        content,
        description: description || "Content snapshot",
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (error) throw error
    return data?.id
  } catch (error) {
    console.error("Error creating snapshot:", error)
    return null
  }
}

// Get snapshots
export async function getSnapshots(limit = 10) {
  try {
    const { data, error } = await supabaseAdmin
      .from("content_snapshots")
      .select("id, content, description, created_at")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error getting snapshots:", error)
    return []
  }
}

// Hash utility function
async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input.toLowerCase())
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

// Default content
function getDefaultContent() {
  return {
    ar: {
      site: {
        name: "KYCtrust",
        description: "خدمة متخصصة في الحسابات البنكية الإلكترونية والخدمات المالية الآمنة",
        phone: "+20-106-245-3344",
        tagline: "شريكك الموثوق في العالم الرقمي",
        logoSrc: "/images/brand/novapay-logo.png",
      },
      hero: {
        title: "KYCtrust",
        subtitle: "منصة متكاملة للخدمات المالية الرقمية",
        description: "احصل على أفضل الحسابات البنكية الإلكترونية والمحافظ الرقمية بأمان وسرعة لا مثيل لها",
        cta: "ابدأ رحلتك المالية",
        secondary: "تصفح خدماتنا",
        stats: [
          { number: "1000+", label: "عميل راضي" },
          { number: "24/7", label: "دعم فني" },
          { number: "99.9%", label: "معدل النجاح" },
          { number: "15+", label: "خدمة متاحة" },
        ],
      },
      services: [
        {
          name: "Payoneer",
          price: "$30",
          category: "حسابات بنكية",
          icon: "💳",
          iconImage: "/images/logos/payoneer.png",
          popular: true,
          active: true,
          sort: 1,
          description: "حساب بنكي عالمي موثوق لاستقبال المدفوعات الدولية",
        },
        {
          name: "Wise",
          price: "$30",
          category: "حسابات بنكية",
          icon: "🏦",
          iconImage: "/images/logos/wise.png",
          popular: true,
          active: true,
          sort: 2,
          description: "حساب متعدد العملات مع تحويلات دولية بأسعار حقيقية",
        },
        {
          name: "Skrill",
          price: "$20",
          category: "محافظ إلكترونية",
          icon: "💰",
          iconImage: "/images/logos/skrill.png",
          active: true,
          sort: 3,
          description: "محفظة إلكترونية سريعة وآمنة للمدفوعات الرقمية",
        },
        {
          name: "PayPal",
          price: "$15",
          category: "محافظ إلكترونية",
          icon: "💙",
          iconImage: "/images/logos/paypal.png",
          popular: true,
          active: true,
          sort: 4,
          description: "المحفظة الإلكترونية الأكثر شهرة وقبولاً عالمياً",
        },
      ],
      payments: [
        { label: "فودافون كاش", value: "01062453344", icon: "📱", color: "red" },
        { label: "USDT TRC20", value: "TFUt8GRpk2R8Wv3FvoCiSUghRBQo4HrmQK", icon: "₿", color: "green" },
      ],
      features: [
        { title: "خدمة سريعة", desc: "تسليم خلال 24-48 ساعة", icon: "clock" },
        { title: "أمان مضمون", desc: "حماية كاملة لبياناتك", icon: "shield" },
        { title: "دعم مستمر", desc: "فريق دعم على مدار الساعة", icon: "users" },
        { title: "أسعار تنافسية", desc: "أفضل الأسعار في السوق", icon: "award" },
      ],
      faq: [
        {
          question: "كم تستغرق عملية إنشاء الحساب؟",
          answer: "عادة من 24-48 ساعة حسب نوع الحساب والمتطلبات المطلوبة.",
        },
        {
          question: "هل الخدمة آمنة ومضمونة؟",
          answer: "نعم، نتبع أعلى معايير الأمان الدولية ونحافظ على خصوصية بياناتك بالكامل.",
        },
        {
          question: "ما هي طرق الدفع المتاحة؟",
          answer: "نقبل الدفع عبر فودافون كاش والعملات المشفرة مثل USDT.",
        },
        {
          question: "هل يمكنني الحصول على دعم فني؟",
          answer: "نعم، فريق الدعم الفني متاح 24/7 عبر واتساب للمساعدة في أي استفسار.",
        },
      ],
      contact: {
        title: "ابدأ معنا اليوم",
        subtitle: "فريق الدعم متاح 24/7 للإجابة على استفساراتك",
        whatsapp: "تواصل عبر واتساب",
        features: ["رد فوري", "استشارة مجانية", "ضمان الخدمة"],
      },
      testimonials: [
        {
          name: "أحمد محمد",
          role: "رائد أعمال",
          quote: "خدمة ممتازة وسرعة في التنفيذ. حصلت على حساب Payoneer في يوم واحد!",
        },
        {
          name: "فاطمة علي",
          role: "مسوقة رقمية",
          quote: "الدعم الفني رائع والأسعار تنافسية جداً. أنصح بالتعامل معهم.",
        },
        {
          name: "محمد حسن",
          role: "مطور مستقل",
          quote: "أفضل مكان للحصول على الحسابات البنكية الإلكترونية بأمان.",
        },
      ],
      cta: {
        title: "جاهز لتبدأ الآن؟",
        subtitle: "ابدأ رحلتك المالية بثقة وسرعة",
        primaryText: "ابدأ الآن",
        secondaryText: "تواصل معنا",
      },
    },
    en: {
      site: {
        name: "KYCtrust",
        description: "Specialized service for secure electronic banking accounts and financial services",
        phone: "+20-106-245-3344",
        tagline: "Your trusted partner in the digital world",
        logoSrc: "/images/brand/novapay-logo.png",
      },
      hero: {
        title: "KYCtrust",
        subtitle: "Complete Digital Financial Services Platform",
        description: "Get the best electronic banking accounts and digital wallets with unmatched security and speed",
        cta: "Start Your Financial Journey",
        secondary: "Browse Our Services",
        stats: [
          { number: "1000+", label: "Happy Clients" },
          { number: "24/7", label: "Support" },
          { number: "99.9%", label: "Success Rate" },
          { number: "15+", label: "Services" },
        ],
      },
      services: [
        {
          name: "Payoneer",
          price: "$30",
          category: "Banking",
          icon: "💳",
          iconImage: "/images/logos/payoneer.png",
          popular: true,
          active: true,
          sort: 1,
          description: "Trusted global banking account for receiving international payments",
        },
        {
          name: "Wise",
          price: "$30",
          category: "Banking",
          icon: "🏦",
          iconImage: "/images/logos/wise.png",
          popular: true,
          active: true,
          sort: 2,
          description: "Multi-currency account with international transfers at real exchange rates",
        },
        {
          name: "Skrill",
          price: "$20",
          category: "E-Wallets",
          icon: "💰",
          iconImage: "/images/logos/skrill.png",
          active: true,
          sort: 3,
          description: "Fast and secure e-wallet for digital payments",
        },
        {
          name: "PayPal",
          price: "$15",
          category: "E-Wallets",
          icon: "💙",
          iconImage: "/images/logos/paypal.png",
          popular: true,
          active: true,
          sort: 4,
          description: "The most popular and globally accepted e-wallet",
        },
      ],
      payments: [
        { label: "Vodafone Cash", value: "01062453344", icon: "📱", color: "red" },
        { label: "USDT TRC20", value: "TFUt8GRpk2R8Wv3FvoCiSUghRBQo4HrmQK", icon: "₿", color: "green" },
      ],
      features: [
        { title: "Fast Service", desc: "Delivery within 24-48 hours", icon: "clock" },
        { title: "Guaranteed Security", desc: "Complete protection for your data", icon: "shield" },
        { title: "Continuous Support", desc: "24/7 support team", icon: "users" },
        { title: "Competitive Prices", desc: "Best prices in the market", icon: "award" },
      ],
      faq: [
        {
          question: "How long does account creation take?",
          answer: "Usually 24-48 hours depending on account type and requirements.",
        },
        {
          question: "Is the service safe and guaranteed?",
          answer:
            "Yes, we follow the highest international security standards and maintain complete privacy of your data.",
        },
        {
          question: "What payment methods are available?",
          answer: "We accept payments via Vodafone Cash and cryptocurrencies like USDT.",
        },
        {
          question: "Can I get technical support?",
          answer: "Yes, our technical support team is available 24/7 via WhatsApp to help with any inquiry.",
        },
      ],
      contact: {
        title: "Get Started Today",
        subtitle: "Support team available 24/7 to answer your questions",
        whatsapp: "Contact via WhatsApp",
        features: ["Instant Reply", "Free Consultation", "Service Guarantee"],
      },
      testimonials: [
        {
          name: "Ahmed Mohamed",
          role: "Entrepreneur",
          quote: "Excellent service and fast execution. Got my Payoneer account in one day!",
        },
        {
          name: "Sarah Ali",
          role: "Digital Marketer",
          quote: "Great technical support and very competitive prices. Highly recommend them.",
        },
        {
          name: "Mohamed Hassan",
          role: "Freelance Developer",
          quote: "Best place to get secure electronic banking accounts safely.",
        },
      ],
      cta: {
        title: "Ready to get started?",
        subtitle: "Start your financial journey with confidence and speed",
        primaryText: "Get Started",
        secondaryText: "Contact Us",
      },
    },
    design: {
      theme: "light",
      palette: "violet-emerald",
      anim: {
        enableReveal: true,
        intensity: 1,
        parallax: 14,
      },
    },
  }
}
