"use client"

import { useCMS } from "@/lib/store"

// Re-export hooks للحفاظ على التوافق
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
      analytics: store.getAnalytics(),
    })
  } catch {
    return null
  }
}

// Types للتوافق
export type RootState = {
  auth: { user: any; isAuthenticated: boolean }
  ui: { sidebarOpen: boolean; theme: string }
  users: { list: any[]; loading: boolean }
  content: any
  analytics: any
}

export type AppDispatch = () => void

// Store placeholder
export const store = {
  getState: () => ({}),
  dispatch: () => {},
  subscribe: () => () => {},
}
