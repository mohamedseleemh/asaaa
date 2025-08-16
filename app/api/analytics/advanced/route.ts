import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "7d"

    // تحديد عدد الأيام بناءً على النطاق
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90

    // توليد بيانات تحليلية متقدمة
    const generateData = (baseValue: number, variance: number) => {
      return Array.from({ length: days }, (_, i) => ({
        t: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toLocaleDateString("ar-SA", {
          month: "short",
          day: "numeric",
        }),
        v: Math.floor(baseValue + (Math.random() - 0.5) * variance),
      }))
    }

    const data = {
      visitors: generateData(150, 50),
      pageViews: generateData(400, 100),
      bounceRate: generateData(45, 15),
      sessionDuration: generateData(180, 60), // بالثواني
      conversionRate: generateData(3.5, 1.5),
    }

    // حساب مؤشرات الأداء الرئيسية
    const kpis = [
      {
        title: "إجمالي الزوار",
        value: data.visitors.reduce((sum, item) => sum + item.v, 0).toLocaleString(),
        change: "+12.5%",
        trend: "up",
        icon: "Users",
      },
      {
        title: "مشاهدات الصفحة",
        value: data.pageViews.reduce((sum, item) => sum + item.v, 0).toLocaleString(),
        change: "+8.3%",
        trend: "up",
        icon: "Eye",
      },
      {
        title: "معدل الارتداد",
        value: `${(data.bounceRate.reduce((sum, item) => sum + item.v, 0) / data.bounceRate.length).toFixed(1)}%`,
        change: "-2.1%",
        trend: "down",
        icon: "MousePointer",
      },
      {
        title: "متوسط مدة الجلسة",
        value: `${Math.floor(data.sessionDuration.reduce((sum, item) => sum + item.v, 0) / data.sessionDuration.length / 60)}:${String(Math.floor((data.sessionDuration.reduce((sum, item) => sum + item.v, 0) / data.sessionDuration.length) % 60)).padStart(2, "0")}`,
        change: "+15.7%",
        trend: "up",
        icon: "Clock",
      },
    ]

    return NextResponse.json({ data, kpis })
  } catch (error) {
    console.error("Advanced analytics API error:", error)
    return NextResponse.json({ error: "Failed to fetch advanced analytics" }, { status: 500 })
  }
}
