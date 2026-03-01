-- ============================================
-- PROGRESSIVE MONTH UNLOCK
-- Track how many program months a user has unlocked via payments.
-- Each monthly payment increments months_unlocked by 1.
-- Yearly plans set it to 12.
-- ============================================

-- 1. Add column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS months_unlocked INTEGER NOT NULL DEFAULT 0;

-- 2. Backfill: existing paid members get 1 month unlocked
UPDATE public.profiles
SET months_unlocked = 1
WHERE membership_type IN ('basic', 'premium')
  AND membership_started_at IS NOT NULL
  AND months_unlocked = 0;
