-- ============================================
-- Update Video Categories for 4 Programs
-- Smazat staré české kategorie a přidat nové pro Resilient Mind programy
-- ============================================

-- Smazat všechny existující kategorie (CASCADE smaže i videa)
DELETE FROM public.video_categories;

-- Přidat nové kategorie pro 4 programy
INSERT INTO public.video_categories (name, description, month_number, icon) VALUES
  -- Program 1: Adaptation in a Foreign Country (Months 1-3)
  ('First Steps: Finding Solid Ground', 'Practical techniques for calming your nervous system while navigating cultural differences', 1, 'compass'),
  ('Creating Your New Roots', 'Identity transformation and creating an inner home that remains stable anywhere', 2, 'heart'),
  ('The Integration Path', 'Balancing cultural identity while opening to new ways of being', 3, 'globe'),

  -- Program 2: Navigating Inner Landscapes (Months 4-6)
  ('The Emotional Terrain of Expatriation', 'Understanding hidden emotional phases and transforming isolation into self-knowledge', 4, 'brain'),
  ('Reclaiming Your Authentic Self', 'Discovering new dimensions of identity through living between cultures', 5, 'target'),
  ('Soul Alignment', 'Finding meaning and purpose in your expat journey', 6, 'sun'),

  -- Program 3: Financial Freedom Abroad (Months 7-9)
  ('Money Energy Mastery', 'Identifying inherited money beliefs and cultural money values', 7, 'zap'),
  ('Trust & Abundance', 'Building inner certainty and financial security anywhere', 8, 'shield'),
  ('Prosperity Consciousness', 'Manifesting opportunities and living in alignment with abundance', 9, 'users'),

  -- Program 4: Life Beyond Family Borders (Months 10-12)
  ('Heart Bridges', 'Nurturing love and emotional closeness across distances', 10, 'heart'),
  ('Soul Family', 'Creating your tribe and finding authentic friendships abroad', 11, 'users'),
  ('The Integrated Self', 'Embracing your multi-dimensional life and global identity', 12, 'puzzle');
