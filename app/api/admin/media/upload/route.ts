import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const cookies = request.headers.get("cookie") || ""
    const isUnlocked = /(?:^|; )dash_unlock=1(?:;|$)/.test(cookies)

    if (!isUnlocked) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const uploadedFiles = files.map((file) => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      url: `/uploads/${file.name}`,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      thumbnail: file.type.startsWith("image/") ? `/uploads/thumbnails/${file.name}` : null,
    }))

    return NextResponse.json({ files: uploadedFiles, count: uploadedFiles.length })
  } catch (error) {
    console.error("Error uploading files:", error)
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 })
  }
}
