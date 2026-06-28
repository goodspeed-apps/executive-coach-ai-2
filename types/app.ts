export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  adhd_context: string | null;
  work_role: string | null;
  primary_goal: string | null;
  goal_anchor: string | null;
  checkin_cadence: string | null;
  nudge_intensity: number | null;
  onboarding_completed: boolean | null;
  memory_depth_score: number | null;
}

export interface CheckIn {
  id: string;
  user_id: string;
  mood: number | null;
  energy: number | null;
  task_status: string | null;
  note: string | null;
  checkin_date: string;
  created_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number | null;
  longest_streak: number | null;
  last_checkin_date: string | null;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  focus_area: string | null;
  status: string | null;
  progress_score: number | null;
}

export interface CoachMessage {
  id: string;
  user_id: string;
  session_id: string | null;
  role: string;
  content: string;
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
  quality_rating: number | null;
  is_locked: boolean | null;
  generation_index: number | null;
  created_at: string;
}

export interface Nudge {
  id: string;
  user_id: string;
  drift_type: string | null;
  title: string;
  body_text: string | null;
  suggested_action: string | null;
  state: string | null;
  delivered_at: string | null;
  acted_at: string | null;
}
