"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, XCircle, Activity } from "lucide-react"

interface SystemService {
  name: string
  status: "healthy" | "warning" | "error"
  uptime: number
  description: string
}

interface SystemHealthProps {
  services?: SystemService[]
  overallHealth?: number
}

export function SystemHealth({ services, overallHealth = 95 }: SystemHealthProps) {
  const defaultServices: SystemService[] = [
    {
      name: "قاعدة البيانات",
      status: "healthy",
      uptime: 99.9,
      description: "PostgreSQL متصلة",
    },
    {
      name: "واجهة برمجة التطبيقات",
      status: "healthy",
      uptime: 99.8,
      description: "جميع النقاط نشطة",
    },
    {
      name: "نظام المراجعات",
      status: "healthy",
      uptime: 98.5,
      description: "يعمل بشكل طبيعي",
    },
    {
      name: "التحليلات",
      status: "warning",
      uptime: 97.2,
      description: "بطء في الاستجابة",
    },
  ]

  const serviceList = services || defaultServices

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">نشط</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">تحذير</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">خطأ</Badge>
      default:
        return <Badge variant="secondary">غير معروف</Badge>
    }
  }

  const getProgressColor = (uptime: number) => {
    if (uptime >= 99) return "bg-green-500"
    if (uptime >= 95) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-600" />
          حالة النظام
        </CardTitle>
        <CardDescription>صحة النظام والخدمات</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Health */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">الصحة العامة</span>
            <span className="text-2xl font-bold text-emerald-600">{overallHealth}%</span>
          </div>
          <Progress value={overallHealth} className="h-2" />
        </div>

        {/* Services Status */}
        <div className="space-y-3">
          {serviceList.map((service, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center space-x-3 space-x-reverse">
                {getStatusIcon(service.status)}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-xs text-muted-foreground">{service.uptime}%</span>
                {getStatusBadge(service.status)}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-2">
            <button className="p-2 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg transition-colors">
              تحديث الحالة
            </button>
            <button className="p-2 text-xs bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
              عرض السجلات
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
