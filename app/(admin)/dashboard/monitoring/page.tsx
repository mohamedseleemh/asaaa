"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RealTimeMonitor } from "@/components/dashboard/real-time-monitor"
import { AdvancedAnalytics } from "@/components/dashboard/advanced-analytics"

export default function MonitoringPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">المراقبة والتحليلات</h1>
        <p className="text-muted-foreground">مراقبة شاملة لأداء النظام والتحليلات المتقدمة</p>
      </div>

      <Tabs defaultValue="realtime" className="space-y-4">
        <TabsList>
          <TabsTrigger value="realtime">المراقبة المباشرة</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات المتقدمة</TabsTrigger>
        </TabsList>

        <TabsContent value="realtime">
          <RealTimeMonitor />
        </TabsContent>

        <TabsContent value="analytics">
          <AdvancedAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  )
}
