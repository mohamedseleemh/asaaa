-- v4_content_management.sql
-- نظام إدارة المحتوى

BEGIN;

-- جدول لقطات المحتوى
CREATE TABLE IF NOT EXISTS content_snapshots (
    id SERIAL PRIMARY KEY,
    locale VARCHAR(10) NOT NULL CHECK (locale IN ('ar', 'en')),
    content JSONB NOT NULL,
    version INTEGER DEFAULT 1,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE
);

-- جدول سجل نشر المحتوى
CREATE TABLE IF NOT EXISTS content_publish_history (
    id SERIAL PRIMARY KEY,
    snapshot_id INTEGER REFERENCES content_snapshots(id) ON DELETE CASCADE,
    published_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    locale VARCHAR(10) NOT NULL CHECK (locale IN ('ar', 'en')),
    version INTEGER NOT NULL,
    notes TEXT
);

-- دالة لإنشاء لقطة محتوى جديدة
CREATE OR REPLACE FUNCTION create_content_snapshot(
    p_locale VARCHAR(10),
    p_content JSONB,
    p_user_id INTEGER,
    p_publish BOOLEAN DEFAULT false
) RETURNS INTEGER AS $$
DECLARE
    v_last_version INTEGER;
    v_new_id INTEGER;
BEGIN
    -- الحصول على آخر إصدار
    SELECT COALESCE(MAX(version), 0) INTO v_last_version
    FROM content_snapshots
    WHERE locale = p_locale;
    
    -- إنشاء لقطة جديدة
    INSERT INTO content_snapshots (
        locale,
        content,
        version,
        created_by,
        is_published,
        published_at
    ) VALUES (
        p_locale,
        p_content,
        v_last_version + 1,
        p_user_id,
        p_publish,
        CASE WHEN p_publish THEN NOW() ELSE NULL END
    ) RETURNING id INTO v_new_id;
    
    -- إذا كان النشر مطلوباً، قم بتحديث سجل النشر
    IF p_publish THEN
        INSERT INTO content_publish_history (
            snapshot_id,
            published_by,
            locale,
            version,
            notes
        ) VALUES (
            v_new_id,
            p_user_id,
            p_locale,
            v_last_version + 1,
            'نشر تلقائي عند الإنشاء'
        );
        
        -- تحديث الإعدادات بالمحتوى المنشور
        PERFORM update_published_content();
    END IF;
    
    RETURN v_new_id;
END;
$$ LANGUAGE plpgsql;

