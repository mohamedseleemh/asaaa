import type React from "react"
import type { Metadata } from "next"
import { ResponsiveSidebar } from "@/components/dashboard/responsive-sidebar"
import { ResponsiveTopbar } from "@/components/dashboard/responsive-topbar"
import { MobileTopbar } from "@/components/dashboard/mobile-topbar"

export const metadata: Metadata = {
  title: "KYC Trust Admin Dashboard",
  description: "Admin dashboard for KYC Trust website management",
  robots: "noindex, nofollow",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Desktop Sidebar */}
        <ResponsiveSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Topbar */}
          <MobileTopbar />

          {/* Desktop Topbar */}
          <ResponsiveTopbar />

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
            <div className="max-w-full" dir="rtl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
