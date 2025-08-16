"use client"

import { useCMS } from "@/lib/store"

// Placeholder hooks للحفاظ على التوافق مع الملفات الموجودة
export const useAppDispatch = () => {
  console.warn("useAppDispatch is deprecated. Use useCMS store instead.")
  return () => {}
}

export const useAppSelector = (selector: any) => {
  console.warn("useAppSelector is deprecated. Use useCMS store instead.")
  const store = useCMS()

  // محاولة تحويل selector إلى بيانات من Zustand store
  try {
    return selector({
      auth: { user: null, isAuthenticated: false },
      ui: { sidebarOpen: false, theme: "light" },
      users: { list: [], loading: false },
      content: store.content,
      analytics: { data: null, loading: false },
    })
  } catch {
    return null
  }
}

// Hook للحصول على بيانات المستخدم الإداري
export const useAdminUser = () => {
  if (typeof window === "undefined") return null

  try {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin_token="))
      ?.split("=")[1]

    if (!token) return null

    // فك تشفير JWT بسيط (للعرض فقط)
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload
  } catch {
    return null
  }
}
