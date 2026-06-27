// App-specific types for MindThread
// Do NOT duplicate template types (User, Notification, Bookmark, etc.)

export type SubscriptionTier = 'free' | 'pro';

export interface AppUser {
  id: string;
  email: string;
  created_at: string;
  subscription_tier: SubscriptionTier;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  adhd_context: string | null;
  work_role: string | null;
  work_role_custom: string | null;
  primary_goal: string | null;
  emotional_triggers: string[] | null;
  goal_anchor: string | null;
  checkin_cadence: string | null;
  checkin_reminder_time: string | null;
  nudge_intensity: number | null;
  theme: string | null;
  push_notifications_enabled: boolean;
  onboarding_completed: boolean;
  memory_depth_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  mood: string;
  energy: string;
  task_status: string;
  note: string | null;
  checkin_date: string;
  created_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_checkin_date: string | null;
  updated_at: string;
}

export interface BehavioralDataPoint {
  id: string;
  user_id: string;
  source_type: string;
  source_id: string | null;
  pattern_tag: string;
  signal_value: number | null;
  context_json: Record<string, unknown> | null;
  occurred_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  focus_area: string | null;
  status: string;
  progress_score: number | null;
  created_at: string;
  updated_at: string;
}

export type CoachRole = 'user' | 'coach' | 'system';

export interface CoachMessage {
  id: string;
  user_id: string;
  session_id: string;
  role: CoachRole;
  content: string;
  memory_context_snapshot: Record<string, unknown> | null;
  token_count: number | null;
  created_at: string;
}

export interface CoachSection {
  heading: string;
  body: string;
}

export interface Retrospective {
  id: string;
  user_id: string;
  week_start_date: string;
  week_end_date: string;
  summary_text: string | null;
  detected_patterns: Record<string, unknown> | null;
  wins: Record<string, unknown> | null;
  next_step: string | null;
  completion_stats: Record<string, unknown> | null;
  quality_rating: number | null;
  is_locked: boolean;
  generation_index: number;
  created_at: string;
}

export type NudgeState = 'delivered' | 'read' | 'acted' | 'dismissed' | 'snoozed';

export interface Nudge {
  id: string;
  user_id: string;
  drift_type: string;
  title: string;
  body_text: string;
  suggested_action: string;
  context_data_points: string[] | null;
  state: NudgeState;
  snoozed_until: string | null;
  delivered_at: string;
  acted_at: string | null;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  checkin_reminders_enabled: boolean;
  checkin_reminder_time: string | null;
  nudge_notifications_enabled: boolean;
  nudge_intensity: number;
  retrospective_notifications_enabled: boolean;
  push_token: string | null;
  updated_at: string;
}

export interface AchievementRow {
  id: string;
  user_id: string;
  achievement_key: string;
  unlocked_at: string;
  is_shared: boolean;
}

export interface AchievementDefinition {
  key: string;
  title: string;
  description: string;
  icon_url: string | null;
  category: string;
  threshold_value: number | null;
}

export interface UnlockedAchievement extends AchievementRow {
  definition: AchievementDefinition | null;
}

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface BehavioralInsights {
  completion_rate_trend: { week_start: string; rate: number }[];
  trigger_pattern_frequencies: { pattern_tag: string; count: number }[];
  avoidance_cycles_detected: number;
  memory_depth_score: number;
  pro_locked: boolean;
}

export interface RevenueCatPackage {
  identifier: string;
  product_id: string;
  price_string: string;
  period: 'monthly' | 'annual';
  trial_eligible: boolean;
}

export interface IntakeEcho {
  sections: CoachSection[];
}

export interface CheckInSubmission {
  mood: string;
  energy: string;
  task_status: string;
  note?: string | null;
}

export interface DataExportResult {
  download_url: string;
  expires_at: string;
}
