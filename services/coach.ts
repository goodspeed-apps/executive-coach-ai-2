import { supabase } from '@/lib/supabase';
import { captureException } from '@/lib/sentry';
import { trackApiLatency } from '@/lib/performance';
import type {
  CheckIn,
  Streak,
  Nudge,
  Retrospective,
  CoachProfile,
  CoachMessage,
} from '@/types/app';

export async function fetchProfile(userId: string): Promise<CoachProfile | null> {
  return trackApiLatency('fetchProfile', async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, user_id, display_name, primary_goal, goal_anchor, memory_depth_score, onboarding_completed')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      captureException(error, { screen: 'home', action: 'fetchProfile' });
      throw error;
    }
    return data as CoachProfile | null;
  });
}

export async function fetchStreak(userId: string): Promise<Streak | null> {
  return trackApiLatency('fetchStreak', async () => {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      captureException(error, { screen: 'home', action: 'fetchStreak' });
      throw error;
    }
    return data as Streak | null;
  });
}

export async function fetchPendingNudges(userId: string): Promise<Nudge[]> {
  return trackApiLatency('fetchNudges', async () => {
    const { data, error } = await supabase
      .from('nudges')
      .select('*')
      .eq('user_id', userId)
      .eq('state', 'pending')
      .order('delivered_at', { ascending: false })
      .limit(10);
    if (error) {
      captureException(error, { screen: 'nudges', action: 'fetchNudges' });
      throw error;
    }
    return (data ?? []) as Nudge[];
  });
}

export async function updateNudgeState(
  id: string,
  state: Nudge['state'],
): Promise<void> {
  const acted_at = state === 'acted' ? new Date().toISOString() : null;
  const { error } = await supabase
    .from('nudges')
    .update({ state, acted_at })
    .eq('id', id);
  if (error) {
    captureException(error, { screen: 'nudges', action: 'updateNudgeState' });
    throw error;
  }
}

export async function fetchRetrospectives(userId: string): Promise<Retrospective[]> {
  return trackApiLatency('fetchRetros', async () => {
    const { data, error } = await supabase
      .from('retrospectives')
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false })
      .limit(20);
    if (error) {
      captureException(error, { screen: 'retro', action: 'fetchRetros' });
      throw error;
    }
    return (data ?? []) as Retrospective[];
  });
}

export async function fetchTodayCheckIn(userId: string): Promise<CheckIn | null> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', userId)
    .eq('checkin_date', today)
    .maybeSingle();
  if (error) {
    captureException(error, { screen: 'checkin', action: 'fetchTodayCheckIn' });
    throw error;
  }
  return data as CheckIn | null;
}

export async function submitCheckIn(
  userId: string,
  payload: { mood: number; energy: number; task_status: string; note: string | null },
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const { error } = await supabase.from('check_ins').upsert(
    { user_id: userId, checkin_date: today, ...payload },
    { onConflict: 'user_id,checkin_date' },
  );
  if (error) {
    captureException(error, { screen: 'checkin', action: 'submitCheckIn' });
    throw error;
  }
}

export async function fetchCoachMessages(userId: string): Promise<CoachMessage[]> {
  const { data, error } = await supabase
    .from('coach_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(50);
  if (error) {
    captureException(error, { screen: 'coach', action: 'fetchCoachMessages' });
    throw error;
  }
  return (data ?? []) as CoachMessage[];
}
