-- ============================================
-- FIX WEEK MEMBERSHIP PATTERN
-- ============================================

-- CRITICAL FIX: Set correct membership for each week:
-- Week 1: Free (intro)
-- Week 2: Basic
-- Week 3: Basic
-- Week 4: Premium

-- This affects ALL videos in each week (EFT, Art, Meditation)

-- ============================================
-- 1. UPDATE WEEK 1: Set to FREE
-- ============================================

UPDATE videos v
SET
  min_membership = 'free',
  is_free = true
FROM video_categories vc
WHERE v.category_id = vc.id
  AND v.week_number = 1
  AND (vc.is_additional_hub = false OR vc.is_additional_hub IS NULL);

-- ============================================
-- 2. UPDATE WEEK 2: Set to BASIC
-- ============================================

UPDATE videos v
SET
  min_membership = 'basic',
  is_free = false
FROM video_categories vc
WHERE v.category_id = vc.id
  AND v.week_number = 2
  AND (vc.is_additional_hub = false OR vc.is_additional_hub IS NULL);

-- ============================================
-- 3. UPDATE WEEK 3: Set to BASIC (CRITICAL FIX)
-- ============================================

UPDATE videos v
SET
  min_membership = 'basic',
  is_free = false
FROM video_categories vc
WHERE v.category_id = vc.id
  AND v.week_number = 3
  AND (vc.is_additional_hub = false OR vc.is_additional_hub IS NULL);

-- ============================================
-- 4. UPDATE WEEK 4: Set to PREMIUM (CRITICAL FIX)
-- ============================================

UPDATE videos v
SET
  min_membership = 'premium',
  is_free = false
FROM video_categories vc
WHERE v.category_id = vc.id
  AND v.week_number = 4
  AND (vc.is_additional_hub = false OR vc.is_additional_hub IS NULL);

-- ============================================
-- 5. RECALCULATE SORT ORDER WITH CORRECT PATTERN
-- ============================================

-- Now that membership is correct, recalculate sort order
WITH video_ordering AS (
  SELECT
    v.id,
    vc.month_number,
    v.week_number,
    -- Global sort order: (month - 1) * 4 + week
    ((vc.month_number - 1) * 4) + v.week_number as new_sort_order
  FROM videos v
  JOIN video_categories vc ON v.category_id = vc.id
  WHERE vc.is_additional_hub = false OR vc.is_additional_hub IS NULL
)
UPDATE videos
SET sort_order = vo.new_sort_order
FROM video_ordering vo
WHERE videos.id = vo.id;

-- ============================================
-- 6. VERIFICATION QUERY (commented out)
-- ============================================

-- Run this to verify the fix:
/*
SELECT
  vc.name as category,
  vc.month_number,
  v.week_number,
  v.min_membership,
  v.video_type,
  v.title,
  v.sort_order
FROM videos v
JOIN video_categories vc ON v.category_id = vc.id
WHERE vc.month_number IN (1, 2, 3)
ORDER BY vc.month_number, v.week_number, v.video_type;
*/

-- Expected result for each month:
-- Week 1: min_membership = 'free' (all 3 videos: eft, art, meditation)
-- Week 2: min_membership = 'basic' (all 3 videos)
-- Week 3: min_membership = 'basic' (all 3 videos)
-- Week 4: min_membership = 'premium' (all 3 videos)
