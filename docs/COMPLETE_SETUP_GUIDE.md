# KYCtrust - دليل الإعداد الكامل

## 📋 المتطلبات الأساسية

- Node.js 18+ 
- npm أو yarn
- حساب Supabase مجاني
- محرر نصوص (VS Code مُوصى به)

## 🚀 خطوات الإعداد

### 1. إعداد المشروع

\`\`\`bash
# استنساخ المشروع
git clone <repository-url>
cd kyctrust-landing

# تثبيت التبعيات
npm install

# نسخ ملف البيئة
cp .env.example .env.local
\`\`\`

### 2. إعداد Supabase

1. **إنشاء مشروع جديد**
   - اذهب إلى [supabase.com](https://supabase.com)
   - أنشئ حساب جديد أو سجل دخول
   - أنشئ مشروع جديد

2. **تشغيل SQL Schema**
   - اذهب إلى SQL Editor في لوحة تحكم Supabase
   - انسخ محتوى `scripts/sql/supabase_schema.sql`
   - شغل الكود

3. **الحصول على المفاتيح**
   - اذهب إلى Settings > API
   - انسخ Project URL
   - انسخ anon public key
   - انسخ service_role key (سري!)

### 3. تكوين متغيرات البيئة

\`\`\`env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### 4. تشغيل المشروع

\`\`\`bash
# تشغيل الخادم المحلي
npm run dev

# فتح المتصفح
open http://localhost:3000
\`\`\`

## 🔐 الوصول للوحة الإدارة

- **الرابط**: http://localhost:3000/admin
- **كلمة المرور الافتراضية**: `admin123123`
- **⚠️ مهم**: غير كلمة المرور فوراً!

## 📊 ميزات المشروع

### ✅ المكتملة
- [x] صفحة رئيسية ثنائية اللغة (عربي/إنجليزي)
- [x] لوحة إدارة كاملة
- [x] نظام التقييمات مع الإشراف
- [x] تتبع الإحصائيات الأساسية
- [x] تصميم متجاوب
- [x] تحسين محركات البحث
- [x] ويدجت الدردشة
- [x] تكامل واتساب
- [x] نظام الألوان القابل للتخصيص
- [x] الرسوم المتحركة والتأثيرات

### 🎨 التخصيص

#### تغيير الألوان
\`\`\`typescript
// في lib/palette.ts
export function paletteGrad(palette: Palette) {
  switch (palette) {
    case 'violet-emerald':
      return { range: 'from-violet-600 to-emerald-600' }
    // أضف ألوان جديدة هنا
  }
}
\`\`\`

#### تعديل المحتوى
- استخدم لوحة الإدارة `/admin`
- أو عدل `lib/default-content.ts` مباشرة

#### إضافة خدمات جديدة
\`\`\`typescript
// في لوحة الإدارة أو default-content.ts
{
  name: "خدمة جديدة",
  price: "$25",
  category: "فئة جديدة",
  icon: "💎",
  description: "وصف الخدمة",
  active: true,
  sort: 5
}
\`\`\`

## 🚀 النشر

### Vercel (مُوصى به)

\`\`\`bash
# تثبيت Vercel CLI
npm i -g vercel

# نشر المشروع
vercel

# إضافة متغيرات البيئة في لوحة تحكم Vercel
\`\`\`

### Netlify

\`\`\`bash
# بناء المشروع
npm run build

# رفع مجلد .next إلى Netlify
\`\`\`

## 🔧 استكشاف الأخطاء

### خطأ قاعدة البيانات
\`\`\`
Could not find table 'analytics_events'
\`\`\`
**الحل**: تأكد من تشغيل SQL schema كاملاً

### خطأ المصادقة
\`\`\`
Unauthorized access
\`\`\`
**الحل**: تحقق من cookies وكلمة مرور الإدارة

### خطأ البيئة
\`\`\`
Missing Supabase environment variables
\`\`\`
**الحل**: تأكد من ملف `.env.local` وصحة المفاتيح

## 📱 الميزات المتقدمة

### تفعيل Real-time Updates
- تحديثات فورية للمحتوى
- إشعارات التقييمات الجديدة
- مزامنة البيانات عبر المتصفحات

### نظام التحليلات
- تتبع الزيارات
- إحصائيات الصفحات
- تقارير الأداء

### الأمان
- Row Level Security (RLS)
- تشفير البيانات الحساسة
- حماية من الهجمات
- Rate limiting

## 🎯 الخطوات التالية

1. **غير كلمة مرور الإدارة**
2. **أضف محتوى حقيقي**
3. **اختبر جميع الميزات**
4. **انشر على الإنتاج**
5. **راقب الأداء**

## 📞 الدعم

للمساعدة والاستفسارات:
- 📧 البريد الإلكتروني: info@kyctrust.com
- 📱 واتساب: +20-106-245-3344
- 🌐 الموقع: https://kyctrust.com

---

**🎉 مبروك! مشروعك جاهز للعمل**
\`\`\`

## ✅ **المشروع مكتمل بالكامل!**

### 📁 **الملفات المضافة:**
- ✅ جميع مكونات الواجهة الأمامية
- ✅ نظام إدارة المحتوى
- ✅ نظام التقييمات
- ✅ تكامل قاعدة البيانات
- ✅ APIs كاملة
- ✅ المصادقة والأمان
- ✅ الرسوم المتحركة
- ✅ ويدجت الدردشة
- ✅ دليل الإعداد الكامل

### 🚀 **للبدء:**

1. **تشغيل SQL Schema**: `scripts/sql/supabase_schema.sql`
2. **إضافة متغيرات البيئة**: من `.env.example`
3. **تشغيل المشروع**: `npm run dev`
4. **الدخول للإدارة**: `/admin` بكلمة مرور `admin123123`

**المشروع جاهز للاستخدام والنشر! 🎉**
