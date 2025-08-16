import { NextResponse } from "next/server"
import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // نظام معرفة مخصص للإدارة
    const adminKnowledge = `
أنت مساعد ذكي متخصص في إدارة مواقع الخدمات المالية. لديك خبرة في:
- تحليل البيانات والتحليلات
- تحسين معدلات التحويل
- إدارة المحتوى والتسويق الرقمي
- الأمان والحماية
- تجربة المستخدم وتحسين الأداء

قدم إجابات عملية ومفيدة باللغة العربية.
`

    let model
    try {
      if (process.env.XAI_API_KEY) {
        model = xai("grok-beta")
      } else {
        throw new Error("No AI provider configured")
      }
    } catch (modelError) {
      return NextResponse.json(
        { response: "عذراً، خدمة الذكاء الاصطناعي غير متاحة حالياً. يرجى المحاولة لاحقاً." },
        { status: 200 },
      )
    }

    const { text } = await generateText({
      model,
      system: adminKnowledge,
      prompt: query,
      maxTokens: 500,
    })

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Admin assistant error:", error)
    return NextResponse.json({ response: "عذراً، حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى." }, { status: 200 })
  }
}
