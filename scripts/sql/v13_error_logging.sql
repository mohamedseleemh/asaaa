-- إنشاء جدول سجل الأخطاء
CREATE TABLE IF NOT EXISTS error_logs (
    id SERIAL PRIMARY KEY,
    error_name VARCHAR(255) NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    url TEXT NOT NULL,
    user_agent TEXT,
    user_id TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    additional_info JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_name ON error_logs(error_name);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_url ON error_logs(url);

-- إنشاء دالة لتنظيف الأخطاء القديمة
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM error_logs 
    WHERE timestamp < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- إنشاء دالة للحصول على إحصائيات الأخطاء
CREATE OR REPLACE FUNCTION get_error_statistics()
RETURNS TABLE (
    total_errors BIGINT,
    errors_today BIGINT,
    errors_this_week BIGINT,
    most_common_error TEXT,
    error_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM error_logs) as total_errors,
        (SELECT COUNT(*) FROM error_logs WHERE timestamp >= CURRENT_DATE) as errors_today,
        (SELECT COUNT(*) FROM error_logs WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days') as errors_this_week,
        (SELECT error_name FROM error_logs GROUP BY error_name ORDER BY COUNT(*) DESC LIMIT 1) as most_common_error,
        (SELECT COUNT(*) FROM error_logs GROUP BY error_name ORDER BY COUNT(*) DESC LIMIT 1) as error_count;
END;
$$ LANGUAGE plpgsql;

-- تعليق على الجدول
COMMENT ON TABLE error_logs IS 'سجل شامل لجميع أخطاء النظام والتطبيق';
