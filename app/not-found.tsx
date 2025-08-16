"use client"

import { Search, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NotFoundPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-blue-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">404</CardTitle>
          <CardDescription className="text-xl text-gray-600">الصفحة غير موجودة</CardDescription>
          <p className="text-gray-500 mt-2">عذراً، لا يمكننا العثور على الصفحة التي تبحث عنها</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => router.back()} variant="outline" className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة للخلف
            </Button>

            <Button asChild className="flex-1">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                الصفحة الرئيسية
              </Link>
            </Button>
          </div>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-3">هل تحتاج مساعدة؟</p>
            <div className="flex justify-center space-x-4 space-x-reverse">
              <Link href="/contact" className="text-blue-600 hover:text-blue-800 underline text-sm">
                تواصل معنا
              </Link>
              <Link href="/help" className="text-blue-600 hover:text-blue-800 underline text-sm">
                مركز المساعدة
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
