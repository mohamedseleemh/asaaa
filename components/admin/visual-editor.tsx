"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import {
  Plus,
  Trash2,
  Eye,
  Save,
  Copy,
  Move,
  Settings,
  Type,
  Layout,
  Smartphone,
  Tablet,
  Monitor,
  Undo,
  Redo,
} from "lucide-react"

interface BlockElement {
  id: string
  type: "hero" | "features" | "testimonials" | "cta" | "about" | "contact" | "custom"
  title: string
  content: any
  styles: {
    backgroundColor: string
    textColor: string
    padding: number
    margin: number
    borderRadius: number
    fontSize: number
  }
  visible: boolean
  order: number
}

interface VisualEditorProps {
  initialBlocks?: BlockElement[]
  onSave?: (blocks: BlockElement[]) => void
}

export function VisualEditor({ initialBlocks = [], onSave }: VisualEditorProps) {
  const [blocks, setBlocks] = useState<BlockElement[]>(initialBlocks)
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [isPreview, setIsPreview] = useState(false)
  const [history, setHistory] = useState<BlockElement[][]>([initialBlocks])
  const [historyIndex, setHistoryIndex] = useState(0)
  const editorRef = useRef<HTMLDivElement>(null)

  const addToHistory = useCallback(
    (newBlocks: BlockElement[]) => {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push([...newBlocks])
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    },
    [history, historyIndex],
  )

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setBlocks([...history[historyIndex - 1]])
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setBlocks([...history[historyIndex + 1]])
    }
  }, [history, historyIndex])

  const addBlock = useCallback(
    (type: BlockElement["type"]) => {
      const newBlock: BlockElement = {
        id: `block-${Date.now()}`,
        type,
        title: getBlockTitle(type),
        content: getDefaultBlockContent(type),
        styles: {
          backgroundColor: "#ffffff",
          textColor: "#000000",
          padding: 20,
          margin: 10,
          borderRadius: 8,
          fontSize: 16,
        },
        visible: true,
        order: blocks.length,
      }

      const newBlocks = [...blocks, newBlock]
      setBlocks(newBlocks)
      addToHistory(newBlocks)
      setSelectedBlock(newBlock.id)
      toast.success(`تم إضافة ${getBlockTitle(type)}`)
    },
    [blocks, addToHistory],
  )

  const updateBlock = useCallback(
    (blockId: string, updates: Partial<BlockElement>) => {
      const newBlocks = blocks.map((block) => (block.id === blockId ? { ...block, ...updates } : block))
      setBlocks(newBlocks)
      addToHistory(newBlocks)
    },
    [blocks, addToHistory],
  )

  const deleteBlock = useCallback(
    (blockId: string) => {
      const newBlocks = blocks.filter((block) => block.id !== blockId)
      setBlocks(newBlocks)
      addToHistory(newBlocks)
      setSelectedBlock(null)
      toast.success("تم حذف العنصر")
    },
    [blocks, addToHistory],
  )

  const duplicateBlock = useCallback(
    (blockId: string) => {
      const blockToDuplicate = blocks.find((block) => block.id === blockId)
      if (!blockToDuplicate) return

      const duplicatedBlock: BlockElement = {
        ...blockToDuplicate,
        id: `block-${Date.now()}`,
        title: `${blockToDuplicate.title} (نسخة)`,
        order: blocks.length,
      }

      const newBlocks = [...blocks, duplicatedBlock]
      setBlocks(newBlocks)
      addToHistory(newBlocks)
      toast.success("تم نسخ العنصر")
    },
    [blocks, addToHistory],
  )

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return

      const newBlocks = Array.from(blocks)
      const [reorderedBlock] = newBlocks.splice(result.source.index, 1)
      newBlocks.splice(result.destination.index, 0, reorderedBlock)

      // Update order property
      const updatedBlocks = newBlocks.map((block, index) => ({
        ...block,
        order: index,
      }))

      setBlocks(updatedBlocks)
      addToHistory(updatedBlocks)
    },
    [blocks, addToHistory],
  )

  const handleSave = useCallback(async () => {
    try {
      if (onSave) {
        onSave(blocks)
      }

      const response = await fetch("/api/admin/landing-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      })

      if (response.ok) {
        toast.success("تم حفظ التصميم بنجاح")
      } else {
        throw new Error("فشل في الحفظ")
      }
    } catch (error) {
      toast.error("فشل في حفظ التصميم")
    }
  }, [blocks, onSave])

  const getBlockTitle = (type: string) => {
    const titles = {
      hero: "قسم البطل الرئيسي",
      features: "قسم الميزات",
      testimonials: "قسم الشهادات",
      cta: "دعوة للعمل",
      about: "من نحن",
      contact: "تواصل معنا",
      custom: "قسم مخصص",
    }
    return titles[type as keyof typeof titles] || "قسم جديد"
  }

  const getDefaultBlockContent = (type: string) => {
    const defaults = {
      hero: {
        title: "مرحباً بك في موقعنا",
        subtitle: "نحن نقدم أفضل الخدمات",
        buttonText: "ابدأ الآن",
        backgroundImage: "",
      },
      features: {
        title: "ميزاتنا",
        items: [
          { title: "ميزة رائعة", description: "وصف الميزة", icon: "star" },
          { title: "خدمة متميزة", description: "وصف الخدمة", icon: "heart" },
          { title: "دعم 24/7", description: "نحن هنا لمساعدتك", icon: "support" },
        ],
      },
      testimonials: {
        title: "آراء عملائنا",
        items: [{ name: "أحمد محمد", text: "خدمة ممتازة", rating: 5, avatar: "" }],
      },
      cta: {
        title: "ابدأ رحلتك معنا اليوم",
        description: "انضم إلى آلاف العملاء الراضين",
        buttonText: "ابدأ الآن",
      },
      about: {
        title: "من نحن",
        description: "نحن شركة رائدة في مجالنا",
        image: "",
      },
      contact: {
        title: "تواصل معنا",
        email: "info@example.com",
        phone: "+966123456789",
        address: "الرياض، المملكة العربية السعودية",
      },
      custom: {
        html: "<div><h2>محتوى مخصص</h2><p>يمكنك إضافة أي محتوى HTML هنا</p></div>",
      },
    }
    return defaults[type as keyof typeof defaults] || {}
  }

  const selectedBlockData = selectedBlock ? blocks.find((b) => b.id === selectedBlock) : null

  return (
    <div className="h-screen flex flex-col">
      {/* شريط الأدوات العلوي */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">محرر صفحة الهبوط المرئي</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
                <Undo className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
                <Redo className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={previewMode === "desktop" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("desktop")}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={previewMode === "tablet" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("tablet")}
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={previewMode === "mobile" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("mobile")}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="outline" onClick={() => setIsPreview(!isPreview)}>
              <Eye className="h-4 w-4 mr-2" />
              {isPreview ? "تحرير" : "معاينة"}
            </Button>

            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              حفظ
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* الشريط الجانبي للعناصر */}
        {!isPreview && (
          <div className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
            <Tabs defaultValue="blocks" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="blocks">العناصر</TabsTrigger>
                <TabsTrigger value="settings">الإعدادات</TabsTrigger>
              </TabsList>

              <TabsContent value="blocks" className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3">إضافة عناصر جديدة</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => addBlock("hero")} className="h-20 flex-col">
                      <Layout className="h-6 w-6 mb-1" />
                      بطل
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock("features")} className="h-20 flex-col">
                      <Settings className="h-6 w-6 mb-1" />
                      ميزات
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addBlock("testimonials")}
                      className="h-20 flex-col"
                    >
                      <Type className="h-6 w-6 mb-1" />
                      شهادات
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addBlock("cta")} className="h-20 flex-col">
                      <Plus className="h-6 w-6 mb-1" />
                      دعوة
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">العناصر الحالية</h3>
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="blocks">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                          {blocks.map((block, index) => (
                            <Draggable key={block.id} draggableId={block.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`p-3 border rounded-lg bg-white cursor-pointer transition-all ${
                                    selectedBlock === block.id
                                      ? "border-blue-500 shadow-md"
                                      : "border-gray-200 hover:border-gray-300"
                                  } ${snapshot.isDragging ? "shadow-lg" : ""}`}
                                  onClick={() => setSelectedBlock(block.id)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div {...provided.dragHandleProps}>
                                        <Move className="h-4 w-4 text-gray-400" />
                                      </div>
                                      <span className="font-medium text-sm">{block.title}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Switch
                                        checked={block.visible}
                                        onCheckedChange={(checked) => updateBlock(block.id, { visible: checked })}
                                        size="sm"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          duplicateBlock(block.id)
                                        }}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          deleteBlock(block.id)
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="mt-2 text-xs">
                                    {block.type}
                                  </Badge>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                {selectedBlockData && <BlockSettings block={selectedBlockData} onUpdate={updateBlock} />}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* منطقة المعاينة */}
        <div className="flex-1 bg-gray-100 overflow-auto">
          <div
            ref={editorRef}
            className={`mx-auto bg-white min-h-full transition-all duration-300 ${
              previewMode === "desktop" ? "max-w-none" : previewMode === "tablet" ? "max-w-3xl" : "max-w-sm"
            }`}
          >
            {blocks
              .filter((block) => block.visible)
              .sort((a, b) => a.order - b.order)
              .map((block) => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  isSelected={selectedBlock === block.id}
                  isPreview={isPreview}
                  onClick={() => !isPreview && setSelectedBlock(block.id)}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function BlockSettings({
  block,
  onUpdate,
}: {
  block: BlockElement
  onUpdate: (blockId: string, updates: Partial<BlockElement>) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>عنوان العنصر</Label>
        <Input value={block.title} onChange={(e) => onUpdate(block.id, { title: e.target.value })} />
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">التصميم</h4>

        <div>
          <Label>لون الخلفية</Label>
          <Input
            type="color"
            value={block.styles.backgroundColor}
            onChange={(e) =>
              onUpdate(block.id, {
                styles: { ...block.styles, backgroundColor: e.target.value },
              })
            }
          />
        </div>

        <div>
          <Label>لون النص</Label>
          <Input
            type="color"
            value={block.styles.textColor}
            onChange={(e) =>
              onUpdate(block.id, {
                styles: { ...block.styles, textColor: e.target.value },
              })
            }
          />
        </div>

        <div>
          <Label>الحشو الداخلي: {block.styles.padding}px</Label>
          <Slider
            value={[block.styles.padding]}
            onValueChange={([value]) =>
              onUpdate(block.id, {
                styles: { ...block.styles, padding: value },
              })
            }
            max={100}
            step={5}
          />
        </div>

        <div>
          <Label>الهامش: {block.styles.margin}px</Label>
          <Slider
            value={[block.styles.margin]}
            onValueChange={([value]) =>
              onUpdate(block.id, {
                styles: { ...block.styles, margin: value },
              })
            }
            max={50}
            step={5}
          />
        </div>

        <div>
          <Label>انحناء الحواف: {block.styles.borderRadius}px</Label>
          <Slider
            value={[block.styles.borderRadius]}
            onValueChange={([value]) =>
              onUpdate(block.id, {
                styles: { ...block.styles, borderRadius: value },
              })
            }
            max={50}
            step={2}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">المحتوى</h4>
        <BlockContentEditor block={block} onUpdate={onUpdate} />
      </div>
    </div>
  )
}

function BlockContentEditor({
  block,
  onUpdate,
}: {
  block: BlockElement
  onUpdate: (blockId: string, updates: Partial<BlockElement>) => void
}) {
  const updateContent = (updates: any) => {
    onUpdate(block.id, { content: { ...block.content, ...updates } })
  }

  switch (block.type) {
    case "hero":
      return (
        <div className="space-y-3">
          <div>
            <Label>العنوان الرئيسي</Label>
            <Input value={block.content.title || ""} onChange={(e) => updateContent({ title: e.target.value })} />
          </div>
          <div>
            <Label>العنوان الفرعي</Label>
            <Textarea
              value={block.content.subtitle || ""}
              onChange={(e) => updateContent({ subtitle: e.target.value })}
              rows={2}
            />
          </div>
          <div>
            <Label>نص الزر</Label>
            <Input
              value={block.content.buttonText || ""}
              onChange={(e) => updateContent({ buttonText: e.target.value })}
            />
          </div>
        </div>
      )

    case "features":
      return (
        <div className="space-y-3">
          <div>
            <Label>عنوان القسم</Label>
            <Input value={block.content.title || ""} onChange={(e) => updateContent({ title: e.target.value })} />
          </div>
        </div>
      )

    default:
      return (
        <div>
          <Label>المحتوى (JSON)</Label>
          <Textarea
            value={JSON.stringify(block.content, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                onUpdate(block.id, { content: parsed })
              } catch (error) {
                // Invalid JSON, ignore
              }
            }}
            rows={6}
          />
        </div>
      )
  }
}

function BlockRenderer({
  block,
  isSelected,
  isPreview,
  onClick,
}: {
  block: BlockElement
  isSelected: boolean
  isPreview: boolean
  onClick: () => void
}) {
  const blockStyle = {
    backgroundColor: block.styles.backgroundColor,
    color: block.styles.textColor,
    padding: `${block.styles.padding}px`,
    margin: `${block.styles.margin}px`,
    borderRadius: `${block.styles.borderRadius}px`,
    fontSize: `${block.styles.fontSize}px`,
  }

  return (
    <div
      className={`relative transition-all duration-200 ${
        !isPreview && isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
      } ${!isPreview ? "cursor-pointer hover:ring-1 hover:ring-gray-300" : ""}`}
      style={blockStyle}
      onClick={onClick}
    >
      {!isPreview && isSelected && (
        <div className="absolute -top-6 left-0 bg-blue-500 text-white px-2 py-1 text-xs rounded">{block.title}</div>
      )}

      <BlockContent block={block} />
    </div>
  )
}

function BlockContent({ block }: { block: BlockElement }) {
  switch (block.type) {
    case "hero":
      return (
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold mb-4">{block.content.title}</h1>
          <p className="text-xl mb-8">{block.content.subtitle}</p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium">
            {block.content.buttonText}
          </button>
        </div>
      )

    case "features":
      return (
        <div className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">{block.content.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {block.content.items?.map((item: any, index: number) => (
              <div key={index} className="text-center">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )

    case "cta":
      return (
        <div className="text-center py-16">
          <h2 className="text-3xl font-bold mb-4">{block.content.title}</h2>
          <p className="text-lg mb-8">{block.content.description}</p>
          <button className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium">
            {block.content.buttonText}
          </button>
        </div>
      )

    default:
      return (
        <div className="py-8">
          <h3 className="text-xl font-semibold mb-4">{block.title}</h3>
          <pre className="text-sm bg-gray-100 p-4 rounded">{JSON.stringify(block.content, null, 2)}</pre>
        </div>
      )
  }
}
