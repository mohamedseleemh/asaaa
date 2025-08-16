"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Save, Eye, Plus, Trash2, Move, Copy } from "lucide-react"
import { toast } from "sonner"

interface LandingPageSection {
  id: string
  type: "hero" | "features" | "testimonials" | "cta" | "about" | "contact"
  title: string
  content: any
  visible: boolean
  order: number
}

interface LandingPageConfig {
  sections: LandingPageSection[]
  theme: {
    primaryColor: string
    secondaryColor: string
    fontFamily: string
    direction: "rtl" | "ltr"
  }
  seo: {
    title: string
    description: string
    keywords: string
  }
}

export default function LandingEditorPage() {
  const [config, setConfig] = useState<LandingPageConfig>({
    sections: [],
    theme: {
      primaryColor: "#10b981",
      secondaryColor: "#3b82f6",
      fontFamily: "Cairo",
      direction: "rtl",
    },
    seo: {
      title: "KYC Trust - خدمات التحقق من الهوية",
      description: "منصة موثوقة لخدمات التحقق من الهوية والامتثال",
      keywords: "KYC, التحقق من الهوية, الامتثال",
    },
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  useEffect(() => {
    loadLandingPageConfig()
  }, [])

  const loadLandingPageConfig = async () => {
    try {
      const response = await fetch("/api/admin/landing-config")
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error("Error loading landing page config:", error)
      toast.error("فشل في تحميل إعدادات الصفحة")
    } finally {
      setLoading(false)
    }
  }

  const saveLandingPageConfig = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/landing-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast.success("تم حفظ التغييرات بنجاح")
      } else {
        throw new Error("Failed to save")
      }
    } catch (error) {
      console.error("Error saving landing page config:", error)
      toast.error("فشل في حفظ التغييرات")
    } finally {
      setSaving(false)
    }
  }

  const addSection = (type: LandingPageSection["type"]) => {
    const newSection: LandingPageSection = {
      id: `section-${Date.now()}`,
      type,
      title: getSectionTitle(type),
      content: getDefaultContent(type),
      visible: true,
      order: config.sections.length,
    }

    setConfig((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }))
  }

  const updateSection = (sectionId: string, updates: Partial<LandingPageSection>) => {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => (section.id === sectionId ? { ...section, ...updates } : section)),
    }))
  }

  const deleteSection = (sectionId: string) => {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== sectionId),
    }))
  }

  const getSectionTitle = (type: string) => {
    const titles = {
      hero: "قسم البطل الرئيسي",
      features: "قسم الميزات",
      testimonials: "قسم الشهادات",
      cta: "قسم الدعوة للعمل",
      about: "قسم من نحن",
      contact: "قسم التواصل",
    }
    return titles[type as keyof typeof titles] || "قسم جديد"
  }

  const getDefaultContent = (type: string) => {
    const defaults = {
      hero: {
        title: "مرحباً بك في KYC Trust",
        subtitle: "منصة موثوقة لخدمات التحقق من الهوية",
        buttonText: "ابدأ الآن",
        backgroundImage: "/placeholder.svg?height=600&width=1200",
      },
      features: {
        title: "ميزاتنا المتقدمة",
        items: [
          { title: "أمان عالي", description: "حماية متقدمة للبيانات" },
          { title: "سرعة في التحقق", description: "نتائج فورية" },
          { title: "دعم 24/7", description: "فريق دعم متاح دائماً" },
        ],
      },
      testimonials: {
        title: "آراء عملائنا",
        items: [{ name: "أحمد محمد", text: "خدمة ممتازة وسريعة", rating: 5 }],
      },
      cta: {
        title: "ابدأ رحلتك معنا اليوم",
        description: "انضم إلى آلاف العملاء الراضين",
        buttonText: "ابدأ الآن",
      },
      about: {
        title: "من نحن",
        description: "نحن شركة رائدة في مجال التحقق من الهوية",
      },
      contact: {
        title: "تواصل معنا",
        email: "info@kyctrust.com",
        phone: "+966123456789",
      },
    }
    return defaults[type as keyof typeof defaults] || {}
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
          <h2 className="text-3xl font-bold">محرر صفحة الهبوط</h2>
          <p className="text-muted-foreground">تخصيص وإدارة محتوى صفحة الهبوط</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open("/", "_blank")}>
            <Eye className="h-4 w-4 mr-2" />
            معاينة
          </Button>
          <Button onClick={saveLandingPageConfig} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sections" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sections">الأقسام</TabsTrigger>
          <TabsTrigger value="theme">التصميم</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                إدارة الأقسام
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => addSection("hero")}>
                    <Plus className="h-4 w-4 mr-1" />
                    قسم البطل
                  </Button>
                  <Button size="sm" onClick={() => addSection("features")}>
                    <Plus className="h-4 w-4 mr-1" />
                    الميزات
                  </Button>
                  <Button size="sm" onClick={() => addSection("testimonials")}>
                    <Plus className="h-4 w-4 mr-1" />
                    الشهادات
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.sections.map((section, index) => (
                <Card key={section.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{section.type}</Badge>
                        <h4 className="font-medium">{section.title}</h4>
                        <Switch
                          checked={section.visible}
                          onCheckedChange={(checked) => updateSection(section.id, { visible: checked })}
                        />
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost">
                          <Move className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteSection(section.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SectionEditor section={section} onUpdate={(updates) => updateSection(section.id, updates)} />
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات التصميم</CardTitle>
              <CardDescription>تخصيص ألوان وخطوط الموقع</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اللون الأساسي</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.theme.primaryColor}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, primaryColor: e.target.value },
                        }))
                      }
                      className="w-16 h-10"
                    />
                    <Input
                      value={config.theme.primaryColor}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, primaryColor: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>اللون الثانوي</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.theme.secondaryColor}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, secondaryColor: e.target.value },
                        }))
                      }
                      className="w-16 h-10"
                    />
                    <Input
                      value={config.theme.secondaryColor}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, secondaryColor: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات SEO</CardTitle>
              <CardDescription>تحسين محركات البحث</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>عنوان الصفحة</Label>
                <Input
                  value={config.seo.title}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, title: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>وصف الصفحة</Label>
                <Textarea
                  value={config.seo.description}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, description: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>الكلمات المفتاحية</Label>
                <Input
                  value={config.seo.keywords}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, keywords: e.target.value },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات العامة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>اتجاه النص</Label>
                  <p className="text-sm text-muted-foreground">تحديد اتجاه النص في الموقع</p>
                </div>
                <Switch
                  checked={config.theme.direction === "rtl"}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, direction: checked ? "rtl" : "ltr" },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SectionEditor({
  section,
  onUpdate,
}: {
  section: LandingPageSection
  onUpdate: (updates: Partial<LandingPageSection>) => void
}) {
  const updateContent = (key: string, value: any) => {
    onUpdate({
      content: { ...section.content, [key]: value },
    })
  }

  switch (section.type) {
    case "hero":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>العنوان الرئيسي</Label>
            <Input value={section.content.title || ""} onChange={(e) => updateContent("title", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>العنوان الفرعي</Label>
            <Textarea
              value={section.content.subtitle || ""}
              onChange={(e) => updateContent("subtitle", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>نص الزر</Label>
            <Input
              value={section.content.buttonText || ""}
              onChange={(e) => updateContent("buttonText", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>الصورة الخلفية</Label>
            <Input
              value={section.content.backgroundImage || ""}
              onChange={(e) => updateContent("backgroundImage", e.target.value)}
            />
          </div>
        </div>
      )

    case "features":
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>عنوان القسم</Label>
            <Input value={section.content.title || ""} onChange={(e) => updateContent("title", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>الميزات</Label>
            {section.content.items?.map((item: any, index: number) => (
              <div key={index} className="border p-3 rounded space-y-2">
                <Input
                  placeholder="عنوان الميزة"
                  value={item.title || ""}
                  onChange={(e) => {
                    const newItems = [...section.content.items]
                    newItems[index] = { ...item, title: e.target.value }
                    updateContent("items", newItems)
                  }}
                />
                <Textarea
                  placeholder="وصف الميزة"
                  value={item.description || ""}
                  onChange={(e) => {
                    const newItems = [...section.content.items]
                    newItems[index] = { ...item, description: e.target.value }
                    updateContent("items", newItems)
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )

    default:
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>المحتوى</Label>
            <Textarea
              value={JSON.stringify(section.content, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  onUpdate({ content: parsed })
                } catch (error) {
                  // Invalid JSON, ignore
                }
              }}
              rows={10}
            />
          </div>
        </div>
      )
  }
}
