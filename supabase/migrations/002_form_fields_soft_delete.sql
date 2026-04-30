-- ============================================================
-- OMSP Platform — Migration 002
-- Soft-delete support for form_fields
--
-- Problem: editing a form used to DELETE + re-INSERT all fields,
-- which cascaded to form_submission_values and destroyed history.
--
-- Fix: fields are now soft-deleted (is_active = false) instead of
-- physically removed. Historical submission values are preserved.
-- ============================================================

-- Add soft-delete columns to form_fields
ALTER TABLE form_fields
  ADD COLUMN IF NOT EXISTS is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Index for fast active-field queries
CREATE INDEX IF NOT EXISTS idx_form_fields_is_active
  ON form_fields (form_id, is_active);

-- Back-fill: all existing fields are active
UPDATE form_fields SET is_active = TRUE WHERE is_active IS NULL;
