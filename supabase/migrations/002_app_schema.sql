-- 002_app_schema.sql — app-specific domain tables.
-- Generated deterministically by DevAgent from architecture.dataModels.
-- Do NOT recreate tables from 001_base_schema.sql.

-- Users (users)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz default now() not null,
  subscription_tier text not null
);
alter table public.users enable row level security;
drop policy if exists "users_select_self" on public.users;
create policy "users_select_self" on public.users for select using (auth.uid() = id);
drop policy if exists "users_update_self" on public.users;
create policy "users_update_self" on public.users for update using (auth.uid() = id) with check (auth.uid() = id);

-- CheckIns (check_ins)
create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  mood text not null,
  energy text not null,
  task_status text not null,
  note text,
  checkin_date date not null,
  created_at timestamptz default now() not null
);
create index if not exists check_ins_user_id_idx on public.check_ins(user_id);
alter table public.check_ins enable row level security;
drop policy if exists "check_ins_select_own" on public.check_ins;
create policy "check_ins_select_own" on public.check_ins for select using (auth.uid() = user_id);
drop policy if exists "check_ins_insert_own" on public.check_ins;
create policy "check_ins_insert_own" on public.check_ins for insert with check (auth.uid() = user_id);
drop policy if exists "check_ins_update_own" on public.check_ins;
create policy "check_ins_update_own" on public.check_ins for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "check_ins_delete_own" on public.check_ins;
create policy "check_ins_delete_own" on public.check_ins for delete using (auth.uid() = user_id);

-- Streaks (streaks)
create table if not exists public.streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  current_streak integer not null,
  longest_streak integer not null,
  last_checkin_date date,
  updated_at timestamptz default now() not null
);
create index if not exists streaks_user_id_idx on public.streaks(user_id);
alter table public.streaks enable row level security;
drop policy if exists "streaks_select_own" on public.streaks;
create policy "streaks_select_own" on public.streaks for select using (auth.uid() = user_id);
drop policy if exists "streaks_insert_own" on public.streaks;
create policy "streaks_insert_own" on public.streaks for insert with check (auth.uid() = user_id);
drop policy if exists "streaks_update_own" on public.streaks;
create policy "streaks_update_own" on public.streaks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "streaks_delete_own" on public.streaks;
create policy "streaks_delete_own" on public.streaks for delete using (auth.uid() = user_id);

-- BehavioralDataPoints (behavioral_data_points)
create table if not exists public.behavioral_data_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  source_type text not null,
  source_id uuid,
  pattern_tag text not null,
  signal_value numeric,
  context_json jsonb,
  occurred_at timestamptz not null
);
create index if not exists behavioral_data_points_user_id_idx on public.behavioral_data_points(user_id);
alter table public.behavioral_data_points enable row level security;
drop policy if exists "behavioral_data_points_select_own" on public.behavioral_data_points;
create policy "behavioral_data_points_select_own" on public.behavioral_data_points for select using (auth.uid() = user_id);
drop policy if exists "behavioral_data_points_insert_own" on public.behavioral_data_points;
create policy "behavioral_data_points_insert_own" on public.behavioral_data_points for insert with check (auth.uid() = user_id);
drop policy if exists "behavioral_data_points_update_own" on public.behavioral_data_points;
create policy "behavioral_data_points_update_own" on public.behavioral_data_points for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "behavioral_data_points_delete_own" on public.behavioral_data_points;
create policy "behavioral_data_points_delete_own" on public.behavioral_data_points for delete using (auth.uid() = user_id);

-- Goals (goals)
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  focus_area text,
  status text not null,
  progress_score numeric,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
create index if not exists goals_user_id_idx on public.goals(user_id);
alter table public.goals enable row level security;
drop policy if exists "goals_select_own" on public.goals;
create policy "goals_select_own" on public.goals for select using (auth.uid() = user_id);
drop policy if exists "goals_insert_own" on public.goals;
create policy "goals_insert_own" on public.goals for insert with check (auth.uid() = user_id);
drop policy if exists "goals_update_own" on public.goals;
create policy "goals_update_own" on public.goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "goals_delete_own" on public.goals;
create policy "goals_delete_own" on public.goals for delete using (auth.uid() = user_id);

-- CoachMessages (coach_messages)
create table if not exists public.coach_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  session_id uuid not null,
  role text not null,
  content text not null,
  memory_context_snapshot jsonb,
  token_count integer,
  created_at timestamptz default now() not null
);
create index if not exists coach_messages_user_id_idx on public.coach_messages(user_id);
alter table public.coach_messages enable row level security;
drop policy if exists "coach_messages_select_own" on public.coach_messages;
create policy "coach_messages_select_own" on public.coach_messages for select using (auth.uid() = user_id);
drop policy if exists "coach_messages_insert_own" on public.coach_messages;
create policy "coach_messages_insert_own" on public.coach_messages for insert with check (auth.uid() = user_id);
drop policy if exists "coach_messages_update_own" on public.coach_messages;
create policy "coach_messages_update_own" on public.coach_messages for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "coach_messages_delete_own" on public.coach_messages;
create policy "coach_messages_delete_own" on public.coach_messages for delete using (auth.uid() = user_id);

