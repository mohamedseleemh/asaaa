-- v6_seed_data.sql
-- البيانات الأولية للمشروع

BEGIN;

-- إدراج المحتوى الافتراضي إذا لم يكن موجوداً
DO $$
DECLARE
    content_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM settings WHERE key = 'published_content') INTO content_exists;
    
    IF NOT content_exists THEN
        PERFORM set_setting('published_content', '{
            "ar": {
                "site": {
                    "name": "KYCtrust",
                    "description": "منصة متخصصة في الحسابات البنكية الإلكترونية والخدمات المالية الآمنة",
                    "phone": "+20-106-245-3344",
                    "tagline": "شريكك الموثوق في العالم الرقمي",
                    "logoSrc": "/images/brand/novapay-logo.png"
                },
                "hero": {
                    "title": "KYCtrust",
                    "subtitle": "منصة متكاملة للخدمات المالية الرقمية",
                    "description": "احصل على أفضل الحسابات البنكية الإلكترونية والمحافظ الرقمية بأمان وسرعة",
                    "cta": "ابدأ الآن",
                    "secondary": "تصفح الخدمات",
                    "stats": [
                        {"number": "1000+", "label": "عميل راضي"},
                        {"number": "24/7", "label": "دعم فني"},
                        {"number": "99.9%", "label": "معدل النجاح"},
                        {"number": "15+", "label": "خدمة"}
                    ]
                },
                "services": [
                    {
                        "name": "Payoneer",
                        "price": "$30",
                        "category": "حسابات بنكية",
                        "icon": "💳",
                        "iconImage": "/images/logos/payoneer.png",
                        "popular": true,
                        "active": true,
                        "sort": 1,
                        "description": "حساب بنكي عالمي موثوق لاستقبال المدفوعات الدولية"
                    },
                    {
                        "name": "Wise",
                        "price": "$30",
                        "category": "حسابات بنكية",
                        "icon": "🏦",
                        "iconImage": "/images/logos/wise.png",
                        "popular": true,
                        "active": true,
                        "sort": 2,
                        "description": "حساب متعدد العملات مع تحويلات دولية بأسعار حقيقية"
                    },
                    {
                        "name": "Skrill",
                        "price": "$20",
                        "category": "محافظ إلكترونية",
                        "icon": "💰",
                        "iconImage": "/images/logos/skrill.png",
                        "active": true,
                        "sort": 3,
                        "description": "محفظة إلكترونية سريعة وآمنة للمدفوعات الرقمية"
                    },
                    {
                        "name": "PayPal",
                        "price": "$15",
                        "category": "محافظ إلكترونية",
                        "icon": "💙",
                        "iconImage": "/images/logos/paypal.png",
                        "popular": true,
                        "active": true,
                        "sort": 4,
                        "description": "المحفظة الإلكترونية الأكثر شهرة وقبولاً عالمياً"
                    }
                ],
                "payments": [
                    {"label": "فودافون كاش", "value": "01062453344", "icon": "📱", "color": "red"},
                    {"label": "USDT TRC20", "value": "TFUt8GRpk2R8Wv3FvoCiSUghRBQo4HrmQK", "icon": "₿", "color": "green"}
                ],
                "features": [
                    {"title": "خدمة سريعة", "desc": "تسليم خلال 24-48 ساعة", "icon": "clock"},
                    {"title": "أمان مضمون", "desc": "حماية كاملة لبياناتك", "icon": "shield"},
                    {"title": "دعم مستمر", "desc": "فريق دعم على مدار الساعة", "icon": "users"},
                    {"title": "أسعار تنافسية", "desc": "أفضل الأسعار في السوق", "icon": "award"}
                ],
                "faq": [
                    {"question": "كم تستغرق عملية إنشاء الحساب؟", "answer": "عادة من 24-48 ساعة حسب نوع الحساب والمتطلبات المطلوبة."},
                    {"question": "هل الخدمة آمنة ومضمونة؟", "answer": "نعم، نتبع أعلى معايير الأمان الدولية ونحافظ على خصوصية بياناتك بالكامل."},
                    {"question": "ما هي طرق الدفع المتاحة؟", "answer": "نقبل الدفع عبر فودافون كاش والعملات المشفرة مثل USDT."},
                    {"question": "هل يمكنني الحصول على دعم فني؟", "answer": "نعم، فريق الدعم الفني متاح 24/7 عبر واتساب للمساعدة في أي استفسار."}
                ],
                "contact": {
                    "title": "ابدأ معنا اليوم",
                    "subtitle": "فريق الدعم متاح 24/7 للإجابة على استفساراتك",
                    "whatsapp": "تواصل عبر واتساب",
                    "features": ["رد فوري", "استشارة مجانية", "ضمان الخدمة"]
                },
                "logos": [
                    {"name": "Payoneer", "src": "/images/logos/payoneer.png"},
                    {"name": "Wise", "src": "/images/logos/wise.png"},
                    {"name": "Skrill", "src": "/images/logos/skrill.png"},
                    {"name": "PayPal", "src": "/images/logos/paypal.png"},
                    {"name": "Neteller", "src": "/images/logos/neteller.png"},
                    {"name": "OKX", "src": "/images/logos/okx.png"}
                ],
                "testimonials": [
                    {"name": "أحمد محمد", "role": "رائد أعمال", "quote": "خدمة ممتازة وسرعة في التنفيذ. حصلت على حساب Payoneer في يوم واحد!"},
                    {"name": "فاطمة علي", "role": "مسوقة رقمية", "quote": "الدعم الفني رائع والأسعار تنافسية جداً. أنصح بالتعامل معهم."},
                    {"name": "محمد حسن", "role": "مطور مستقل", "quote": "أفضل مكان للحصول على الحسابات البنكية الإلكترونية بأمان."}
                ],
                "cta": {
                    "title": "جاهز لتبدأ الآن؟",
                    "subtitle": "ابدأ رحلتك المالية بثقة وسرعة",
                    "primaryText": "ابدأ الآن",
                    "secondaryText": "تواصل معنا"
                }
            },
            "en": {
                "site": {
                    "name": "KYCtrust",
                    "description": "Specialized platform for secure electronic banking accounts and financial services",
                    "phone": "+20-106-245-3344",
                    "tagline": "Your trusted partner in the digital world",
                    "logoSrc": "/images/brand/novapay-logo.png"
                },
                "hero": {
                    "title": "KYCtrust",
                    "subtitle": "Complete Digital Financial Services Platform",
                    "description": "Get the best electronic banking accounts and digital wallets with security and speed",
                    "cta": "Get Started",
                    "secondary": "Explore Services",
                    "stats": [
                        {"number": "1000+", "label": "Happy Clients"},
                        {"number": "24/7", "label": "Support"},
                        {"number": "99.9%", "label": "Success Rate"},
                        {"number": "15+", "label": "Services"}
                    ]
                },
                "services": [
                    {
                        "name": "Payoneer",
                        "price": "$30",
                        "category": "Banking",
                        "icon": "💳",
                        "iconImage": "/images/logos/payoneer.png",
                        "popular": true,
                        "active": true,
                        "sort": 1,
                        "description": "Trusted global banking account for receiving international payments"
                    },
                    {
                        "name": "Wise",
                        "price": "$30",
                        "category": "Banking",
                        "icon": "🏦",
                        "iconImage": "/images/logos/wise.png",
                        "popular": true,
                        "active": true,
                        "sort": 2,
                        "description": "Multi-currency account with international transfers at real exchange rates"
                    },
                    {
                        "name": "Skrill",
                        "price": "$20",
                        "category": "E-Wallets",
                        "icon": "💰",
                        "iconImage": "/images/logos/skrill.png",
                        "active": true,
                        "sort": 3,
                        "description": "Fast and secure e-wallet for digital payments"
                    },
                    {
                        "name": "PayPal",
                        "price": "$15",
                        "category": "E-Wallets",
                        "icon": "💙",
                        "iconImage": "/images/logos/paypal.png",
                        "popular": true,
                        "active": true,
                        "sort": 4,
                        "description": "The most popular and globally accepted e-wallet"
                    }
                ],
                "payments": [
                    {"label": "Vodafone Cash", "value": "01062453344", "icon": "📱", "color": "red"},
                    {"label": "USDT TRC20", "value": "TFUt8GRpk2R8Wv3FvoCiSUghRBQo4HrmQK", "icon": "₿", "color": "green"}
                ],
                "features": [
                    {"title": "Fast Service", "desc": "Delivery within 24-48 hours", "icon": "clock"},
                    {"title": "Guaranteed Security", "desc": "Complete protection for your data", "icon": "shield"},
                    {"title": "Continuous Support", "desc": "24/7 support team", "icon": "users"},
                    {"title": "Competitive Prices", "desc": "Best prices in the market", "icon": "award"}
                ],
                "faq": [
                    {"question": "How long does account creation take?", "answer": "Usually 24-48 hours depending on account type and requirements."},
                    {"question": "Is the service safe and guaranteed?", "answer": "Yes, we follow the highest international security standards and maintain complete privacy of your data."},
                    {"question": "What payment methods are available?", "answer": "We accept payments via Vodafone Cash and cryptocurrencies like USDT."},
                    {"question": "Can I get technical support?", "answer": "Yes, our technical support team is available 24/7 via WhatsApp to help with any inquiry."}
                ],
                "contact": {
                    "title": "Get Started Today",
                    "subtitle": "Support team available 24/7 to answer your questions",
                    "whatsapp": "Contact via WhatsApp",
                    "features": ["Instant Reply", "Free Consultation", "Service Guarantee"]
                },
                "logos": [
                    {"name": "Payoneer", "src": "/images/logos/payoneer.png"},
                    {"name": "Wise", "src": "/images/logos/wise.png"},
                    {"name": "Skrill", "src": "/images/logos/skrill.png"},
                    {"name": "PayPal", "src": "/images/logos/paypal.png"},
                    {"name": "Neteller", "src": "/images/logos/neteller.png"},
                    {"name": "OKX", "src": "/images/logos/okx.png"}
                ],
                "testimonials": [
                    {"name": "Ahmed Mohamed", "role": "Entrepreneur", "quote": "Excellent service and fast execution. Got my Payoneer account in one day!"},
                    {"name": "Sarah Ali", "role": "Digital Marketer", "quote": "Great technical support and very competitive prices. Highly recommend them."},
                    {"name": "Mohamed Hassan", "role": "Freelance Developer", "quote": "Best place to get secure electronic banking accounts safely."}
                ],
                "cta": {
                    "title": "Ready to get started?",
                    "subtitle": "Start your financial journey with confidence and speed",
                    "primaryText": "Get Started",
                    "secondaryText": "Contact Us"
                }
            },
            "design": {
                "theme": "system",
                "palette": "violet-emerald",
                "anim": {
                    "enableReveal": true,
                    "intensity": 1,
                    "parallax": 14
                }
            }
        }'::jsonb, 'المحتوى الافتراضي للموقع');
    END IF;
