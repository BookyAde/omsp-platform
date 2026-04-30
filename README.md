# OMSP — Organization of Marine Science Professionals
## Production Platform

A full-stack institutional platform for student engagement, skill development, career exposure, and community impact in marine science.

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | Next.js 14 (App Router)             |
| Language    | TypeScript                          |
| Styling     | Tailwind CSS                        |
| Database    | Supabase (PostgreSQL)               |
| Auth        | Supabase Auth                       |
| Storage     | Supabase Storage                    |
| Deployment  | Vercel (recommended)                |

---

## Project Structure

```
omsp/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout (fonts, metadata)
│   │   ├── page.tsx                    # Homepage
│   │   │
│   │   ├── (public)/                   # Public route group
│   │   │   ├── about/page.tsx
│   │   │   ├── programs/page.tsx
│   │   │   ├── events/page.tsx
│   │   │   ├── opportunities/page.tsx
│   │   │   ├── partners/page.tsx
│   │   │   └── contact/page.tsx
│   │   │
│   │   ├── (admin)/                    # Protected admin route group
│   │   │   ├── layout.tsx              # Admin shell with sidebar
│   │   │   ├── dashboard/page.tsx      # Overview stats
│   │   │   ├── forms/
│   │   │   │   ├── page.tsx            # All forms list
│   │   │   │   ├── new/page.tsx        # Create form
│   │   │   │   └── [id]/page.tsx       # Edit form
│   │   │   ├── submissions/page.tsx    # All submissions
│   │   │   ├── events/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── contacts/page.tsx
│   │   │   ├── sponsors/page.tsx
│   │   │   └── content/page.tsx
│   │   │
│   │   ├── f/[slug]/page.tsx           # Public form submission URL
│   │   │
│   │   └── api/                        # API Routes
│   │       ├── forms/route.ts
│   │       ├── submissions/route.ts
│   │       ├── events/route.ts
│   │       ├── contacts/route.ts
│   │       └── sponsors/route.ts
│   │
│   ├── components/
│   │   ├── ui/                         # Primitive components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── Toast.tsx
│   │   │
│   │   ├── layout/                     # Site-wide layout components
│   │   │   ├── Header.tsx              # Public site header/nav
│   │   │   ├── Footer.tsx
│   │   │   ├── Logo.tsx               # Logo placeholder component
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── PublicNav.tsx
│   │   │   └── MobileNav.tsx
│   │   │
│   │   ├── dashboard/                  # Admin dashboard widgets
│   │   │   ├── StatsCard.tsx
│   │   │   ├── RecentSubmissions.tsx
│   │   │   ├── RecentContacts.tsx
│   │   │   └── QuickActions.tsx
│   │   │
│   │   ├── forms/                      # Form builder + public form
│   │   │   ├── FormBuilder.tsx         # Admin drag/config UI
│   │   │   ├── FormField.tsx           # Single field component
│   │   │   ├── FormPreview.tsx         # Preview panel
│   │   │   ├── PublicForm.tsx          # Rendered public form
│   │   │   └── SubmissionTable.tsx     # Submissions data table
│   │   │
│   │   └── public/                     # Homepage / public page sections
│   │       ├── HeroSection.tsx
│   │       ├── VisionSection.tsx
│   │       ├── PillarsSection.tsx
│   │       ├── RoadmapSection.tsx
│   │       ├── EventsSection.tsx
│   │       ├── OpportunitiesSection.tsx
│   │       ├── SponsorsSection.tsx
│   │       └── ContactSection.tsx
│   │
│   ├── lib/
│   │   ├── supabase.ts                 # Supabase client (browser + server)
│   │   ├── utils.ts                    # Shared utilities
│   │   ├── constants.ts                # App-wide constants
│   │   └── validations.ts             # Zod schemas
│   │
│   ├── types/
│   │   ├── index.ts                    # Re-exports
│   │   ├── forms.ts                    # Form + field types
│   │   ├── events.ts                   # Event types
│   │   └── admin.ts                   # Admin/dashboard types
│   │
│   └── hooks/
│       ├── useAuth.ts
│       ├── useForms.ts
│       ├── useEvents.ts
│       └── useSubmissions.ts
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql      # Full database schema
│   └── seed/
│       └── seed.sql                    # Sample data for development
│
├── public/
│   ├── images/                         # Static images
│   └── fonts/                          # Self-hosted fonts (if any)
│
├── .env.local.example                  # Environment variable template
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Setup Instructions

### 1. Clone and install

```bash
npm install
```

### 2. Set up Supabase

- Create a project at https://supabase.com
- Run the migration file: `supabase/migrations/001_initial_schema.sql`
- Copy `.env.local.example` to `.env.local` and fill in your keys

### 3. Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run development server

```bash
npm run dev
```

### 5. Create admin user

- Register via Supabase Auth dashboard or via the `/api/admin/setup` endpoint
- Set `role = 'admin'` in the `profiles` table

---

## Route Map

| Route                        | Description                       | Access  |
|------------------------------|-----------------------------------|---------|
| `/`                          | Homepage                          | Public  |
| `/about`                     | About OMSP                        | Public  |
| `/programs`                  | Training programs                 | Public  |
| `/events`                    | Events listing                    | Public  |
| `/opportunities`             | Forms hub                         | Public  |
| `/partners`                  | Sponsors & partners               | Public  |
| `/contact`                   | Contact page                      | Public  |
| `/f/[slug]`                  | Public form submission            | Public  |
| `/admin/dashboard`           | Admin overview                    | Admin   |
| `/admin/forms`               | Form management                   | Admin   |
| `/admin/forms/new`           | Create new form                   | Admin   |
| `/admin/forms/[id]`          | Edit form                         | Admin   |
| `/admin/submissions`         | View all submissions              | Admin   |
| `/admin/events`              | Event management                  | Admin   |
| `/admin/contacts`            | Contact messages                  | Admin   |
| `/admin/sponsors`            | Sponsor management                | Admin   |
| `/admin/content`             | Content management                | Admin   |

---

## Design System

**Color palette:**

| Token             | Value     | Use                          |
|-------------------|-----------|------------------------------|
| `ocean-950`       | `#020f1e`  | Deep backgrounds             |
| `ocean-900`       | `#041529`  | Dark sections                |
| `ocean-800`       | `#062241`  | Cards, panels                |
| `ocean-600`       | `#0a4575`  | Mid-tones                    |
| `teal-500`        | `#0d9488`  | Primary accent               |
| `teal-400`        | `#2dd4bf`  | Hover states                 |
| `sky-300`         | `#7dd3fc`  | Subtle highlights            |
| `white`           | `#ffffff`  | Text on dark                 |
| `slate-400`       | `#94a3b8`  | Muted text                   |

**Typography:**
- Display: `Playfair Display` — institutional authority
- Body: `DM Sans` — clean, modern readability
- Mono: `JetBrains Mono` — code/form fields

---

## Development Phases

- [x] Phase 1 — Architecture & folder structure
- [ ] Phase 2 — Database schema (SQL)
- [ ] Phase 3 — Core layout + homepage UI
- [ ] Phase 4 — Admin dashboard
- [ ] Phase 5 — Dynamic form builder
- [ ] Phase 6 — Events + contact system
- [ ] Phase 7 — Final polish + deployment
