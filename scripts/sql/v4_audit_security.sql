-- v4_audit_security.sql
-- نظام التدقيق والأمان

BEGIN;

-- جدول سجلات التدقيق
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT','UPDATE','DELETE')),
  row_id TEXT,
  old_values JSONB,
  new_values JSONB,
  changed_by TEXT DEFAULT CURRENT_USER,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- الفهارس
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_time ON audit_logs (table_name, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON audit_logs (changed_by);
CREATE INDEX IF NOT EXISTS idx_audit_logs_cleanup ON audit_logs (changed_at) WHERE changed_at < NOW() - INTERVAL '90 days';

-- دالة التدقيق العامة
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  row_id_value TEXT;
BEGIN
  -- تحديد البيانات القديمة والجديدة
  IF TG_OP = 'DELETE' THEN
    old_data = to_jsonb(OLD);
    new_data = NULL;
    row_id_value = COALESCE(OLD.id::text, OLD.key::text);
  ELSIF TG_OP = 'INSERT' THEN
    old_data = NULL;
    new_data = to_jsonb(NEW);
    row_id_value = COALESCE(NEW.id::text, NEW.key::text);
  ELSE -- UPDATE
    old_data = to_jsonb(OLD);
    new_data = to_jsonb(NEW);
    row_id_value = COALESCE(NEW.id::text, NEW.key::text);
  END IF;

  -- إدراج سجل التدقيق
  INSERT INTO audit_logs (
    table_name,
    operation,
    row_id,
    old_values,
    new_values
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    row_id_value,
    old_data,
    new_data
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- تطبيق التدقيق على الجداول الحساسة
DROP TRIGGER IF EXISTS audit_settings ON settings;
CREATE TRIGGER audit_settings
  AFTER INSERT OR UPDATE OR DELETE ON settings
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_users ON users;
CREATE TRIGGER audit_users
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_reviews ON reviews;
CREATE TRIGGER audit_reviews
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- دالة تنظيف سجلات التدقيق القديمة
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM audit_logs 
  WHERE changed_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

COMMIT;
