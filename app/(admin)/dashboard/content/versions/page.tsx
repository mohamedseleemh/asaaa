"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { History, RotateCcw, Eye, Download } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ContentVersion {
  id: string
  version: string
  description: string
  createdAt: string
  author: string
  changes: number
  status: "draft" | "published" | "archived"
}

export default function VersionHistoryPage() {
  const { toast } = useToast()
  const [versions, setVersions] = useState<ContentVersion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVersions()
  }, [])

  const fetchVersions = async () => {
    try {
      const response = await fetch("/api/admin/content/versions")
      const data = await response.json()
      setVersions(data)
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch versions" })
    } finally {
      setLoading(false)
    }
  }

  const restoreVersion = async (versionId: string) => {
    try {
      await fetch(`/api/admin/content/versions/${versionId}/restore`, {
        method: "POST",
      })
      toast({ title: "Success", description: "Version restored successfully" })
      fetchVersions()
    } catch (error) {
      toast({ title: "Error", description: "Failed to restore version" })
    }
  }

  const previewVersion = (versionId: string) => {
    window.open(`/preview?version=${versionId}`, "_blank")
  }

  const exportVersion = async (versionId: string) => {
    try {
      const response = await fetch(`/api/admin/content/versions/${versionId}/export`)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `content-version-${versionId}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast({ title: "Error", description: "Failed to export version" })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {versions.map((version) => (
              <div key={version.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">Version {version.version}</h3>
                    <Badge
                      variant={
                        version.status === "published"
                          ? "default"
                          : version.status === "draft"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {version.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{version.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>By {version.author}</span>
                    <span>{formatDistanceToNow(new Date(version.createdAt))} ago</span>
                    <span>{version.changes} changes</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => previewVersion(version.id)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => exportVersion(version.id)}>
                    <Download className="w-4 h-4" />
                  </Button>
                  {version.status !== "published" && (
                    <Button size="sm" onClick={() => restoreVersion(version.id)}>
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Restore
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
