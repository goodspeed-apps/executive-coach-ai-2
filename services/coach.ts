import { supabase } from '@/lib/supabase';
import { captureException } from '@/lib/sentry';
import { trackApiLatency } from '@/lib/performance';
import { retryWithBackoff } from '@/lib/retry';
import type {
  CheckIn,
  Streak,
  Retrospective,
  Nudge,
  CoachProfile,
  TaskStatus,
} from '@/types/app';

export async function fetchCoachProfile(userId: string): Promise<CoachProfile | null> {
  try {
    const { data, error } = await trackApiLatency('fetchCoachProfile', () =>
      supabase
        .from('profiles')
        .select('display_name, primary_goal, goal_anchor, memory_depth_score')
        .eq('user_id', userId)
        .maybeSingle()
    );
    if (error) throw error;
    return data as CoachProfile | null;
  } catch (error) {
    captureException(error, { screen: 'home', action: 'fetchCoachProfile' });
    return null;
  }
}

export async function fetchStreak(userId: string): Promise<Streak | null> {
  try {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data as Streak | null;
  } catch (error) {
    captureException(error, { screen: 'home', action: 'fetchStreak' });
    return null;
  }
}

export async function fetchTodayCheckIn(userId: string): Promise<CheckIn | null> {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', userId)
      .eq('checkin_date', today)
      .maybeSingle();
    if (error) throw error;
    return data as CheckIn | null;
  } catch (error) {
    captureException(error, { screen: 'home', action: 'fetchTodayCheckIn' });
    return null;
  }
}

export async function submitCheckIn(
  userId: string,
  payload: { mood: number; energy: number; task_status: TaskStatus; note: string | null }
): Promise<CheckIn> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await retryWithBackoff(() =>
    supabase
      .from('check_ins')
      .upsert(
        { user_id: userId, checkin_date: today, ...payload },
        { onConflict: 'user_id,checkin_date' }
      )
      .select()
      .single()
  );
  if (error) {
    captureException(error, { screen: 'checkin', action: 'submitCheckIn' });
    throw error;
  }
  return data as CheckIn;
}

export async function fetchRetrospectives(userId: string): Promise<Retrospective[]> {
  try {
    const { data, error } = await supabase
      .from('retrospectives')
      .select('*')
      .eq('user_id', userId)
      .order('week_start_date', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Retrospective[];
  } catch (error) {
    captureException(error, { screen: 'retrospectives', action: 'fetchRetrospectives' });
    return [];
  }
}

export async function fetchNudges(userId: string): Promise<Nudge[]> {
  try {
    const { data, error } = await supabase
      .from('nudges')
      .select('*')
      .eq('user_id', userId)
      .in('state', ['delivered', 'snoozed'])
      .order('delivered_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as Nudge[];
  } catch (error) {
    captureException(error, { screen: 'nudges', action: 'fetchNudges' });
    return [];
  }
}

export async function actOnNudge(nudgeId: string): Promise<void> {
  const { error } = await supabase
    .from('nudges')
    .update({ state: 'acted', acted_at: new Date().toISOString() })
    .eq('id', nudgeId);
  if (error) {
    captureException(error, { screen: 'nudges', action: 'actOnNudge' });
    throw error;
  }
}
