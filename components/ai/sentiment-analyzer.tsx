"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Smile, Meh, Frown, TrendingUp, TrendingDown } from "lucide-react"

interface SentimentData {
  positive: number
  neutral: number
  negative: number
  totalReviews: number
  trend: "up" | "down" | "stable"
  keywords: { word: string; sentiment: "positive" | "negative"; count: number }[]
}

export function SentimentAnalyzer() {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSentimentData()
  }, [])

  const fetchSentimentData = async () => {
    try {
      const response = await fetch("/api/ai/sentiment-analysis")
      const data = await response.json()
      setSentimentData(data)
    } catch (error) {
      console.error("Failed to fetch sentiment data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>تحليل المشاعر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!sentimentData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>تحليل المشاعر</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">لا توجد بيانات متاحة</p>
        </CardContent>
      </Card>
    )
  }

  const getSentimentIcon = (type: "positive" | "neutral" | "negative") => {
    switch (type) {
      case "positive":
        return <Smile className="w-5 h-5 text-green-600" />
      case "neutral":
        return <Meh className="w-5 h-5 text-yellow-600" />
      case "negative":
        return <Frown className="w-5 h-5 text-red-600" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <div className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>تحليل مشاعر العملاء</CardTitle>
              <CardDescription>تحليل ذكي لآراء ومشاعر العملاء</CardDescription>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              {getTrendIcon(sentimentData.trend)}
              <span className="text-sm text-muted-foreground">{sentimentData.totalReviews} مراجعة</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* نظرة عامة على المشاعر */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center justify-center mb-2">{getSentimentIcon("positive")}</div>
              <div className="text-2xl font-bold text-green-600">{sentimentData.positive}%</div>
              <div className="text-sm text-muted-foreground">إيجابي</div>
            </div>

            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center justify-center mb-2">{getSentimentIcon("neutral")}</div>
              <div className="text-2xl font-bold text-yellow-600">{sentimentData.neutral}%</div>
              <div className="text-sm text-muted-foreground">محايد</div>
            </div>

            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center justify-center mb-2">{getSentimentIcon("negative")}</div>
              <div className="text-2xl font-bold text-red-600">{sentimentData.negative}%</div>
              <div className="text-sm text-muted-foreground">سلبي</div>
            </div>
          </div>

          {/* شريط التقدم الإجمالي */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>التوزيع الإجمالي للمشاعر</span>
              <span>{sentimentData.positive + sentimentData.neutral + sentimentData.negative}%</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden">
              <div className="bg-green-500" style={{ width: `${sentimentData.positive}%` }} />
              <div className="bg-yellow-500" style={{ width: `${sentimentData.neutral}%` }} />
              <div className="bg-red-500" style={{ width: `${sentimentData.negative}%` }} />
            </div>
          </div>

          {/* الكلمات المفتاحية */}
          <div>
            <h4 className="font-semibold mb-3">الكلمات المفتاحية الأكثر تكراراً</h4>
            <div className="flex flex-wrap gap-2">
              {sentimentData.keywords.map((keyword, index) => (
                <Badge
                  key={index}
                  variant={keyword.sentiment === "positive" ? "default" : "destructive"}
                  className={
                    keyword.sentiment === "positive"
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                  }
                >
                  {keyword.word} ({keyword.count})
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
