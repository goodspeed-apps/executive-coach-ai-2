import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useSubscription } from '@/hooks/useSubscription';
import { usePaywall } from '@/hooks/usePaywall';
import { supabase } from '@/lib/supabase';
import { captureException } from '@/lib/sentry';
import { trackScreenLoad, trackApiLatency } from '@/lib/performance';
import { callEdge } from '@/services/api';
import { KitPressable, KitSurface } from '@/components/kit';
import { CoachAvatar } from '@/components/CoachAvatar';
import { CoachTyping } from '@/components/CoachTyping';
import type { CoachMessage } from '@/types/app';

const FREE_LIMIT = 10;

export default function CoachScreen() {
  const colors = useThemeColors();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const { isSubscribed } = useSubscription();
  const { showPaywall } = usePaywall();
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<CoachMessage>>(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const start = Date.now();
    try {
      const { data, error } = await supabase
        .from('coach_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);
      if (error) throw error;
      setMessages((data ?? []) as CoachMessage[]);
      trackScreenLoad('coach', start);
    } catch (e) {
      captureException(e, { screen: 'coach', action: 'load' });
    }
  }, [user?.id]);

  useEffect(() => {
    track('coach_viewed');
    load();
  }, [load, track]);

  const userMsgCount = messages.filter((m) => m.role === 'user').length;

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || !user?.id || sending) return;
    if (!isSubscribed && userMsgCount >= FREE_LIMIT) {
      track('paywall_coach_limit');
      showPaywall('coach_message_limit');
      return;
    }
    setSending(true);
    setInput('');
    const optimistic: CoachMessage = {
      id: `tmp-${Date.now()}`,
      user_id: user.id,
      session_id: null,
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);
    try {
      const reply = await trackApiLatency('coach_reply', () =>
        callEdge<{ content: string }>('coach-chat', { message: text })
      );
      const coachMsg: CoachMessage = {
        id: `coach-${Date.now()}`,
        user_id: user.id,
        session_id: null,
        role: 'coach',
        content: reply?.content ?? "Let's stay with that. What's the smallest next step?",
        created_at: new Date().toISOString(),
      };
      setMessages((m) => [...m, coachMsg]);
      track('coach_message_sent');
    } catch (e) {
      captureException(e, { screen: 'coach', action: 'send' });
    } finally {
      setSending(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [input, user?.id, sending, isSubscribed, userMsgCount, track, showPaywall]);

  const renderItem = useCallback(
    ({ item }: { item: CoachMessage }) => {
      const isCoach = item.role === 'coach';
      return (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: isCoach ? 'flex-start' : 'flex-end',
            marginBottom: 12,
            gap: 8,
          }}
        >
          {isCoach ? <CoachAvatar size={36} /> : null}
          <KitSurface
            style={{
              maxWidth: '76%',
              padding: 16,
              borderRadius: 14,
              backgroundColor: isCoach ? colors.warningMuted ?? colors.surface : colors.primary,
              borderColor: isCoach ? colors.accent : colors.primary,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                lineHeight: 22,
                fontFamily: 'Manrope_400Regular',
                color: isCoach ? colors.text : colors.textOnPrimary,
              }}
            >
              {item.content}
            </Text>
          </KitSurface>
        </View>
      );
    },
    [colors]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
          <Text style={{ fontSize: 24, fontFamily: 'Outfit_700Bold', color: colors.text }}>
            Your coach
          </Text>
        </View>
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 24, paddingTop: 0, flexGrow: 1 }}
          ListEmptyComponent={
            <View style={{ paddingVertical: 48, alignItems: 'center', gap: 16 }}>
              <CoachAvatar size={72} pulse />
              <Text
                style={{
                  fontSize: 16,
                  textAlign: 'center',
                  fontFamily: 'Manrope_400Regular',
                  color: colors.textSecondary,
                  paddingHorizontal: 24,
                }}
              >
                {"I'm here. Tell me what you're working on, or what's getting in the way today."}
              </Text>
            </View>
          }
          ListFooterComponent={sending ? <CoachTyping /> : null}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <TextInput
            testID="coach-message-input"
            value={input}
            onChangeText={setInput}
            placeholder="Message your coach…"
            placeholderTextColor={colors.textMuted}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 9999,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.surface,
              color: colors.text,
              fontFamily: 'Manrope_400Regular',
              fontSize: 16,
            }}
          />
          <KitPressable
            testID="coach-send"
            accessibilityLabel="Send message"
            accessibilityHint="Sends your message to the coach"
            onPress={send}
            disabled={sending || !input.trim()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 9999,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: input.trim() ? 1 : 0.5,
            }}
          >
            <Send size={20} color={colors.textOnPrimary} />
          </KitPressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