-- دالة لنشر لقطة محتوى
CREATE OR REPLACE FUNCTION publish_content_snapshot(
    p_snapshot_id INTEGER,
    p_user_id INTEGER,
    p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_locale VARCHAR(10);
    v_version INTEGER;
BEGIN
    -- الحصول على معلومات اللقطة
    SELECT locale, version INTO v_locale, v_version
    FROM content_snapshots
    WHERE id = p_snapshot_id;
    
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- تحديث حالة النشر للقطة
    UPDATE content_snapshots
    SET is_published = true,
        published_at = NOW()
    WHERE id = p_snapshot_id;
    
    -- إلغاء نشر اللقطات الأخرى بنفس اللغة
    UPDATE content_snapshots
    SET is_published = false
    WHERE locale = v_locale
      AND id != p_snapshot_id
      AND is_published = true;
    
    -- إضافة سجل النشر
    INSERT INTO content_publish_history (
        snapshot_id,
        published_by,
        locale,
        version,
        notes
    ) VALUES (
        p_snapshot_id,
        p_user_id,
        v_locale,
        v_version,
        COALESCE(p_notes, 'نشر محتوى')
    );
    
    -- تحديث الإعدادات بالمحتوى المنشور
    PERFORM update_published_content();
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- دالة لتحديث المحتوى المنشور في الإعدادات
CREATE OR REPLACE FUNCTION update_published_content() RETURNS VOID AS $$
DECLARE
    v_ar_content JSONB;
    v_en_content JSONB;
    v_design JSONB;
BEGIN
    -- الحصول على المحتوى العربي المنشور
    SELECT content INTO v_ar_content
    FROM content_snapshots
    WHERE locale = 'ar' AND is_published = true
    ORDER BY published_at DESC
    LIMIT 1;
    
    -- الحصول على المحتوى الإنجليزي المنشور
    SELECT content INTO v_en_content
    FROM content_snapshots
    WHERE locale = 'en' AND is_published = true
    ORDER BY published_at DESC
    LIMIT 1;
    
    -- الحصول على تصميم الموقع
    SELECT value INTO v_design
    FROM settings
    WHERE key = 'site_design';
    
    -- تحديث الإعدادات
    UPDATE settings
    SET value = jsonb_build_object(
        'ar', COALESCE(v_ar_content, '{}'::jsonb),
        'en', COALESCE(v_en_content, '{}'::jsonb),
        'design', COALESCE(v_design, '{}'::jsonb)
    )
    WHERE key = 'published_content';
    
    -- إذا لم يكن الإعداد موجوداً، قم بإنشائه
    IF NOT FOUND THEN
        INSERT INTO settings (key, value, description)
        VALUES (
            'published_content',
            jsonb_build_object(
                'ar', COALESCE(v_ar_content, '{}'::jsonb),
                'en', COALESCE(v_en_content, '{}'::jsonb),
                'design', COALESCE(v_design, '{}'::jsonb)
            ),
            'المحتوى المنشور حالياً'
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_content_snapshots_locale ON content_snapshots(locale);
CREATE INDEX IF NOT EXISTS idx_content_snapshots_published ON content_snapshots(is_published);
CREATE INDEX IF NOT EXISTS idx_content_snapshots_version ON content_snapshots(version);
CREATE INDEX IF NOT EXISTS idx_content_publish_history_snapshot_id ON content_publish_history(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_content_publish_history_locale ON content_publish_history(locale);

-- إضافة محتوى افتراضي إذا لم يكن موجوداً
DO $$
DECLARE
    v_ar_exists BOOLEAN;
    v_en_exists BOOLEAN;
    v_admin_id INTEGER;
BEGIN
    -- التحقق من وجود محتوى منشور
    SELECT EXISTS (
        SELECT 1 FROM content_snapshots WHERE locale = 'ar' AND is_published = true
    ) INTO v_ar_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM content_snapshots WHERE locale = 'en' AND is_published = true
    ) INTO v_en_exists;
    
    -- الحصول على معرف المستخدم المسؤول
    SELECT id INTO v_admin_id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1;
    
    -- إذا لم يكن هناك مستخدم مسؤول، قم بإنشاء واحد
    IF v_admin_id IS NULL THEN
        INSERT INTO users (name, email, role, active)
        VALUES ('المدير العام', 'admin@kyctrust.com', 'admin', true)
        RETURNING id INTO v_admin_id;
    END IF;
    
    -- إنشاء محتوى افتراضي للغة العربية إذا لم يكن موجوداً
    IF NOT v_ar_exists THEN
        PERFORM create_content_snapshot(
            'ar',
            '{"site":{"name":"KYCtrust","description":"خدمة متخصصة في الحسابات البنكية الإلكترونية والخدمات المالية الآمنة","phone":"+20-106-245-3344","tagline":"شريكك الموثوق في العالم الرقمي"},"hero":{"title":"KYCtrust","subtitle":"منصة متكاملة للخدمات المالية الرقمية","description":"احصل على أفضل الحسابات البنكية الإلكترونية والمحافظ الرقمية بأمان وسرعة لا مثيل لها","cta":"ابدأ رحلتك المالية","secondary":"تصفح خدماتنا","stats":[{"number":"1000+","label":"عميل راضي"},{"number":"24/7","label":"دعم فني"},{"number":"99.9%","label":"معدل النجاح"},{"number":"15+","label":"خدمة متاحة"}]},"services":[{"name":"Payoneer","price":"$30","category":"حسابات بنكية","icon":"💳","popular":true,"active":true,"sort":1,"description":"حساب بنكي عالمي موثوق"},{"name":"Wise","price":"$30","category":"حسابات بنكية","icon":"🏦","popular":true,"active":true,"sort":2,"description":"تحويلات دولية بأقل رسوم"},{"name":"Skrill","price":"$20","category":"محافظ إلكترونية","icon":"💰","active":true,"sort":3,"description":"محفظة إلكترونية آمنة وسريعة"},{"name":"Neteller","price":"$20","category":"محافظ إلكترونية","icon":"💸","active":true,"sort":4,"description":"مدفوعات فورية عالميا"},{"name":"PayPal","price":"$15","category":"محافظ إلكترونية","icon":"💙","popular":true,"active":true,"sort":12,"description":"الحل الأشهر للمدفوعات"}],"payments":[{"label":"فودافون كاش","value":"01062453344","icon":"📱","color":"red"},{"label":"USDT TRC20","value":"TFUt8GRpk2R8Wv3FvoCiSUghRBQo4HrmQK","icon":"₿","color":"green"}],"features":[{"title":"خدمة سريعة","desc":"تسليم خلال 24-48 ساعة","icon":"⚡"},{"title":"أمان مضمون","desc":"حماية كاملة لبياناتك","icon":"🔒"},{"title":"دعم مستمر","desc":"فريق دعم على مدار الساعة","icon":"🛎️"},{"title":"أسعار تنافسية","desc":"أفضل الأسعار في السوق","icon":"💰"}],"faq":[{"question":"كم تستغرق عملية إنشاء الحساب؟","answer":"عادة من 24-48 ساعة حسب نوع الحساب والمتطلبات. نحن نعمل بأقصى سرعة لضمان حصولك على حسابك في أسرع وقت ممكن."},{"question":"هل الخدمة آمنة ومضمونة؟","answer":"نعم تماماً، نتبع أعلى معايير الأمان العالمية ونحافظ على سرية بياناتك الشخصية. كما نقدم ضمان استرداد المال في حالة عدم نجاح العملية."},{"question":"ما هي طرق الدفع المتاحة؟","answer":"نقبل الدفع عبر فودافون كاش والعملات الرقمية USDT TRC20 فقط لضمان الأمان والسرعة في المعاملات."},{"question":"هل تقدمون خدمة ما بعد البيع؟","answer":"بالطبع، نقدم دعم فني مجاني مدى الحياة لجميع عملائنا مع إرشادات مفصلة لاستخدام حساباتكم الجديدة."}],"contact":{"title":"ابدأ معنا اليوم","subtitle":"فريق الدعم متاح على مدار الساعة للإجابة على استفساراتك","whatsapp":"تواصل عبر واتساب","features":["رد فوري","استشارة مجانية","ضمان الخدمة"]}}',
            v_admin_id,
            true
        );
    END IF;
    
    -- إنشاء محتوى افتراضي للغة الإنجليزية إذا لم يكن موجوداً
    IF NOT v_en_exists THEN
        PERFORM create_content_snapshot(
            'en',
            '{"site":{"name":"KYCtrust","description":"Specialized service for secure electronic banking accounts and financial services","phone":"+20-106-245-3344","tagline":"Your trusted partner in the digital world"},"hero":{"title":"KYCtrust","subtitle":"Complete Digital Financial Services Platform","description":"Get the best electronic banking accounts and digital wallets with unmatched security and speed","cta":"Start Your Financial Journey","secondary":"Browse Our Services","stats":[{"number":"1000+","label":"Happy Clients"},{"number":"24/7","label":"Support"},{"number":"99.9%","label":"Success Rate"},{"number":"15+","label":"Services"}]},"services":[{"name":"Payoneer","price":"$30","category":"Banking","icon":"💳","popular":true,"active":true,"sort":1,"description":"Trusted global banking account"},{"name":"Wise","price":"$30","category":"Banking","icon":"🏦","popular":true,"active":true,"sort":2,"description":"International transfers with lowest fees"},{"name":"Skrill","price":"$20","category":"E-Wallets","icon":"💰","active":true,"sort":3,"description":"Safe and fast digital wallet"},{"name":"Neteller","price":"$20","category":"E-Wallets","icon":"💸","active":true,"sort":4,"description":"Instant payments worldwide"},{"name":"PayPal","price":"$15","category":"E-Wallets","icon":"💙","popular":true,"active":true,"sort":12,"description":"Most popular payment solution"}],"payments":[{"label":"Vodafone Cash","value":"01062453344","icon":"📱","color":"red"},{"label":"USDT TRC20","value":"TFUt8GRpk2R8Wv3FvoCiSUghRBQo4HrmQK","icon":"₿","color":"green"}],"features":[{"title":"Fast Service","desc":"Delivery within 24-48 hours","icon":"⚡"},{"title":"Guaranteed Security","desc":"Complete protection for your data","icon":"🔒"},{"title":"Continuous Support","desc":"24/7 support team","icon":"🛎️"},{"title":"Competitive Prices","desc":"Best prices in the market","icon":"💰"}],"faq":[{"question":"How long does account creation take?","answer":"Usually 24-48 hours depending on account type and requirements. We work at maximum speed to ensure you get your account as soon as possible."},{"question":"Is the service safe and guaranteed?","answer":"Absolutely yes, we follow the highest international security standards and maintain confidentiality of your personal data. We also offer money-back guarantee if the process fails."},{"question":"What payment methods are available?","answer":"We accept payments via Vodafone Cash and USDT TRC20 cryptocurrency only to ensure security and speed in transactions."},{"question":"Do you provide after-sales service?","answer":"Of course, we provide free lifetime technical support for all our clients with detailed instructions for using your new accounts."}],"contact":{"title":"Get Started Today","subtitle":"Support team available 24/7 to answer your questions","whatsapp":"Contact via WhatsApp","features":["Instant Reply","Free Consultation","Service Guarantee"]}}',
            v_admin_id,
            true
        );
    END IF;
    
    -- تحديث تصميم الموقع
    UPDATE settings
    SET value = '{"theme":"system","palette":"emerald","layout":"default","animation":true,"rtl":true}'
    WHERE key = 'site_design';
    
    IF NOT FOUND THEN
        INSERT INTO settings (key, value, description)
        VALUES (
            'site_design',
            '{"theme":"system","palette":"emerald","layout":"default","animation":true,"rtl":true}',
            'إعدادات تصميم الموقع'
        );
    END IF;
    
    -- تحديث المحتوى المنشور
    PERFORM update_published_content();
END $$;

COMMIT;
