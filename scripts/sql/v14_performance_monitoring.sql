-- v14_performance_monitoring.sql
-- إضافة جداول مراقبة الأداء

BEGIN;

-- جدول مشاكل الأداء
CREATE TABLE IF NOT EXISTS performance_issues (
  id BIGSERIAL PRIMARY KEY,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('lcp', 'fid', 'cls', 'fcp', 'ttfb')),
  metric_value NUMERIC(10,2) NOT NULL,
  page_url TEXT NOT NULL,
  user_agent TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- جدول الموارد البطيئة
CREATE TABLE IF NOT EXISTS slow_resources (
  id BIGSERIAL PRIMARY KEY,
  resource_name TEXT NOT NULL,
  load_duration NUMERIC(10,2) NOT NULL,
  resource_size BIGINT DEFAULT 0,
  resource_type TEXT,
  page_url TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- جدول تنبيهات النظام
CREATE TABLE IF NOT EXISTS system_alerts (
  id BIGSERIAL PRIMARY KEY,
  alert_type TEXT NOT NULL,
  alert_data JSONB,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  timestamp TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- فهارس الأداء
CREATE INDEX IF NOT EXISTS idx_performance_issues_type_created ON performance_issues (metric_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_issues_url ON performance_issues (page_url);
CREATE INDEX IF NOT EXISTS idx_slow_resources_name_created ON slow_resources (resource_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_slow_resources_duration ON slow_resources (load_duration DESC);
CREATE INDEX IF NOT EXISTS idx_system_alerts_type_created ON system_alerts (alert_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts (severity, created_at DESC);

-- دالة تنظيف البيانات القديمة
CREATE OR REPLACE FUNCTION cleanup_performance_data()
RETURNS void AS $$
BEGIN
  -- حذف بيانات الأداء الأقدم من 30 يوم
  DELETE FROM performance_issues WHERE created_at < NOW() - INTERVAL '30 days';
  DELETE FROM slow_resources WHERE created_at < NOW() - INTERVAL '30 days';
  DELETE FROM system_alerts WHERE created_at < NOW() - INTERVAL '90 days' AND resolved_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

COMMIT;
