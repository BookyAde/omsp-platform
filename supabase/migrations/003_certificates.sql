create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),

  certificate_id text unique not null,
  source text not null default 'form_submission',
  form_id uuid references forms(id) on delete set null,
  submission_id uuid references form_submissions(id) on delete set null,

  recipient_name text not null,
  recipient_email text,
  programme_title text not null,
  certificate_type text not null default 'Participation',

  issue_date date not null default current_date,
  status text not null default 'valid',

  verification_url text,
  qr_code_data_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint certificates_status_check
  check (status in ('valid', 'revoked', 'expired'))
);

alter table certificates enable row level security;

create policy "Public can verify valid certificates"
on certificates
for select
using (true);

create policy "Admins can manage certificates"
on certificates
for all
using (is_admin())
with check (is_admin());

create index if not exists certificates_certificate_id_idx
on certificates(certificate_id);

create index if not exists certificates_submission_id_idx
on certificates(submission_id);