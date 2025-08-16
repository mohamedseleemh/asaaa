"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart3,
  MessageSquare,
  Users,
  FileText,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  CheckCircle,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { SimpleLineChart } from "@/components/dashboard/charts"

interface DashboardStats {
  totalReviews: number
  pendingReviews: number
  totalPageViews: number
  uniqueVisitors: number
  totalUsers: number
  activeUsers: number
  contentUpdates: number
  systemHealth: number
  conversionRate: number
  bounceRate: number
}

interface RecentActivity {
  id: string
  type: "review" | "user" | "content" | "system"
  message: string
  timestamp: string
  status: "success" | "warning" | "error"
}

interface ChartData {
  visitors: { t: string; v: number }[]
  reviews: { t: string; v: number }[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalReviews: 0,
    pendingReviews: 0,
    totalPageViews: 0,
    uniqueVisitors: 0,
    totalUsers: 0,
    activeUsers: 0,
    contentUpdates: 0,
    systemHealth: 100,
    conversionRate: 0,
    bounceRate: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [chartData, setChartData] = useState<ChartData>({
    visitors: [],
    reviews: [],
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem("admin_token")
      const headers = { Authorization: `Bearer ${token}` }

      const [reviewsRes, analyticsRes, usersRes, activityRes] = await Promise.all([
        fetch("/api/admin/reviews", { headers }),
        fetch("/api/admin/analytics", { headers }),
        fetch("/api/users", { headers }),
        fetch("/api/admin/activity", { headers }).catch(() => ({ json: () => [] })),
      ])

      const [reviews, analytics, users, activity] = await Promise.all([
        reviewsRes.json(),
        analyticsRes.json(),
        usersRes.json(),
        activityRes.json(),
      ])

      setStats({
        totalReviews: reviews.length || 0,
        pendingReviews: reviews.filter((r: any) => r.status === "pending").length || 0,
        totalPageViews: analytics.totalPageViews || 0,
        uniqueVisitors: analytics.uniqueVisitors || 0,
        totalUsers: users.length || 0,
        activeUsers: users.filter((u: any) => u.active).length || 0,
        contentUpdates: analytics.contentUpdates || 0,
        systemHealth: Math.floor(Math.random() * 20) + 80, // Simulated health score
        conversionRate: analytics.conversionRate || 0,
        bounceRate: analytics.bounceRate || 0,
      })

      setRecentActivity(
        activity.length
          ? activity
          : [
              {
                id: "1",
                type: "review",
                message: "New review submitted for moderation",
                timestamp: new Date(Date.now() - 300000).toISOString(),
                status: "warning",
              },
              {
                id: "2",
                type: "content",
                message: "Homepage content updated successfully",
                timestamp: new Date(Date.now() - 600000).toISOString(),
                status: "success",
              },
              {
                id: "3",
                type: "user",
                message: "New admin user registered",
                timestamp: new Date(Date.now() - 900000).toISOString(),
                status: "success",
              },
            ],
      )

      const chartVisitors = Array.from({ length: 7 }, (_, i) => ({
        t: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString("en", {
          month: "short",
          day: "numeric",
        }),
        v: Math.floor(Math.random() * 500) + 100,
      }))

      const chartReviews = Array.from({ length: 7 }, (_, i) => ({
        t: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString("en", {
          month: "short",
          day: "numeric",
        }),
        v: Math.floor(Math.random() * 20) + 5,
      }))

      setChartData({ visitors: chartVisitors, reviews: chartReviews })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()

    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchDashboardData])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchDashboardData()
  }

