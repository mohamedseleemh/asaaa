import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Mock version data - in real implementation, fetch from database
    const versions = [
      {
        id: "v1.0.0",
        version: "1.0.0",
        description: "Initial website launch",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        author: "Admin",
        changes: 15,
        status: "published" as const,
      },
      {
        id: "v1.1.0",
        version: "1.1.0",
        description: "Added new services section",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        author: "Admin",
        changes: 8,
        status: "draft" as const,
      },
      {
        id: "v1.2.0",
        version: "1.2.0",
        description: "Updated hero section and testimonials",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        author: "Admin",
        changes: 12,
        status: "draft" as const,
      },
    ]

    return NextResponse.json(versions)
  } catch (error) {
    console.error("Error fetching versions:", error)
    return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description, content } = body

    // In real implementation, save version to database
    const newVersion = {
      id: `v${Date.now()}`,
      version: `1.${Math.floor(Math.random() * 10)}.0`,
      description: description || "Auto-saved version",
      createdAt: new Date().toISOString(),
      author: "Admin",
      changes: Math.floor(Math.random() * 20) + 1,
      status: "draft" as const,
      content,
    }

    return NextResponse.json(newVersion)
  } catch (error) {
    console.error("Error creating version:", error)
    return NextResponse.json({ error: "Failed to create version" }, { status: 500 })
  }
}
