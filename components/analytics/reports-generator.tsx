"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ar } from "date-fns/locale"
import { Download, FileText, CalendarIcon, Clock, Mail, BarChart3, Users, Eye, Target } from "lucide-react"

interface ReportTemplate {
  id: string
  name: string
  description: string
  metrics: string[]
  frequency: string
  format: string
}

interface ScheduledReport {
  id: string
  name: string
  frequency: string
  nextRun: string
  status: "active" | "paused"
  recipients: string[]
}

export function ReportsGenerator() {
  const { toast } = useToast()
  const [reportName, setReportName] = useState("")
  const [reportDescription, setReportDescription] = useState("")
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [reportFormat, setReportFormat] = useState("pdf")
  const [frequency, setFrequency] = useState("once")
  const [recipients, setRecipients] = useState("")
  const [generating, setGenerating] = useState(false)

  const availableMetrics = [
    { id: "visitors", label: "الزوار", icon: Users },
    { id: "pageviews", label: "مشاهدات الصفحة", icon: Eye },
    { id: "bounce_rate", label: "معدل الارتداد", icon: Target },
    { id: "session_duration", label: "مدة الجلسة", icon: Clock },
    { id: "conversion_rate", label: "معدل التحويل", icon: BarChart3 },
    { id: "traffic_sources", label: "مصادر الزيارات", icon: BarChart3 },
    { id: "device_breakdown", label: "توزيع الأجهزة", icon: BarChart3 },
    { id: "geographic_data", label: "البيانات الجغرافية", icon: BarChart3 },
  ]

  const reportTemplates: ReportTemplate[] = [
    {
      id: "weekly_summary",
      name: "التقرير الأسبوعي",
      description: "ملخص أسبوعي شامل للأداء",
      metrics: ["visitors", "pageviews", "bounce_rate", "conversion_rate"],
      frequency: "weekly",
      format: "pdf",
    },
    {
      id: "monthly_detailed",
      name: "التقرير الشهري المفصل",
      description: "تقرير شهري مفصل مع جميع المقاييس",
      metrics: availableMetrics.map((m) => m.id),
      frequency: "monthly",
      format: "pdf",
    },
    {
      id: "performance_dashboard",
      name: "لوحة الأداء",
      description: "تقرير يومي للأداء الأساسي",
      metrics: ["visitors", "pageviews", "bounce_rate"],
      frequency: "daily",
      format: "csv",
    },
  ]

  const scheduledReports: ScheduledReport[] = [
    {
      id: "1",
      name: "التقرير الأسبوعي",
      frequency: "أسبوعي - الأحد",
      nextRun: "2024-01-21 09:00",
      status: "active",
      recipients: ["admin@kyctrust.com"],
    },
    {
      id: "2",
      name: "تقرير الأداء الشهري",
      frequency: "شهري - اليوم الأول",
      nextRun: "2024-02-01 08:00",
      status: "active",
      recipients: ["admin@kyctrust.com", "manager@kyctrust.com"],
    },
  ]

  const handleMetricToggle = (metricId: string) => {
    setSelectedMetrics((prev) => (prev.includes(metricId) ? prev.filter((id) => id !== metricId) : [...prev, metricId]))
  }

  const generateReport = async () => {
    if (!reportName || selectedMetrics.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال اسم التقرير واختيار مقياس واحد على الأقل",
        variant: "destructive",
      })
      return
    }

    setGenerating(true)
    try {
      const reportConfig = {
        name: reportName,
        description: reportDescription,
        metrics: selectedMetrics,
        dateRange,
        format: reportFormat,
        frequency,
        recipients: recipients
          .split(",")
          .map((email) => email.trim())
          .filter(Boolean),
      }

      const response = await fetch("/api/analytics/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportConfig),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${reportName.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.${reportFormat}`
        a.click()
        URL.revokeObjectURL(url)

        toast({
          title: "تم إنشاء التقرير",
          description: "تم إنشاء التقرير وتحميله بنجاح",
        })

        // إعادة تعيين النموذج
        setReportName("")
        setReportDescription("")
        setSelectedMetrics([])
        setDateRange({ from: undefined, to: undefined })
      } else {
        throw new Error("فشل في إنشاء التقرير")
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء التقرير",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  const useTemplate = (template: ReportTemplate) => {
    setReportName(template.name)
    setReportDescription(template.description)
    setSelectedMetrics(template.metrics)
    setReportFormat(template.format)
    setFrequency(template.frequency)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* منشئ التقارير */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                إنشاء تقرير مخصص
              </CardTitle>
              <CardDescription>قم بإنشاء تقرير مخصص حسب احتياجاتك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="report-name">اسم التقرير</Label>
                  <Input
                    id="report-name"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="تقرير الأداء الشهري"
                  />
                </div>
                <div>
                  <Label htmlFor="report-format">تنسيق التقرير</Label>
                  <Select value={reportFormat} onValueChange={setReportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xlsx">Excel</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="report-description">وصف التقرير</Label>
                <Textarea
                  id="report-description"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="وصف مختصر للتقرير..."
                  rows={3}
                />
              </div>

              <div>
                <Label>المقاييس المطلوبة</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableMetrics.map((metric) => (
                    <div key={metric.id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={metric.id}
                        checked={selectedMetrics.includes(metric.id)}
                        onCheckedChange={() => handleMetricToggle(metric.id)}
                      />
                      <Label htmlFor={metric.id} className="flex items-center gap-2 text-sm">
                        <metric.icon className="h-3 w-3" />
                        {metric.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>من تاريخ</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? format(dateRange.from, "PPP", { locale: ar }) : "اختر التاريخ"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>إلى تاريخ</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? format(dateRange.to, "PPP", { locale: ar }) : "اختر التاريخ"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency">التكرار</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">مرة واحدة</SelectItem>
                      <SelectItem value="daily">يومي</SelectItem>
                      <SelectItem value="weekly">أسبوعي</SelectItem>
                      <SelectItem value="monthly">شهري</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="recipients">المستلمون (اختياري)</Label>
                  <Input
                    id="recipients"
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                    placeholder="email1@example.com, email2@example.com"
                  />
                </div>
              </div>

              <Button onClick={generateReport} disabled={generating} className="w-full">
                {generating ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    جاري إنشاء التقرير...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    إنشاء التقرير
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* القوالب والتقارير المجدولة */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>قوالب التقارير</CardTitle>
              <CardDescription>قوالب جاهزة للاستخدام السريع</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportTemplates.map((template) => (
                  <div key={template.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <Button size="sm" variant="outline" onClick={() => useTemplate(template)}>
                        استخدام
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.metrics.slice(0, 3).map((metricId) => {
                        const metric = availableMetrics.find((m) => m.id === metricId)
                        return (
                          <Badge key={metricId} variant="outline" className="text-xs">
                            {metric?.label}
                          </Badge>
                        )
                      })}
                      {template.metrics.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.metrics.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                التقارير المجدولة
              </CardTitle>
              <CardDescription>التقارير التي يتم إرسالها تلقائياً</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduledReports.map((report) => (
                  <div key={report.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{report.name}</h4>
                      <Badge
                        className={
                          report.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }
                      >
                        {report.status === "active" ? "نشط" : "متوقف"}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {report.frequency}
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        التشغيل التالي: {report.nextRun}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {report.recipients.length} مستلم
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