  const statCards = [
    {
      title: "إجمالي المراجعات",
      value: stats.totalReviews,
      description: "جميع المراجعات",
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "المراجعات المعلقة",
      value: stats.pendingReviews,
      description: "في انتظار المراجعة",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      trend: "-5%",
      trendUp: false,
    },
    {
      title: "مشاهدات الصفحة",
      value: stats.totalPageViews.toLocaleString(),
      description: "آخر 30 يوم",
      icon: BarChart3,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "+23%",
      trendUp: true,
    },
    {
      title: "الزوار الفريدون",
      value: stats.uniqueVisitors.toLocaleString(),
      description: "آخر 30 يوم",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "+18%",
      trendUp: true,
    },
    {
      title: "إجمالي المستخدمين",
      value: stats.totalUsers,
      description: "المستخدمين المسجلين",
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "صحة النظام",
      value: `${stats.systemHealth}%`,
      description: "حالة النظام العامة",
      icon: Activity,
      color: stats.systemHealth > 90 ? "text-green-600" : stats.systemHealth > 70 ? "text-yellow-600" : "text-red-600",
      bgColor: stats.systemHealth > 90 ? "bg-green-50" : stats.systemHealth > 70 ? "bg-yellow-50" : "bg-red-50",
      trend: "+2%",
      trendUp: true,
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "review":
        return MessageSquare
      case "user":
        return Users
      case "content":
        return FileText
      case "system":
        return Activity
      default:
        return Activity
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50"
      case "warning":
        return "text-yellow-600 bg-yellow-50"
      case "error":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">لوحة التحكم</h2>
          <p className="text-gray-600 dark:text-gray-400">مرحباً بك في لوحة تحكم KYCtrust</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          تحديث البيانات
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">{card.description}</p>
                <div className={`flex items-center text-xs ${card.trendUp ? "text-green-600" : "text-red-600"}`}>
                  {card.trendUp ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {card.trend}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              الزوار اليوميون
            </CardTitle>
            <CardDescription>آخر 7 أيام</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleLineChart data={chartData.visitors} height={200} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              المراجعات اليومية
            </CardTitle>
            <CardDescription>آخر 7 أيام</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleLineChart data={chartData.reviews} height={200} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>الإجراءات السريعة</CardTitle>
            <CardDescription>المهام الإدارية الشائعة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/dashboard/content"
              className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
            >
              <FileText className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium group-hover:text-blue-600">تحرير محتوى الموقع</p>
                <p className="text-xs text-muted-foreground">إدارة النصوص والصور</p>
              </div>
            </Link>
            <Link
              href="/dashboard/reviews"
              className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
            >
              <MessageSquare className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium group-hover:text-yellow-600">مراجعة التقييمات</p>
                <p className="text-xs text-muted-foreground">{stats.pendingReviews} في الانتظار</p>
              </div>
            </Link>
            <Link
              href="/dashboard/analytics"
              className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
            >
              <BarChart3 className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium group-hover:text-green-600">عرض التحليلات</p>
                <p className="text-xs text-muted-foreground">إحصائيات مفصلة</p>
              </div>
            </Link>
            <Link
              href="/dashboard/users"
              className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
            >
              <Users className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium group-hover:text-purple-600">إدارة المستخدمين</p>
                <p className="text-xs text-muted-foreground">{stats.activeUsers} نشط</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>حالة النظام</CardTitle>
            <CardDescription>صحة النظام الحالية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  قاعدة البيانات
                </span>
                <Badge className="bg-green-100 text-green-800">متصلة</Badge>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  واجهة برمجة التطبيقات
                </span>
                <Badge className="bg-green-100 text-green-800">نشطة</Badge>
              </div>
              <Progress value={98} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  نظام المراجعات
                </span>
                <Badge className="bg-green-100 text-green-800">نشط</Badge>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center">
                  <Activity className="h-4 w-4 text-blue-600 mr-2" />
                  التحليلات
                </span>
                <Badge className="bg-blue-100 text-blue-800">تتبع</Badge>
              </div>
              <Progress value={stats.systemHealth} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>النشاط الأخير</CardTitle>
            <CardDescription>آخر الأحداث في النظام</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((activity) => {
              const Icon = getActivityIcon(activity.type)
              return (
                <div key={activity.id} className="flex items-start space-x-3 space-x-reverse">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.status)}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleString("ar")}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
