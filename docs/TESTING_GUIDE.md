# 🧪 دليل الاختبار - Testing Guide

## 📋 نظرة عامة

هذا الدليل يوضح كيفية اختبار جميع ميزات النظام والتأكد من عمله بشكل صحيح.

## 🔧 أدوات الاختبار

### 1. التحقق من صحة النظام
\`\`\`bash
# اختبار شامل للنظام
curl http://localhost:3000/api/system/validate

# فحص صحة النظام
curl http://localhost:3000/api/health
\`\`\`

### 2. اختبار قاعدة البيانات
\`\`\`bash
# اختبار الاتصال
curl http://localhost:3000/api/health | jq '.database'

# اختبار المخطط
curl http://localhost:3000/api/system/validate | jq '.results[] | select(.category=="Database")'
\`\`\`

### 3. اختبار الأداء
\`\`\`bash
# مراقبة الأداء
curl http://localhost:3000/api/monitoring/metrics

# اختبار سرعة الاستجابة
time curl http://localhost:3000/api/health
\`\`\`

## 🧪 اختبارات وظيفية

### 1. اختبار الصفحة الرئيسية
- [ ] تحميل الصفحة بنجاح
- [ ] عرض المحتوى بالعربية والإنجليزية
- [ ] عمل تبديل اللغة
- [ ] عمل الروابط والأزرار
- [ ] تحميل الصور والأيقونات

### 2. اختبار لوحة الإدارة
- [ ] تسجيل الدخول بكلمة المرور
- [ ] عرض لوحة التحكم
- [ ] تعديل المحتوى
- [ ] حفظ التغييرات
- [ ] عرض الإحصائيات

### 3. اختبار نظام التقييمات
- [ ] إضافة تقييم جديد
- [ ] عرض التقييمات
- [ ] إشراف على التقييمات
- [ ] حذف التقييمات المرفوضة

### 4. اختبار إمكانية الوصول
- [ ] التنقل بلوحة المفاتيح
- [ ] عمل قارئ الشاشة
- [ ] تباين الألوان
- [ ] حجم الخط القابل للتعديل

## 📱 اختبار التجاوب

### الأجهزة المحمولة (320px - 768px)
- [ ] عرض القائمة المحمولة
- [ ] تكيف المحتوى مع الشاشة الصغيرة
- [ ] عمل اللمس والتمرير
- [ ] سرعة التحميل

### الأجهزة اللوحية (768px - 1024px)
- [ ] تخطيط متوسط الحجم
- [ ] عمل التفاعلات اللمسية
- [ ] عرض المحتوى بشكل مناسب

### أجهزة سطح المكتب (1024px+)
- [ ] التخطيط الكامل
- [ ] عمل التأثيرات والرسوم المتحركة
- [ ] التفاعل بالماوس

## 🔒 اختبار الأمان

### 1. اختبار المصادقة
\`\`\`bash
# محاولة الوصول بدون مصادقة
curl http://localhost:3000/admin

# اختبار كلمة مرور خاطئة
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"wrong"}'
\`\`\`

### 2. اختبار Rate Limiting
\`\`\`bash
# إرسال طلبات متعددة سريعة
for i in {1..10}; do
  curl http://localhost:3000/api/reviews -X POST &
done
\`\`\`

### 3. اختبار الحماية من XSS
- [ ] إدخال نصوص ضارة في النماذج
- [ ] التحقق من تنظيف المدخلات
- [ ] اختبار حقول التعليقات

## ⚡ اختبار الأداء

### 1. سرعة التحميل
\`\`\`bash
# قياس وقت التحميل
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/

# اختبار الضغط
ab -n 100 -c 10 http://localhost:3000/
\`\`\`

### 2. اختبار التخزين المؤقت
\`\`\`bash
# اختبار cache headers
curl -I http://localhost:3000/api/analytics

# اختبار cache hit rate
curl http://localhost:3000/api/system/validate | jq '.results[] | select(.test=="Cache Hit Rate")'
\`\`\`

## 🌐 اختبار SEO

### 1. Meta Tags
- [ ] وجود title مناسب
- [ ] وجود description
- [ ] Open Graph tags
- [ ] Twitter Cards

### 2. البيانات المنظمة
\`\`\`bash
# اختبار Schema.org
curl http://localhost:3000/ | grep -o 'application/ld+json[^>]*>[^<]*'
\`\`\`

### 3. Sitemap و Robots
\`\`\`bash
# اختبار sitemap
curl http://localhost:3000/sitemap.xml

# اختبار robots.txt
curl http://localhost:3000/robots.txt
\`\`\`

## 🔍 اختبار المراقبة

### 1. مراقبة الأخطاء
\`\`\`bash
# عرض سجل الأخطاء
curl http://localhost:3000/api/monitoring/errors

# اختبار التنبيهات
curl http://localhost:3000/api/monitoring/alerts
\`\`\`

### 2. مراقبة الأداء
\`\`\`bash
# عرض مقاييس الأداء
curl http://localhost:3000/api/monitoring/metrics

# اختبار Web Vitals
curl http://localhost:3000/api/monitoring/vitals
\`\`\`

## 📊 تقرير الاختبار

### قالب التقرير
\`\`\`markdown
# تقرير الاختبار - [التاريخ]

## النتائج العامة
- ✅ الاختبارات الناجحة: X/Y
- ❌ الاختبارات الفاشلة: Z
- ⚠️ التحذيرات: W

## تفاصيل الاختبارات
### الوظائف الأساسية
- [x] الصفحة الرئيسية
- [x] لوحة الإدارة
- [ ] نظام التقييمات (مشكلة في X)

### الأداء
- متوسط وقت الاستجابة: Xms
- نقاط الأداء: Y/100
- معدل نجاح التخزين المؤقت: Z%

### الأمان
- جميع اختبارات الأمان ناجحة ✅
- لا توجد ثغرات مكتشفة

## التوصيات
1. إصلاح المشكلة في نظام التقييمات
2. تحسين وقت الاستجابة
3. مراقبة مستمرة للأداء
\`\`\`

## 🚀 الاختبار التلقائي

### إعداد CI/CD
\`\`\`yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
      - name: Health check
        run: curl http://localhost:3000/api/health
\`\`\`

## 📋 قائمة التحقق النهائية

### قبل النشر
- [ ] جميع الاختبارات الوظيفية تمر
- [ ] اختبارات الأمان ناجحة
- [ ] الأداء ضمن المعايير المقبولة
- [ ] إمكانية الوصول مكتملة
- [ ] SEO محسن
- [ ] المراقبة تعمل بشكل صحيح

### بعد النشر
- [ ] مراقبة الأداء لمدة 24 ساعة
- [ ] التحقق من عدم وجود أخطاء
- [ ] اختبار جميع الميزات في الإنتاج
- [ ] جمع ملاحظات المستخدمين

---

**ملاحظة**: يجب تشغيل هذه الاختبارات بانتظام للتأكد من استمرار عمل النظام بشكل صحيح.
