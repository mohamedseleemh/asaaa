import { type NextRequest, NextResponse } from "next/server"
import { readFile, writeFile } from "fs/promises"
import { join } from "path"

const CONFIG_FILE = join(process.cwd(), "data", "landing-config.json")

export async function GET() {
  try {
    const data = await readFile(CONFIG_FILE, "utf-8")
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    // Return default config if file doesn't exist
    const defaultConfig = {
      sections: [
        {
          id: "hero-1",
          type: "hero",
          title: "قسم البطل الرئيسي",
          content: {
            title: "مرحباً بك في KYC Trust",
            subtitle: "منصة موثوقة لخدمات التحقق من الهوية والامتثال",
            buttonText: "ابدأ الآن",
            backgroundImage: "/placeholder.svg?height=600&width=1200",
          },
          visible: true,
          order: 0,
        },
      ],
      theme: {
        primaryColor: "#10b981",
        secondaryColor: "#3b82f6",
        fontFamily: "Cairo",
        direction: "rtl",
      },
      seo: {
        title: "KYC Trust - خدمات التحقق من الهوية",
        description: "منصة موثوقة لخدمات التحقق من الهوية والامتثال",
        keywords: "KYC, التحقق من الهوية, الامتثال",
      },
    }
    return NextResponse.json(defaultConfig)
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = await request.json()

    // Ensure data directory exists
    const { mkdir } = await import("fs/promises")
    const dataDir = join(process.cwd(), "data")
    try {
      await mkdir(dataDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving landing config:", error)
    return NextResponse.json({ error: "Failed to save configuration" }, { status: 500 })
  }
}
