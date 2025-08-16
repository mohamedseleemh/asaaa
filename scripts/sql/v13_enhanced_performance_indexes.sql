-- v13_enhanced_performance_indexes.sql
-- Enhanced performance indexes and optimizations

BEGIN;

-- Enhanced user table indexes for better query performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_active ON users(email) WHERE active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_active ON users(role, active) WHERE active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_last_login_desc ON users(last_login DESC NULLS LAST) WHERE active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at_desc ON users(created_at DESC) WHERE active = true;

-- Enhanced analytics table indexes for time-series queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_day_desc ON analytics_daily(day DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_visitors_desc ON analytics_daily(visitors DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_conversion_rate ON analytics_daily(conversion_rate DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_recent ON analytics_daily(day) WHERE day >= CURRENT_DATE - INTERVAL '90 days';

-- Enhanced reviews table indexes for moderation and display
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_status_created ON reviews(status, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_rating_approved ON reviews(rating DESC) WHERE status = 'approved';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_moderated_at ON reviews(moderated_at DESC) WHERE status != 'pending';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_ip_hash_created ON reviews(ip_hash, created_at) WHERE ip_hash IS NOT NULL;

-- Enhanced session and security indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at) WHERE expires_at > NOW();
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_user_id_expires ON sessions(user_id, expires_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rate_limits_cleanup ON rate_limits(window_start) WHERE window_start < NOW() - INTERVAL '2 hours';

-- Enhanced audit and monitoring indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_action_created ON audit_logs(action, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action, created_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_cleanup ON audit_logs(created_at) WHERE created_at < NOW() - INTERVAL '90 days';

-- Enhanced content management indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_snapshots_published_locale ON content_snapshots(is_published, locale, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_snapshots_published_at ON content_snapshots(published_at DESC) WHERE is_published = true;

-- Enhanced chat system indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_session_created ON chat_messages(session_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_cleanup ON chat_messages(created_at) WHERE created_at < NOW() - INTERVAL '30 days';

-- Enhanced settings and configuration indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_settings_key_updated ON settings(key, updated_at DESC);

-- Add query performance monitoring function
CREATE OR REPLACE FUNCTION get_query_performance_stats()
RETURNS TABLE(
  schemaname text,
  tablename text,
  seq_scan bigint,
  seq_tup_read bigint,
  idx_scan bigint,
  idx_tup_fetch bigint,
  n_tup_ins bigint,
  n_tup_upd bigint,
  n_tup_del bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.schemaname::text,
    s.tablename::text,
    s.seq_scan,
    s.seq_tup_read,
    s.idx_scan,
    s.idx_tup_fetch,
    s.n_tup_ins,
    s.n_tup_upd,
    s.n_tup_del
  FROM pg_stat_user_tables s
  WHERE s.schemaname = 'public'
  ORDER BY s.seq_scan DESC, s.idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- Add index usage monitoring function
CREATE OR REPLACE FUNCTION get_index_usage_stats()
RETURNS TABLE(
  schemaname text,
  tablename text,
  indexname text,
  idx_scan bigint,
  idx_tup_read bigint,
  idx_tup_fetch bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.schemaname::text,
    s.tablename::text,
    s.indexname::text,
    s.idx_scan,
    s.idx_tup_read,
    s.idx_tup_fetch
  FROM pg_stat_user_indexes s
  WHERE s.schemaname = 'public'
  ORDER BY s.idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- Update table statistics for better query planning
ANALYZE users;
ANALYZE analytics_daily;
ANALYZE reviews;
ANALYZE sessions;
ANALYZE audit_logs;
ANALYZE content_snapshots;
ANALYZE chat_sessions;
ANALYZE chat_messages;
ANALYZE settings;

COMMIT;
