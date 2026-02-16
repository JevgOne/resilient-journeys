-- Add 'endometriosis_support' to session_type enum
-- This is required for the booking system to accept endometriosis support bookings

ALTER TYPE public.session_type ADD VALUE IF NOT EXISTS 'endometriosis_support';

-- Fix incorrect session prices in get_session_price function
-- Old prices were wrong: one_on_one=8700 (€87), family=12000 (€120)
-- Correct prices: one_on_one=10700 (€107), family=12700 (€127)
CREATE OR REPLACE FUNCTION public.get_session_price(p_session_type session_type)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE p_session_type
    WHEN 'discovery' THEN 0
    WHEN 'one_on_one' THEN 10700
    WHEN 'family' THEN 12700
    WHEN 'endometriosis_support' THEN 14700
    WHEN 'premium_consultation' THEN 8700
    ELSE 0
  END;
END;
$$;
