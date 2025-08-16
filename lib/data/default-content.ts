// فصل المحتوى الافتراضي
import type { Bundle, Design, Block, Locale } from "@/lib/types/cms"

export const defaultContent: Record<Locale, Bundle> = {
  ar: {
    hero: {
      title: "KYC Trust - خدماتك المالية الموثوقة",
      subtitle: "منصة آمنة وموثوقة للخدمات المالية الرقمية",
      description:
        "نحن نقدم خدمات مالية متكاملة مع أعلى معايير الأمان والموثوقية. تواصل معنا عبر واتساب للحصول على خدمة سريعة ومخصصة.",
      cta: "ابدأ الآن",
      whatsapp: "تواصل عبر واتساب",
    },
    services: [
      {
        id: "1",
        title: "تفعيل PayPal",
        description: "خدمة تفعيل حسابات PayPal بأمان وسرعة",
        icon: "paypal",
        price: "من $50",
        features: ["تفعيل فوري", "ضمان 100%", "دعم 24/7"],
      },
      {
        id: "2",
        title: "تفعيل Payoneer",
        description: "تفعيل حسابات Payoneer للمدفوعات الدولية",
        icon: "payoneer",
        price: "من $40",
        features: ["تفعيل سريع", "دعم كامل", "ضمان الجودة"],
      },
      {
        id: "3",
        title: "تفعيل Wise",
        description: "خدمة تفعيل حسابات Wise (TransferWise)",
        icon: "wise",
        price: "من $45",
        features: ["تحويلات دولية", "رسوم منخفضة", "أمان عالي"],
      },
      {
        id: "4",
        title: "تفعيل Skrill",
        description: "تفعيل محافظ Skrill الإلكترونية",
        icon: "skrill",
        price: "من $35",
        features: ["تفعيل سريع", "دعم العملات المتعددة", "أمان مضمون"],
      },
      {
        id: "5",
        title: "تفعيل Neteller",
        description: "خدمة تفعيل حسابات Neteller",
        icon: "neteller",
        price: "من $40",
        features: ["تفعيل فوري", "دعم VIP", "ضمان الخدمة"],
      },
      {
        id: "6",
        title: "خدمات العملات الرقمية",
        description: "تفعيل وإدارة محافظ العملات الرقمية",
        icon: "crypto",
        price: "من $60",
        features: ["محافظ متعددة", "أمان عالي", "دعم فني"],
      },
    ],
    about: {
      title: "من نحن",
      description:
        "KYC Trust هي منصة رائدة في مجال الخدمات المالية الرقمية، نقدم حلولاً آمنة وموثوقة لعملائنا حول العالم.",
      features: ["أكثر من 5 سنوات من الخبرة", "أكثر من 10,000 عميل راضٍ", "دعم فني 24/7", "أعلى معايير الأمان"],
    },
    contact: {
      title: "تواصل معنا",
      description: "نحن هنا لمساعدتك في جميع احتياجاتك المالية",
      phone: "+971501234567",
      email: "info@kyctrust.com",
      address: "دبي، الإمارات العربية المتحدة",
    },
    faq: [
      {
        question: "ما هي خدمات KYC Trust؟",
        answer:
          "نقدم خدمات تفعيل المحافظ الإلكترونية مثل PayPal وPayoneer وWise وSkrill وNeteller، بالإضافة إلى خدمات العملات الرقمية.",
      },
      {
        question: "هل الخدمات آمنة؟",
        answer: "نعم، نستخدم أحدث تقنيات الأمان والتشفير لحماية بياناتك وأموالك. جميع خدماتنا مضمونة 100%.",
      },
      {
        question: "كم يستغرق التفعيل؟",
        answer: "معظم خدماتنا تتم خلال 24-48 ساعة، وبعض الخدمات تتم فورياً حسب نوع الطلب.",
      },
      {
        question: "هل تقدمون ضمان؟",
        answer: "نعم، نقدم ضمان كامل على جميع خدماتنا. في حالة عدم نجاح التفعيل، نعيد المبلغ كاملاً.",
      },
    ],
    testimonials: [
      {
        name: "أحمد محمد",
        role: "رجل أعمال",
        content: "خدمة ممتازة وسريعة، تم تفعيل حساب PayPal خلال يوم واحد. أنصح بها بشدة",
        rating: 5,
      },
      {
        name: "فاطمة علي",
        role: "مستقلة",
        content: "تعامل احترافي وأسعار منافسة. فريق الدعم متعاون جداً",
        rating: 5,
      },
      {
        name: "محمد السعيد",
        role: "مطور ويب",
        content: "أفضل موقع لتفعيل المحافظ الإلكترونية. خدمة موثوقة وآمنة",
        rating: 5,
      },
    ],
  },
  en: {
    hero: {
      title: "KYC Trust - Your Trusted Financial Partner",
      subtitle: "Secure and reliable digital financial services platform",
      description:
        "We provide comprehensive financial services with the highest standards of security and reliability. Contact us via WhatsApp for fast and personalized service.",
      cta: "Get Started",
      whatsapp: "Contact via WhatsApp",
    },
    services: [
      {
        id: "1",
        title: "PayPal Activation",
        description: "Safe and fast PayPal account activation service",
        icon: "paypal",
        price: "From $50",
        features: ["Instant activation", "100% guarantee", "24/7 support"],
      },
      {
        id: "2",
        title: "Payoneer Activation",
        description: "Payoneer account activation for international payments",
        icon: "payoneer",
        price: "From $40",
        features: ["Quick activation", "Full support", "Quality guarantee"],
      },
      {
        id: "3",
        title: "Wise Activation",
        description: "Wise (TransferWise) account activation service",
        icon: "wise",
        price: "From $45",
        features: ["International transfers", "Low fees", "High security"],
      },
      {
        id: "4",
        title: "Skrill Activation",
        description: "Skrill e-wallet activation service",
        icon: "skrill",
        price: "From $35",
        features: ["Fast activation", "Multi-currency support", "Guaranteed security"],
      },
      {
        id: "5",
        title: "Neteller Activation",
        description: "Neteller account activation service",
        icon: "neteller",
        price: "From $40",
        features: ["Instant activation", "VIP support", "Service guarantee"],
      },
      {
        id: "6",
        title: "Cryptocurrency Services",
        description: "Cryptocurrency wallet activation and management",
        icon: "crypto",
        price: "From $60",
        features: ["Multiple wallets", "High security", "Technical support"],
      },
    ],
    about: {
      title: "About Us",
      description:
        "KYC Trust is a leading platform in digital financial services, providing secure and reliable solutions to our clients worldwide.",
      features: [
        "Over 5 years of experience",
        "More than 10,000 satisfied customers",
        "24/7 technical support",
        "Highest security standards",
      ],
    },
    contact: {
      title: "Contact Us",
      description: "We're here to help you with all your financial needs",
      phone: "+971501234567",
      email: "info@kyctrust.com",
      address: "Dubai, United Arab Emirates",
    },
    faq: [
      {
        question: "What are KYC Trust services?",
        answer:
          "We provide e-wallet activation services like PayPal, Payoneer, Wise, Skrill, and Neteller, plus cryptocurrency services.",
      },
      {
        question: "Are the services secure?",
        answer:
          "Yes, we use the latest security and encryption technologies to protect your data and funds. All our services are 100% guaranteed.",
      },
      {
        question: "How long does activation take?",
        answer:
          "Most of our services are completed within 24-48 hours, and some services are instant depending on the request type.",
      },
      {
        question: "Do you provide a guarantee?",
        answer: "Yes, we provide a full guarantee on all our services. If activation fails, we refund the full amount.",
      },
    ],
    testimonials: [
      {
        name: "Ahmed Mohammed",
        role: "Businessman",
        content: "Excellent and fast service, PayPal account activated within one day. Highly recommended",
        rating: 5,
      },
      {
        name: "Fatima Ali",
        role: "Freelancer",
        content: "Professional service and competitive prices. Support team is very helpful",
        rating: 5,
      },
      {
        name: "Mohammed Al-Saeed",
        role: "Web Developer",
        content: "Best website for e-wallet activation. Reliable and secure service",
        rating: 5,
      },
    ],
  },
}

export const defaultDesign: Design = {
  primaryColor: "#3b82f6",
  secondaryColor: "#1e40af",
  accentColor: "#06b6d4",
  fontFamily: "Inter",
  borderRadius: "0.5rem",
  spacing: "1rem",
  palette: "blue",
}

export const defaultBlocks: Block[] = [
  { id: "hero", name: "Hero Section", type: "hero", enabled: true, order: 1 },
  { id: "services", name: "Services", type: "services", enabled: true, order: 2 },
  { id: "about", name: "About Us", type: "about", enabled: true, order: 3 },
  { id: "testimonials", name: "Testimonials", type: "testimonials", enabled: true, order: 4 },
  { id: "faq", name: "FAQ", type: "faq", enabled: true, order: 5 },
  { id: "contact", name: "Contact", type: "contact", enabled: true, order: 6 },
]
