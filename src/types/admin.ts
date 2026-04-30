// ─── Admin / Auth ─────────────────────────────────────────────────────────────

export type UserRole = "admin" | "member";

export interface Profile {
  id: string;          // matches auth.users.id
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

// ─── Contact Messages ─────────────────────────────────────────────────────────

export type ContactStatus = "unread" | "read" | "archived";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  submitted_at: string;
}

// ─── Sponsors ─────────────────────────────────────────────────────────────────

export type SponsorTier = "platinum" | "gold" | "silver" | "bronze" | "partner";

export interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  tier: SponsorTier;
  is_active: boolean;
  description: string | null;
  created_at: string;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  total_forms: number;
  published_forms: number;
  total_submissions: number;
  submissions_this_month: number;
  total_events: number;
  upcoming_events: number;
  unread_contacts: number;
  active_sponsors: number;
}

// ─── Nav / UI ─────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}
