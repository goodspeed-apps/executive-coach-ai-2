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
  completion_stats: { completed: number; total: number } | null;
  quality_rating: number | null;
  is_locked: boolean;
  generation_index: number;
  created_at: string;
}

export interface Nudge {
  id: string;
  user_id: string;
  drift_type: string;
  title: string;
  body_text: string;
  suggested_action: string | null;
  state: 'delivered' | 'acted' | 'snoozed' | 'dismissed';
  snoozed_until: string | null;
  delivered_at: string | null;
  acted_at: string | null;
}

export interface CoachProfile {
  display_name: string | null;
  primary_goal: string | null;
  goal_anchor: string | null;
  memory_depth_score: number | null;
}
