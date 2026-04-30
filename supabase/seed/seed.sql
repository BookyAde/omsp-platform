-- ============================================================
-- OMSP Platform — Seed Data (development only)
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- NOTE: Create an admin user in Supabase Auth dashboard first, then:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';

-- ─── Sample Events (remove or update before going live) ───────────────────────

INSERT INTO events (title, description, event_date, end_date, location_type, location_detail, is_featured)
VALUES
  (
    'Webinar: Career Pathways for Marine Science Graduates',
    'An in-depth webinar exploring the diverse career options available to marine science graduates. Industry professionals and academics will share their journeys and answer your questions.',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '14 days' + INTERVAL '2 hours',
    'virtual',
    NULL,
    TRUE
  ),
  (
    'GIS for Marine Applications Workshop',
    'Hands-on training in ArcGIS and QGIS for marine spatial analysis. Participants should have a laptop with QGIS installed.',
    NOW() + INTERVAL '45 days',
    NOW() + INTERVAL '46 days',
    'virtual',
    NULL,
    TRUE
  ),
  (
    'CV & LinkedIn Profile Workshop',
    'A practical workshop focused on building compelling CVs and LinkedIn profiles tailored for the marine science job market.',
    NOW() + INTERVAL '90 days',
    NOW() + INTERVAL '90 days' + INTERVAL '3 hours',
    'virtual',
    NULL,
    FALSE
  );
