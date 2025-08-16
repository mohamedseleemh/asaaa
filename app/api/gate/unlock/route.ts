import { type NextRequest, NextResponse } from "next/server"
import { getSetting } from "@/lib/database/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    // Get stored password from settings
    const storedPassword = await getSetting("admin_password")

    if (!storedPassword || password !== storedPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Set unlock cookie
    const response = NextResponse.json({ success: true, message: "Access granted" })
    response.cookies.set("dash_unlock", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return response
  } catch (error) {
    console.error("Error in unlock API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
