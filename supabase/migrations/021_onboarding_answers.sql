-- profiles: add onboarding_answers jsonb column.
-- Onboarding capture answers are model-authored per app (arbitrary field keys).
-- Storing the whole answers object in one jsonb column removes the drift between
-- model-authored keys and generated columns and needs no per-key migration.
-- ADD COLUMN IF NOT EXISTS so this also reaches already-provisioned managed apps.
alter table public.profiles
  add column if not exists onboarding_answers jsonb not null default '{}'::jsonb;
