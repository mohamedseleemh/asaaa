"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MobileSidebar } from "./mobile-sidebar"
import { LogOut, User, Bell, Settings, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function MobileTopbar() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      localStorage.removeItem("admin_token")
      await fetch("/api/gate/logout", { method: "POST" })
      router.push("/admin")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 md:hidden">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left side - Menu and Title */}
        <div className="flex items-center gap-3">
          <MobileSidebar />
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">لوحة التحكم</h1>
          </div>
        </div>

        {/* Right side - Notifications and User Menu */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500 hover:bg-red-600">3</Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2 border-b">
                <p className="text-sm font-medium">مدير النظام</p>
                <p className="text-xs text-muted-foreground">admin@kyctrust.com</p>
              </div>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                الملف الشخصي
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                التفضيلات
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
