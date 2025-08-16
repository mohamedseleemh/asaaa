"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useCMS } from "@/lib/store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  SiteForm,
  HeroForm,
  ServicesForm,
  PaymentsForm,
  FAQForm,
  LogosForm,
  TestimonialsForm,
  CTAForm,
  ContactForm,
} from "@/components/editor/forms"
import { VisualEditor } from "@/components/editor/visual-editor"
import { SectionList } from "@/components/editor/section-list"
import { DesignForm } from "@/components/editor/design-form"
import Link from "next/link"
import {
  Upload,
  Download,
  Save,
  Clock,
  History,
  Eye,
  Globe,
  Calendar,
  FileText,
  Settings,
  Palette,
  Layout,
  RefreshCw,
} from "lucide-react"
import { notifyPublished } from "@/lib/realtime"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ContentVersion {
  id: string
  version: number
  title: string
  created_at: string
  created_by: string
  content: any
  published: boolean
}

interface ScheduledContent {
  id: string
  title: string
  scheduled_date: string
  status: "pending" | "published" | "failed"
  content: any
}

export default function ContentManagerPage() {
  const { toast } = useToast()
  const cms = useCMS()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [versions, setVersions] = useState<ContentVersion[]>([])
  const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>([])
  const [showVersionDialog, setShowVersionDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    description: "",
    scheduled_date: "",
    scheduled_time: "",
  })

  const fetchContentData = useCallback(async () => {
    try {
      const [contentRes, versionsRes, scheduledRes] = await Promise.all([
        fetch("/api/content/published", { cache: "no-store" }),
        fetch("/api/content/versions").catch(() => ({ json: () => [] })),
        fetch("/api/content/scheduled").catch(() => ({ json: () => [] })),
      ])

      const [content, versionsData, scheduledData] = await Promise.all([
        contentRes.json(),
        versionsRes.json(),
        scheduledRes.json(),
      ])

      if (content && content.ar && content.en) {
        cms.setContent("ar", content.ar)
        cms.setContent("en", content.en)
        if (content.design) cms.setDesign(content.design)
      }

      setVersions(Array.isArray(versionsData) ? versionsData : [])
      setScheduledContent(Array.isArray(scheduledData) ? scheduledData : [])
    } catch (error) {
      console.error("Error fetching content data:", error)
    } finally {
      setLoading(false)
    }
  }, [cms])

  useEffect(() => {
    fetchContentData()
  }, [fetchContentData])

  const exportJSON = () => {
    const data = JSON.stringify({ ar: cms.content.ar, en: cms.content.en, design: cms.design }, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `kyctrust-content-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImport = async (file: File) => {
    try {
      const text = await file.text()
      const j = JSON.parse(text)
      if (!j.ar || !j.en) throw new Error("Missing ar/en content")
      cms.setContent("ar", j.ar)
      cms.setContent("en", j.en)
      if (j.design) cms.setDesign(j.design)
      toast({ title: "تم الاستيراد", description: "تم استيراد المحتوى بنجاح إلى المحرر" })
    } catch (e: any) {
      toast({ title: "خطأ في الاستيراد", description: e?.message || "لا يمكن تحليل الملف", variant: "destructive" })
    }
  }

  const saveVersion = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/content/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Version ${versions.length + 1}`,
          content: { ar: cms.content.ar, en: cms.content.en, design: cms.design },
        }),
      })

      if (response.ok) {
        await fetchContentData()
        toast({ title: "تم الحفظ", description: "تم حفظ إصدار جديد من المحتوى" })
      }
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في حفظ الإصدار", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const restoreVersion = async (version: ContentVersion) => {
    try {
      cms.setContent("ar", version.content.ar)
      cms.setContent("en", version.content.en)
      if (version.content.design) cms.setDesign(version.content.design)
      setShowVersionDialog(false)
      toast({ title: "تم الاستعادة", description: `تم استعادة الإصدار ${version.version}` })
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في استعادة الإصدار", variant: "destructive" })
    }
  }

  const scheduleContent = async () => {
    if (!scheduleForm.title || !scheduleForm.scheduled_date || !scheduleForm.scheduled_time) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const scheduledDateTime = new Date(`${scheduleForm.scheduled_date}T${scheduleForm.scheduled_time}`)

      const response = await fetch("/api/content/scheduled", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: scheduleForm.title,
          description: scheduleForm.description,
          scheduled_date: scheduledDateTime.toISOString(),
          content: { ar: cms.content.ar, en: cms.content.en, design: cms.design },
        }),
      })

      if (response.ok) {
        await fetchContentData()
        setShowScheduleDialog(false)
        setScheduleForm({ title: "", description: "", scheduled_date: "", scheduled_time: "" })
        toast({ title: "تم الجدولة", description: "تم جدولة المحتوى للنشر" })
      }
    } catch (error) {
      toast({ title: "خطأ في الجدولة", description: "فشل في جدولة المحتوى", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const publish = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/content/published", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ar: cms.content.ar, en: cms.content.en, design: cms.design }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "فشل في النشر")
      }

      await Promise.all([
        fetch("/api/content/snapshots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: "ar", content: cms.content.ar }),
        }).catch(() => {}),
        fetch("/api/content/snapshots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: "en", content: cms.content.en }),
        }).catch(() => {}),
      ])

      notifyPublished()
      await fetchContentData()
      toast({ title: "تم النشر", description: "تم نشر المحتوى وإرساله للموقع المباشر" })
    } catch (e: any) {
      toast({ title: "خطأ في النشر", description: e?.message || "لا يمكن نشر المحتوى", variant: "destructive" })
    } finally {
      setSaving(false)
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
          <h2 className="text-2xl font-bold">إدارة المحتوى</h2>
          <p className="text-muted-foreground">تحرير وإدارة محتوى الموقع الإلكتروني</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {cms.locale === "ar" ? "العربية" : "English"}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => cms.setLocale(cms.locale === "ar" ? "en" : "ar")}>
            {cms.locale === "ar" ? "EN" : "AR"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              أدوات المحتوى
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">آخر تحديث: {new Date().toLocaleDateString("ar")}</span>
              <Button variant="outline" size="sm" onClick={fetchContentData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            <Button variant="outline" onClick={exportJSON} className="flex items-center gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              تصدير JSON
            </Button>

            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}
            />
            <Button variant="outline" onClick={() => fileRef.current?.click()} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              استيراد JSON
            </Button>

            <Button
              variant="outline"
              onClick={saveVersion}
              disabled={saving}
              className="flex items-center gap-2 bg-transparent"
            >
              <History className="h-4 w-4" />
              حفظ إصدار
            </Button>

            <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Clock className="h-4 w-4" />
                  الإصدارات ({versions.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>إصدارات المحتوى</DialogTitle>
                  <DialogDescription>استعادة إصدار سابق من المحتوى</DialogDescription>
                </DialogHeader>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {versions.map((version) => (
                    <div key={version.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{version.title}</p>
                        <p className="text-sm text-muted-foreground">
                          الإصدار {version.version} • {new Date(version.created_at).toLocaleDateString("ar")} •{" "}
                          {version.created_by}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {version.published && <Badge className="bg-green-100 text-green-800">منشور</Badge>}
                        <Button size="sm" onClick={() => restoreVersion(version)}>
                          استعادة
                        </Button>
                      </div>
                    </div>
                  ))}
                  {versions.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">لا توجد إصدارات محفوظة</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Calendar className="h-4 w-4" />
                  جدولة النشر
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>جدولة المحتوى للنشر</DialogTitle>
                  <DialogDescription>تحديد موعد نشر المحتوى تلقائياً</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="schedule-title">عنوان الجدولة</Label>
                    <Input
                      id="schedule-title"
                      value={scheduleForm.title}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                      placeholder="تحديث المحتوى الأسبوعي"
                    />
                  </div>
                  <div>
                    <Label htmlFor="schedule-description">وصف (اختياري)</Label>
                    <Textarea
                      id="schedule-description"
                      value={scheduleForm.description}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                      placeholder="وصف التحديث..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="schedule-date">التاريخ</Label>
                      <Input
                        id="schedule-date"
                        type="date"
                        value={scheduleForm.scheduled_date}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="schedule-time">الوقت</Label>
                      <Input
                        id="schedule-time"
                        type="time"
                        value={scheduleForm.scheduled_time}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_time: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={scheduleContent} disabled={saving}>
                    {saving ? "جاري الحفظ..." : "جدولة"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Link
              href="/dashboard/content/json"
              className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm hover:bg-accent"
            >
              <Settings className="h-4 w-4 mr-2" />
              محرر JSON
            </Link>

            <Button onClick={publish} disabled={saving} className="flex items-center gap-2">
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "جاري النشر..." : "نشر"}
            </Button>
          </div>

          {scheduledContent.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                المحتوى المجدول ({scheduledContent.length})
              </h4>
              <div className="space-y-2">
                {scheduledContent.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span>{item.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          item.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : item.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {item.status === "pending" ? "في الانتظار" : item.status === "published" ? "منشور" : "فشل"}
                      </Badge>
                      <span className="text-muted-foreground">
                        {new Date(item.scheduled_date).toLocaleDateString("ar")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="forms" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forms" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            النماذج
          </TabsTrigger>
          <TabsTrigger value="visual" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            المحرر المرئي
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            ترتيب الأقسام
          </TabsTrigger>
          <TabsTrigger value="design" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            التصميم
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forms" className="space-y-4">
          <Tabs defaultValue="site" className="space-y-4">
            <TabsList className="flex w-full flex-wrap justify-start">
              <TabsTrigger value="site">الموقع</TabsTrigger>
              <TabsTrigger value="hero">البطل</TabsTrigger>
              <TabsTrigger value="services">الخدمات</TabsTrigger>
              <TabsTrigger value="payments">الدفع</TabsTrigger>
              <TabsTrigger value="faq">الأسئلة الشائعة</TabsTrigger>
              <TabsTrigger value="logos">الشعارات</TabsTrigger>
              <TabsTrigger value="testimonials">الشهادات</TabsTrigger>
              <TabsTrigger value="cta">دعوة للعمل</TabsTrigger>
              <TabsTrigger value="contact">التواصل</TabsTrigger>
            </TabsList>

            <TabsContent value="site">
              <Card>
                <CardContent className="p-4">
                  <SiteForm locale={cms.locale} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="hero">
              <Card>
                <CardContent className="p-4">
                  <HeroForm locale={cms.locale} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="services">
              <Card>
                <CardContent className="p-4">
                  <ServicesForm locale={cms.locale} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="payments">
              <Card>
                <CardContent className="p-4">
                  <PaymentsForm locale={cms.locale} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="faq">
              <Card>
                <CardContent className="p-4">
                  <FAQForm locale={cms.locale} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="logos">
              <Card>
                <CardContent className="p-4">
                  <LogosForm locale={cms.locale} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="testimonials">
              <Card>
                <CardContent className="p-4">
                  <TestimonialsForm locale={cms.locale} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="cta">
              <Card>
                <CardContent className="p-4">
                  <CTAForm locale={cms.locale} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="contact">
              <Card>
                <CardContent className="p-4">
                  <ContactForm locale={cms.locale} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="visual">
          <Card>
            <CardContent className="p-4">
              <VisualEditor />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout">
          <Card>
            <CardHeader>
              <CardTitle>ترتيب أقسام الصفحة</CardTitle>
              <p className="text-sm text-muted-foreground">اسحب الأقسام لإعادة ترتيبها وتفعيل/إلغاء تفعيلها</p>
            </CardHeader>
            <CardContent>
              <SectionList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات التصميم</CardTitle>
              <p className="text-sm text-muted-foreground">تخصيص الألوان والحركات</p>
            </CardHeader>
            <CardContent>
              <DesignForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
