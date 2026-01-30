-- ============================================
-- FIX VIDEO SORT ORDER - Consistent Free → Basic → Basic → Premium
-- ============================================

-- CRITICAL FIX: Ensure all months have same membership order:
-- Week 1: Free (intro)
-- Week 2: Basic
-- Week 3: Basic
-- Week 4: Premium

-- ============================================
-- 1. ADD sort_order COLUMN IF NOT EXISTS
-- ============================================

ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- ============================================
-- 2. UPDATE SORT ORDER BASED ON MEMBERSHIP PATTERN
-- ============================================

-- This formula ensures consistent order within each month:
-- sort_order = (month_number - 1) * 4 + week_within_month

-- For each video, calculate its position:
-- - Free videos (is_free=true or is_intro=true) = Week 1
-- - Basic videos (min_membership='basic') = Week 2 or 3
-- - Premium videos (min_membership='premium') = Week 4

WITH video_ordering AS (
  SELECT
    v.id,
    vc.month_number,
    v.min_membership,
    v.is_free,
    v.is_intro,
    -- Assign week within month based on membership and current position
    ROW_NUMBER() OVER (
      PARTITION BY vc.month_number
      ORDER BY
        CASE
          WHEN v.is_free = true OR v.is_intro = true THEN 1  -- Free first (Week 1)
          WHEN v.min_membership = 'basic' THEN 2              -- Basic second/third (Week 2-3)
          WHEN v.min_membership = 'premium' THEN 4            -- Premium last (Week 4)
          ELSE 5
        END,
        v.id  -- Secondary sort by ID for stability
    ) as week_in_month,
    -- Calculate global sort order
    ((vc.month_number - 1) * 4) + ROW_NUMBER() OVER (
      PARTITION BY vc.month_number
      ORDER BY
        CASE
          WHEN v.is_free = true OR v.is_intro = true THEN 1
          WHEN v.min_membership = 'basic' THEN 2
          WHEN v.min_membership = 'premium' THEN 4
          ELSE 5
        END,
        v.id
    ) as new_sort_order
  FROM videos v
  JOIN video_categories vc ON v.category_id = vc.id
  WHERE vc.is_additional_hub = false OR vc.is_additional_hub IS NULL
)
UPDATE videos
SET
  sort_order = vo.new_sort_order,
  week_number = vo.week_in_month
FROM video_ordering vo
WHERE videos.id = vo.id;

-- ============================================
-- 3. CREATE INDEX FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_videos_sort_order
  ON public.videos(sort_order);

-- ============================================
-- 4. VERIFICATION QUERY (commented out)
-- ============================================

-- Run this to verify the fix:
/*
SELECT
  vc.name as category,
  vc.month_number,
  v.title,
  v.week_number,
  v.min_membership,
  v.sort_order
FROM videos v
JOIN video_categories vc ON v.category_id = vc.id
WHERE vc.month_number IN (1, 2, 3)
ORDER BY v.sort_order;
*/

-- Expected result for each month:
-- Week 1: Free
-- Week 2: Basic
-- Week 3: Basic
-- Week 4: Premium
