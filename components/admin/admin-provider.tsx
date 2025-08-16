"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { ThemeProvider } from "next-themes"

interface AdminContextType {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AdminContext.Provider value={{ sidebarOpen, setSidebarOpen }}>{children}</AdminContext.Provider>
    </ThemeProvider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
