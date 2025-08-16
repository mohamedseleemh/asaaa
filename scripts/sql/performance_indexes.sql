-- Added comprehensive database indexes for performance optimization

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(role, active);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login DESC) WHERE active = true;

-- Reviews table indexes  
CREATE INDEX IF NOT EXISTS idx_reviews_status_created ON reviews(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_reviews_moderated ON reviews(moderated_at DESC) WHERE status != 'pending';

-- Analytics table indexes
CREATE INDEX IF NOT EXISTS idx_analytics_day ON analytics_daily(day DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_visitors ON analytics_daily(visitors DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_conversion ON analytics_daily(conversion_rate DESC);

-- Sessions table indexes
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token) WHERE expires_at > NOW();
CREATE INDEX IF NOT EXISTS idx_sessions_user_expires ON user_sessions(user_id, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at) WHERE expires_at < NOW();

-- Settings table indexes
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_updated ON settings(updated_at DESC);

-- Rate limits table indexes
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_window ON rate_limits(identifier, window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup ON rate_limits(window_start) WHERE window_start < NOW() - INTERVAL '1 hour';

-- Audit logs table indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_cleanup ON audit_logs(created_at) WHERE created_at < NOW() - INTERVAL '90 days';

-- Content snapshots indexes
CREATE INDEX IF NOT EXISTS idx_content_snapshots_published ON content_snapshots(is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_snapshots_created ON content_snapshots(created_at DESC);

-- Chat sessions and messages indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created ON chat_messages(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_cleanup ON chat_messages(created_at) WHERE created_at < NOW() - INTERVAL '30 days';
