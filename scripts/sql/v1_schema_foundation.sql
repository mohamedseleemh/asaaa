-- v1_schema_foundation.sql
-- الأساس الأساسي لقاعدة البيانات

BEGIN;

-- تفعيل امتداد التشفير
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- جدول الإعدادات العامة
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول جلسات المستخدمين
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول التحكم في المعدل
CREATE TABLE IF NOT EXISTS rate_limits (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول سجل الأنشطة
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(50),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key);
CREATE INDEX IF NOT EXISTS idx_rate_limits_created ON rate_limits(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- دالة لتنظيف الجلسات المنتهية الصلاحية
CREATE OR REPLACE FUNCTION cleanup_expired_sessions() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- دالة لتنظيف سجلات التحكم في المعدل القديمة
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM rate_limits WHERE created_at < NOW() - INTERVAL '1 day';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- دالة لتسجيل النشاط
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id VARCHAR(50),
    p_action VARCHAR(100),
    p_resource_type VARCHAR(50) DEFAULT NULL,
    p_resource_id VARCHAR(50) DEFAULT NULL,
    p_details JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO activity_logs (
        user_id, action, resource_type, resource_id, 
        details, ip_address, user_agent
    ) VALUES (
        p_user_id, p_action, p_resource_type, p_resource_id,
        p_details, p_ip_address, p_user_agent
    );
END;
$$ LANGUAGE plpgsql;

-- إنشاء مستخدم مسؤول افتراضي
INSERT INTO users (name, email, role, active, password_hash)
VALUES (
    'المدير العام',
    'admin@kyctrust.com',
    'admin',
    true,
    crypt('admin123123', gen_salt('bf', 12))
) ON CONFLICT (email) DO NOTHING;

-- إعدادات افتراضية
INSERT INTO settings (key, value, description) VALUES
    ('site_title', '{"ar": "كي واي سي ترست", "en": "KYC Trust"}', 'عنوان الموقع'),
    ('site_description', '{"ar": "منصة الخدمات المالية الرقمية", "en": "Digital Financial Services Platform"}', 'وصف الموقع'),
    ('contact_email', '"info@kyctrust.com"', 'البريد الإلكتروني للتواصل'),
    ('contact_phone', '"+20-106-245-3344"', 'رقم الهاتف للتواصل'),
    ('whatsapp_number', '"+201062453344"', 'رقم الواتساب'),
    ('site_design', '{"theme": "system", "palette": "emerald", "layout": "default", "animation": true, "rtl": true}', 'إعدادات تصميم الموقع')
ON CONFLICT (key) DO NOTHING;

COMMIT;
