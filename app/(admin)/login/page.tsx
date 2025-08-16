"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/dashboard/login-form"
import { useAppDispatch, useAppSelector } from "@/lib/redux/store"
import { me } from "@/lib/redux/slices/auth"

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user, status } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // محاولة استرداد جلسة المستخدم
    dispatch(me())
  }, [dispatch])

  useEffect(() => {
    // إذا كان المستخدم مسجل الدخول بالفعل، انتقل إلى لوحة التحكم
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}
