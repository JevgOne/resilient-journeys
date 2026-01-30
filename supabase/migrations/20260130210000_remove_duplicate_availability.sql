-- ============================================
-- REMOVE DUPLICATE AVAILABILITY ENTRIES
-- ============================================

-- This fixes the issue where time slots appear 2x on booking page
-- because there are duplicate rows in availability table

-- ============================================
-- 1. IDENTIFY AND DELETE DUPLICATES
-- ============================================

-- Keep only one row per (day_of_week, start_time, end_time, is_active) combination
-- Delete duplicates keeping the row with the lowest id

WITH duplicates AS (
  SELECT
    id,
    day_of_week,
    start_time,
    end_time,
    is_active,
    ROW_NUMBER() OVER (
      PARTITION BY day_of_week, start_time, end_time, is_active
      ORDER BY id ASC
    ) as row_num
  FROM availability
)
DELETE FROM availability
WHERE id IN (
  SELECT id
  FROM duplicates
  WHERE row_num > 1
);

-- ============================================
-- 2. ADD UNIQUE CONSTRAINT TO PREVENT FUTURE DUPLICATES
-- ============================================

-- Create unique index to prevent duplicate availability windows
CREATE UNIQUE INDEX IF NOT EXISTS idx_availability_unique_slot
  ON availability(day_of_week, start_time, end_time, is_active)
  WHERE is_active = true;

-- ============================================
-- 3. VERIFICATION QUERY (commented out)
-- ============================================

-- Run this to verify no duplicates remain:
/*
SELECT
  day_of_week,
  start_time,
  end_time,
  is_active,
  COUNT(*) as count
FROM availability
GROUP BY day_of_week, start_time, end_time, is_active
HAVING COUNT(*) > 1;
*/

-- Should return 0 rows if successful
