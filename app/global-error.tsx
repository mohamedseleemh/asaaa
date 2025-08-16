"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">حدث خطأ غير متوقع</h2>
            <p className="text-muted-foreground">نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى.</p>
            <Button onClick={() => reset()}>المحاولة مرة أخرى</Button>
          </div>
        </div>
      </body>
    </html>
  )
}
