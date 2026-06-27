import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, FlatList, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Send } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useSubscription } from '@/hooks/useSubscription';
import { usePaywall } from '@/hooks/usePaywall';
import { supabase } from '@/lib/supabase';
import { captureException } from '@/lib/sentry';
import { trackScreenLoad } from '@/lib/performance';
import { callEdge } from '@/services/api';
import { KitPressable } from '@/components/kit';
import { ChatBubble } from '@/components/ChatBubble';
import { ThinkingDots } from '@/components/ThinkingDots';

const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32 };
const radii = { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 };

interface Msg {
  id: string;
  role: 'user' | 'coach';
  content: string;
}

const FREE_LIMIT = 10;

export default function CoachScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const { isSubscribed } = useSubscription();
  const { showPaywall } = usePaywall();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const listRef = useRef<FlatList<Msg>>(null);

  const load = useCallback(async () => {
    const start = Date.now();
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('coach_messages')
        .select('id, role, content')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);
      if (error) throw error;
      const mapped: Msg[] = (data ?? []).map((m) => ({
        id: m.id,
        role: m.role === 'user' ? 'user' : 'coach',
        content: m.content,
      }));
      if (mapped.length === 0) {
        mapped.push({
          id: 'intro',
          role: 'coach',
          content: "I'm here. Based on our recent threads, you've been wrestling with starting tasks before noon. What's on your mind right now?",
        });
      }
      setMessages(mapped);
      setSentCount(mapped.filter((m) => m.role === 'user').length);
      trackScreenLoad('coach', start);
    } catch (error) {
      captureException(error, { screen: 'coach', action: 'load' });
    }
  }, [user?.id]);

  useEffect(() => {
    track('coach_viewed');
    load();
  }, [load, track]);

  const send = async () => {
    const text = input.trim();
    if (!text || thinking) return;
    if (!isSubscribed && sentCount >= FREE_LIMIT) {
      track('coach_limit_hit');
      showPaywall();
      return;
    }
    const userMsg: Msg = { id: `u${Date.now()}`, role: 'user', content: text };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setThinking(true);
    setSentCount((c) => c + 1);
    track('coach_message_sent');
    try {
      const res = await callEdge<{ reply: string }>('coach-reply', { message: text });
      const reply = res?.reply ?? "Let's slow down. What feels heaviest about that right now?";
      setMessages((m) => [...m, { id: `c${Date.now()}`, role: 'coach', content: reply }]);
    } catch (error) {
      captureException(error, { screen: 'coach', action: 'send' });
      setMessages((m) => [
        ...m,
        { id: `c${Date.now()}`, role: 'coach', content: "I lost the thread for a moment. Could you say that again?" },
      ]);
    } finally {
      setThinking(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Coach', headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: spacing.xl, gap: spacing.md }}
          renderItem={({ item }) => <ChatBubble role={item.role} content={item.content} />}
          ListFooterComponent={thinking ? <ThinkingDots /> : null}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: spacing.md,
            padding: spacing.lg,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <TextInput
            testID="coach-message-input"
            value={input}
            onChangeText={setInput}
            placeholder="Tell your coach…"
            placeholderTextColor={colors.textMuted}
            multiline
            style={{
              flex: 1,
              maxHeight: 100,
              color: colors.text,
              fontFamily: 'Manrope_400Regular',
              fontSize: 16,
              backgroundColor: colors.surface,
              borderRadius: radii.md,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
            }}
          />
          <KitPressable
            testID="coach-send"
            onPress={send}
            accessibilityLabel="Send message"
            accessibilityHint="Sends your message to the coach"
            style={{
              width: 48,
              height: 48,
              borderRadius: radii.full,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send size={20} color={colors.textOnPrimary} />
          </KitPressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
