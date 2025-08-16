"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description: string
  icon: LucideIcon
  color: string
  bgColor: string
  trend?: string
  trendUp?: boolean
  loading?: boolean
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  bgColor,
  trend,
  trendUp,
  loading = false,
}: StatCardProps) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className={`p-2 rounded-lg ${bgColor}`}>
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-md transition-all duration-200 hover:scale-105">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${bgColor} shadow-sm`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <div className={`flex items-center text-xs font-medium ${trendUp ? "text-green-600" : "text-red-600"}`}>
              {trendUp ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {trend}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface QuickActionProps {
  title: string
  description: string
  icon: LucideIcon
  color: string
  href: string
  badge?: string
}

export function QuickAction({ title, description, icon: Icon, color, href, badge }: QuickActionProps) {
  return (
    <a
      href={href}
      className="flex items-center p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
    >
      <div className={`p-2 rounded-lg ${color} mr-4 group-hover:scale-110 transition-transform`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">
          {title}
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {badge && (
        <Badge variant="secondary" className="ml-2">
          {badge}
        </Badge>
      )}
    </a>
  )
}
