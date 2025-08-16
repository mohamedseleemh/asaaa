"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, MessageSquare, BarChart3, Settings, Zap, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

interface AIInsight {
  type: "performance" | "content" | "user" | "security"
  title: string
  description: string
  priority: "high" | "medium" | "low"
  action?: string
}

interface AIRecommendation {
  id: string
  category: string
  title: string
  description: string
  impact: "high" | "medium" | "low"
  effort: "low" | "medium" | "high"
  automated: boolean
}

export function SmartAdminAssistant() {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState("")

  useEffect(() => {
    fetchInsights()
    fetchRecommendations()
  }, [])

  const fetchInsights = async () => {
    try {
      const response = await fetch("/api/ai/insights")
      const data = await response.json()
      setInsights(data.insights || [])
    } catch (error) {
      console.error("Failed to fetch AI insights:", error)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const response = await fetch("/api/ai/recommendations")
      const data = await response.json()
      setRecommendations(data.recommendations || [])
    } catch (error) {
      console.error("Failed to fetch recommendations:", error)
    }
  }

  const handleQuery = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/ai/admin-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })
      const data = await response.json()
      setAiResponse(data.response || "عذراً، لم أتمكن من معالجة طلبك.")
    } catch (error) {
      setAiResponse("حدث خطأ أثناء معالجة طلبك.")
    } finally {
      setLoading(false)
    }
  }

  const executeRecommendation = async (id: string) => {
    try {
      const response = await fetch("/api/ai/execute-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendationId: id }),
      })
      const data = await response.json()
      if (data.success) {
        fetchRecommendations() // Refresh recommendations
      }
    } catch (error) {
      console.error("Failed to execute recommendation:", error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 space-x-reverse">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">المساعد الذكي للإدارة</h2>
          <p className="text-muted-foreground">تحليلات وتوصيات مدعومة بالذكاء الاصطناعي</p>
        </div>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">الرؤى الذكية</TabsTrigger>
          <TabsTrigger value="recommendations">التوصيات</TabsTrigger>
          <TabsTrigger value="assistant">المساعد</TabsTrigger>
          <TabsTrigger value="automation">الأتمتة</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <BarChart3 className="w-4 h-4 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                      </div>
                      <Badge variant={getPriorityColor(insight.priority) as any}>
                        {insight.priority === "high" ? "عالي" : insight.priority === "medium" ? "متوسط" : "منخفض"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-3">{insight.description}</p>
                    {insight.action && (
                      <Button variant="outline" size="sm">
                        {insight.action}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{rec.title}</CardTitle>
                        <CardDescription>{rec.category}</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Badge variant="outline" className={getImpactColor(rec.impact)}>
                          تأثير {rec.impact === "high" ? "عالي" : rec.impact === "medium" ? "متوسط" : "منخفض"}
                        </Badge>
                        {rec.automated && (
                          <Badge className="bg-green-100 text-green-800">
                            <Zap className="w-3 h-3 mr-1" />
                            تلقائي
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{rec.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        الجهد المطلوب: {rec.effort === "low" ? "قليل" : rec.effort === "medium" ? "متوسط" : "كبير"}
                      </div>
                      <Button
                        onClick={() => executeRecommendation(rec.id)}
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        {rec.automated ? "تنفيذ تلقائي" : "تطبيق"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assistant" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                اسأل المساعد الذكي
              </CardTitle>
              <CardDescription>احصل على إجابات ذكية حول إدارة موقعك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2 space-x-reverse">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="مثال: كيف يمكنني تحسين معدل التحويل؟"
                  onKeyPress={(e) => e.key === "Enter" && handleQuery()}
                />
                <Button onClick={handleQuery} disabled={loading}>
                  {loading ? "جاري التحليل..." : "اسأل"}
                </Button>
              </div>

              {aiResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border"
                >
                  <div className="flex items-start space-x-3 space-x-reverse">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">المساعد الذكي</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{aiResponse}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  المهام التلقائية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">تنظيف البيانات القديمة</span>
                  <Badge className="bg-green-100 text-green-800">نشط</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">تحديث التحليلات</span>
                  <Badge className="bg-green-100 text-green-800">نشط</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">النسخ الاحتياطي</span>
                  <Badge className="bg-green-100 text-green-800">نشط</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  التحسين التلقائي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">تحسين الصور</span>
                  <Badge variant="outline">متاح</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">ضغط المحتوى</span>
                  <Badge variant="outline">متاح</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">تحسين SEO</span>
                  <Badge variant="outline">متاح</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
