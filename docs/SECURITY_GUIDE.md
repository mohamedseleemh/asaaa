# 🔒 دليل الأمان - Security Guide

## ⚠️ تحذير أمني مهم

**لا تشارك أبداً بيانات الاعتماد الحقيقية!** المفاتيح المشاركة في هذا المشروع تحتاج إلى إعادة تعيين فورية.

## 🛡️ الإجراءات الأمنية المطلوبة

### 1. إعادة تعيين جميع المفاتيح
- اذهب إلى لوحة تحكم Supabase
- أعد تعيين Service Role Key
- أعد تعيين Anon Key  
- غير كلمة مرور قاعدة البيانات

### 2. متغيرات البيئة الآمنة
\`\`\`bash
# استخدم مفاتيح جديدة فقط
NEXT_PUBLIC_SUPABASE_URL=https://your-new-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_new_service_key
\`\`\`

### 3. أفضل الممارسات الأمنية

#### أ) حماية المفاتيح
- احفظ المفاتيح في `.env.local` فقط
- أضف `.env.local` إلى `.gitignore`
- لا تشارك المفاتيح في الكود أو الرسائل

#### ب) Row Level Security (RLS)
\`\`\`sql
-- تم تفعيل RLS على جميع الجداول
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
\`\`\`

#### ج) Rate Limiting
- حماية من الإساءة والسبام
- حدود زمنية للطلبات
- تتبع IP addresses

#### د) تشفير البيانات الحساسة
- تشفير emails قبل التخزين
- استخدام hashing للبيانات الحساسة
- حماية كلمات المرور

### 4. مراقبة الأمان

#### أ) تسجيل الأحداث
- تتبع جميع محاولات الدخول
- تسجيل التغييرات المهمة
- مراقبة الأنشطة المشبوهة

#### ب) التحديثات الدورية
- تحديث المفاتيح دورياً
- مراجعة الصلاحيات
- فحص الثغرات الأمنية

### 5. إعدادات الإنتاج

#### أ) HTTPS فقط
\`\`\`javascript
// في الإنتاج، استخدم HTTPS فقط
const isProduction = process.env.NODE_ENV === 'production'
\`\`\`

#### ب) Cookies آمنة
\`\`\`javascript
response.cookies.set('session', token, {
  httpOnly: true,
  secure: true, // HTTPS فقط
  sameSite: 'strict'
})
\`\`\`

#### ج) Headers أمنية
\`\`\`javascript
// إضافة headers أمنية
'X-Frame-Options': 'DENY',
'X-Content-Type-Options': 'nosniff',
'Referrer-Policy': 'origin-when-cross-origin'
\`\`\`

## 🚨 في حالة تسريب البيانات

1. **أوقف الخدمة فوراً**
2. **غير جميع كلمات المرور والمفاتيح**
3. **راجع سجلات الوصول**
4. **أبلغ المستخدمين إذا لزم الأمر**
5. **حدث إجراءات الأمان**

## ✅ قائمة مراجعة الأمان

- [ ] تم تغيير جميع المفاتيح الافتراضية
- [ ] تم تفعيل RLS على جميع الجداول
- [ ] تم إعداد Rate Limiting
- [ ] تم تشفير البيانات الحساسة
- [ ] تم إعداد HTTPS في الإنتاج
- [ ] تم إعداد مراقبة الأمان
- [ ] تم اختبار جميع نقاط النهاية

**تذكر: الأمان مسؤولية مستمرة وليس إعداد لمرة واحدة!**
