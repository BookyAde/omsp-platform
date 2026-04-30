/**
 * lib/constants.ts — App-wide constants
 */

export const SITE_NAME = "OMSP";
export const SITE_FULL_NAME = "Organization of Marine Science Professionals";
export const SITE_DESCRIPTION =
  "Building a strong network of marine science students and professionals, engaged in ocean sustainability and community impact.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://omsp.org";

// ─── Navigation ───────────────────────────────────────────────────────────────

export const PUBLIC_NAV = [
  { label: "About",         href: "/about" },
  { label: "Programs",      href: "/programs" },
  { label: "Events",        href: "/events" },
  { label: "Opportunities", href: "/opportunities" },
  { label: "Partners",      href: "/partners" },
  { label: "Contact",       href: "/contact" },
] as const;

export const ADMIN_NAV = [
  { label: "Dashboard",    href: "/admin/dashboard",   icon: "LayoutDashboard" },
  { label: "Forms",        href: "/admin/forms",        icon: "FileText" },
  { label: "Submissions",  href: "/admin/submissions",  icon: "Inbox" },
  { label: "Events",       href: "/admin/events",       icon: "Calendar" },
  { label: "Broadcasts",   href: "/admin/broadcasts",   icon: "PenLine" },
  { label: "Contacts",     href: "/admin/contacts",     icon: "Mail" },
  { label: "Sponsors",     href: "/admin/sponsors",     icon: "Building2" },
] as const;

// ─── Form field types (for UI labels) ─────────────────────────────────────────

export const FIELD_TYPE_LABELS: Record<string, string> = {
  text:     "Short Text",
  textarea: "Long Text",
  email:    "Email Address",
  phone:    "Phone Number",
  select:   "Dropdown (Select)",
  radio:    "Multiple Choice (Radio)",
  checkbox: "Checkboxes",
  date:     "Date Picker",
  file: "File Upload",
};

// ─── Sponsor tiers ────────────────────────────────────────────────────────────

export const SPONSOR_TIERS = [
  { value: "platinum", label: "Platinum", color: "sky" },
  { value: "gold",     label: "Gold",     color: "yellow" },
  { value: "silver",   label: "Silver",   color: "slate" },
  { value: "bronze",   label: "Bronze",   color: "orange" },
  { value: "partner",  label: "Partner",  color: "teal" },
] as const;

// ─── Roadmap milestones (from PDF) ────────────────────────────────────────────

export const ROADMAP_MILESTONES = [
  {
    month: "Month 1",
    title: "Kickoff",
    items: [
      "Webinar on career pathways for Marine Science graduates",
      "Establish WhatsApp and LinkedIn community",
      "Assign and confirm team roles",
    ],
  },
  {
    month: "Month 3",
    title: "Skill Development",
    items: [
      "GIS for Marine Applications (ArcGIS / QGIS)",
      "Ocean Data Analysis (Python / Excel)",
      "Track selection for participants",
    ],
  },
  {
    month: "Month 6",
    title: "Career Exposure",
    items: [
      "CV and LinkedIn profile workshop",
      "Professional networking session",
    ],
  },
  {
    month: "Month 9",
    title: "Career Writing",
    items: [
      "Cover letter, SOP, and cold email workshop",
      "Application strategy session",
    ],
  },
  {
    month: "Month 12",
    title: "Annual Conference",
    items: [
      "OMSP Virtual Conference",
      "Student presentations (prize for best presentation)",
      "Annual report publication",
    ],
  },
] as const;
