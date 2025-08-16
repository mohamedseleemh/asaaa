"use client"

import { Loader2 } from "lucide-react"

export default function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 mx-auto">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
          </div>
          <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-blue-200 rounded-full animate-pulse"></div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">جاري التحميل...</h2>
          <p className="text-gray-600">يرجى الانتظار قليلاً</p>
        </div>

        <div className="flex justify-center space-x-1 space-x-reverse">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
      </div>
    </div>
  )
}
