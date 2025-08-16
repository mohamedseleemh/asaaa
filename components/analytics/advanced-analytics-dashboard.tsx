"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Clock,
  Target,
  Globe,
  Smartphone,
  Monitor,
  MapPin,
  RefreshCw,
} from "lucide-react"

interface AnalyticsMetrics {
  totalVisitors: number
  uniqueVisitors: number
  pageViews: number
  bounceRate: number
  avgSessionDuration: number
  conversionRate: number
  newVsReturning: { new: number; returning: number }
  topCountries: { country: string; visitors: number; percentage: number }[]
  topCities: { city: string; visitors: number }[]
  browserStats: { browser: string; percentage: number; users: number }[]
  osStats: { os: string; percentage: number; users: number }[]
  hourlyTraffic: { hour: number; visitors: number }[]
  weeklyTraffic: { day: string; visitors: number }[]
  goalCompletions: { goal: string; completions: number; rate: number }[]
  revenueMetrics: { revenue: number; transactions: number; avgOrderValue: number }
}

interface GeographicData {
  country: string
  visitors: number
  sessions: number
  bounceRate: number
  avgSessionDuration: number
}

export function AdvancedAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null)
  const [geoData, setGeoData] = useState<GeographicData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")
  const [selectedMetric, setSelectedMetric] = useState("visitors")

  useEffect(() => {
    fetchAdvancedAnalytics()
  }, [timeRange])

  const fetchAdvancedAnalytics = async () => {
    setLoading(true)
    try {
      // محاكاة البيانات المتقدمة
      const simulatedMetrics: AnalyticsMetrics = {
        totalVisitors: 15420,
        uniqueVisitors: 12350,
        pageViews: 45680,
        bounceRate: 34.2,
        avgSessionDuration: 245,
        conversionRate: 3.8,
        newVsReturning: { new: 8500, returning: 6920 },
        topCountries: [
          { country: "السعودية", visitors: 4200, percentage: 27.2 },
          { country: "الإمارات", visitors: 3100, percentage: 20.1 },
          { country: "مصر", visitors: 2800, percentage: 18.2 },
          { country: "الكويت", visitors: 1900, percentage: 12.3 },
          { country: "قطر", visitors: 1500, percentage: 9.7 },
        ],
        topCities: [
          { city: "الرياض", visitors: 2100 },
          { city: "دبي", visitors: 1800 },
          { city: "القاهرة", visitors: 1600 },
          { city: "جدة", visitors: 1200 },
          { city: "الكويت", visitors: 900 },
        ],
        browserStats: [
          { browser: "Chrome", percentage: 65.4, users: 10100 },
          { browser: "Safari", percentage: 18.2, users: 2800 },
          { browser: "Firefox", percentage: 9.1, users: 1400 },
          { browser: "Edge", percentage: 7.3, users: 1120 },
        ],
        osStats: [
          { os: "Windows", percentage: 45.2, users: 6970 },
          { os: "iOS", percentage: 28.1, users: 4330 },
          { os: "Android", percentage: 20.3, users: 3130 },
          { os: "macOS", percentage: 6.4, users: 990 },
        ],
        hourlyTraffic: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          visitors: Math.floor(Math.random() * 800) + 200,
        })),
        weeklyTraffic: [
          { day: "الأحد", visitors: 2100 },
          { day: "الاثنين", visitors: 2800 },
          { day: "الثلاثاء", visitors: 2650 },
          { day: "الأربعاء", visitors: 2900 },
          { day: "الخميس", visitors: 2750 },
          { day: "الجمعة", visitors: 1900 },
          { day: "السبت", visitors: 1800 },
        ],
        goalCompletions: [
          { goal: "تسجيل الاشتراك", completions: 245, rate: 15.9 },
          { goal: "تحميل الكتالوج", completions: 189, rate: 12.3 },
          { goal: "طلب عرض سعر", completions: 156, rate: 10.1 },
          { goal: "الاتصال بنا", completions: 98, rate: 6.4 },
        ],
        revenueMetrics: {
          revenue: 125000,
          transactions: 342,
          avgOrderValue: 365.5,
        },
      }

      setMetrics(simulatedMetrics)

      const simulatedGeoData: GeographicData[] = [
        { country: "السعودية", visitors: 4200, sessions: 6800, bounceRate: 32.1, avgSessionDuration: 285 },
        { country: "الإمارات", visitors: 3100, sessions: 4900, bounceRate: 28.5, avgSessionDuration: 310 },
        { country: "مصر", visitors: 2800, sessions: 4200, bounceRate: 38.2, avgSessionDuration: 220 },
        { country: "الكويت", visitors: 1900, sessions: 2800, bounceRate: 30.8, avgSessionDuration: 265 },
        { country: "قطر", visitors: 1500, sessions: 2100, bounceRate: 25.4, avgSessionDuration: 340 },
      ]

      setGeoData(simulatedGeoData)
    } catch (error) {
      console.error("Error fetching advanced analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getChangeIndicator = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100
    const isPositive = change > 0

    return (
      <div className={`flex items-center text-xs ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        {Math.abs(change).toFixed(1)}%
      </div>
    )
  }

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* شريط التحكم العلوي */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">التحليلات المتقدمة</h3>
          <p className="text-sm text-muted-foreground">تحليل مفصل لسلوك المستخدمين والأداء</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">آخر 7 أيام</SelectItem>
              <SelectItem value="30d">آخر 30 يوم</SelectItem>
              <SelectItem value="90d">آخر 90 يوم</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchAdvancedAnalytics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* المقاييس الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الزوار</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalVisitors.toLocaleString()}</div>
            {getChangeIndicator(metrics.totalVisitors, 13200)}
            <div className="mt-2">
              <div className="text-xs text-muted-foreground mb-1">جدد مقابل عائدين</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(metrics.newVsReturning.new / metrics.totalVisitors) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs">
                  {((metrics.newVsReturning.new / metrics.totalVisitors) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مشاهدات الصفحة</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pageViews.toLocaleString()}</div>
            {getChangeIndicator(metrics.pageViews, 42100)}
            <div className="mt-2 text-xs text-muted-foreground">
              {(metrics.pageViews / metrics.totalVisitors).toFixed(1)} صفحة لكل جلسة
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الارتداد</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.bounceRate.toFixed(1)}%</div>
            {getChangeIndicator(metrics.bounceRate, 36.8)}
            <div className="mt-2">
              <Progress value={metrics.bounceRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط مدة الجلسة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(metrics.avgSessionDuration)}</div>
            {getChangeIndicator(metrics.avgSessionDuration, 220)}
            <div className="mt-2 text-xs text-muted-foreground">دقائق:ثواني</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="audience" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="audience">الجمهور</TabsTrigger>
          <TabsTrigger value="behavior">السلوك</TabsTrigger>
          <TabsTrigger value="technology">التقنية</TabsTrigger>
          <TabsTrigger value="geography">الجغرافيا</TabsTrigger>
          <TabsTrigger value="goals">الأهداف</TabsTrigger>
        </TabsList>

        <TabsContent value="audience" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>الزوار الجدد مقابل العائدين</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">زوار جدد</span>
                    <span className="text-sm text-muted-foreground">
                      {metrics.newVsReturning.new.toLocaleString()} (
                      {((metrics.newVsReturning.new / metrics.totalVisitors) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={(metrics.newVsReturning.new / metrics.totalVisitors) * 100} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">زوار عائدون</span>
                    <span className="text-sm text-muted-foreground">
                      {metrics.newVsReturning.returning.toLocaleString()} (
                      {((metrics.newVsReturning.returning / metrics.totalVisitors) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={(metrics.newVsReturning.returning / metrics.totalVisitors) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الزيارات حسب الوقت</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {metrics.hourlyTraffic
                    .filter((_, i) => i % 4 === 0)
                    .map((hour) => (
                      <div key={hour.hour} className="flex items-center justify-between">
                        <span className="text-sm">{hour.hour}:00</span>
                        <div className="flex items-center gap-2 flex-1 mx-4">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(hour.visitors / Math.max(...metrics.hourlyTraffic.map((h) => h.visitors))) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-12 text-right">{hour.visitors}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الزيارات الأسبوعية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.weeklyTraffic.map((day) => (
                  <div key={day.day} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{day.day}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${(day.visitors / Math.max(...metrics.weeklyTraffic.map((d) => d.visitors))) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">{day.visitors.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technology" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>المتصفحات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.browserStats.map((browser) => (
                    <div key={browser.browser} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{browser.browser}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${browser.percentage}%` }} />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">{browser.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أنظمة التشغيل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.osStats.map((os) => (
                    <div key={os.os} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{os.os}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${os.percentage}%` }} />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">{os.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  أهم البلدان
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {metrics.topCountries.map((country, index) => (
                      <div key={country.country} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <span className="font-medium">{country.country}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{country.visitors.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{country.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  أهم المدن
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.topCities.map((city, index) => (
                    <div key={city.city} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <span className="font-medium">{city.city}</span>
                      </div>
                      <span className="font-medium">{city.visitors.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  إنجاز الأهداف
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.goalCompletions.map((goal) => (
                    <div key={goal.goal} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{goal.goal}</span>
                        <span className="text-sm text-muted-foreground">
                          {goal.completions} ({goal.rate}%)
                        </span>
                      </div>
                      <Progress value={goal.rate} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>مقاييس الإيرادات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ${metrics.revenueMetrics.revenue.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">إجمالي الإيرادات</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-semibold">{metrics.revenueMetrics.transactions}</div>
                      <div className="text-xs text-muted-foreground">المعاملات</div>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-lg font-semibold">${metrics.revenueMetrics.avgOrderValue.toFixed(0)}</div>
                      <div className="text-xs text-muted-foreground">متوسط قيمة الطلب</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
