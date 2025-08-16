# KYCtrust Setup Guide

## 🚀 Quick Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready

### 2. Run Database Schema
1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the content from `scripts/sql/supabase_schema.sql`
3. Click "Run" to execute the schema

### 3. Environment Variables
Create a `.env.local` file in your project root:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

### 4. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 5. Run the Application
\`\`\`bash
npm run dev
\`\`\`

### 6. Access Admin Dashboard
1. Go to `http://localhost:3000/admin`
2. Use password: `admin123123`
3. Start managing your content!

## 🔧 Configuration

### Admin Password
To change the admin password:
1. Go to your Supabase dashboard
2. Navigate to Table Editor > settings
3. Find the row with key `admin_password_hash`
4. Update the value to your new password

### Site Configuration
Update site settings in the `settings` table:
- `site_config`: General site configuration
- `published_content`: Website content and design

## 📊 Features

- ✅ **Content Management**: Edit website content in real-time
- ✅ **Reviews System**: Customer reviews with moderation
- ✅ **Analytics**: Track visitors and page views
- ✅ **Multi-language**: Arabic and English support
- ✅ **Responsive Design**: Works on all devices
- ✅ **SEO Optimized**: Built-in SEO features

## 🛠 Troubleshooting

### Database Connection Issues
1. Check your environment variables
2. Verify Supabase project is active
3. Ensure RLS policies are correctly set

### Content Not Loading
1. Check if `published_content` exists in settings table
2. Verify API routes are working
3. Check browser console for errors

### Admin Access Issues
1. Verify admin password in settings table
2. Check if cookies are enabled
3. Clear browser cache and try again

## 📝 Support

For support, contact: info@kyctrust.com
WhatsApp: +20-106-245-3344
