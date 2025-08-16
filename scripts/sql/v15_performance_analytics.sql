-- v15_performance_analytics.sql
-- إضافة جداول تحليل الأداء المتقدم

BEGIN;

-- جدول مقاييس الأداء التفصيلية
CREATE TABLE IF NOT EXISTS performance_metrics (
  id BIGSERIAL PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC(10,3) NOT NULL,
  metric_category TEXT NOT NULL CHECK (metric_category IN ('core-web-vitals', 'custom', 'network', 'resource')),
  threshold_good NUMERIC(10,3) NOT NULL,
  threshold_poor NUMERIC(10,3) NOT NULL,
  page_url TEXT,
  user_agent TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- جدول تقارير الأداء
CREATE TABLE IF NOT EXISTS performance_reports (
  id BIGSERIAL PRIMARY KEY,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  grade CHAR(1) NOT NULL CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),
  recommendations JSONB,
  metrics_summary JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- جدول المقارنات المرجعية
CREATE TABLE IF NOT EXISTS performance_benchmarks (
  id BIGSERIAL PRIMARY KEY,
  metric_name TEXT NOT NULL UNIQUE,
  current_value NUMERIC(10,3) NOT NULL,
  baseline_value NUMERIC(10,3) NOT NULL,
  target_value NUMERIC(10,3) NOT NULL,
  improvement_percentage NUMERIC(5,2) DEFAULT 0,
  trend TEXT NOT NULL CHECK (trend IN ('improving', 'declining', 'stable')) DEFAULT 'stable',
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- جدول تنبيهات الأداء
CREATE TABLE IF NOT EXISTS performance_alerts (
  id BIGSERIAL PRIMARY KEY,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  metric_name TEXT,
  metric_value NUMERIC(10,3),
  threshold_exceeded NUMERIC(10,3),
  message TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- فهارس الأداء
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name_timestamp ON performance_metrics (metric_name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_category ON performance_metrics (metric_category);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created ON performance_metrics (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_reports_score ON performance_reports (score DESC);
CREATE INDEX IF NOT EXISTS idx_performance_reports_grade ON performance_reports (grade);
CREATE INDEX IF NOT EXISTS idx_performance_reports_timestamp ON performance_reports (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_benchmarks_metric ON performance_benchmarks (metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_type_severity ON performance_alerts (alert_type, severity);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_resolved ON performance_alerts (resolved, created_at DESC);

-- دالة حساب نقاط الأداء
CREATE OR REPLACE FUNCTION calculate_performance_score(
  metrics_data JSONB
) RETURNS INTEGER AS $$
DECLARE
  total_score NUMERIC := 0;
  total_weight NUMERIC := 0;
  metric JSONB;
  weight NUMERIC;
  score NUMERIC;
BEGIN
  FOR metric IN SELECT * FROM jsonb_array_elements(metrics_data)
  LOOP
    -- تحديد الوزن حسب الفئة
    weight := CASE (metric->>'category')::TEXT
      WHEN 'core-web-vitals' THEN 0.4
      WHEN 'network' THEN 0.3
      WHEN 'resource' THEN 0.2
      ELSE 0.1
    END;
    
    -- حساب النقاط حسب القيمة والحدود
    IF (metric->>'value')::NUMERIC <= (metric->>'threshold_good')::NUMERIC THEN
      score := 100;
    ELSIF (metric->>'value')::NUMERIC <= (metric->>'threshold_poor')::NUMERIC THEN
      score := 75;
    ELSE
      score := 25;
    END IF;
    
    total_score := total_score + (score * weight);
    total_weight := total_weight + weight;
  END LOOP;
  
  RETURN CASE 
    WHEN total_weight > 0 THEN ROUND(total_score / total_weight)
    ELSE 0
  END;
END;
$$ LANGUAGE plpgsql;

-- دالة تنظيف البيانات القديمة
CREATE OR REPLACE FUNCTION cleanup_performance_data()
RETURNS void AS $$
BEGIN
  -- حذف المقاييس الأقدم من 30 يوم
  DELETE FROM performance_metrics WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- حذف التقارير الأقدم من 90 يوم
  DELETE FROM performance_reports WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- حذف التنبيهات المحلولة الأقدم من 7 أيام
  DELETE FROM performance_alerts 
  WHERE resolved = TRUE AND resolved_at < NOW() - INTERVAL '7 days';
  
  -- تحديث إحصائيات الجداول
  ANALYZE performance_metrics;
  ANALYZE performance_reports;
  ANALYZE performance_benchmarks;
  ANALYZE performance_alerts;
END;
$$ LANGUAGE plpgsql;

-- إدراج بيانات أولية للمقارنات المرجعية
INSERT INTO performance_benchmarks (metric_name, current_value, baseline_value, target_value) VALUES
  ('LCP', 2800, 3000, 2500),
  ('FID', 120, 150, 100),
  ('CLS', 0.15, 0.20, 0.10),
  ('TTFB', 650, 800, 600),
  ('FCP', 1900, 2200, 1800)
ON CONFLICT (metric_name) DO NOTHING;

COMMIT;
