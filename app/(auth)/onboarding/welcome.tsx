/**
 * Onboarding Welcome / Landing Screen
 *
 * The app's landing screen (route '/' resolves here for first-launch visitors).
 * Structure matches the approved design:
 *   - Hero headline + tagline (the "coach who remembers" promise)
 *   - Comparison card (generic apps vs. Executive Coach AI)
 *   - "What your coach will track" feature grid
 *   - Primary "Create your account" CTA (routes to signup) + secondary sign-in link
 *
 * The CTA marks onboarding complete then routes to signup. If a DevAgent adds
 * more onboarding steps to gasConfig.features.onboarding.steps, the CTA instead
 * advances to the next step and the step dots appear.
 *
 * All colors come from useThemeColors(), never hardcoded.
 * Uses SafeAreaView from 'react-native-safe-area-context' (CRITICAL).
 */

import { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useThemeColors } from '@/context/ThemeContext';
import { markOnboardingComplete } from '@/lib/onboarding-buffer';
import AppLogo from '@/components/AppLogo';
import { gasConfig } from '../../../gas.config';

const ONBOARDING_STEPS = gasConfig.features.onboarding.steps;
const APP_NAME = gasConfig.app.name;

// Hero copy for the landing/onboarding screen. The headline names the product's
// core promise (a coach that remembers), the tagline frames the differentiator.
const HERO_HEADLINE = "A coach who remembers every pattern you've shared";
const HERO_TAGLINE =
  'Unlike generic coaching apps that reset to zero each session, your coaching quality compounds the longer you stay.';

// Comparison card: the central "why us" contrast that the approved design shows.
const COMPARISON = {
  them: {
    label: 'Generic coaching apps',
    points: [
      'Forget your history every session',
      'Restart from zero context each time',
      'Generic, one-size-fits-all advice',
    ],
  },
  us: {
    label: 'Executive Coach AI',
    points: [
      'Builds a persistent behavioral model',
      'Retrospectives from your own history',
      'Real-time nudges when it detects drift',
    ],
  },
};

// "What your coach will track" feature grid.
const TRACKING_FEATURES = [
  { icon: '✓', title: 'Task completion', detail: 'Patterns across weeks and months' },
  { icon: '⚡', title: 'Emotional triggers', detail: 'What pulls you off course' },
  { icon: '↻', title: 'Avoidance cycles', detail: 'Recurring loops you fall into' },
  { icon: '📈', title: 'Weekly retrospectives', detail: 'Generated from real behavior' },
];

/**
 * Step progress dots, shows current position in the onboarding flow.
 */
function StepDots({ step, total }: { step: number; total: number }) {
  const { colors } = useThemeColors();

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: total, now: step }}
      accessibilityLabel={`Step ${step} of ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            height: 8,
            width: i + 1 === step ? 24 : 8,
            borderRadius: 4,
            backgroundColor: i + 1 <= step ? colors.primary : colors.border,
            opacity: i + 1 <= step ? 1 : 0.35,
          }}
        />
      ))}
    </View>
  );
}

export default function OnboardingWelcome() {
  const router = useRouter();
  const { track } = useAnalytics();
  const { colors } = useThemeColors();

  useEffect(() => {
    track('screen_view', { screen: 'onboarding_welcome' });
  }, []);

  /**
   * Navigate to the next onboarding step, or to signup if this is the only step.
   * Steps are defined in gasConfig.features.onboarding.steps.
   */
  async function handleGetStarted() {
    if (ONBOARDING_STEPS.length > 1) {
      // Navigate to the second step (first step is 'welcome', which is this screen).
      const nextStep = ONBOARDING_STEPS[1];
      router.push(`/(auth)/onboarding/${nextStep}` as any);
    } else {
      // Welcome is the only onboarding screen, so mark onboarding complete here
      // before going to signup. Without this the has_onboarded flag is never set,
      // and a logged-out returning user is routed back through onboarding on every
      // cold start. A DevAgent-added multi-step flow must mark complete on its
      // final step instead.
      await markOnboardingComplete();
      router.push('/(auth)/signup');
    }
  }

  // Total steps includes welcome + subsequent steps + signup (as the final destination).
  // For dot display, we show one dot per onboarding screen.
  const totalDots = ONBOARDING_STEPS.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, gap: 28 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Step dots */}
        {totalDots > 1 && <StepDots step={1} total={totalDots} />}

        {/* Hero section */}
        <View style={{ alignItems: 'center', gap: 16, marginTop: 8 }}>
          <AppLogo size={64} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary, textAlign: 'center', letterSpacing: 0.5 }}>
            {APP_NAME}
          </Text>
          <Text
            accessibilityRole="header"
            style={{ fontSize: 32, fontWeight: '800', color: colors.text, letterSpacing: -1, textAlign: 'center', lineHeight: 40 }}
          >
            {HERO_HEADLINE}
          </Text>
          <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', lineHeight: 24, maxWidth: 320 }}>
            {HERO_TAGLINE}
          </Text>
        </View>

        {/* Comparison card */}
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 20,
            backgroundColor: colors.surface,
            padding: 20,
            gap: 20,
          }}
        >
          {/* Generic apps column */}
          <View style={{ gap: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {COMPARISON.them.label}
            </Text>
            {COMPARISON.them.points.map((point) => (
              <View key={point} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                <Text style={{ color: colors.error, fontSize: 15, lineHeight: 22 }}>✕</Text>
                <Text style={{ flex: 1, color: colors.textSecondary, fontSize: 15, lineHeight: 22 }}>{point}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 1, backgroundColor: colors.border }} />

          {/* Executive Coach AI column */}
          <View style={{ gap: 10 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {COMPARISON.us.label}
            </Text>
            {COMPARISON.us.points.map((point) => (
              <View key={point} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                <Text style={{ color: colors.success, fontSize: 15, lineHeight: 22 }}>✓</Text>
                <Text style={{ flex: 1, color: colors.text, fontSize: 15, lineHeight: 22 }}>{point}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* What your coach will track — feature grid */}
        <View style={{ gap: 14 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
            What your coach will track
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
            {TRACKING_FEATURES.map((feature) => (
              <View
                key={feature.title}
                style={{
                  width: '47%',
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 16,
                  backgroundColor: colors.surface,
                  padding: 16,
                  gap: 8,
                }}
              >
                <Text style={{ fontSize: 22 }}>{feature.icon}</Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>{feature.title}</Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>{feature.detail}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Primary CTA — Create your account */}
        <TouchableOpacity
          style={{
            width: '100%',
            backgroundColor: colors.primary,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            minHeight: 54,
            marginTop: 4,
          }}
          onPress={handleGetStarted}
          accessibilityRole="button"
          accessibilityLabel="Create your account"
        >
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Create your account</Text>
        </TouchableOpacity>

        {/* Secondary link — existing users */}
        <TouchableOpacity
          style={{ alignItems: 'center', paddingVertical: 8 }}
          onPress={async () => {
            await markOnboardingComplete();
            router.push('/(auth)/login');
          }}
          accessibilityRole="button"
          accessibilityLabel="Sign in to an existing account"
        >
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            Already have an account? <Text style={{ color: colors.primary, fontWeight: '600' }}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
