-- v5_functions_procedures.sql
-- الدوال والإجراءات المخزنة الأساسية

BEGIN;

-- دالة الحصول على إعداد
CREATE OR REPLACE FUNCTION get_setting(setting_key VARCHAR(255))
RETURNS JSONB AS $$
DECLARE
    setting_value JSONB;
BEGIN
    SELECT value INTO setting_value
    FROM settings
    WHERE key = setting_key;
    
    RETURN setting_value;
END;
$$ LANGUAGE plpgsql;

-- دالة تعيين إعداد
CREATE OR REPLACE FUNCTION set_setting(
    setting_key VARCHAR(255),
    setting_value JSONB,
    setting_description TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO settings (key, value, description)
    VALUES (setting_key, setting_value, setting_description)
    ON CONFLICT (key) 
    DO UPDATE SET 
        value = EXCLUDED.value,
        description = COALESCE(EXCLUDED.description, settings.description),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- دالة نشر المحتوى
CREATE OR REPLACE FUNCTION publish_content(p_content JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- حفظ المحتوى المنشور
    PERFORM set_setting('published_content', p_content, 'المحتوى المنشور للموقع');
    
    -- إضافة سجل في تاريخ النشر
    INSERT INTO content_publish_history (content, published_by)
    VALUES (p_content, 'system');
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- دالة تسجيل حدث في سجل التدقيق
CREATE OR REPLACE FUNCTION log_audit_event(
    p_user_id INTEGER,
    p_action VARCHAR(100),
    p_resource_type VARCHAR(100) DEFAULT NULL,
    p_resource_id VARCHAR(100) DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id, action, resource_type, resource_id,
        old_values, new_values, ip_address, user_agent
    )
    VALUES (
        p_user_id, p_action, p_resource_type, p_resource_id,
        p_old_values, p_new_values, p_ip_address, p_user_agent
    );
END;
$$ LANGUAGE plpgsql;

-- دالة تنظيف الجلسات المنتهية الصلاحية
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- دالة الحصول على إحصائيات التحليلات
CREATE OR REPLACE FUNCTION get_analytics_summary(days_back INTEGER DEFAULT 30)
RETURNS TABLE(
    total_visitors BIGINT,
    total_leads BIGINT,
    total_orders BIGINT,
    avg_conversion_rate NUMERIC(5,2),
    period_days INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        SUM(visitors)::BIGINT as total_visitors,
        SUM(leads)::BIGINT as total_leads,
        SUM(orders)::BIGINT as total_orders,
        ROUND(AVG(conversion_rate), 2)::NUMERIC(5,2) as avg_conversion_rate,
        COUNT(*)::INTEGER as period_days
    FROM analytics_daily
    WHERE day >= CURRENT_DATE - INTERVAL '1 day' * days_back;
END;
$$ LANGUAGE plpgsql;

-- دالة إنشاء مستخدم جديد مع تشفير كلمة المرور
CREATE OR REPLACE FUNCTION create_user_with_password(
    p_name VARCHAR(255),
    p_email VARCHAR(255),
    p_password VARCHAR(255),
    p_role VARCHAR(50) DEFAULT 'editor'
)
RETURNS INTEGER AS $$
DECLARE
    user_id INTEGER;
    password_hash VARCHAR(255);
BEGIN
    -- تشفير كلمة المرور
    password_hash := crypt(p_password, gen_salt('bf', 12));
    
    -- إدراج المستخدم
    INSERT INTO users (name, email, password_hash, role)
    VALUES (p_name, p_email, password_hash, p_role)
    RETURNING id INTO user_id;
    
    -- تسجيل الحدث
    PERFORM log_audit_event(
        user_id, 
        'USER_CREATED', 
        'user', 
        user_id::VARCHAR,
        NULL,
        jsonb_build_object('name', p_name, 'email', p_email, 'role', p_role)
    );
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- دالة التحقق من كلمة المرور
CREATE OR REPLACE FUNCTION verify_user_password(
    p_email VARCHAR(255),
    p_password VARCHAR(255)
)
RETURNS TABLE(
    user_id INTEGER,
    name VARCHAR(255),
    role VARCHAR(50),
    active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.name, u.role, u.active
    FROM users u
    WHERE u.email = p_email 
    AND u.password_hash = crypt(p_password, u.password_hash)
    AND u.active = true;
END;
$$ LANGUAGE plpgsql;

COMMIT;
