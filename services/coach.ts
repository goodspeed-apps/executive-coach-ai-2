import { supabase } from '@/lib/supabase';
import { captureException } from '@/lib/sentry';
import { trackApiLatency } from '@/lib/performance';
import type {
  CheckIn,
  Streak,
  Nudge,
  Retrospective,
  CoachMessage,
  AppProfile,
} from '@/types/app';

const today = (): string => new Date().toISOString().slice(0, 10);

export async function fetchProfile(userId: string): Promise<AppProfile | null> {
  const end = trackApiLatency('fetchProfile');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      captureException(error, { screen: 'home', action: 'fetchProfile' });
      throw error;
    }
    return data as AppProfile | null;
  } finally {
    end();
  }
}

export async function fetchStreak(userId: string): Promise<Streak | null> {
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
}

export async function fetchPendingNudge(userId: string): Promise<Nudge | null> {
  const { data, error } = await supabase
    .from('nudges')
    .select('*')
    .eq('user_id', userId)
    .eq('state', 'pending')
    .order('delivered_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    captureException(error, { screen: 'home', action: 'fetchNudge' });
    throw error;
  }
  return data as Nudge | null;
}

export async function fetchTodayCheckIn(userId: string): Promise<CheckIn | null> {
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', userId)
    .eq('checkin_date', today())
    .maybeSingle();
  if (error) {
    captureException(error, { screen: 'home', action: 'fetchTodayCheckIn' });
    throw error;
  }
  return data as CheckIn | null;
}

export async function submitCheckIn(
  userId: string,
  payload: Pick<CheckIn, 'mood' | 'energy' | 'task_status' | 'note'>
): Promise<void> {
  const { error } = await supabase.from('check_ins').upsert(
    {
      user_id: userId,
      checkin_date: today(),
      ...payload,
    },
    { onConflict: 'user_id,checkin_date' }
  );
  if (error) {
    captureException(error, { screen: 'check-in', action: 'submitCheckIn' });
    throw error;
  }
}

export async function fetchRetrospectives(userId: string): Promise<Retrospective[]> {
  const { data, error } = await supabase
    .from('retrospectives')
    .select('*')
    .eq('user_id', userId)
    .order('week_start_date', { ascending: false });
  if (error) {
    captureException(error, { screen: 'retrospectives', action: 'fetch' });
    throw error;
  }
  return (data ?? []) as Retrospective[];
}

export async function fetchMessages(userId: string): Promise<CoachMessage[]> {
  const { data, error } = await supabase
    .from('coach_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(50);
  if (error) {
    captureException(error, { screen: 'coach', action: 'fetchMessages' });
    throw error;
  }
  return (data ?? []) as CoachMessage[];
}

export async function sendMessage(
  userId: string,
  content: string
): Promise<CoachMessage> {
  const { data, error } = await supabase
    .from('coach_messages')
    .insert({ user_id: userId, role: 'user', content })
    .select()
    .single();
  if (error) {
    captureException(error, { screen: 'coach', action: 'sendMessage' });
    throw error;
  }
  return data as CoachMessage;
}

export async function actOnNudge(nudgeId: string): Promise<void> {
  const { error } = await supabase
    .from('nudges')
    .update({ state: 'acted', acted_at: new Date().toISOString() })
    .eq('id', nudgeId);
  if (error) {
    captureException(error, { screen: 'home', action: 'actOnNudge' });
    throw error;
  }
}
