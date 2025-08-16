-- KYCtrust Supabase Schema (Fixed)
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.analytics_events CASCADE;
DROP TABLE IF EXISTS public.content_snapshots CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;

-- Create settings table
CREATE TABLE public.settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE public.reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email_hash VARCHAR(64),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL CHECK (length(comment) >= 10 AND length(comment) <= 500),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    moderated_at TIMESTAMP WITH TIME ZONE
);

-- Create analytics_events table
CREATE TABLE public.analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    page VARCHAR(255),
    user_agent TEXT,
    ip_address INET,
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content_snapshots table
CREATE TABLE public.content_snapshots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_settings_key ON public.settings(key);
CREATE INDEX idx_reviews_status ON public.reviews(status);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX idx_analytics_timestamp ON public.analytics_events(timestamp DESC);
CREATE INDEX idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_content_snapshots_created_at ON public.content_snapshots(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for settings table
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_snapshots ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to approved reviews
CREATE POLICY "Public can read approved reviews" ON public.reviews
    FOR SELECT USING (status = 'approved');

-- Create policies for public insert on reviews
CREATE POLICY "Public can insert reviews" ON public.reviews
    FOR INSERT WITH CHECK (true);

-- Create policies for public read access to published content
CREATE POLICY "Public can read published content" ON public.settings
    FOR SELECT USING (key = 'published_content');

-- Create policies for analytics (public insert only)
CREATE POLICY "Public can insert analytics" ON public.analytics_events
    FOR INSERT WITH CHECK (true);

-- Service role has full access to all tables
CREATE POLICY "Service role has full access to settings" ON public.settings
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to reviews" ON public.reviews
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to analytics" ON public.analytics_events
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to snapshots" ON public.content_snapshots
    FOR ALL USING (auth.role() = 'service_role');

-- Insert default admin password (CHANGE THIS IMMEDIATELY!)
INSERT INTO public.settings (key, value) 
VALUES ('admin_password', '"admin123123"'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Insert default published content
INSERT INTO public.settings (key, value)
VALUES ('published_content', '{
  "ar": {
    "site": {
      "name": "KYCtrust",
      "description": "خدمة متخصصة في الحسابات البنكية الإلكترونية والخدمات المالية الآمنة",
      "phone": "+20-106-245-3344",
      "tagline": "شريكك الموثوق في العالم الرقمي",
      "logoSrc": "/images/brand/novapay-logo.png"
    },
    "hero": {
      "title": "KYCtrust",
      "subtitle": "منصة متكاملة للخدمات المالية الرقمية",
      "description": "احصل على أفضل الحسابات البنكية الإلكترونية والمحافظ الرقمية بأمان وسرعة لا مثيل لها",
      "cta": "ابدأ رحلتك المالية",
      "secondary": "تصفح خدماتنا",
      "stats": [
        {"number": "1000+", "label": "عميل راضي"},
        {"number": "24/7", "label": "دعم فني"},
        {"number": "99.9%", "label": "معدل النجاح"},
        {"number": "15+", "label": "خدمة متاحة"}
      ]
    },
    "services": [
      {
        "name": "Payoneer",
        "price": "$30",
        "category": "حسابات بنكية",
        "icon": "💳",
        "iconImage": "/images/logos/payoneer.png",
        "popular": true,
        "active": true,
        "sort": 1,
        "description": "حساب بنكي عالمي موثوق لاستقبال المدفوعات الدولية"
      },
      {
        "name": "Wise",
        "price": "$30",
        "category": "حسابات بنكية",
        "icon": "🏦",
        "iconImage": "/images/logos/wise.png",
        "popular": true,
        "active": true,
        "sort": 2,
        "description": "حساب متعدد العملات مع تحويلات دولية بأسعار حقيقية"
      },
      {
        "name": "PayPal",
        "price": "$15",
        "category": "محافظ إلكترونية",
        "icon": "💙",
        "iconImage": "/images/logos/paypal.png",
        "popular": true,
        "active": true,
        "sort": 3,
        "description": "المحفظة الإلكترونية الأكثر شهرة وقبولاً عالمياً"
      }
    ],
    "features": [
      {"title": "خدمة سريعة", "desc": "تسليم خلال 24-48 ساعة", "icon": "clock"},
      {"title": "أمان مضمون", "desc": "حماية كاملة لبياناتك", "icon": "shield"},
      {"title": "دعم مستمر", "desc": "فريق دعم على مدار الساعة", "icon": "users"},
      {"title": "أسعار تنافسية", "desc": "أفضل الأسعار في السوق", "icon": "award"}
    ],
    "payments": [
      {"label": "فودافون كاش", "value": "01062453344", "icon": "📱", "color": "red"},
      {"label": "USDT TRC20", "value": "TFUt8GRpk2R8Wv3FvoCiSUghRBQo4HrmQK", "icon": "₿", "color": "green"}
    ],
    "faq": [
      {
        "question": "كم تستغرق عملية إنشاء الحساب؟",
        "answer": "عادة من 24-48 ساعة حسب نوع الحساب والمتطلبات المطلوبة."
      },
      {
        "question": "هل الخدمة آمنة ومضمونة؟",
        "answer": "نعم، نتبع أعلى معايير الأمان الدولية ونحافظ على خصوصية بياناتك بالكامل."
      }
    ],
    "contact": {
      "title": "ابدأ معنا اليوم",
      "subtitle": "فريق الدعم متاح 24/7 للإجابة على استفساراتك",
      "whatsapp": "تواصل عبر واتساب",
      "features": ["رد فوري", "استشارة مجانية", "ضمان الخدمة"]
    },
    "testimonials": [
      {
        "name": "أحمد محمد",
        "role": "رائد أعمال",
        "quote": "خدمة ممتازة وسرعة في التنفيذ. حصلت على حساب Payoneer في يوم واحد!"
      }
    ]
  },
  "en": {
    "site": {
      "name": "KYCtrust",
      "description": "Specialized service for secure electronic banking accounts and financial services",
      "phone": "+20-106-245-3344",
      "tagline": "Your trusted partner in the digital world",
      "logoSrc": "/images/brand/novapay-logo.png"
    },
    "hero": {
      "title": "KYCtrust",
      "subtitle": "Complete Digital Financial Services Platform",
      "description": "Get the best electronic banking accounts and digital wallets with unmatched security and speed",
      "cta": "Start Your Financial Journey",
      "secondary": "Browse Our Services",
      "stats": [
        {"number": "1000+", "label": "Happy Clients"},
        {"number": "24/7", "label": "Support"},
        {"number": "99.9%", "label": "Success Rate"},
        {"number": "15+", "label": "Services"}
      ]
    },
    "services": [
      {
        "name": "Payoneer",
        "price": "$30",
        "category": "Banking",
        "icon": "💳",
        "iconImage": "/images/logos/payoneer.png",
        "popular": true,
        "active": true,
        "sort": 1,
        "description": "Trusted global banking account for receiving international payments"
      },
      {
        "name": "Wise",
        "price": "$30",
        "category": "Banking",
        "icon": "🏦",
        "iconImage": "/images/logos/wise.png",
        "popular": true,
        "active": true,
        "sort": 2,
        "description": "Multi-currency account with international transfers at real exchange rates"
      },
      {
        "name": "PayPal",
        "price": "$15",
        "category": "E-Wallets",
        "icon": "💙",
        "iconImage": "/images/logos/paypal.png",
        "popular": true,
        "active": true,
        "sort": 3,
        "description": "The most popular and globally accepted e-wallet"
      }
    ],
    "features": [
      {"title": "Fast Service", "desc": "Delivery within 24-48 hours", "icon": "clock"},
      {"title": "Guaranteed Security", "desc": "Complete protection for your data", "icon": "shield"},
      {"title": "Continuous Support", "desc": "24/7 support team", "icon": "users"},
      {"title": "Competitive Prices", "desc": "Best prices in the market", "icon": "award"}
    ],
    "payments": [
      {"label": "Vodafone Cash", "value": "01062453344", "icon": "📱", "color": "red"},
      {"label": "USDT TRC20", "value": "TFUt8GRpk2R8Wv3FvoCiSUghRBQo4HrmQK", "icon": "₿", "color": "green"}
    ],
    "faq": [
      {
        "question": "How long does account creation take?",
        "answer": "Usually 24-48 hours depending on account type and requirements."
      },
      {
        "question": "Is the service safe and guaranteed?",
        "answer": "Yes, we follow the highest international security standards and maintain complete privacy of your data."
      }
    ],
    "contact": {
      "title": "Get Started Today",
      "subtitle": "Support team available 24/7 to answer your questions",
      "whatsapp": "Contact via WhatsApp",
      "features": ["Instant Reply", "Free Consultation", "Service Guarantee"]
    },
    "testimonials": [
      {
        "name": "Ahmed Mohamed",
        "role": "Entrepreneur",
        "quote": "Excellent service and fast execution. Got my Payoneer account in one day!"
      }
    ]
  },
  "design": {
    "theme": "light",
    "palette": "violet-emerald",
    "anim": {
      "enableReveal": true,
      "intensity": 1,
      "parallax": 14
    }
  }
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Insert sample reviews
INSERT INTO public.reviews (name, rating, comment, status, created_at) VALUES
('أحمد محمد', 5, 'خدمة ممتازة وسرعة في التنفيذ. حصلت على حساب Payoneer في يوم واحد!', 'approved', NOW() - INTERVAL '5 days'),
('فاطمة علي', 5, 'الدعم الفني رائع والأسعار تنافسية جداً. أنصح بالتعامل معهم.', 'approved', NOW() - INTERVAL '3 days'),
('محمد حسن', 4, 'أفضل مكان للحصول على الحسابات البنكية الإلكترونية بأمان.', 'approved', NOW() - INTERVAL '1 day'),
('سارة أحمد', 5, 'تجربة رائعة وخدمة عملاء متميزة. شكراً لكم!', 'approved', NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- Create helpful views
CREATE OR REPLACE VIEW public.review_stats AS
SELECT 
    COUNT(*) as total_reviews,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_reviews,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_reviews,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_reviews,
    ROUND(AVG(rating) FILTER (WHERE status = 'approved'), 2) as average_rating
FROM public.reviews;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Comments for documentation
COMMENT ON TABLE public.settings IS 'Application settings and published content storage';
COMMENT ON TABLE public.reviews IS 'Customer reviews with moderation workflow';
COMMENT ON TABLE public.analytics_events IS 'Website analytics and user behavior tracking';
COMMENT ON TABLE public.content_snapshots IS 'Content version snapshots for backup and history';

-- Success message
SELECT 'KYCtrust database schema created successfully!' as message;
