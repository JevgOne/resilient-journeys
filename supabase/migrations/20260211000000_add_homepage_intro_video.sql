-- Add homepage intro video CMS field
INSERT INTO cms_content (key, value, description, page, section, field_type)
VALUES (
  'homepage_intro_video',
  '',
  'YouTube or Vimeo URL for the homepage intro video. Leave empty to hide the section.',
  'homepage',
  'intro_video',
  'video_url'
)
ON CONFLICT (key) DO NOTHING;
