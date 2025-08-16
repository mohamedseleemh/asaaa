import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const headersList = headers()
    const authorization = headersList.get("authorization")

    // Simple auth check - in production, use proper JWT validation
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // In a real app, save to database
    // For now, we'll just return success
    console.log("Saving CMS data:", data)

    return NextResponse.json({
      success: true,
      message: "Content saved successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error saving CMS data:", error)
    return NextResponse.json({ error: "Failed to save content" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // In a real app, fetch from database
    // For now, return default content
    const defaultContent = {
      hero: {
        title: {
          ar: "KYC Trust - خدمات التحقق المالي الموثوقة",
          en: "KYC Trust - Reliable Financial Verification Services",
        },
        subtitle: {
          ar: "نقدم خدمات تفعيل وتحقق الحسابات المالية بأعلى معايير الأمان والجودة",
          en: "We provide account activation and financial verification services with the highest standards of security and quality",
        },
      },
      services: {
        title: {
          ar: "خدماتنا المتميزة",
          en: "Our Premium Services",
        },
        subtitle: {
          ar: "نوفر مجموعة شاملة من خدمات التحقق والتفعيل للمنصات المالية الرائدة",
          en: "We offer a comprehensive range of verification and activation services for leading financial platforms",
        },
        items: [
          {
            id: "paypal",
            name: { ar: "تفعيل PayPal", en: "PayPal Activation" },
            icon: "paypal",
            price: 50,
            features: {
              ar: ["تفعيل فوري", "ضمان مدى الحياة", "دعم فني 24/7"],
              en: ["Instant activation", "Lifetime guarantee", "24/7 support"],
            },
            timing: { ar: "24-48 ساعة", en: "24-48 hours" },
          },
          {
            id: "payoneer",
            name: { ar: "تفعيل Payoneer", en: "Payoneer Activation" },
            icon: "payoneer",
            price: 40,
            features: {
              ar: ["تفعيل سريع", "ضمان النجاح", "استشارة مجانية"],
              en: ["Fast activation", "Success guarantee", "Free consultation"],
            },
            timing: { ar: "12-24 ساعة", en: "12-24 hours" },
          },
        ],
      },
    }

    return NextResponse.json(defaultContent)
  } catch (error) {
    console.error("Error fetching CMS data:", error)
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 })
  }
}
