"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Users, FileText, Activity, Shield, Settings } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface ActivityItem {
  id: string
  type: "review" | "user" | "content" | "system" | "security" | "settings"
  message: string
  timestamp: string
  status: "success" | "warning" | "error" | "info"
  user?: string
}

interface RecentActivityProps {
  activities?: ActivityItem[]
  maxItems?: number
}

export function RecentActivity({ activities, maxItems = 10 }: RecentActivityProps) {
  const defaultActivities: ActivityItem[] = [
    {
      id: "1",
      type: "review",
      message: "تم إضافة مراجعة جديدة من العميل أحمد محمد",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      status: "info",
      user: "أحمد محمد",
    },
    {
      id: "2",
      type: "content",
      message: "تم تحديث محتوى الصفحة الرئيسية بنجاح",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: "success",
      user: "مدير النظام",
    },
    {
      id: "3",
      type: "user",
      message: "تم تسجيل مستخدم جديد في النظام",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: "success",
      user: "سارة أحمد",
    },
    {
      id: "4",
      type: "security",
      message: "محاولة دخول مشبوهة من IP: 192.168.1.100",
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      status: "warning",
    },
    {
      id: "5",
      type: "system",
      message: "تم إجراء نسخ احتياطي للقاعدة البيانات",
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      status: "success",
      user: "النظام",
    },
    {
      id: "6",
      type: "settings",
      message: "تم تحديث إعدادات البريد الإلكتروني",
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      status: "success",
      user: "مدير النظام",
    },
  ]

  const activityList = (activities || defaultActivities).slice(0, maxItems)

  const getActivityIcon = (type: string): LucideIcon => {
    switch (type) {
      case "review":
        return MessageSquare
      case "user":
        return Users
      case "content":
        return FileText
      case "security":
        return Shield
      case "settings":
        return Settings
      case "system":
      default:
        return Activity
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50 dark:bg-green-900/20"
      case "warning":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
      case "error":
        return "text-red-600 bg-red-50 dark:bg-red-900/20"
      case "info":
      default:
        return "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">نجح</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">تحذير</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">خطأ</Badge>
      case "info":
      default:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">معلومات</Badge>
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "الآن"
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`
    return date.toLocaleDateString("ar-SA")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2 text-purple-600" />
          النشاط الأخير
        </CardTitle>
        <CardDescription>آخر الأحداث في النظام</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {activityList.map((activity) => {
              const Icon = getActivityIcon(activity.type)
              return (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 space-x-reverse p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className={`p-2 rounded-full ${getActivityColor(activity.status)} flex-shrink-0`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white leading-relaxed">{activity.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {activity.user && <span className="text-xs text-muted-foreground">بواسطة {activity.user}</span>}
                        <span className="text-xs text-muted-foreground">{formatTimestamp(activity.timestamp)}</span>
                      </div>
                      {getStatusBadge(activity.status)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
