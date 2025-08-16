"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Shield, Users, FileText, BarChart3, Settings, Lock, Eye, Edit, Trash2 } from "lucide-react"
import { PERMISSIONS, ROLES, type Permission } from "@/lib/security/rbac"

interface UserPermissionsProps {
  userId: string
  userRole: string
  onPermissionsChange?: (permissions: string[]) => void
}

interface PermissionGroup {
  name: string
  icon: any
  color: string
  permissions: Permission[]
}

export function UserPermissions({ userId, userRole, onPermissionsChange }: UserPermissionsProps) {
  const { toast } = useToast()
  const [customPermissions, setCustomPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const permissionGroups: PermissionGroup[] = [
    {
      name: "إدارة المستخدمين",
      icon: Users,
      color: "text-blue-600 bg-blue-50",
      permissions: [
        PERMISSIONS.USERS_READ,
        PERMISSIONS.USERS_CREATE,
        PERMISSIONS.USERS_UPDATE,
        PERMISSIONS.USERS_DELETE,
        PERMISSIONS.USERS_MANAGE,
      ],
    },
    {
      name: "إدارة المحتوى",
      icon: FileText,
      color: "text-green-600 bg-green-50",
      permissions: [
        PERMISSIONS.CONTENT_READ,
        PERMISSIONS.CONTENT_CREATE,
        PERMISSIONS.CONTENT_UPDATE,
        PERMISSIONS.CONTENT_DELETE,
        PERMISSIONS.CONTENT_PUBLISH,
      ],
    },
    {
      name: "التحليلات",
      icon: BarChart3,
      color: "text-purple-600 bg-purple-50",
      permissions: [PERMISSIONS.ANALYTICS_READ, PERMISSIONS.ANALYTICS_EXPORT],
    },
    {
      name: "الأمان",
      icon: Shield,
      color: "text-red-600 bg-red-50",
      permissions: [PERMISSIONS.SECURITY_READ, PERMISSIONS.SECURITY_MANAGE],
    },
    {
      name: "إعدادات النظام",
      icon: Settings,
      color: "text-orange-600 bg-orange-50",
      permissions: [PERMISSIONS.SYSTEM_SETTINGS, PERMISSIONS.SYSTEM_LOGS],
    },
  ]

  useEffect(() => {
    fetchUserPermissions()
  }, [userId])

  const fetchUserPermissions = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/permissions`)
      if (response.ok) {
        const data = await response.json()
        setCustomPermissions(data.permissions || [])
      }
    } catch (error) {
      console.error("Error fetching user permissions:", error)
    }
  }

  const updatePermissions = async (permissions: string[]) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions }),
      })

      if (response.ok) {
        setCustomPermissions(permissions)
        onPermissionsChange?.(permissions)
        toast({ title: "تم التحديث", description: "تم تحديث صلاحيات المستخدم بنجاح" })
      } else {
        throw new Error("فشل في تحديث الصلاحيات")
      }
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في تحديث الصلاحيات", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const togglePermission = (permissionKey: string) => {
    const newPermissions = customPermissions.includes(permissionKey)
      ? customPermissions.filter((p) => p !== permissionKey)
      : [...customPermissions, permissionKey]

    updatePermissions(newPermissions)
  }

  const hasPermission = (permission: Permission) => {
    const permissionKey = `${permission.resource}_${permission.action}`
    return customPermissions.includes(permissionKey) || ROLES[userRole]?.permissions.includes(permission)
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case "read":
        return <Eye className="h-3 w-3" />
      case "create":
        return <FileText className="h-3 w-3" />
      case "update":
        return <Edit className="h-3 w-3" />
      case "delete":
        return <Trash2 className="h-3 w-3" />
      case "manage":
        return <Shield className="h-3 w-3" />
      default:
        return <Lock className="h-3 w-3" />
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case "read":
        return "عرض"
      case "create":
        return "إنشاء"
      case "update":
        return "تحديث"
      case "delete":
        return "حذف"
      case "manage":
        return "إدارة كاملة"
      default:
        return action
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            إدارة الصلاحيات
          </CardTitle>
          <CardDescription>تخصيص صلاحيات المستخدم حسب الحاجة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium">الدور الحالي</p>
              <Badge className="mt-1">
                {userRole === "admin" ? "مدير النظام" : userRole === "editor" ? "محرر" : "مشاهد"}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">الصلاحيات المخصصة</p>
              <p className="text-lg font-semibold">{customPermissions.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="permissions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="permissions">الصلاحيات</TabsTrigger>
          <TabsTrigger value="roles">الأدوار</TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="space-y-4">
          {permissionGroups.map((group) => (
            <Card key={group.name}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className={`p-2 rounded-lg ${group.color}`}>
                    <group.icon className="h-4 w-4" />
                  </div>
                  {group.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.permissions.map((permission) => {
                    const permissionKey = `${permission.resource}_${permission.action}`
                    const isEnabled = hasPermission(permission)
                    const isCustom = customPermissions.includes(permissionKey)
                    const isFromRole = ROLES[userRole]?.permissions.includes(permission)

                    return (
                      <div
                        key={permissionKey}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isEnabled ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {getActionIcon(permission.action)}
                          <div>
                            <p className="text-sm font-medium">{getActionLabel(permission.action)}</p>
                            <p className="text-xs text-muted-foreground">{permission.resource}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isFromRole && (
                            <Badge variant="outline" className="text-xs">
                              من الدور
                            </Badge>
                          )}
                          <Switch
                            checked={isCustom}
                            onCheckedChange={() => togglePermission(permissionKey)}
                            disabled={loading || isFromRole}
                            size="sm"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الأدوار المتاحة</CardTitle>
              <CardDescription>معلومات عن الأدوار وصلاحياتها</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.values(ROLES).map((role) => (
                  <div
                    key={role.id}
                    className={`p-4 rounded-lg border ${
                      userRole === role.id ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{role.name}</h3>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                      {userRole === role.id && <Badge>الدور الحالي</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {role.permissions.map((permission, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {getActionLabel(permission.action)} {permission.resource}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
