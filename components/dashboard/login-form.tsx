"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Loader2 } from "lucide-react"
import { useAppDispatch } from "@/lib/redux/store"
import { login } from "@/lib/redux/slices/auth"

export function LoginForm() {
  const [email, setEmail] = useState("admin")
  const [password, setPassword] = useState("admin123123")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const dispatch = useAppDispatch()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await dispatch(login({ email, password })).unwrap()
      if (result) {
        router.push("/dashboard")
      }
    } catch (err: any) {
      setError(err.message || "فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">تسجيل الدخول</CardTitle>
        <CardDescription className="text-center">أدخل بيانات الاعتماد الخاصة بك للوصول إلى لوحة التحكم</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">اسم المستخدم / البريد الإلكتروني</Label>
            <Input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="أدخل اسم المستخدم أو البريد الإلكتروني"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="أدخل كلمة المرور"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <p className="text-xs text-center text-muted-foreground mt-4">بيانات الدخول الافتراضية: admin / admin123123</p>
      </CardFooter>
    </Card>
  )
}
