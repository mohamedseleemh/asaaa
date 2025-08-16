"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Upload, Trash2, Copy, Eye } from "lucide-react"
import Image from "next/image"

interface MediaFile {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: string
}

export default function MediaManagerPage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<MediaFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles) return

    setUploading(true)
    try {
      for (const file of Array.from(selectedFiles)) {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const newFile = await response.json()
          setFiles((prev) => [...prev, newFile])
        }
      }
      toast({ title: "Success", description: "Files uploaded successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload files" })
    } finally {
      setUploading(false)
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({ title: "Copied", description: "URL copied to clipboard" })
  }

  const deleteFile = async (id: string) => {
    try {
      await fetch(`/api/admin/media/${id}`, { method: "DELETE" })
      setFiles((prev) => prev.filter((f) => f.id !== id))
      toast({ title: "Deleted", description: "File deleted successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete file" })
    }
  }

  const filteredFiles = files.filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Media Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Files"}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFiles.map((file) => (
              <Card key={file.id} className="overflow-hidden">
                <div className="aspect-square relative bg-gray-100 dark:bg-gray-800">
                  {file.type.startsWith("image/") ? (
                    <Image src={file.url || "/placeholder.svg"} alt={file.name} fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-4xl">📄</div>
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm truncate mb-2">{file.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{(file.size / 1024).toFixed(1)} KB</p>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(file.url)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.open(file.url, "_blank")}>
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteFile(file.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