END $$;

-- إدراج مستخدم إداري افتراضي
SELECT create_user_with_password(
    'المدير العام',
    'admin@kyctrust.com',
    'KYCtrust2024!@#',
    'admin'
) WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@kyctrust.com');

-- إدراج بيانات تحليلية تجريبية للأيام الـ 30 الماضية
INSERT INTO analytics_daily (day, visitors, leads, orders, conversion_rate)
SELECT 
    CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 29),
    (300 + random() * 500)::int,
    (20 + random() * 40)::int,
    (8 + random() * 20)::int,
    (1.5 + random() * 3.5)::numeric(5,2)
ON CONFLICT (day) DO NOTHING;

-- إدراج تقييمات تجريبية
INSERT INTO reviews (name, rating, comment, status, created_at) VALUES
('أحمد محمد', 5, 'خدمة ممتازة وسرعة في التنفيذ. حصلت على حساب Payoneer في يوم واحد!', 'approved', NOW() - INTERVAL '5 days'),
('فاطمة علي', 5, 'الدعم الفني رائع والأسعار تنافسية جداً. أنصح بالتعامل معهم.', 'approved', NOW() - INTERVAL '3 days'),
('محمد حسن', 4, 'أفضل مكان للحصول على الحسابات البنكية الإلكترونية بأمان.', 'approved', NOW() - INTERVAL '1 day'),
('سارة أحمد', 5, 'تجربة رائعة وخدمة عملاء متميزة. شكراً لكم!', 'approved', NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- تعيين علامة التثبيت
PERFORM set_setting('installation_completed', jsonb_build_object(
    'completed', true,
    'version', '1.0.0',
    'installed_at', NOW(),
    'database_version', '6'
), 'علامة اكتمال التثبيت');

-- تعيين إعدادات النظام الأساسية
PERFORM set_setting('system_config', jsonb_build_object(
    'maintenance_mode', false,
    'registration_enabled', false,
    'reviews_moderation', true,
    'chat_enabled', true,
    'analytics_enabled', true
), 'إعدادات النظام الأساسية');

COMMIT;
