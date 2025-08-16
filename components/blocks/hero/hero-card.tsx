// فصل بطاقة البطل إلى مكون منفصل
"use client"
import { motion } from "framer-motion"
import { Shield, CheckCircle, Zap, Award, Star, MessageCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface HeroCardProps {
  locale: string
}

export function HeroCard({ locale }: HeroCardProps) {
  return (
    <div className="relative max-w-md mx-auto lg:max-w-none">
      <motion.div
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-gray-700/50"
        whileHover={{ scale: 1.02, y: -5 }}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                  {locale === "ar" ? "تفعيل آمن" : "Secure Activation"}
                </h3>
                <p className="text-sm text-muted-foreground">{locale === "ar" ? "خدمة موثوقة" : "Trusted Service"}</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              {locale === "ar" ? "نشط" : "Active"}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{locale === "ar" ? "معدل النجاح" : "Success Rate"}</span>
              <span className="font-semibold text-emerald-600">99%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: "99%" }}
                transition={{ duration: 2, delay: 1 }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
              <Zap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-blue-600">24h</div>
              <div className="text-xs text-muted-foreground">{locale === "ar" ? "وقت التفعيل" : "Activation Time"}</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
              <Award className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-purple-600">100%</div>
              <div className="text-xs text-muted-foreground">{locale === "ar" ? "ضمان" : "Guarantee"}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        className="absolute -top-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full items-center justify-center shadow-lg hidden sm:flex"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <Star className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-current" />
      </motion.div>

      <motion.div
        className="absolute -bottom-4 -left-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full items-center justify-center shadow-lg hidden sm:flex"
        animate={{
          y: [0, 10, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <MessageCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
      </motion.div>
    </div>
  )
}
