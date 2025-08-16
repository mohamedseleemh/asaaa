"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Loader2,
  Plus,
  Trash2,
  Edit,
  Search,
  Download,
  UserCheck,
  UserX,
  Shield,
  Activity,
  Calendar,
  Mail,
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type User = {
  id: string
  name: string
  email: string
  role: "admin" | "editor" | "viewer"
  active: boolean
  created_at?: string
  last_login?: string
  login_count?: number
  permissions?: string[]
  notes?: string
}

type UserActivity = {
  id: string
  user_id: string
  action: string
  timestamp: string
  ip_address?: string
  user_agent?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "editor" as const,
    active: true,
    notes: "",
  })

  const { toast } = useToast()

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const [usersRes, activitiesRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/admin/user-activities").catch(() => ({ json: () => [] })),
      ])

      const [usersData, activitiesData] = await Promise.all([usersRes.json(), activitiesRes.json()])

      setUsers(Array.isArray(usersData) ? usersData : [])
      setActivities(Array.isArray(activitiesData) ? activitiesData : [])
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في تحميل بيانات المستخدمين", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const addUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
        await fetchUsers()
        setShowAddDialog(false)
        setNewUser({ name: "", email: "", role: "editor", active: true, notes: "" })
        toast({ title: "نجح", description: "تم إضافة المستخدم بنجاح" })
      } else {
        throw new Error("فشل في إضافة المستخدم")
      }
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في إضافة المستخدم", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const updateUser = async (patch: Partial<User> & { id: string }) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/users/${patch.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })

      if (response.ok) {
        await fetchUsers()
        toast({ title: "نجح", description: "تم تحديث المستخدم بنجاح" })
      } else {
        throw new Error("فشل في تحديث المستخدم")
      }
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في تحديث المستخدم", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const deleteUser = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return

    setSaving(true)
    try {
      const response = await fetch(`/api/users/${id}`, { method: "DELETE" })
      if (response.ok) {
        await fetchUsers()
        toast({ title: "نجح", description: "تم حذف المستخدم بنجاح" })
      } else {
        throw new Error("فشل في حذف المستخدم")
      }
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في حذف المستخدم", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const bulkAction = async (action: "activate" | "deactivate" | "delete") => {
    if (selectedUsers.length === 0) {
      toast({ title: "تنبيه", description: "يرجى اختيار مستخدمين أولاً", variant: "destructive" })
      return
    }

    if (action === "delete" && !confirm(`هل أنت متأكد من حذف ${selectedUsers.length} مستخدم؟`)) return

    setSaving(true)
    try {
      const promises = selectedUsers.map((id) => {
        switch (action) {
          case "activate":
            return fetch(`/api/users/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ active: true }),
            })
          case "deactivate":
            return fetch(`/api/users/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ active: false }),
            })
          case "delete":
            return fetch(`/api/users/${id}`, { method: "DELETE" })
        }
      })

      await Promise.all(promises)
      await fetchUsers()
      setSelectedUsers([])
      toast({ title: "نجح", description: `تم تنفيذ العملية على ${selectedUsers.length} مستخدم` })
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في تنفيذ العملية", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const exportUsers = () => {
    const csv = [
      ["الاسم", "البريد الإلكتروني", "الدور", "الحالة", "تاريخ الإنشاء", "آخر تسجيل دخول"].join(","),
      ...users.map((user) =>
        [
          user.name,
          user.email,
          user.role,
          user.active ? "نشط" : "غير نشط",
          user.created_at || "",
          user.last_login || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `users-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(filter.toLowerCase()) ||
        user.email.toLowerCase().includes(filter.toLowerCase())
      const matchesRole = roleFilter === "all" || user.role === roleFilter
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? user.active : !user.active)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, filter, roleFilter, statusFilter])

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "editor":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "viewer":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getUserActivities = (userId: string) => {
    return activities.filter((activity) => activity.user_id === userId).slice(0, 5)
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
          <h2 className="text-2xl font-bold">إدارة المستخدمين</h2>
          <p className="text-muted-foreground">إدارة حسابات المستخدمين والصلاحيات</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={exportUsers} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            تصدير
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                إضافة مستخدم
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                <DialogDescription>أدخل بيانات المستخدم الجديد</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">الاسم</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="اسم المستخدم"
                  />
                </div>
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="role">الدور</Label>
                  <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">مدير</SelectItem>
                      <SelectItem value="editor">محرر</SelectItem>
                      <SelectItem value="viewer">مشاهد</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={newUser.notes}
                    onChange={(e) => setNewUser({ ...newUser, notes: e.target.value })}
                    placeholder="ملاحظات اختيارية"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  إلغاء
                </Button>
                <Button onClick={addUser} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                  إضافة
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">المستخدمون</TabsTrigger>
          <TabsTrigger value="activities">سجل النشاط</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  المستخدمون ({filteredUsers.length})
                </CardTitle>
                {selectedUsers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{selectedUsers.length} محدد</span>
                    <Button size="sm" variant="outline" onClick={() => bulkAction("activate")}>
                      <UserCheck className="h-4 w-4 mr-1" />
                      تفعيل
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => bulkAction("deactivate")}>
                      <UserX className="h-4 w-4 mr-1" />
                      إلغاء تفعيل
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => bulkAction("delete")}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      حذف
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث بالاسم أو البريد الإلكتروني..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأدوار</SelectItem>
                    <SelectItem value="admin">مدير</SelectItem>
                    <SelectItem value="editor">محرر</SelectItem>
                    <SelectItem value="viewer">مشاهد</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">لا توجد مستخدمون</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="text-left text-muted-foreground border-b">
                      <tr>
                        <th className="p-3">
                          <Checkbox
                            checked={selectedUsers.length === filteredUsers.length}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedUsers(filteredUsers.map((u) => u.id))
                              } else {
                                setSelectedUsers([])
                              }
                            }}
                          />
                        </th>
                        <th className="p-3">المستخدم</th>
                        <th className="p-3">الدور</th>
                        <th className="p-3">الحالة</th>
                        <th className="p-3">آخر تسجيل دخول</th>
                        <th className="p-3">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-3">
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedUsers([...selectedUsers, user.id])
                                } else {
                                  setSelectedUsers(selectedUsers.filter((id) => id !== user.id))
                                }
                              }}
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-3 space-x-reverse">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-muted-foreground text-xs">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {user.role === "admin" ? "مدير" : user.role === "editor" ? "محرر" : "مشاهد"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge
                              className={`cursor-pointer ${
                                user.active
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-red-100 text-red-800 hover:bg-red-200"
                              }`}
                              onClick={() => updateUser({ id: user.id, active: !user.active })}
                            >
                              {user.active ? "نشط" : "غير نشط"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="text-xs text-muted-foreground">
                              {user.last_login ? new Date(user.last_login).toLocaleDateString("ar") : "لم يسجل دخول"}
                            </div>
                          </td>
                          <td className="p-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditingUser(user)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  تحرير
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="h-4 w-4 mr-2" />
                                  إرسال بريد
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Activity className="h-4 w-4 mr-2" />
                                  عرض النشاط
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => deleteUser(user.id)}
                                  className="text-red-600 dark:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  حذف
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                سجل نشاط المستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">لا توجد أنشطة مسجلة</div>
                ) : (
                  activities.slice(0, 20).map((activity) => {
                    const user = users.find((u) => u.id === activity.user_id)
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-4 space-x-reverse p-4 border rounded-lg"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Activity className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{user?.name || "مستخدم محذوف"}</span> {activity.action}
                          </p>
                          <div className="flex items-center space-x-4 space-x-reverse text-xs text-muted-foreground mt-1">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(activity.timestamp).toLocaleString("ar")}
                            </span>
                            {activity.ip_address && <span>IP: {activity.ip_address}</span>}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
