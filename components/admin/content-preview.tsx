"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCMS } from "@/lib/store"
import { BlocksRenderer } from "@/components/blocks/blocks-renderer"
import { Eye, EyeOff, Monitor, Smartphone, Tablet } from "lucide-react"

export function ContentPreview() {
  const cms = useCMS()
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [showPreview, setShowPreview] = useState(false)

  const previewSizes = {
    desktop: "w-full",
    tablet: "w-[768px]",
    mobile: "w-[375px]",
  }

  if (!showPreview) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              معاينة المحتوى
            </CardTitle>
            <Button onClick={() => setShowPreview(true)} variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              عرض المعاينة
            </Button>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            معاينة المحتوى
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{cms.locale === "ar" ? "العربية" : "English"}</Badge>
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={previewMode === "desktop" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("desktop")}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={previewMode === "tablet" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("tablet")}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={previewMode === "mobile" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("mobile")}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => setShowPreview(false)} variant="outline">
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden bg-background">
          <div className={`mx-auto transition-all duration-300 ${previewSizes[previewMode]}`}>
            <div className="min-h-screen bg-background">
              <BlocksRenderer />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