-- Retrospectives (retrospectives)
create table if not exists public.retrospectives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  week_start_date date not null,
  week_end_date date not null,
  summary_text text,
  detected_patterns jsonb,
  wins jsonb,
  next_step text,
  completion_stats jsonb,
  quality_rating integer,
  is_locked boolean not null,
  generation_index integer not null,
  created_at timestamptz default now() not null
);
create index if not exists retrospectives_user_id_idx on public.retrospectives(user_id);
alter table public.retrospectives enable row level security;
drop policy if exists "retrospectives_select_own" on public.retrospectives;
create policy "retrospectives_select_own" on public.retrospectives for select using (auth.uid() = user_id);
drop policy if exists "retrospectives_insert_own" on public.retrospectives;
create policy "retrospectives_insert_own" on public.retrospectives for insert with check (auth.uid() = user_id);
drop policy if exists "retrospectives_update_own" on public.retrospectives;
create policy "retrospectives_update_own" on public.retrospectives for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "retrospectives_delete_own" on public.retrospectives;
create policy "retrospectives_delete_own" on public.retrospectives for delete using (auth.uid() = user_id);

-- Nudges (nudges)
create table if not exists public.nudges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  drift_type text not null,
  title text not null,
  body_text text not null,
  suggested_action text not null,
  context_data_points uuid[],
  state text not null,
  snoozed_until timestamptz,
  delivered_at timestamptz not null,
  acted_at timestamptz
);
create index if not exists nudges_user_id_idx on public.nudges(user_id);
alter table public.nudges enable row level security;
drop policy if exists "nudges_select_own" on public.nudges;
create policy "nudges_select_own" on public.nudges for select using (auth.uid() = user_id);
drop policy if exists "nudges_insert_own" on public.nudges;
create policy "nudges_insert_own" on public.nudges for insert with check (auth.uid() = user_id);
drop policy if exists "nudges_update_own" on public.nudges;
create policy "nudges_update_own" on public.nudges for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "nudges_delete_own" on public.nudges;
create policy "nudges_delete_own" on public.nudges for delete using (auth.uid() = user_id);

-- NotificationSettings (notification_settings)
create table if not exists public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  checkin_reminders_enabled boolean not null,
  checkin_reminder_time timetz,
  nudge_notifications_enabled boolean not null,
  nudge_intensity integer not null,
  retrospective_notifications_enabled boolean not null,
  push_token text,
  updated_at timestamptz default now() not null
);
create index if not exists notification_settings_user_id_idx on public.notification_settings(user_id);
alter table public.notification_settings enable row level security;
drop policy if exists "notification_settings_select_own" on public.notification_settings;
create policy "notification_settings_select_own" on public.notification_settings for select using (auth.uid() = user_id);
drop policy if exists "notification_settings_insert_own" on public.notification_settings;
create policy "notification_settings_insert_own" on public.notification_settings for insert with check (auth.uid() = user_id);
drop policy if exists "notification_settings_update_own" on public.notification_settings;
create policy "notification_settings_update_own" on public.notification_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "notification_settings_delete_own" on public.notification_settings;
create policy "notification_settings_delete_own" on public.notification_settings for delete using (auth.uid() = user_id);

-- Achievements (achievements)
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  achievement_key text not null,
  unlocked_at timestamptz not null,
  is_shared boolean not null
);
create index if not exists achievements_user_id_idx on public.achievements(user_id);
alter table public.achievements enable row level security;
drop policy if exists "achievements_select_own" on public.achievements;
create policy "achievements_select_own" on public.achievements for select using (auth.uid() = user_id);
drop policy if exists "achievements_insert_own" on public.achievements;
create policy "achievements_insert_own" on public.achievements for insert with check (auth.uid() = user_id);
drop policy if exists "achievements_update_own" on public.achievements;
create policy "achievements_update_own" on public.achievements for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "achievements_delete_own" on public.achievements;
create policy "achievements_delete_own" on public.achievements for delete using (auth.uid() = user_id);

-- AchievementDefinitions (achievement_definitions)
create table if not exists public.achievement_definitions (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  title text not null,
  description text not null,
  icon_url text,
  category text not null,
  threshold_value integer
);
alter table public.achievement_definitions enable row level security;
drop policy if exists "achievement_definitions_read_public" on public.achievement_definitions;
drop policy if exists "achievement_definitions_select_scoped" on public.achievement_definitions;
drop policy if exists "achievement_definitions_read_authenticated" on public.achievement_definitions;
drop policy if exists "achievement_definitions_update_scoped" on public.achievement_definitions;
drop policy if exists "achievement_definitions_delete_scoped" on public.achievement_definitions;
create policy "achievement_definitions_read_public" on public.achievement_definitions for select to anon, authenticated using (true);

-- FaqEntries (faq_entries)
create table if not exists public.faq_entries (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  sort_order integer not null,
  is_active boolean not null
);
alter table public.faq_entries enable row level security;
drop policy if exists "faq_entries_read_public" on public.faq_entries;
drop policy if exists "faq_entries_select_scoped" on public.faq_entries;
drop policy if exists "faq_entries_read_authenticated" on public.faq_entries;
drop policy if exists "faq_entries_update_scoped" on public.faq_entries;
drop policy if exists "faq_entries_delete_scoped" on public.faq_entries;
create policy "faq_entries_read_public" on public.faq_entries for select to anon, authenticated using (true);



