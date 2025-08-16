"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAdmin } from "./admin-provider"
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  BarChart3,
  Palette,
  Globe,
  MessageSquare,
  Shield,
  X,
  Database,
  Bot,
  Activity,
  Star,
} from "lucide-react"

const navigation = [
  { name: "لوحة التحكم", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "إدارة المحتوى", href: "/admin/content", icon: FileText },
  { name: "المراجعات", href: "/admin/reviews", icon: Star },
  { name: "تصميم الموقع", href: "/admin/design", icon: Palette },
  { name: "إدارة الأقسام", href: "/admin/blocks", icon: Globe },
  { name: "المستخدمين", href: "/admin/users", icon: Users },
  { name: "التحليلات", href: "/admin/analytics", icon: BarChart3 },
  { name: "الذكاء الاصطناعي", href: "/admin/ai", icon: Bot },
  { name: "المراقبة", href: "/admin/monitoring", icon: Activity },
  { name: "قاعدة البيانات", href: "/admin/database", icon: Database },
  { name: "الرسائل", href: "/admin/messages", icon: MessageSquare },
  { name: "الأمان", href: "/admin/security", icon: Shield },
  { name: "الإعدادات", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useAdmin()

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">KYC Trust</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
                  )}
                >
                  <item.icon
                    className={cn(
                      "ml-3 h-5 w-5 flex-shrink-0",
                      isActive
                        ? "text-emerald-500 dark:text-emerald-300"
                        : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300",
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <div>الإصدار 2.0.0</div>
            <div className="mt-1">© 2024 KYC Trust</div>
          </div>
        </div>
      </div>
    </>
  )
}
