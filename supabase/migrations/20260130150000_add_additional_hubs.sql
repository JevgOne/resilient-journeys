-- ============================================
-- ADDITIONAL HUBS ACCESS CONTROL
-- Migration: Add purchased_hubs field and create additional hub categories
-- ============================================

-- ============================================
-- 1. ADD PURCHASED_HUBS COLUMN TO PROFILES
-- ============================================

-- Add purchased_hubs column to store array of purchased hub slugs
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS purchased_hubs JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.purchased_hubs IS 'Array of purchased additional hub slugs (e.g., ["transformed_self", "endometriosis"])';

-- ============================================
-- 2. ADD IS_ADDITIONAL_HUB TO VIDEO_CATEGORIES
-- ============================================

-- Add flag to mark categories as additional hubs
ALTER TABLE public.video_categories
  ADD COLUMN IF NOT EXISTS is_additional_hub BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.video_categories.is_additional_hub IS 'True if category is a paid additional hub (separate from main membership)';

-- Add hub_slug for identifying purchased hubs
ALTER TABLE public.video_categories
  ADD COLUMN IF NOT EXISTS hub_slug TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.video_categories.hub_slug IS 'Unique slug for additional hub (e.g., "transformed_self", "endometriosis")';

-- Add unique constraint on hub_slug (only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_video_categories_hub_slug
  ON public.video_categories(hub_slug)
  WHERE hub_slug IS NOT NULL;

-- ============================================
-- 3. UPDATE EXISTING CATEGORIES
-- ============================================

-- Update existing categories to set sort_order if using month_number
-- This ensures smooth transition to sort_order system
UPDATE public.video_categories
SET sort_order = month_number
WHERE sort_order IS NULL OR sort_order = 0;

-- ============================================
-- 4. CREATE ADDITIONAL HUB CATEGORIES
-- ============================================

-- Insert The Transformed Self hub
INSERT INTO public.video_categories (name, description, sort_order, is_additional_hub, hub_slug, month_number, icon)
VALUES (
  'The Transformed Self',
  'Carrying Your Strength Across Borders - A specialized program for expatriates navigating identity transformation while living abroad',
  13,
  true,
  'transformed_self',
  13,
  'sparkles'
) ON CONFLICT DO NOTHING;

-- Insert Endometriosis hub
INSERT INTO public.video_categories (name, description, sort_order, is_additional_hub, hub_slug, month_number, icon)
VALUES (
  'Navigating Expat Life with Endometriosis',
  'Managing chronic pain while living abroad - A comprehensive program combining medical knowledge with emotional support for expatriates with endometriosis',
  14,
  true,
  'endometriosis',
  14,
  'heart-pulse'
) ON CONFLICT DO NOTHING;

-- ============================================
-- 5. UPDATE RLS POLICIES FOR VIDEOS
-- ============================================

-- Drop existing policy for membership-based video access
DROP POLICY IF EXISTS "Members can view videos based on membership" ON public.videos;

-- Create new policy that checks both membership AND purchased hubs
CREATE POLICY "Members can view videos based on membership"
  ON public.videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      LEFT JOIN public.video_categories vc ON videos.category_id = vc.id
      WHERE p.user_id = auth.uid()
      AND (
        -- Option 1: User has premium membership (access to all main content)
        (
          p.membership_type = 'premium'
          AND (vc.is_additional_hub IS NULL OR vc.is_additional_hub = false)
          AND (p.membership_expires_at IS NULL OR p.membership_expires_at > now())
        )
        -- Option 2: User has basic membership (access to basic content only)
        OR (
          videos.min_membership = 'basic'
          AND p.membership_type IN ('basic', 'premium')
          AND (vc.is_additional_hub IS NULL OR vc.is_additional_hub = false)
          AND (p.membership_expires_at IS NULL OR p.membership_expires_at > now())
        )
        -- Option 3: Video is from additional hub that user purchased
        OR (
          vc.is_additional_hub = true
          AND vc.hub_slug IS NOT NULL
          AND p.purchased_hubs ? vc.hub_slug
        )
      )
    )
  );

-- ============================================
-- 6. UPDATE RLS POLICIES FOR RESOURCES
-- ============================================

-- Drop existing policy for membership-based resource access
DROP POLICY IF EXISTS "Members can view resources based on membership" ON public.resources;

