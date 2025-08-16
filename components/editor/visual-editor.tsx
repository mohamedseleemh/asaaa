"use client"

import { useState } from "react"
import { useCMS } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Eye, Edit, Save, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface EditableSection {
  id: string
  type: "text" | "textarea" | "image"
  value: string
  placeholder: string
}

export function VisualEditor() {
  const { content, locale, setContent } = useCMS()
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  const bundle = content[locale]

  const editableSections: EditableSection[] = [
    {
      id: "hero.title",
      type: "text",
      value: bundle.hero.title,
      placeholder: "Hero Title",
    },
    {
      id: "hero.subtitle",
      type: "text",
      value: bundle.hero.subtitle,
      placeholder: "Hero Subtitle",
    },
    {
      id: "hero.description",
      type: "textarea",
      value: bundle.hero.description,
      placeholder: "Hero Description",
    },
  ]

  const updateSection = (sectionId: string, value: string) => {
    const [section, field] = sectionId.split(".")

    if (section === "hero") {
      setContent(locale, {
        hero: {
          ...bundle.hero,
          [field]: value,
        },
      })
    }
  }

  const EditableText = ({ section }: { section: EditableSection }) => {
    const isEditing = editingSection === section.id

    return (
      <div className="relative group">
        {!isEditing ? (
          <div
            className="min-h-[40px] p-2 rounded border-2 border-transparent hover:border-blue-200 cursor-pointer transition-colors"
            onClick={() => setEditingSection(section.id)}
          >
            <div className="flex items-center justify-between">
              <span>{section.value || section.placeholder}</span>
              <Edit className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-2 border-2 border-blue-400 rounded bg-white dark:bg-gray-800 shadow-lg"
          >
            {section.type === "textarea" ? (
              <Textarea
                value={section.value}
                onChange={(e) => updateSection(section.id, e.target.value)}
                placeholder={section.placeholder}
                className="mb-2"
                autoFocus
              />
            ) : (
              <Input
                value={section.value}
                onChange={(e) => updateSection(section.id, e.target.value)}
                placeholder={section.placeholder}
                className="mb-2"
                autoFocus
              />
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setEditingSection(null)}>
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditingSection(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Visual Editor</h2>
        <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
          <Eye className="w-4 h-4 mr-2" />
          {previewMode ? "Edit Mode" : "Preview Mode"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Hero Section</h3>
              <div className="space-y-4">
                {editableSections.map((section) => (
                  <div key={section.id}>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      {section.placeholder}
                    </label>
                    <EditableText section={section} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {previewMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Preview</h3>
                <Button variant="outline" onClick={() => setPreviewMode(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">{bundle.hero.title}</h1>
                  <h2 className="text-xl text-muted-foreground">{bundle.hero.subtitle}</h2>
                  <p className="mt-4">{bundle.hero.description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
