-- ============================================================
-- OMSP Platform — Initial Database Schema
-- Migration: 001_initial_schema.sql
--
-- Run this in your Supabase SQL editor (or via supabase db push)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ─────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('admin', 'member');

CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  role        user_role NOT NULL DEFAULT 'member',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- FORMS
-- ─────────────────────────────────────────────────────────────

CREATE TYPE form_status AS ENUM ('draft', 'published', 'closed');

CREATE TABLE forms (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  status      form_status NOT NULL DEFAULT 'draft',
  deadline    TIMESTAMPTZ,
  created_by  UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_forms_slug   ON forms(slug);
CREATE INDEX idx_forms_status ON forms(status);

-- ─────────────────────────────────────────────────────────────
-- FORM FIELDS
-- ─────────────────────────────────────────────────────────────

CREATE TYPE field_type AS ENUM (
  'text', 'textarea', 'email', 'phone',
  'select', 'radio', 'checkbox', 'date', 'file'
);

CREATE TABLE form_fields (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id      UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  label        TEXT NOT NULL,
  field_type   field_type NOT NULL,
  placeholder  TEXT,
  required     BOOLEAN NOT NULL DEFAULT FALSE,
  options      TEXT[],               -- for select, radio, checkbox
  field_order  INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_form_fields_form_id ON form_fields(form_id);

-- ─────────────────────────────────────────────────────────────
-- FORM SUBMISSIONS
-- ─────────────────────────────────────────────────────────────

CREATE TABLE form_submissions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id       UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address    TEXT
);

CREATE INDEX idx_submissions_form_id      ON form_submissions(form_id);
CREATE INDEX idx_submissions_submitted_at ON form_submissions(submitted_at DESC);

-- ─────────────────────────────────────────────────────────────
-- FORM SUBMISSION VALUES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE form_submission_values (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id  UUID NOT NULL REFERENCES form_submissions(id) ON DELETE CASCADE,
  field_id       UUID NOT NULL REFERENCES form_fields(id) ON DELETE CASCADE,
  value          TEXT NOT NULL DEFAULT ''
);

CREATE INDEX idx_submission_values_submission_id ON form_submission_values(submission_id);

-- ─────────────────────────────────────────────────────────────
-- EVENTS
-- ─────────────────────────────────────────────────────────────

CREATE TYPE event_location_type AS ENUM ('virtual', 'physical', 'hybrid');

CREATE TABLE events (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                  TEXT NOT NULL,
  description            TEXT,
  event_date             TIMESTAMPTZ NOT NULL,
  end_date               TIMESTAMPTZ,
  location_type          event_location_type NOT NULL DEFAULT 'virtual',
  location_detail        TEXT,           -- URL or address
  registration_form_id   UUID REFERENCES forms(id) ON DELETE SET NULL,
  is_featured            BOOLEAN NOT NULL DEFAULT FALSE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_event_date  ON events(event_date);
CREATE INDEX idx_events_is_featured ON events(is_featured);

-- ─────────────────────────────────────────────────────────────
-- CONTACTS
-- ─────────────────────────────────────────────────────────────

CREATE TYPE contact_status AS ENUM ('unread', 'read', 'archived');

CREATE TABLE contacts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  subject       TEXT NOT NULL,
  message       TEXT NOT NULL,
  status        contact_status NOT NULL DEFAULT 'unread',
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contacts_status       ON contacts(status);
CREATE INDEX idx_contacts_submitted_at ON contacts(submitted_at DESC);

-- ─────────────────────────────────────────────────────────────
-- SPONSORS
-- ─────────────────────────────────────────────────────────────

CREATE TYPE sponsor_tier AS ENUM ('platinum', 'gold', 'silver', 'bronze', 'partner');

CREATE TABLE sponsors (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  logo_url     TEXT,
  website_url  TEXT,
  tier         sponsor_tier NOT NULL DEFAULT 'partner',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sponsors_tier      ON sponsors(tier);
CREATE INDEX idx_sponsors_is_active ON sponsors(is_active);

-- ─────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGERS (auto-update on row change)
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER forms_updated_at
  BEFORE UPDATE ON forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────

ALTER TABLE profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields            ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submission_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE events                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors               ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ── Profiles ──
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT USING (is_admin());

-- ── Forms: public can read published, admins manage all ──
CREATE POLICY "Published forms are public"
  ON forms FOR SELECT USING (status = 'published');

CREATE POLICY "Admins manage forms"
  ON forms FOR ALL USING (is_admin());

-- ── Form fields: follow form visibility ──
CREATE POLICY "Fields of published forms are public"
  ON form_fields FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_fields.form_id AND forms.status = 'published'
    )
  );

CREATE POLICY "Admins manage form fields"
  ON form_fields FOR ALL USING (is_admin());

-- ── Submissions: anyone can insert, only admins can read ──
CREATE POLICY "Anyone can submit a form"
  ON form_submissions FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can read submissions"
  ON form_submissions FOR SELECT USING (is_admin());

CREATE POLICY "Anyone can insert submission values"
  ON form_submission_values FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can read submission values"
  ON form_submission_values FOR SELECT USING (is_admin());

-- ── Events: public can read, admins manage ──
CREATE POLICY "Events are public"
  ON events FOR SELECT USING (TRUE);

CREATE POLICY "Admins manage events"
  ON events FOR ALL USING (is_admin());

-- ── Contacts: anyone can insert, admins read ──
CREATE POLICY "Anyone can submit contact"
  ON contacts FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins read contacts"
  ON contacts FOR SELECT USING (is_admin());

CREATE POLICY "Admins manage contacts"
  ON contacts FOR UPDATE USING (is_admin());

-- ── Sponsors: public can read active ones, admins manage all ──
CREATE POLICY "Active sponsors are public"
  ON sponsors FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins manage sponsors"
  ON sponsors FOR ALL USING (is_admin());

-- ─────────────────────────────────────────────────────────────
-- STORAGE BUCKETS
-- ─────────────────────────────────────────────────────────────
-- Run these in your Supabase dashboard > Storage, or via CLI:
--
-- supabase storage create form-uploads  --public=false
-- supabase storage create sponsor-logos --public=true
-- supabase storage create assets        --public=true
