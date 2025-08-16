"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  Users,
  Home,
  Shield,
  Menu,
  X,
} from "lucide-react"

const navigation = [
  { name: "لوحة التحكم", href: "/dashboard", icon: LayoutDashboard },
  { name: "المحتوى", href: "/dashboard/content", icon: FileText },
  { name: "المراجعات", href: "/dashboard/reviews", icon: MessageSquare },
  { name: "التحليلات", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "المستخدمون", href: "/dashboard/users", icon: Users },
  { name: "الأمان", href: "/dashboard/security", icon: Shield },
  { name: "الإعدادات", href: "/dashboard/settings", icon: Settings },
]

export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">فتح القائمة</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">KYCtrust</span>
                  <p className="text-xs text-muted-foreground">لوحة الإدارة</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation",
                      isActive
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white active:bg-gray-200 dark:active:bg-gray-600",
                    )}
                  >
                    <item.icon className="ml-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-lg transition-all duration-200 touch-manipulation active:bg-gray-200 dark:active:bg-gray-600"
              >
                <Home className="ml-3 h-5 w-5" />
                عرض الموقع
              </Link>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-center text-muted-foreground">KYCtrust Admin v2.0</div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
