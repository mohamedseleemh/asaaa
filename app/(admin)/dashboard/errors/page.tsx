"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, RefreshCw, Eye } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ErrorLog {
  id: string
  error_name: string
  error_message: string
  url: string
  user_id?: string
  timestamp: string
}

export default function ErrorsPage() {
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null)

  const fetchErrors = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/errors?limit=100")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setErrors(data?.errors || [])
    } catch (error) {
      console.error("Failed to fetch errors:", error)
      setErrors([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchErrors()
  }, [])

  const getErrorSeverity = (errorName: string) => {
    if (!errorName) return "low"
    if (errorName.includes("TypeError") || errorName.includes("ReferenceError")) {
      return "high"
    }
    if (errorName.includes("NetworkError") || errorName.includes("FetchError")) {
      return "medium"
    }
    return "low"
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">سجل الأخطاء</h1>
          <p className="text-muted-foreground">مراقبة وإدارة أخطاء النظام</p>
        </div>
        <Button onClick={fetchErrors} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          تحديث
        </Button>
      </div>

      {errors.length === 0 ? (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>لا توجد أخطاء مسجلة حالياً</AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4">
          {errors.map((error) => {
            const severity = getErrorSeverity(error.error_name)
            return (
              <Card key={error.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <CardTitle className="text-lg">{error.error_name}</CardTitle>
                      <Badge variant={getSeverityColor(severity) as any}>
                        {severity === "high" ? "عالي" : severity === "medium" ? "متوسط" : "منخفض"}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedError(error)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-right">
                    {new Date(error.timestamp).toLocaleString("ar-SA")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{error.error_message}</p>
                  <p className="text-xs text-muted-foreground">الصفحة: {error.url}</p>
                  {error.user_id && <p className="text-xs text-muted-foreground">المستخدم: {error.user_id}</p>}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
