-- v7_maintenance_jobs.sql
-- مهام الصيانة والتنظيف التلقائي

BEGIN;

-- إنشاء جدول مهام الصيانة
CREATE TABLE IF NOT EXISTS maintenance_jobs (
    id SERIAL PRIMARY KEY,
    job_name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    last_run TIMESTAMP WITH TIME ZONE,
    next_run TIMESTAMP WITH TIME ZONE,
    interval_minutes INTEGER DEFAULT 1440, -- يومياً افتراضياً
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إدراج مهام الصيانة الأساسية
INSERT INTO maintenance_jobs (job_name, description, interval_minutes) VALUES
('cleanup_expired_sessions', 'تنظيف الجلسات المنتهية الصلاحية', 60), -- كل ساعة
('cleanup_old_conversations', 'تنظيف المحادثات القديمة', 1440), -- يومياً
('cleanup_old_audit_logs', 'تنظيف سجلات التدقيق القديمة', 10080), -- أسبوعياً
('update_analytics_summary', 'تحديث ملخص التحليلات', 1440), -- يومياً
('backup_content_snapshots', 'نسخ احتياطي من لقطات المحتوى', 4320) -- كل 3 أيام
ON CONFLICT (job_name) DO NOTHING;

-- دالة تنظيف سجلات التدقيق القديمة
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- دالة تحديث ملخص التحليلات
CREATE OR REPLACE FUNCTION update_analytics_summary()
RETURNS VOID AS $$
DECLARE
    summary_data JSONB;
BEGIN
    -- حساب الملخص للأيام الـ 30 الماضية
    SELECT jsonb_build_object(
        'total_visitors', SUM(visitors),
        'total_leads', SUM(leads),
        'total_orders', SUM(orders),
        'avg_conversion_rate', ROUND(AVG(conversion_rate), 2),
        'best_day', (
            SELECT jsonb_build_object('day', day, 'visitors', visitors)
            FROM analytics_daily 
            WHERE day >= CURRENT_DATE - INTERVAL '30 days'
            ORDER BY visitors DESC 
            LIMIT 1
        ),
        'updated_at', NOW()
    ) INTO summary_data
    FROM analytics_daily
    WHERE day >= CURRENT_DATE - INTERVAL '30 days';
    
    -- حفظ الملخص
    PERFORM set_setting('analytics_summary', summary_data, 'ملخص التحليلات المحدث تلقائياً');
END;
$$ LANGUAGE plpgsql;

-- دالة تشغيل مهمة صيانة
CREATE OR REPLACE FUNCTION run_maintenance_job(job_name_param VARCHAR(255))
RETURNS JSONB AS $$
DECLARE
    result_count INTEGER := 0;
    job_result JSONB;
    error_message TEXT;
BEGIN
    -- تحديث وقت التشغيل
    UPDATE maintenance_jobs 
    SET last_run = NOW(),
        next_run = NOW() + INTERVAL '1 minute' * interval_minutes
    WHERE job_name = job_name_param AND enabled = true;
    
    -- تشغيل المهمة المناسبة
    CASE job_name_param
        WHEN 'cleanup_expired_sessions' THEN
            SELECT cleanup_expired_sessions() INTO result_count;
            job_result := jsonb_build_object('deleted_sessions', result_count);
            
        WHEN 'cleanup_old_conversations' THEN
            SELECT cleanup_old_conversations() INTO result_count;
            job_result := jsonb_build_object('deleted_conversations', result_count);
            
        WHEN 'cleanup_old_audit_logs' THEN
            SELECT cleanup_old_audit_logs() INTO result_count;
            job_result := jsonb_build_object('deleted_logs', result_count);
            
        WHEN 'update_analytics_summary' THEN
            PERFORM update_analytics_summary();
            job_result := jsonb_build_object('summary_updated', true);
            
        WHEN 'backup_content_snapshots' THEN
            -- إنشاء نسخة احتياطية من المحتوى الحالي
            PERFORM create_snapshot('ar', get_setting('published_content')->'ar', 'نسخة احتياطية تلقائية', 'system');
            PERFORM create_snapshot('en', get_setting('published_content')->'en', 'نسخة احتياطية تلقائية', 'system');
            job_result := jsonb_build_object('backup_created', true);
            
        ELSE
            job_result := jsonb_build_object('error', 'مهمة غير معروفة');
    END CASE;
    
    RETURN jsonb_build_object(
        'job_name', job_name_param,
        'executed_at', NOW(),
        'result', job_result
    );
    
EXCEPTION
    WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS error_message = MESSAGE_TEXT;
        RETURN jsonb_build_object(
            'job_name', job_name_param,
            'executed_at', NOW(),
            'error', error_message
        );
END;
$$ LANGUAGE plpgsql;

-- دالة تشغيل جميع المهام المستحقة
CREATE OR REPLACE FUNCTION run_due_maintenance_jobs()
RETURNS JSONB AS $$
DECLARE
    job_record RECORD;
    results JSONB := '[]'::jsonb;
    job_result JSONB;
BEGIN
    FOR job_record IN 
        SELECT job_name 
        FROM maintenance_jobs 
        WHERE enabled = true 
        AND (next_run IS NULL OR next_run <= NOW())
    LOOP
        SELECT run_maintenance_job(job_record.job_name) INTO job_result;
        results := results || job_result;
    END LOOP;
    
    RETURN jsonb_build_object(
        'executed_at', NOW(),
        'jobs_run', jsonb_array_length(results),
        'results', results
    );
END;
$$ LANGUAGE plpgsql;

COMMIT;
