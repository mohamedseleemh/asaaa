"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, Calendar, MapPin, Monitor, RefreshCw, Search } from "lucide-react"

interface ActivityLog {
  id: string
  user_id: string
  user_name: string
  action: string
  resource?: string
  details?: any
  ip_address?: string
  user_agent?: string
  timestamp: string
  status: "success" | "warning" | "error"
}

interface UserActivityLogProps {
  userId?: string
  showAllUsers?: boolean
}

export function UserActivityLog({ userId, showAllUsers = false }: UserActivityLogProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchActivities()
  }, [userId])

  const fetchActivities = async () => {
    setLoading(true)
    try {
      const url = userId ? `/api/admin/users/${userId}/activities` : "/api/admin/activities"
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      }
    } catch (error) {
      console.error("Error fetching activities:", error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (action: string) => {
    if (action.includes("login")) return <Activity className="h-4 w-4 text-green-600" />
    if (action.includes("logout")) return <Activity className="h-4 w-4 text-gray-600" />
    if (action.includes("create")) return <Activity className="h-4 w-4 text-blue-600" />
    if (action.includes("update")) return <Activity className="h-4 w-4 text-yellow-600" />
    if (action.includes("delete")) return <Activity className="h-4 w-4 text-red-600" />
    return <Activity className="h-4 w-4 text-gray-600" />
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">نجح</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">تحذير</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">خطأ</Badge>
      default:
        return <Badge variant="outline">غير معروف</Badge>
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

  const getActionLabel = (action: string) => {
    const actionMap: Record<string, string> = {
      login: "تسجيل دخول",
      logout: "تسجيل خروج",
      create_user: "إنشاء مستخدم",
      update_user: "تحديث مستخدم",
      delete_user: "حذف مستخدم",
      create_content: "إنشاء محتوى",
      update_content: "تحديث محتوى",
      publish_content: "نشر محتوى",
      view_analytics: "عرض التحليلات",
      export_data: "تصدير بيانات",
      change_settings: "تغيير إعدادات",
    }
    return actionMap[action] || action
  }

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = actionFilter === "all" || activity.action.includes(actionFilter)
    const matchesStatus = statusFilter === "all" || activity.status === statusFilter

    return matchesSearch && matchesAction && matchesStatus
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              سجل النشاط
            </CardTitle>
            <CardDescription>{showAllUsers ? "جميع أنشطة المستخدمين" : "نشاط المستخدم المحدد"}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchActivities} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* فلاتر البحث */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="البحث في الأنشطة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="نوع النشاط" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنشطة</SelectItem>
              <SelectItem value="login">تسجيل الدخول</SelectItem>
              <SelectItem value="content">المحتوى</SelectItem>
              <SelectItem value="user">المستخدمين</SelectItem>
              <SelectItem value="settings">الإعدادات</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="success">نجح</SelectItem>
              <SelectItem value="warning">تحذير</SelectItem>
              <SelectItem value="error">خطأ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* قائمة الأنشطة */}
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">لا توجد أنشطة مطابقة</div>
            ) : (
              filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 space-x-reverse p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.action)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {showAllUsers && <span className="text-blue-600">{activity.user_name}</span>}{" "}
                        {getActionLabel(activity.action)}
                        {activity.resource && <span className="text-muted-foreground"> - {activity.resource}</span>}
                      </p>
                      {getStatusBadge(activity.status)}
                    </div>
                    <div className="flex items-center space-x-4 space-x-reverse text-xs text-muted-foreground mt-1">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatTimestamp(activity.timestamp)}
                      </span>
                      {activity.ip_address && (
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {activity.ip_address}
                        </span>
                      )}
                      {activity.user_agent && (
                        <span className="flex items-center">
                          <Monitor className="h-3 w-3 mr-1" />
                          {activity.user_agent.includes("Mobile") ? "جوال" : "سطح المكتب"}
                        </span>
                      )}
                    </div>
                    {activity.details && (
                      <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(activity.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
