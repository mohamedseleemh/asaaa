"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Shield,
  Key,
  AlertTriangle,
  Activity,
  Users,
  Lock,
  Eye,
  Smartphone,
  Globe,
  Ban,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react"

interface SecuritySettings {
  twoFactorEnabled: boolean
  sessionTimeout: number
  maxLoginAttempts: number
  lockoutDuration: number
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSymbols: boolean
  }
  ipWhitelist: string[]
  securityNotifications: boolean
}

interface AuditLog {
  id: string
  action: string
  user_email: string
  ip_address: string
  user_agent: string
  details: any
  created_at: string
  risk_level: "low" | "medium" | "high"
}

interface ActiveSession {
  id: string
  user_email: string
  ip_address: string
  user_agent: string
  created_at: string
  last_activity: string
  is_current: boolean
}

interface SecurityThreat {
  id: string
  type: "brute_force" | "suspicious_ip" | "multiple_sessions" | "unusual_activity"
  severity: "low" | "medium" | "high" | "critical"
  description: string
  ip_address: string
  detected_at: string
  status: "active" | "resolved" | "investigating"
}

export default function SecurityPage() {
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 7 * 24 * 60, // 7 days in minutes
    maxLoginAttempts: 5,
    lockoutDuration: 30, // minutes
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true,
    },
    ipWhitelist: [],
    securityNotifications: true,
  })
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [securityThreats, setSecurityThreats] = useState<SecurityThreat[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [show2FADialog, setShow2FADialog] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [twoFactorSecret, setTwoFactorSecret] = useState("")
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [newIpAddress, setNewIpAddress] = useState("")

  const { toast } = useToast()

  const fetchSecurityData = useCallback(async () => {
    setLoading(true)
    try {
      const [settingsRes, auditRes, sessionsRes, threatsRes] = await Promise.all([
        fetch("/api/admin/security/settings").catch(() => ({ json: () => settings })),
        fetch("/api/admin/security/audit-logs").catch(() => ({ json: () => [] })),
        fetch("/api/admin/security/sessions").catch(() => ({ json: () => [] })),
        fetch("/api/admin/security/threats").catch(() => ({ json: () => [] })),
      ])

      const [settingsData, auditData, sessionsData, threatsData] = await Promise.all([
        settingsRes.json(),
        auditRes.json(),
        sessionsRes.json(),
        threatsRes.json(),
      ])

      setSettings(settingsData.length ? settingsData : settings)
      setAuditLogs(Array.isArray(auditData) ? auditData : generateMockAuditLogs())
      setActiveSessions(Array.isArray(sessionsData) ? sessionsData : generateMockSessions())
      setSecurityThreats(Array.isArray(threatsData) ? threatsData : generateMockThreats())
    } catch (error) {
      console.error("Error fetching security data:", error)
      // Use mock data as fallback
      setAuditLogs(generateMockAuditLogs())
      setActiveSessions(generateMockSessions())
      setSecurityThreats(generateMockThreats())
    } finally {
      setLoading(false)
    }
  }, [settings])

  const generateMockAuditLogs = (): AuditLog[] => [
    {
      id: "1",
      action: "security_successful_login",
      user_email: "admin@kyctrust.com",
      ip_address: "192.168.1.100",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      details: { method: "password" },
      created_at: new Date(Date.now() - 300000).toISOString(),
      risk_level: "low",
    },
    {
      id: "2",
      action: "security_failed_login",
      user_email: "unknown@example.com",
      ip_address: "203.0.113.45",
      user_agent: "curl/7.68.0",
      details: { reason: "invalid_credentials", attempts: 3 },
      created_at: new Date(Date.now() - 600000).toISOString(),
      risk_level: "medium",
    },
    {
      id: "3",
      action: "security_password_changed",
      user_email: "admin@kyctrust.com",
      ip_address: "192.168.1.100",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      details: { forced: false },
      created_at: new Date(Date.now() - 3600000).toISOString(),
      risk_level: "low",
    },
  ]

  const generateMockSessions = (): ActiveSession[] => [
    {
      id: "session_1",
      user_email: "admin@kyctrust.com",
      ip_address: "192.168.1.100",
      user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      last_activity: new Date(Date.now() - 300000).toISOString(),
      is_current: true,
    },
    {
      id: "session_2",
      user_email: "admin@kyctrust.com",
      ip_address: "10.0.0.50",
      user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
      created_at: new Date(Date.now() - 7200000).toISOString(),
      last_activity: new Date(Date.now() - 1800000).toISOString(),
      is_current: false,
    },
  ]

  const generateMockThreats = (): SecurityThreat[] => [
    {
      id: "threat_1",
      type: "brute_force",
      severity: "high",
      description: "Multiple failed login attempts from IP 203.0.113.45",
      ip_address: "203.0.113.45",
      detected_at: new Date(Date.now() - 1800000).toISOString(),
      status: "active",
    },
    {
      id: "threat_2",
      type: "suspicious_ip",
      severity: "medium",
      description: "Login from new geographic location",
      ip_address: "198.51.100.25",
      detected_at: new Date(Date.now() - 3600000).toISOString(),
      status: "investigating",
    },
  ]

  useEffect(() => {
    fetchSecurityData()
  }, [fetchSecurityData])

  const updateSettings = async (newSettings: Partial<SecuritySettings>) => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/security/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, ...newSettings }),
      })

      if (response.ok) {
        setSettings({ ...settings, ...newSettings })
        toast({ title: "تم الحفظ", description: "تم تحديث إعدادات الأمان بنجاح" })
      }
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في تحديث الإعدادات", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "خطأ", description: "كلمات المرور غير متطابقة", variant: "destructive" })
      return
    }

    if (passwordForm.newPassword.length < settings.passwordPolicy.minLength) {
      toast({
        title: "خطأ",
        description: `كلمة المرور يجب أن تكون ${settings.passwordPolicy.minLength} أحرف على الأقل`,
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/admin/security/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      if (response.ok) {
        setShowPasswordDialog(false)
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
        toast({ title: "تم التحديث", description: "تم تغيير كلمة المرور بنجاح" })
      } else {
        toast({ title: "خطأ", description: "كلمة المرور الحالية غير صحيحة", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في تغيير كلمة المرور", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const setup2FA = async () => {
    try {
      const response = await fetch("/api/admin/security/2fa/setup", { method: "POST" })
      const data = await response.json()
      setTwoFactorSecret(data.secret)
      setShow2FADialog(true)
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في إعداد المصادقة الثنائية", variant: "destructive" })
    }
  }

  const verify2FA = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/security/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: twoFactorSecret, code: twoFactorCode }),
      })

      if (response.ok) {
        await updateSettings({ twoFactorEnabled: true })
        setShow2FADialog(false)
        setTwoFactorCode("")
        toast({ title: "تم التفعيل", description: "تم تفعيل المصادقة الثنائية بنجاح" })
      } else {
        toast({ title: "خطأ", description: "رمز التحقق غير صحيح", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في تفعيل المصادقة الثنائية", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const terminateSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/admin/security/sessions/${sessionId}`, { method: "DELETE" })
      if (response.ok) {
        await fetchSecurityData()
        toast({ title: "تم الإنهاء", description: "تم إنهاء الجلسة بنجاح" })
      }
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في إنهاء الجلسة", variant: "destructive" })
    }
  }

  const addToWhitelist = () => {
    if (newIpAddress && !settings.ipWhitelist.includes(newIpAddress)) {
      updateSettings({ ipWhitelist: [...settings.ipWhitelist, newIpAddress] })
      setNewIpAddress("")
    }
  }

  const removeFromWhitelist = (ip: string) => {
    updateSettings({ ipWhitelist: settings.ipWhitelist.filter((item) => item !== ip) })
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "high":
      case "critical":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  const getThreatIcon = (type: string) => {
    switch (type) {
      case "brute_force":
        return <Ban className="h-4 w-4" />
      case "suspicious_ip":
        return <Globe className="h-4 w-4" />
      case "multiple_sessions":
        return <Users className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
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
          <h2 className="text-2xl font-bold">الأمان والتحكم في الوصول</h2>
          <p className="text-muted-foreground">إدارة إعدادات الأمان ومراقبة التهديدات</p>
        </div>
        <Button onClick={fetchSecurityData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          تحديث البيانات
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حالة الأمان</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">آمن</div>
            <p className="text-xs text-muted-foreground">جميع الأنظمة تعمل بشكل طبيعي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الجلسات النشطة</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions.length}</div>
            <p className="text-xs text-muted-foreground">جلسات مفتوحة حالياً</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التهديدات النشطة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {securityThreats.filter((t) => t.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">تهديدات تحتاج انتباه</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المصادقة الثنائية</CardTitle>
            <Smartphone className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {settings.twoFactorEnabled ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{settings.twoFactorEnabled ? "مفعلة" : "غير مفعلة"}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          <TabsTrigger value="sessions">الجلسات</TabsTrigger>
          <TabsTrigger value="audit">سجل التدقيق</TabsTrigger>
          <TabsTrigger value="threats">التهديدات</TabsTrigger>
          <TabsTrigger value="access">التحكم في الوصول</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  إعدادات كلمة المرور
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>الحد الأدنى لطول كلمة المرور</Label>
                  <Input
                    type="number"
                    value={settings.passwordPolicy.minLength}
                    onChange={(e) =>
                      updateSettings({
                        passwordPolicy: { ...settings.passwordPolicy, minLength: Number.parseInt(e.target.value) },
                      })
                    }
                    className="w-20"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>يتطلب أحرف كبيرة</Label>
                  <Switch
                    checked={settings.passwordPolicy.requireUppercase}
                    onCheckedChange={(checked) =>
                      updateSettings({
                        passwordPolicy: { ...settings.passwordPolicy, requireUppercase: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>يتطلب أرقام</Label>
                  <Switch
                    checked={settings.passwordPolicy.requireNumbers}
                    onCheckedChange={(checked) =>
                      updateSettings({
                        passwordPolicy: { ...settings.passwordPolicy, requireNumbers: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>يتطلب رموز خاصة</Label>
                  <Switch
                    checked={settings.passwordPolicy.requireSymbols}
                    onCheckedChange={(checked) =>
                      updateSettings({
                        passwordPolicy: { ...settings.passwordPolicy, requireSymbols: checked },
                      })
                    }
                  />
                </div>
                <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                  <DialogTrigger asChild>
                    <Button className="w-full">تغيير كلمة المرور</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>تغيير كلمة المرور</DialogTitle>
                      <DialogDescription>أدخل كلمة المرور الحالية والجديدة</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="current-password">كلمة المرور الحالية</Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={changePassword} disabled={saving}>
                        {saving ? "جاري التحديث..." : "تحديث"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="h-5 w-5 mr-2" />
                  المصادقة الثنائية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>حالة المصادقة الثنائية</Label>
                  <Badge
                    className={settings.twoFactorEnabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {settings.twoFactorEnabled ? "مفعلة" : "غير مفعلة"}
                  </Badge>
                </div>
                {!settings.twoFactorEnabled ? (
                  <Button onClick={setup2FA} className="w-full">
                    تفعيل المصادقة الثنائية
                  </Button>
                ) : (
                  <Button
                    onClick={() => updateSettings({ twoFactorEnabled: false })}
                    variant="destructive"
                    className="w-full"
                  >
                    إلغاء تفعيل المصادقة الثنائية
                  </Button>
                )}

                <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>إعداد المصادقة الثنائية</DialogTitle>
                      <DialogDescription>امسح رمز QR باستخدام تطبيق المصادقة</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <span className="text-sm text-gray-500">QR Code</span>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="2fa-code">أدخل رمز التحقق</Label>
                        <Input
                          id="2fa-code"
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value)}
                          placeholder="123456"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShow2FADialog(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={verify2FA} disabled={saving}>
                        {saving ? "جاري التحقق..." : "تحقق وتفعيل"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                القائمة البيضاء لعناوين IP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newIpAddress}
                  onChange={(e) => setNewIpAddress(e.target.value)}
                  placeholder="192.168.1.100"
                />
                <Button onClick={addToWhitelist}>إضافة</Button>
              </div>
              <div className="space-y-2">
                {settings.ipWhitelist.map((ip) => (
                  <div key={ip} className="flex items-center justify-between p-2 border rounded">
                    <span>{ip}</span>
                    <Button size="sm" variant="destructive" onClick={() => removeFromWhitelist(ip)}>
                      حذف
                    </Button>
                  </div>
                ))}
                {settings.ipWhitelist.length === 0 && (
                  <p className="text-sm text-muted-foreground">لا توجد عناوين IP في القائمة البيضاء</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                الجلسات النشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{session.user_email}</p>
                        <p className="text-sm text-muted-foreground">IP: {session.ip_address}</p>
                        <p className="text-xs text-muted-foreground">
                          آخر نشاط: {new Date(session.last_activity).toLocaleString("ar")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.is_current && <Badge className="bg-green-100 text-green-800">الجلسة الحالية</Badge>}
                      {!session.is_current && (
                        <Button size="sm" variant="destructive" onClick={() => terminateSession(session.id)}>
                          إنهاء
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                سجل التدقيق
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Activity className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{log.action.replace("security_", "")}</span>
                        <Badge className={getRiskLevelColor(log.risk_level)}>{log.risk_level}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        المستخدم: {log.user_email} • IP: {log.ip_address}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString("ar")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                التهديدات الأمنية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityThreats.map((threat) => (
                  <div key={threat.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        threat.severity === "critical" || threat.severity === "high"
                          ? "bg-red-100 text-red-600"
                          : threat.severity === "medium"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {getThreatIcon(threat.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{threat.description}</span>
                        <Badge className={getRiskLevelColor(threat.severity)}>{threat.severity}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        IP: {threat.ip_address} • {new Date(threat.detected_at).toLocaleString("ar")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          threat.status === "active"
                            ? "bg-red-100 text-red-800"
                            : threat.status === "investigating"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }
                      >
                        {threat.status === "active"
                          ? "نشط"
                          : threat.status === "investigating"
                            ? "قيد التحقيق"
                            : "محلول"}
                      </Badge>
                    </div>
                  </div>
                ))}
                {securityThreats.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">لا توجد تهديدات أمنية حالياً</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                التحكم في الوصول
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>مهلة انتهاء الجلسة (دقائق)</Label>
                  <Input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSettings({ sessionTimeout: Number.parseInt(e.target.value) })}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>محاولات تسجيل الدخول القصوى</Label>
                  <Input
                    type="number"
                    value={settings.maxLoginAttempts}
                    onChange={(e) => updateSettings({ maxLoginAttempts: Number.parseInt(e.target.value) })}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>مدة القفل (دقائق)</Label>
                  <Input
                    type="number"
                    value={settings.lockoutDuration}
                    onChange={(e) => updateSettings({ lockoutDuration: Number.parseInt(e.target.value) })}
                    className="w-24"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>تنبيهات الأمان</Label>
                  <Switch
                    checked={settings.securityNotifications}
                    onCheckedChange={(checked) => updateSettings({ securityNotifications: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
