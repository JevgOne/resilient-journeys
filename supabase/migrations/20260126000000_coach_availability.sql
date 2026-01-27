-- ============================================
-- RESILIENT JOURNEYS - COACH AVAILABILITY SYSTEM
-- Migration: Add coach availability for custom booking system
-- ============================================

-- ============================================
-- 1. COACH AVAILABILITY TABLE
-- ============================================

-- Create day_of_week type for recurring availability
CREATE TYPE IF NOT EXISTS public.day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- Create coach_availability table for recurring weekly slots
CREATE TABLE IF NOT EXISTS public.coach_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week day_of_week NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(day_of_week, start_time)
);

-- Enable RLS
ALTER TABLE public.coach_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Everyone can view availability, only admins can modify
DROP POLICY IF EXISTS "Anyone can view active availability" ON public.coach_availability;
CREATE POLICY "Anyone can view active availability"
  ON public.coach_availability FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage availability" ON public.coach_availability;
CREATE POLICY "Admins can manage availability"
  ON public.coach_availability FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_coach_availability_updated_at ON public.coach_availability;
CREATE TRIGGER update_coach_availability_updated_at
  BEFORE UPDATE ON public.coach_availability
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 2. BLOCKED DATES (HOLIDAYS, VACATIONS, ETC.)
-- ============================================

CREATE TABLE IF NOT EXISTS public.coach_blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(blocked_date)
);

-- Enable RLS
ALTER TABLE public.coach_blocked_dates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can view blocked dates" ON public.coach_blocked_dates;
CREATE POLICY "Anyone can view blocked dates"
  ON public.coach_blocked_dates FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage blocked dates" ON public.coach_blocked_dates;
CREATE POLICY "Admins can manage blocked dates"
  ON public.coach_blocked_dates FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 3. SESSION TYPES CONFIGURATION
-- ============================================

CREATE TABLE IF NOT EXISTS public.session_type_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_type session_type NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price_eur DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_payment BOOLEAN NOT NULL DEFAULT true,
  available_for_premium_credit BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_type_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can view active session types" ON public.session_type_config;
CREATE POLICY "Anyone can view active session types"
  ON public.session_type_config FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage session types" ON public.session_type_config;
CREATE POLICY "Admins can manage session types"
  ON public.session_type_config FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_session_type_config_updated_at ON public.session_type_config;
CREATE TRIGGER update_session_type_config_updated_at
  BEFORE UPDATE ON public.session_type_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default session types
INSERT INTO public.session_type_config (session_type, title, description, duration_minutes, price_eur, requires_payment, available_for_premium_credit, sort_order)
VALUES
  ('discovery', 'Discovery Call', 'A free introductory call to discuss your needs and see if we are a good fit.', 30, 0, false, false, 1),
  ('one_on_one', '1:1 Session', 'Personalised one-on-one guidance tailored to your unique experience.', 60, 87, true, false, 2),
  ('family', 'Family Session', 'Work together as a family to build collective resilience.', 90, 120, true, false, 3),
  ('premium_consultation', 'Premium Consultation', 'Exclusive consultation for Premium members using your included credits.', 60, 0, false, true, 4)
ON CONFLICT (session_type) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  price_eur = EXCLUDED.price_eur,
  requires_payment = EXCLUDED.requires_payment,
  available_for_premium_credit = EXCLUDED.available_for_premium_credit,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- 4. INSERT DEFAULT AVAILABILITY (Mon-Fri 9:00-17:00)
-- ============================================

INSERT INTO public.coach_availability (day_of_week, start_time, end_time, is_active)
VALUES
  ('monday', '09:00', '17:00', true),
  ('tuesday', '09:00', '17:00', true),
  ('wednesday', '09:00', '17:00', true),
  ('thursday', '09:00', '17:00', true),
  ('friday', '09:00', '17:00', true)
ON CONFLICT (day_of_week, start_time) DO NOTHING;

-- ============================================
-- 5. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_coach_availability_day ON public.coach_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_coach_availability_active ON public.coach_availability(is_active);
CREATE INDEX IF NOT EXISTS idx_coach_blocked_dates_date ON public.coach_blocked_dates(blocked_date);
CREATE INDEX IF NOT EXISTS idx_session_type_config_type ON public.session_type_config(session_type);

-- ============================================
-- 6. FUNCTION TO GET AVAILABLE SLOTS FOR A DATE
-- ============================================

CREATE OR REPLACE FUNCTION public.get_available_slots(
  target_date DATE,
  session_duration INTEGER DEFAULT 60
)
RETURNS TABLE (
  slot_start TIMESTAMP WITH TIME ZONE,
  slot_end TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  day_name day_of_week;
  availability_record RECORD;
  slot_time TIME;
  existing_booking RECORD;
  is_slot_available BOOLEAN;
BEGIN
  -- Check if date is blocked
  IF EXISTS (SELECT 1 FROM public.coach_blocked_dates WHERE blocked_date = target_date) THEN
    RETURN;
  END IF;

  -- Get day of week
  day_name := LOWER(to_char(target_date, 'day'))::day_of_week;

  -- Loop through availability for this day
  FOR availability_record IN
    SELECT start_time, end_time
    FROM public.coach_availability
    WHERE day_of_week = day_name AND is_active = true
  LOOP
    -- Generate slots every 30 minutes within the availability window
    slot_time := availability_record.start_time;

    WHILE slot_time + (session_duration || ' minutes')::INTERVAL <= availability_record.end_time LOOP
      -- Check if this slot conflicts with existing bookings
      is_slot_available := NOT EXISTS (
        SELECT 1 FROM public.session_bookings
        WHERE DATE(session_date) = target_date
        AND status IN ('scheduled')
        AND (
          (session_date::TIME, session_date::TIME + (duration_minutes || ' minutes')::INTERVAL)
          OVERLAPS
          (slot_time, slot_time + (session_duration || ' minutes')::INTERVAL)
        )
      );

      IF is_slot_available THEN
        slot_start := target_date + slot_time;
        slot_end := target_date + slot_time + (session_duration || ' minutes')::INTERVAL;
        RETURN NEXT;
      END IF;

      slot_time := slot_time + INTERVAL '30 minutes';
    END LOOP;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
