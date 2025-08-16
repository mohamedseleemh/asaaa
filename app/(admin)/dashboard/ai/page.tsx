"use client"

import { SmartAdminAssistant } from "@/components/ai/smart-admin-assistant"
import { SentimentAnalyzer } from "@/components/ai/sentiment-analyzer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AIPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الذكاء الاصطناعي والأتمتة</h1>
        <p className="text-muted-foreground">أدوات ذكية لتحسين إدارة موقعك</p>
      </div>

      <Tabs defaultValue="assistant" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assistant">المساعد الذكي</TabsTrigger>
          <TabsTrigger value="sentiment">تحليل المشاعر</TabsTrigger>
        </TabsList>

        <TabsContent value="assistant">
          <SmartAdminAssistant />
        </TabsContent>

        <TabsContent value="sentiment">
          <SentimentAnalyzer />
        </TabsContent>
      </Tabs>
    </div>
  )
}
