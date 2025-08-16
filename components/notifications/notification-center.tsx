"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Bell, Check, X, AlertTriangle, Info, CheckCircle, XCircle, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  timestamp: Date
  read: boolean
  actionUrl?: string
  priority: "low" | "medium" | "high"
}

const notificationIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
}

const notificationColors = {
  info: "text-blue-600 bg-blue-50 border-blue-200",
  success: "text-green-600 bg-green-50 border-green-200",
  warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
  error: "text-red-600 bg-red-50 border-red-200",
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      } else {
        // Fallback to localStorage for demo
        const stored = localStorage.getItem("admin_notifications")
        if (stored) {
          const parsed = JSON.parse(stored)
          setNotifications(parsed)
          setUnreadCount(parsed.filter((n: Notification) => !n.read).length)
        }
      }
    } catch (error) {
      console.error("Failed to load notifications:", error)
      // Generate demo notifications
      const demoNotifications: Notification[] = [
        {
          id: "1",
          title: "مستخدم جديد مسجل",
          message: "انضم مستخدم جديد إلى النظام",
          type: "success",
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          read: false,
          priority: "medium",
        },
        {
          id: "2",
          title: "تحديث أمني",
          message: "تم تحديث إعدادات الأمان بنجاح",
          type: "info",
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          read: false,
          priority: "high",
        },
        {
          id: "3",
          title: "تحذير من الأداء",
          message: "استخدام المعالج مرتفع (85%)",
          type: "warning",
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          read: true,
          priority: "high",
        },
      ]
      setNotifications(demoNotifications)
      setUnreadCount(demoNotifications.filter((n) => !n.read).length)
    }
  }, [])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, { method: "POST" })
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Failed to mark as read:", error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "POST" })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
      toast({
        title: "تم بنجاح",
        description: "تم وضع علامة مقروء على جميع الإشعارات",
      })
    } catch (error) {
      console.error("Failed to mark all as read:", error)
    }
  }, [toast])

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        await fetch(`/api/notifications/${notificationId}`, { method: "DELETE" })
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
        setUnreadCount((prev) => {
          const notification = notifications.find((n) => n.id === notificationId)
          return notification && !notification.read ? prev - 1 : prev
        })
      } catch (error) {
        console.error("Failed to delete notification:", error)
      }
    },
    [notifications],
  )

  useEffect(() => {
    loadNotifications()

    // Listen for real-time updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "new_notification") {
        loadNotifications()
        const notification = JSON.parse(e.newValue || "{}")
        toast({
          title: notification.title,
          description: notification.message,
          variant: notification.type === "error" ? "destructive" : "default",
        })
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Poll for updates every 30 seconds
    const interval = setInterval(loadNotifications, 30000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [loadNotifications, toast])

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "الآن"
    if (minutes < 60) return `منذ ${minutes} دقيقة`
    if (hours < 24) return `منذ ${hours} ساعة`
    return `منذ ${days} يوم`
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="sm" className="relative" onClick={() => setIsOpen(!isOpen)}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 hover:bg-red-600">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute left-0 top-full mt-2 w-96 max-h-96 shadow-lg z-50 border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">الإشعارات</CardTitle>
              <div className="flex items-center space-x-2 space-x-reverse">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    <Check className="h-4 w-4 ml-1" />
                    وضع علامة مقروء على الكل
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : "جميع الإشعارات مقروءة"}
            </CardDescription>
          </CardHeader>
          <Separator />
          <ScrollArea className="max-h-80">
            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => {
                    const Icon = notificationIcons[notification.type]
                    return (
                      <div
                        key={notification.id}
                        className={cn("p-4 hover:bg-gray-50 transition-colors", !notification.read && "bg-blue-50/50")}
                      >
                        <div className="flex items-start space-x-3 space-x-reverse">
                          <div className={cn("p-2 rounded-full", notificationColors[notification.type])}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={cn("text-sm font-medium", !notification.read && "font-semibold")}>
                                {notification.title}
                              </p>
                              <div className="flex items-center space-x-1 space-x-reverse">
                                {notification.priority === "high" && (
                                  <Badge variant="destructive" className="text-xs">
                                    عاجل
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => deleteNotification(notification.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.timestamp)}
                              </span>
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs h-6"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  وضع علامة مقروء
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </ScrollArea>
          <Separator />
          <div className="p-3">
            <Button variant="ghost" size="sm" className="w-full">
              <Settings className="h-4 w-4 ml-1" />
              إعدادات الإشعارات
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
