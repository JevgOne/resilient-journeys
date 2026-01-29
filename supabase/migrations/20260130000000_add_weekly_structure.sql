-- ============================================
-- RESILIENT JOURNEYS - PHASE 1: WEEKLY STRUCTURE
-- Migration: Add weekly organization to videos and resources
-- ============================================

-- ============================================
-- 1. CREATE VIDEO_TYPE ENUM
-- ============================================

-- Create video_type enum for categorizing videos
DO $$ BEGIN
    CREATE TYPE public.video_type AS ENUM ('eft', 'art_therapy', 'meditation', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE public.video_type IS 'Types of therapeutic videos: EFT tapping, art therapy, meditation, or other content';

-- ============================================
-- 2. ADD COLUMNS TO VIDEOS TABLE
-- ============================================

-- Add week_number column (1-4, nullable for non-weekly content)
DO $$ BEGIN
    ALTER TABLE public.videos ADD COLUMN week_number INTEGER;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

COMMENT ON COLUMN public.videos.week_number IS 'Week number within the month (1-4). NULL for intro videos or non-weekly content.';

-- Add check constraint for week_number range
DO $$ BEGIN
    ALTER TABLE public.videos ADD CONSTRAINT check_week_number_range
        CHECK (week_number IS NULL OR (week_number >= 1 AND week_number <= 4));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add video_type column with default 'other'
DO $$ BEGIN
    ALTER TABLE public.videos ADD COLUMN video_type public.video_type NOT NULL DEFAULT 'other';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

COMMENT ON COLUMN public.videos.video_type IS 'Type of video content: eft (EFT tapping), art_therapy, meditation, or other';

-- Add is_intro column for month introduction videos
DO $$ BEGIN
    ALTER TABLE public.videos ADD COLUMN is_intro BOOLEAN NOT NULL DEFAULT false;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

COMMENT ON COLUMN public.videos.is_intro IS 'TRUE for month introduction videos, FALSE for regular weekly content';

-- ============================================
-- 3. ADD COLUMNS TO RESOURCES TABLE
-- ============================================

-- Add week_number column (1-4, nullable for month-level resources)
DO $$ BEGIN
    ALTER TABLE public.resources ADD COLUMN week_number INTEGER;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

COMMENT ON COLUMN public.resources.week_number IS 'Week number within the month (1-4). NULL for month-level resources.';

-- Add check constraint for week_number range
DO $$ BEGIN
    ALTER TABLE public.resources ADD CONSTRAINT check_resources_week_number_range
        CHECK (week_number IS NULL OR (week_number >= 1 AND week_number <= 4));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add resource_subtype column for additional categorization
DO $$ BEGIN
    ALTER TABLE public.resources ADD COLUMN resource_subtype TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

COMMENT ON COLUMN public.resources.resource_subtype IS 'Additional subtype categorization (e.g., "eft_script", "art_therapy_guide", "meditation_audio")';

-- ============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Index for querying videos by category and week
CREATE INDEX IF NOT EXISTS idx_videos_week
    ON public.videos(category_id, week_number);

-- Index for querying videos by type
CREATE INDEX IF NOT EXISTS idx_videos_type
    ON public.videos(video_type);

-- Composite index for querying videos by category, week, and type
CREATE INDEX IF NOT EXISTS idx_videos_week_type
    ON public.videos(category_id, week_number, video_type);

-- Index for intro videos
CREATE INDEX IF NOT EXISTS idx_videos_intro
    ON public.videos(is_intro) WHERE is_intro = true;

-- Index for querying resources by category and week
CREATE INDEX IF NOT EXISTS idx_resources_week
    ON public.resources(category_id, week_number);

-- Index for querying resources by subtype
CREATE INDEX IF NOT EXISTS idx_resources_subtype
    ON public.resources(resource_subtype) WHERE resource_subtype IS NOT NULL;

-- ============================================
-- 5. HELPFUL COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON INDEX public.idx_videos_week IS 'Optimizes queries for videos filtered by category and week number';
COMMENT ON INDEX public.idx_videos_type IS 'Optimizes queries for videos filtered by therapeutic type';
COMMENT ON INDEX public.idx_videos_week_type IS 'Optimizes queries for videos filtered by category, week, and type together';
COMMENT ON INDEX public.idx_videos_intro IS 'Optimizes queries for finding introduction videos';
COMMENT ON INDEX public.idx_resources_week IS 'Optimizes queries for resources filtered by category and week number';
COMMENT ON INDEX public.idx_resources_subtype IS 'Optimizes queries for resources filtered by subtype';

-- ============================================
-- 6. VERIFICATION QUERIES (commented out)
-- ============================================

-- Uncomment these queries to verify the migration after deployment:

-- Check new columns in videos table:
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'videos'
--   AND column_name IN ('week_number', 'video_type', 'is_intro');

-- Check new columns in resources table:
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'resources'
--   AND column_name IN ('week_number', 'resource_subtype');

-- Check indexes:
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND tablename IN ('videos', 'resources')
--   AND indexname LIKE 'idx_%week%' OR indexname LIKE 'idx_%type%' OR indexname LIKE 'idx_%intro%';

-- Check video_type enum values:
-- SELECT enumlabel
-- FROM pg_enum
-- WHERE enumtypid = 'public.video_type'::regtype
-- ORDER BY enumsortorder;
