// فصل إحصائيات البطل إلى مكون منفصل
"use client"
import { motion } from "framer-motion"
import { Users, CheckCircle, Zap, type LucideIcon } from "lucide-react"

interface StatCardProps {
  icon: LucideIcon
  value: string
  label: string
  color: string
  delay?: number
}

function StatCard({ icon: Icon, value, label, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      className="text-center p-4 sm:p-6 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-lg"
      whileHover={{ scale: 1.05, y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
    >
      <div className="flex items-center justify-center mb-3">
        <Icon
          className={`w-6 h-6 mr-2 ${
            color === "emerald"
              ? "text-emerald-600"
              : color === "blue"
                ? "text-blue-600"
                : color === "purple"
                  ? "text-purple-600"
                  : "text-gray-600"
          }`}
        />
        <div
          className={`text-2xl sm:text-3xl font-bold ${
            color === "emerald"
              ? "text-emerald-600"
              : color === "blue"
                ? "text-blue-600"
                : color === "purple"
                  ? "text-purple-600"
                  : "text-gray-600"
          }`}
        >
          {value}
        </div>
      </div>
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
    </motion.div>
  )
}

interface HeroStatsProps {
  locale: string
}

export function HeroStats({ locale }: HeroStatsProps) {
  const stats = [
    {
      icon: Users,
      value: "10K+",
      label: locale === "ar" ? "عميل راضٍ" : "Happy Clients",
      color: "emerald",
      delay: 0.1,
    },
    {
      icon: CheckCircle,
      value: "99%",
      label: locale === "ar" ? "معدل النجاح" : "Success Rate",
      color: "blue",
      delay: 0.2,
    },
    {
      icon: Zap,
      value: "24/7",
      label: locale === "ar" ? "دعم فني" : "Support",
      color: "purple",
      delay: 0.3,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 py-6 lg:py-8">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}
