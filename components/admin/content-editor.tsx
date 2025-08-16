"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { useCMS } from "@/lib/store"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  Save,
  Copy,
  ImageIcon,
  FileText,
  Globe,
  Palette,
  Settings,
  Upload,
  Download,
  History,
  BookIcon as Publish,
} from "lucide-react"

interface ContentBlock {
  id: string
  type: string
  title: string
  content: any
  enabled: boolean
  order: number
}

interface ContentEditorProps {
  blockId?: string
  blockType?: string
}

export function ContentEditor({ blockId, blockType }: ContentEditorProps) {
  const cms = useCMS()
  const [activeTab, setActiveTab] = useState("content")
  const [previewMode, setPreviewMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          locale: cms.locale,
          content: cms.content[cms.locale],
          design: cms.design,
          blocks: cms.blocks,
        }),
      })

      if (response.ok) {
        toast.success("تم حفظ المحتوى بنجاح")
      } else {
        throw new Error("فشل في الحفظ")
      }
    } catch (error) {
      toast.error("فشل في حفظ المحتوى")
    } finally {
      setSaving(false)
    }
  }, [cms])

  const handlePublish = useCallback(async () => {
    setPublishing(true)
    try {
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "publish",
          content: {
            locale: cms.locale,
            content: cms.content[cms.locale],
            design: cms.design,
            blocks: cms.blocks,
          },
        }),
      })

      if (response.ok) {
        toast.success("تم نشر المحتوى بنجاح")
      } else {
        throw new Error("فشل في النشر")
      }
    } catch (error) {
      toast.error("فشل في نشر المحتوى")
    } finally {
      setPublishing(false)
    }
  }, [cms])

  const duplicateContent = useCallback(() => {
    const sourceLocale = cms.locale === "ar" ? "en" : "ar"
    const targetLocale = cms.locale

    cms.setContent(targetLocale, cms.content[sourceLocale])
    toast.success(`تم نسخ المحتوى من ${sourceLocale === "ar" ? "العربية" : "الإنجليزية"}`)
  }, [cms])

  const exportContent = useCallback(() => {
    const dataStr = JSON.stringify(
      {
        content: cms.content,
        design: cms.design,
        blocks: cms.blocks,
      },
      null,
      2,
    )

    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `content-backup-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)

    toast.success("تم تصدير المحتوى بنجاح")
  }, [cms])

  return (
    <div className="space-y-6">
      {/* شريط الأدوات العلوي */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                محرر المحتوى المتقدم
              </CardTitle>
              <CardDescription>تحرير وإدارة محتوى الموقع مع معاينة مباشرة</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {cms.locale === "ar" ? "العربية" : "English"}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => cms.setLocale(cms.locale === "ar" ? "en" : "ar")}>
                {cms.locale === "ar" ? "EN" : "AR"}
              </Button>
              <Button variant="outline" size="sm" onClick={duplicateContent}>
                <Copy className="h-4 w-4 mr-1" />
                نسخ من اللغة الأخرى
              </Button>
              <Button variant="outline" size="sm" onClick={exportContent}>
                <Download className="h-4 w-4 mr-1" />
                تصدير
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
                <Eye className="h-4 w-4 mr-1" />
                {previewMode ? "تحرير" : "معاينة"}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-1" />
                {saving ? "جاري الحفظ..." : "حفظ"}
              </Button>
              <Button onClick={handlePublish} disabled={publishing} className="bg-green-600 hover:bg-green-700">
                <Publish className="h-4 w-4 mr-1" />
                {publishing ? "جاري النشر..." : "نشر"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* المحرر الرئيسي */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* الشريط الجانبي للأقسام */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">أقسام الصفحة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {cms.blocks.map((block) => (
              <div
                key={block.id}
                className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                  blockId === block.id ? "bg-primary/10 border-primary" : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Switch checked={block.enabled} onCheckedChange={() => cms.toggleBlock(block.id)} size="sm" />
                  <span className="text-sm font-medium">{block.name}</span>
                </div>
                <Button variant="ghost" size="sm">
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* منطقة التحرير الرئيسية */}
        <Card className="lg:col-span-3">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b px-6 py-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="content">المحتوى</TabsTrigger>
                  <TabsTrigger value="design">التصميم</TabsTrigger>
                  <TabsTrigger value="media">الوسائط</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="history">التاريخ</TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="content" className="space-y-4">
                  <ContentFormRenderer blockType={blockType} />
                </TabsContent>

                <TabsContent value="design" className="space-y-4">
                  <DesignCustomizer />
                </TabsContent>

                <TabsContent value="media" className="space-y-4">
                  <MediaManager />
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
                  <SEOSettings />
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  <ContentHistory />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ContentFormRenderer({ blockType }: { blockType?: string }) {
  const cms = useCMS()

  if (!blockType) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">اختر قسماً من الشريط الجانبي للبدء في التحرير</p>
      </div>
    )
  }

  switch (blockType) {
    case "hero":
      return <HeroContentForm />
    case "services":
      return <ServicesContentForm />
    case "about":
      return <AboutContentForm />
    case "contact":
      return <ContactContentForm />
    case "faq":
      return <FAQContentForm />
    case "testimonials":
      return <TestimonialsContentForm />
    default:
      return <div>نموذج غير متوفر لهذا القسم</div>
  }
}

function HeroContentForm() {
  const cms = useCMS()
  const content = cms.content[cms.locale].hero

  const updateHero = (updates: Partial<typeof content>) => {
    cms.setContent(cms.locale, { hero: { ...content, ...updates } })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="hero-title">العنوان الرئيسي</Label>
        <Input
          id="hero-title"
          value={content.title}
          onChange={(e) => updateHero({ title: e.target.value })}
          placeholder="عنوان جذاب للصفحة الرئيسية"
        />
      </div>

      <div>
        <Label htmlFor="hero-subtitle">العنوان الفرعي</Label>
        <Input
          id="hero-subtitle"
          value={content.subtitle}
          onChange={(e) => updateHero({ subtitle: e.target.value })}
          placeholder="وصف مختصر للخدمة"
        />
      </div>

      <div>
        <Label htmlFor="hero-description">الوصف</Label>
        <Textarea
          id="hero-description"
          value={content.description}
          onChange={(e) => updateHero({ description: e.target.value })}
          placeholder="وصف تفصيلي للخدمات المقدمة"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="hero-cta">زر الإجراء الرئيسي</Label>
          <Input
            id="hero-cta"
            value={content.cta}
            onChange={(e) => updateHero({ cta: e.target.value })}
            placeholder="ابدأ الآن"
          />
        </div>

        <div>
          <Label htmlFor="hero-whatsapp">زر واتساب</Label>
          <Input
            id="hero-whatsapp"
            value={content.whatsapp}
            onChange={(e) => updateHero({ whatsapp: e.target.value })}
            placeholder="تواصل عبر واتساب"
          />
        </div>
      </div>
    </div>
  )
}

function ServicesContentForm() {
  const cms = useCMS()
  const services = cms.content[cms.locale].services
  const [editingService, setEditingService] = useState<number | null>(null)

  const addService = () => {
    const newService = {
      id: Date.now().toString(),
      title: "خدمة جديدة",
      description: "وصف الخدمة",
      icon: "service",
      price: "من $50",
      features: ["ميزة 1", "ميزة 2", "ميزة 3"],
    }
    cms.addService(cms.locale, newService)
    toast.success("تم إضافة خدمة جديدة")
  }

  const updateService = (index: number, updates: any) => {
    cms.updateService(cms.locale, index, updates)
  }

  const removeService = (index: number) => {
    cms.removeService(cms.locale, index)
    toast.success("تم حذف الخدمة")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">إدارة الخدمات</h3>
        <Button onClick={addService} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          إضافة خدمة
        </Button>
      </div>

      <div className="space-y-3">
        {services.map((service, index) => (
          <Card key={service.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">{service.title}</h4>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingService(editingService === index ? null : index)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => removeService(index)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {editingService === index && (
              <div className="space-y-3 border-t pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>عنوان الخدمة</Label>
                    <Input value={service.title} onChange={(e) => updateService(index, { title: e.target.value })} />
                  </div>
                  <div>
                    <Label>السعر</Label>
                    <Input value={service.price} onChange={(e) => updateService(index, { price: e.target.value })} />
                  </div>
                </div>

                <div>
                  <Label>وصف الخدمة</Label>
                  <Textarea
                    value={service.description}
                    onChange={(e) => updateService(index, { description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>المميزات (مفصولة بفاصلة)</Label>
                  <Input
                    value={service.features?.join(", ") || ""}
                    onChange={(e) =>
                      updateService(index, {
                        features: e.target.value.split(",").map((f) => f.trim()),
                      })
                    }
                    placeholder="ميزة 1, ميزة 2, ميزة 3"
                  />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

function AboutContentForm() {
  return <div>نموذج تحرير قسم من نحن</div>
}

function ContactContentForm() {
  return <div>نموذج تحرير قسم التواصل</div>
}

function FAQContentForm() {
  return <div>نموذج تحرير الأسئلة الشائعة</div>
}

function TestimonialsContentForm() {
  return <div>نموذج تحرير الشهادات</div>
}

function DesignCustomizer() {
  const cms = useCMS()

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <Palette className="h-5 w-5" />
        تخصيص التصميم
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>اللون الأساسي</Label>
          <Input
            type="color"
            value={cms.design.primaryColor}
            onChange={(e) => cms.setDesign({ primaryColor: e.target.value })}
          />
        </div>

        <div>
          <Label>اللون الثانوي</Label>
          <Input
            type="color"
            value={cms.design.secondaryColor}
            onChange={(e) => cms.setDesign({ secondaryColor: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label>نمط الألوان</Label>
        <Select value={cms.design.palette} onValueChange={(value) => cms.setDesign({ palette: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="blue">أزرق</SelectItem>
            <SelectItem value="green">أخضر</SelectItem>
            <SelectItem value="purple">بنفسجي</SelectItem>
            <SelectItem value="orange">برتقالي</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function MediaManager() {
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setUploading(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append("files", file)
      })

      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast.success("تم رفع الملفات بنجاح")
      } else {
        throw new Error("فشل في رفع الملفات")
      }
    } catch (error) {
      toast.error("فشل في رفع الملفات")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <ImageIcon className="h-5 w-5" />
        إدارة الوسائط
      </h3>

      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-4">اسحب الملفات هنا أو انقر للتحميل</p>
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" disabled={uploading}>
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "جاري الرفع..." : "تحميل ملفات"}
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </Button>
        </div>
      </div>
    </div>
  )
}

function SEOSettings() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <Settings className="h-5 w-5" />
        إعدادات SEO
      </h3>

      <div className="space-y-4">
        <div>
          <Label>عنوان الصفحة</Label>
          <Input placeholder="عنوان الصفحة في محركات البحث" />
        </div>

        <div>
          <Label>وصف الصفحة</Label>
          <Textarea placeholder="وصف الصفحة في محركات البحث" rows={3} />
        </div>

        <div>
          <Label>الكلمات المفتاحية</Label>
          <Input placeholder="كلمة1, كلمة2, كلمة3" />
        </div>
      </div>
    </div>
  )
}

function ContentHistory() {
  const [history, setHistory] = useState([])

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <History className="h-5 w-5" />
        تاريخ التغييرات
      </h3>

      <div className="space-y-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">تحديث قسم البطل الرئيسي</p>
              <p className="text-sm text-muted-foreground">منذ ساعتين</p>
            </div>
            <Button variant="outline" size="sm">
              استعادة
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">إضافة خدمة جديدة</p>
              <p className="text-sm text-muted-foreground">منذ يوم واحد</p>
            </div>
            <Button variant="outline" size="sm">
              استعادة
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
