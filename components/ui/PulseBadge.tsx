import React from 'react';
import { StyleSheet, Text, View, ViewStyle, Animated } from 'react-native';
import { usePulseAnimation } from '@/hooks/usePulseAnimation';
import { colors, spacing, radius, typography } from '@/app/design';

interface PulseBadgeProps {
  variant: 'live' | 'scheduled' | 'finished';
  compact?: boolean;
}

export function PulseBadge({ variant, compact = false }: PulseBadgeProps) {
  const { pulseStyle } = usePulseAnimation(variant === 'live');

  const variantConfig = {
    live: {
      bg: colors.game.liveBg,
      text: colors.game.live,
      label: 'AO VIVO',
      dotColor: colors.game.live,
    },
    scheduled: {
      bg: colors.game.scheduledBg,
      text: colors.game.scheduled,
      label: 'AGENDADO',
      dotColor: colors.game.scheduled,
    },
    finished: {
      bg: colors.game.finishedBg,
      text: colors.game.finished,
      label: 'FINALIZADO',
      dotColor: colors.game.finished,
    },
  };

  const config = variantConfig[variant];

  if (compact) {
    return (
      <Animated.View
        style={[
          styles.dotContainer,
          { backgroundColor: config.bg },
          pulseStyle,
        ]}
      >
        <View
          style={[
            styles.dot,
            { backgroundColor: config.dotColor },
          ]}
        />
      </Animated.View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Animated.View
        style={[
          styles.dotContainer,
          pulseStyle,
        ]}
      >
        <View
          style={[
            styles.dot,
            { backgroundColor: config.dotColor },
          ]}
        />
      </Animated.View>
      <Text
        style={[
          typography.label,
          { color: config.text },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },

  dotContainer: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
});
