-- ============================================================
-- OMSP Platform — Admin revocation flag
-- Migration: 004_add_is_revoked.sql
--
-- profiles.is_revoked is read/written by /api/admin/users to track admins
-- whose access was revoked (so they can be listed and later restored).
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_revoked BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS profiles_is_revoked_idx ON profiles(is_revoked);
