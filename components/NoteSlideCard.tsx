import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { KitCard, KitButton } from '@/components/kit';
import { CoachSeat } from '@/components/CoachSeat';
import { useThemeColors } from '@/context/ThemeContext';
import { Spacing } from '@/lib/theme';

const spacing = Spacing;

interface NoteSlideCardProps {
  greeting: string;
  body: string;
  ctaLabel?: string;
  onPressCta?: () => void;
  ctaTestID?: string;
  hasNewMessage?: boolean;
  index?: number;
}

export function NoteSlideCard({
  greeting,
  body,
  ctaLabel,
  onPressCta,
  ctaTestID,
  hasNewMessage,
  index = 0,
}: NoteSlideCardProps) {
  const colors = useThemeColors();

  return (
    <Animated.View entering={FadeInDown.delay(60 * index).duration(300)}>
      <KitCard style={{ backgroundColor: colors.warningMuted, gap: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <CoachSeat size={52} hasNewMessage={hasNewMessage} />
          <Text
            style={{
              flex: 1,
              fontFamily: 'Outfit_700Bold',
              fontSize: 20,
              color: colors.text,
            }}
          >
            {greeting}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: 'Manrope_400Regular',
            fontSize: 16,
            lineHeight: 24,
            color: colors.surfaceText,
          }}
        >
          {body}
        </Text>
        {ctaLabel && onPressCta ? (
          <KitButton label={ctaLabel} onPress={onPressCta} testID={ctaTestID} />
        ) : null}
      </KitCard>
    </Animated.View>
  );
}
