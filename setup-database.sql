-- ============================================
-- RESILIENT MIND DATABASE SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- First, check if migrations already ran by looking for profiles table
-- If this fails, migrations need to be run

-- Create test users with passwords
-- Note: These will be created via Supabase Auth, then we'll assign roles

-- ============================================
-- STEP 1: Create Admin Role for your account
-- ============================================
-- Replace 'YOUR_USER_ID' with your actual user ID after you register

-- Example (you'll need to update the UUID):
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('YOUR_USER_ID_HERE', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================
-- STEP 2: Test Accounts Setup (run after creating accounts in Auth)
-- ============================================

-- After you create these accounts manually in Supabase Auth > Users:
-- 1. admin@resilientmind.com (password: Admin123!)
-- 2. free@test.com (password: Test123!)
-- 3. basic@test.com (password: Test123!)
-- 4. premium@test.com (password: Test123!)

-- Then run these commands with their actual UUIDs:

/*
-- Admin account
INSERT INTO public.user_roles (user_id, role)
VALUES ('ADMIN_USER_ID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Update admin profile
UPDATE public.profiles
SET full_name = 'Admin User', membership_type = 'premium'
WHERE user_id = 'ADMIN_USER_ID_HERE';

-- Free account
UPDATE public.profiles
SET full_name = 'Free User', membership_type = 'free'
WHERE user_id = 'FREE_USER_ID_HERE';

-- Basic membership account
UPDATE public.profiles
SET
  full_name = 'Basic Member',
  membership_type = 'basic',
  membership_started_at = now(),
  membership_expires_at = now() + interval '1 year'
WHERE user_id = 'BASIC_USER_ID_HERE';

-- Premium membership account
UPDATE public.profiles
SET
  full_name = 'Premium Member',
  membership_type = 'premium',
  membership_started_at = now(),
  membership_expires_at = now() + interval '1 year'
WHERE user_id = 'PREMIUM_USER_ID_HERE';
*/

-- ============================================
-- STEP 3: Verify setup
-- ============================================

-- Check all profiles
SELECT
  p.user_id,
  p.full_name,
  p.email,
  p.membership_type,
  p.membership_expires_at,
  COALESCE(array_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL), ARRAY[]::app_role[]) as roles
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id
GROUP BY p.user_id, p.full_name, p.email, p.membership_type, p.membership_expires_at
ORDER BY p.created_at;

-- Check video categories (should have 12 months)
SELECT COUNT(*) as category_count FROM public.video_categories;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'user_roles', 'videos', 'video_categories');
