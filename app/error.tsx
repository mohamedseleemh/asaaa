"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      // يمكن إضافة خدمة مراقبة الأخطاء هنا مثل Sentry
      console.error("Production error:", error.message)
    } else {
      console.error("Development error:", error)
    }
  }, [error])

  const handleReset = () => {
    try {
      reset()
    } catch (err) {
      console.error("Reset failed:", err)
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-xl">حدث خطأ غير متوقع</CardTitle>
          <CardDescription>نعتذر، حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button onClick={handleReset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              إعادة المحاولة
            </Button>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full bg-transparent">
                <Home className="mr-2 h-4 w-4" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground">تفاصيل الخطأ (للمطورين)</summary>
              <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-32">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
