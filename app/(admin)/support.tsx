/**
 * Admin, Support
 *
 * Triage view for feedback_threads. Lists threads, shows full message history
 * in a modal, allows admin replies and marking threads resolved.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VirtualList } from '@/components/VirtualList';
import { useThemeColors } from '@/context/ThemeContext';

interface Thread {
  id: string;
  subject: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Supabase returns the joined relation as an array or single object depending on query shape
  profiles?: { display_name: string | null } | { display_name: string | null }[] | null;
}

interface Message {
  id: string;
  body: string | null;
  author_role: string | null;
  author_id: string | null;
  created_at: string | null;
}

export default function AdminSupportScreen() {
  const { colors } = useThemeColors();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

const fetchThreads = useCallback(async () => {
    setLoading(true);
    // Disambiguate the FK to public.profiles (added in migration 012); the
    // base feedback_threads.user_id FK points at auth.users which PostgREST
    // can't traverse from the anon schema.
    const { data } = await supabase
      .from('feedback_threads')
      .select('id, subject, status, created_at, updated_at, profiles!feedback_threads_user_id_profiles_fk(display_name)')
      .order('updated_at', { ascending: false });
    setThreads((data ?? []) as unknown as Thread[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchThreads(); }, [fetchThreads]);

  const openThread = useCallback(async (thread: Thread) => {
    setActive(thread);
    setMsgLoading(true);
    const { data } = await supabase
      .from('feedback_messages')
      .select('id, body, author_role, author_id, created_at')
      .eq('thread_id', thread.id)
      .order('created_at', { ascending: true });
    setMessages((data ?? []) as Message[]);
    setMsgLoading(false);
  }, []);

const sendReply = useCallback(async () => {
    if (!active || !reply.trim()) return;
    setSending(true);
    const { data: session } = await supabase.auth.getSession();
    const uid = session.session?.user?.id;
    // Round-tripping select().single() avoids re-fetching the entire thread
    // after every reply; we just append the new row to local state.
    const { data: inserted, error } = await supabase
      .from('feedback_messages')
      .insert({
        thread_id: active.id,
        body: reply.trim(),
        author_role: 'admin',
        author_id: uid,
      })
      .select('id, body, author_role, author_id, created_at')
      .single();
    if (!error && inserted) {
      setMessages(prev => [...prev, inserted as Message]);
      setReply('');
    }
    setSending(false);
  }, [active, reply]);

  const markResolved = useCallback(async () => {
    if (!active) return;
    const previousStatus = active.status;
    // Optimistic update with revert-on-failure: snapshot the prior status so
    // a network failure rolls the badge back instead of stranding a stale UI.
    setActive(prev => prev ? { ...prev, status: 'resolved' } : prev);
    setThreads(prev => prev.map(t => t.id === active.id ? { ...t, status: 'resolved' } : t));
    const { error } = await supabase.from('feedback_threads').update({ status: 'resolved' }).eq('id', active.id);
    if (error) {
      setActive(prev => prev ? { ...prev, status: previousStatus } : prev);
      setThreads(prev => prev.map(t => t.id === active.id ? { ...t, status: previousStatus } : t));
    }
  }, [active]);

  const styles = StyleSheet.create({
    activityIndicator: {
      color: colors.textOnPrimary,
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <VirtualList
          data={threads}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={{ margin: 8 }}>
              <TouchableOpacity onPress={() => openThread(item)} style={{ padding: 12 }}>
                <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>
                  {item.subject ?? '(no subject)'}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>
                  {Array.isArray(item.profiles)
                    ? item.profiles[0]?.display_name ?? 'Unknown'
                    : (item.profiles as { display_name: string | null } | null)?.display_name ?? 'Unknown'}
                  {' · '}
                  {item.status ?? 'open'}
                </Text>
              </TouchableOpacity>
            </Card>
          )}
        />
      )}

      <Modal visible={!!active} animationType="slide" onRequestClose={() => setActive(null)}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ flex: 1, fontWeight: '700', fontSize: 17, color: colors.text }}>
              {active?.subject ?? '(no subject)'}
            </Text>
            <TouchableOpacity onPress={() => setActive(null)}>
              <Text style={{ color: colors.primary, fontSize: 15 }}>Close</Text>
            </TouchableOpacity>
          </View>

          {msgLoading ? (
            <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
          ) : (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
              {messages.map((msg) => {
                const isAdmin = msg.author_role === 'admin';
                return (
                  <View
                    key={msg.id}
                    style={{
                      alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                      backgroundColor: isAdmin ? colors.primary : colors.surface,
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 10,
                      maxWidth: '80%',
                    }}
                  >
                    <Text style={{ color: isAdmin ? colors.textOnPrimary : colors.text, fontSize: 15 }}>
                      {msg.body}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          )}

          <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', gap: 8 }}>
            <TextInput
              value={reply}
              onChangeText={setReply}
              placeholder="Reply…"
              placeholderTextColor={colors.placeholder}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                paddingHorizontal: 12,
                color: colors.text,
                fontSize: 15,
              }}
            />
            <Button onPress={sendReply} disabled={sending || !reply.trim()} title={sending ? '…' : 'Send'} />
          </View>

          {active?.status !== 'resolved' && (
            <View style={{ paddingHorizontal: 12, paddingBottom: 16 }}>
              <Button onPress={markResolved} title="Mark Resolved" />
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
