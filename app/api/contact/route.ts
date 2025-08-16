export async function POST(req: Request) {
  try {
    let requestData
    try {
      requestData = await req.json()
    } catch (jsonError) {
      return new Response(JSON.stringify({ success: false, message: "Invalid request format" }), { status: 400 })
    }

    const { name, email, message } = requestData

    if (
      !name ||
      !email ||
      !message ||
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string"
    ) {
      return new Response(JSON.stringify({ success: false, message: "Missing or invalid fields" }), { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ success: false, message: "Invalid email format" }), { status: 400 })
    }

    if (name.trim().length < 2 || message.trim().length < 10) {
      return new Response(JSON.stringify({ success: false, message: "Name too short or message too brief" }), {
        status: 400,
      })
    }

    // Simulate server-side processing (store, send email, etc.)
    await new Promise((r) => setTimeout(r, 600))

    return new Response(JSON.stringify({ success: true, message: "Thanks! We'll get back to you soon." }), {
      status: 200,
    })
  } catch (e) {
    // Only log errors in development, use generic message in production
    if (process.env.NODE_ENV === "development") {
      console.error("Contact form error:", e)
    }
    return new Response(JSON.stringify({ success: false, message: "Server error" }), { status: 500 })
  }
}