-- Create new policy that checks both membership AND purchased hubs
CREATE POLICY "Members can view resources based on membership"
  ON public.resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      LEFT JOIN public.video_categories vc ON resources.category_id = vc.id
      WHERE p.user_id = auth.uid()
      AND (
        -- Option 1: User has premium membership (access to all main content)
        (
          p.membership_type = 'premium'
          AND (vc.is_additional_hub IS NULL OR vc.is_additional_hub = false)
          AND (p.membership_expires_at IS NULL OR p.membership_expires_at > now())
        )
        -- Option 2: User has basic membership (access to basic content only)
        OR (
          resources.min_membership = 'basic'
          AND p.membership_type IN ('basic', 'premium')
          AND (vc.is_additional_hub IS NULL OR vc.is_additional_hub = false)
          AND (p.membership_expires_at IS NULL OR p.membership_expires_at > now())
        )
        -- Option 3: Resource is from additional hub that user purchased
        OR (
          vc.is_additional_hub = true
          AND vc.hub_slug IS NOT NULL
          AND p.purchased_hubs ? vc.hub_slug
        )
      )
    )
  );

-- ============================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- GIN index for JSONB purchased_hubs array queries
CREATE INDEX IF NOT EXISTS idx_profiles_purchased_hubs
  ON public.profiles USING gin(purchased_hubs);

-- Index for additional hub queries
CREATE INDEX IF NOT EXISTS idx_video_categories_is_additional_hub
  ON public.video_categories(is_additional_hub)
  WHERE is_additional_hub = true;

-- ============================================
-- 8. CREATE HELPER FUNCTIONS
-- ============================================

-- Function to check if user has access to a specific hub
CREATE OR REPLACE FUNCTION public.user_has_hub_access(_user_id UUID, _hub_slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND purchased_hubs ? _hub_slug
  )
$$;

COMMENT ON FUNCTION public.user_has_hub_access IS 'Check if user has purchased access to a specific additional hub';

-- Function to add hub to user's purchased list
CREATE OR REPLACE FUNCTION public.add_purchased_hub(_user_id UUID, _hub_slug TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update user's purchased_hubs array if hub not already present
  UPDATE public.profiles
  SET purchased_hubs =
    CASE
      WHEN purchased_hubs ? _hub_slug THEN purchased_hubs
      ELSE purchased_hubs || jsonb_build_array(_hub_slug)
    END
  WHERE user_id = _user_id;
END;
$$;

COMMENT ON FUNCTION public.add_purchased_hub IS 'Add a hub slug to user purchased_hubs array (used by Stripe webhook)';

-- Function to get all user's purchased hubs
CREATE OR REPLACE FUNCTION public.get_user_purchased_hubs(_user_id UUID)
RETURNS TABLE(hub_slug TEXT, hub_name TEXT, hub_description TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    vc.hub_slug,
    vc.name,
    vc.description
  FROM public.profiles p
  CROSS JOIN LATERAL jsonb_array_elements_text(p.purchased_hubs) AS hub
  JOIN public.video_categories vc ON vc.hub_slug = hub
  WHERE p.user_id = _user_id
    AND vc.is_additional_hub = true
$$;

COMMENT ON FUNCTION public.get_user_purchased_hubs IS 'Get list of all hubs purchased by user with details';

-- ============================================
-- 9. GRANT EXECUTE PERMISSIONS
-- ============================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.user_has_hub_access TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_purchased_hubs TO authenticated;

-- Grant execute on add_purchased_hub only to service role (for webhook)
GRANT EXECUTE ON FUNCTION public.add_purchased_hub TO service_role;

-- ============================================
-- VERIFICATION QUERIES (for testing)
-- ============================================

-- Check new columns exist
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'profiles' AND column_name = 'purchased_hubs';

-- Check additional hub categories
-- SELECT id, name, hub_slug, is_additional_hub, sort_order
-- FROM public.video_categories
-- WHERE is_additional_hub = true;

-- Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename IN ('profiles', 'video_categories')
-- AND indexname LIKE '%hub%';

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, cmd
-- FROM pg_policies
-- WHERE tablename IN ('videos', 'resources')
-- AND policyname LIKE '%membership%';
