-- v2_reviews_system.sql
-- نظام المراجعات والتقييمات
-- الإصدار 2.0

BEGIN;

-- جدول المراجعات
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    service_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    moderated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    moderated_at TIMESTAMP WITH TIME ZONE
);

-- جدول إحصائيات المراجعات
CREATE TABLE IF NOT EXISTS review_stats (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(255) UNIQUE NOT NULL,
    total_reviews INTEGER DEFAULT 0,
    average_rating NUMERIC(3,2) DEFAULT 0.00,
    rating_1 INTEGER DEFAULT 0,
    rating_2 INTEGER DEFAULT 0,
    rating_3 INTEGER DEFAULT 0,
    rating_4 INTEGER DEFAULT 0,
    rating_5 INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_service_name ON reviews(service_name);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_review_stats_service_name ON review_stats(service_name);

-- دالة تحديث إحصائيات المراجعات
CREATE OR REPLACE FUNCTION update_review_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- تحديث الإحصائيات للخدمة المتأثرة
    INSERT INTO review_stats (service_name, total_reviews, average_rating, rating_1, rating_2, rating_3, rating_4, rating_5)
    SELECT 
        service_name,
        COUNT(*) as total_reviews,
        ROUND(AVG(rating::numeric), 2) as average_rating,
        COUNT(*) FILTER (WHERE rating = 1) as rating_1,
        COUNT(*) FILTER (WHERE rating = 2) as rating_2,
        COUNT(*) FILTER (WHERE rating = 3) as rating_3,
        COUNT(*) FILTER (WHERE rating = 4) as rating_4,
        COUNT(*) FILTER (WHERE rating = 5) as rating_5
    FROM reviews 
    WHERE status = 'approved' 
    AND service_name = COALESCE(NEW.service_name, OLD.service_name)
    GROUP BY service_name
    ON CONFLICT (service_name) 
    DO UPDATE SET
        total_reviews = EXCLUDED.total_reviews,
        average_rating = EXCLUDED.average_rating,
        rating_1 = EXCLUDED.rating_1,
        rating_2 = EXCLUDED.rating_2,
        rating_3 = EXCLUDED.rating_3,
        rating_4 = EXCLUDED.rating_4,
        rating_5 = EXCLUDED.rating_5,
        last_updated = NOW();
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- إضافة المشغلات
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_review_stats ON reviews;
CREATE TRIGGER trigger_update_review_stats
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_review_stats();

-- إدراج بيانات تجريبية للمراجعات
INSERT INTO reviews (customer_name, customer_email, service_name, rating, comment, status) VALUES
('أحمد محمد', 'ahmed@example.com', 'Payoneer', 5, 'خدمة ممتازة وسريعة، تم إنشاء الحساب خلال 24 ساعة', 'approved'),
('فاطمة علي', 'fatima@example.com', 'Wise', 5, 'أفضل خدمة للتحويلات الدولية، أنصح بها بشدة', 'approved'),
('محمد حسن', 'mohamed@example.com', 'PayPal', 4, 'خدمة جيدة ولكن تحتاج وقت أطول قليلاً', 'approved'),
('سارة أحمد', 'sara@example.com', 'Skrill', 5, 'تعامل راقي ومهني، شكراً لكم', 'approved'),
('عبدالله محمد', 'abdullah@example.com', 'Neteller', 4, 'خدمة موثوقة وآمنة', 'approved'),
('نور الدين', 'nour@example.com', 'Okx', 5, 'أسرع خدمة حصلت عليها، ممتاز', 'approved'),
('ليلى حسام', 'layla@example.com', 'Bybit', 4, 'خدمة احترافية وأسعار مناسبة', 'approved'),
('خالد عمر', 'khaled@example.com', 'Bitget', 5, 'تجربة رائعة، سأتعامل معكم مرة أخرى', 'approved');

COMMIT;

-- رسالة نجاح
DO $$
BEGIN
    RAISE NOTICE 'تم إنشاء نظام المراجعات بنجاح';
    RAISE NOTICE 'تم إدراج % مراجعة تجريبية', (SELECT COUNT(*) FROM reviews);
END $$;
