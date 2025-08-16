"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface ErrorInfo {
  error: Error
  errorInfo?: any
  timestamp: string
  url: string
  userAgent: string
  userId?: string
}

class ErrorMonitor {
  private static instance: ErrorMonitor
  private errors: ErrorInfo[] = []
  private maxErrors = 100

  static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor()
    }
    return ErrorMonitor.instance
  }

  logError(error: Error, errorInfo?: any, userId?: string) {
    const errorData: ErrorInfo = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } as Error,
      errorInfo,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId,
    }

    this.errors.unshift(errorData)
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors)
    }

    // إرسال الخطأ إلى الخادم في الإنتاج
    if (process.env.NODE_ENV === "production") {
      this.sendErrorToServer(errorData)
    }

    console.error("Error logged:", errorData)
  }

  private async sendErrorToServer(errorData: ErrorInfo) {
    try {
      await fetch("/api/errors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(errorData),
      })
    } catch (err) {
      console.error("Failed to send error to server:", err)
    }
  }

  getErrors(): ErrorInfo[] {
    return [...this.errors]
  }

  clearErrors() {
    this.errors = []
  }
}

export function ErrorMonitorProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const errorMonitor = ErrorMonitor.getInstance()

    // معالج الأخطاء العامة
    const handleError = (event: ErrorEvent) => {
      errorMonitor.logError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    }

    // معالج الأخطاء غير المعالجة في Promise
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      errorMonitor.logError(new Error(`Unhandled Promise Rejection: ${event.reason}`), { reason: event.reason })
    }

    // معالج أخطاء التنقل
    const handleRouteError = () => {
      errorMonitor.logError(new Error("Navigation error occurred"))
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [router])

  return <>{children}</>
}

export { ErrorMonitor }
