import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie") || ""
    const isUnlocked = /(?:^|; )dash_unlock=1(?:;|$)/.test(cookies)

    return NextResponse.json({ unlocked: isUnlocked })
  } catch (error) {
    console.error("Error checking gate status:", error)
    return NextResponse.json({ unlocked: false })
  }
}
