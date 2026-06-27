export type TaskStatus = 'completed' | 'partial' | 'avoided';

export interface CheckIn {
  id: string;
  user_id: string;
  mood: number;
  energy: number;
  task_status: TaskStatus;
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

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  focus_area: string | null;
  status: string;
  progress_score: number | null;
  created_at: string;
}

export interface CoachMessage {
  id: string;
  user_id: string;
  session_id: string | null;
  role: 'user' | 'coach';
  content: string;
  token_count: number | null;
  created_at: string;
}

export interface Retrospective {
  id: string;
  user_id: string;
  week_start_date: string;
  week_end_date: string;
  summary_text: string | null;
  detected_patterns: string[] | null;
  wins: string[] | null;
  next_step: string | null;
  completion_stats: Record<string, number> | null;
  quality_rating: number | null;
  is_locked: boolean;
  generation_index: number | null;
  created_at: string;
}

export interface Nudge {
  id: string;
  user_id: string;
  drift_type: string | null;
  title: string;
  body_text: string;
  suggested_action: string | null;
  state: 'pending' | 'acted' | 'snoozed' | 'dismissed';
  delivered_at: string | null;
  acted_at: string | null;
}

export interface AppProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  work_role: string | null;
  primary_goal: string | null;
  goal_anchor: string | null;
  nudge_intensity: number | null;
  memory_depth_score: number | null;
  onboarding_completed: boolean;
}
