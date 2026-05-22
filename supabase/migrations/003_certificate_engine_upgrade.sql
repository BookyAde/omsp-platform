alter table certificates
add column if not exists certificate_title text,
add column if not exists recipient_email text,
add column if not exists template_id text default 'classic-maritime',
add column if not exists design_overrides jsonb default '{}'::jsonb,
add column if not exists pdf_url text,
add column if not exists email_sent boolean default false,
add column if not exists email_sent_at timestamptz;

create table if not exists signatory_presets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null,
  signature_image_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists certificate_assets (
  id uuid primary key default gen_random_uuid(),
  certificate_id uuid references certificates(id) on delete cascade,
  pdf_url text not null,
  file_size_kb integer,
  generated_at timestamptz default now()
);