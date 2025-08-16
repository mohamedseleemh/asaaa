"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo)

    // In production, send to monitoring service
    if (process.env.NODE_ENV === "production") {
      // TODO: Send to monitoring service like Sentry
      // captureException(error, { extra: errorInfo })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">حدث خطأ غير متوقع</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              نعتذر عن الإزعاج. يرجى تحديث الصفحة والمحاولة مرة أخرى.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="text-left mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                <summary className="cursor-pointer font-medium">تفاصيل الخطأ</summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs overflow-auto max-h-32">{this.state.error.stack}</pre>
              </details>
            )}
            <Button onClick={() => window.location.reload()} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              تحديث الصفحة
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
