-- ===============================================
-- Populate availability table with default data
-- Monday-Friday 9:00-17:00
-- ===============================================

-- day_of_week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
INSERT INTO public.availability (day_of_week, start_time, end_time, is_active)
VALUES
  (1, '09:00', '17:00', true),  -- Monday
  (2, '09:00', '17:00', true),  -- Tuesday
  (3, '09:00', '17:00', true),  -- Wednesday
  (4, '09:00', '17:00', true),  -- Thursday
  (5, '09:00', '17:00', true)   -- Friday
ON CONFLICT DO NOTHING;
