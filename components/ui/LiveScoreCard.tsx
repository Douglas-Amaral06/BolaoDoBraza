import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ViewStyle,
  Animated,
} from 'react-native';
import { PulseBadge } from './PulseBadge';
import { colors, spacing, radius, typography, elevation } from '@/app/design';

interface Team {
  nome: string;
  logo?: string;
}

interface LiveScoreCardProps {
  timeCasa: Team;
  timeVisitante: Team;
  golsCasa: number;
  golsVisitante: number;
  status: 'STATUS_SCHEDULED' | 'STATUS_IN_PROGRESS' | 'STATUS_FINAL';
  dataJogo: string;
}

export function LiveScoreCard({
  timeCasa,
  timeVisitante,
  golsCasa,
  golsVisitante,
  status,
  dataJogo,
}: LiveScoreCardProps) {
  const scoreScale = useRef(new Animated.Value(1)).current;

  // Anima o placar quando muda
  useEffect(() => {
    Animated.sequence([
      Animated.timing(scoreScale, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scoreScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [golsCasa, golsVisitante]);

  const getBadgeVariant = ():
    | 'live'
    | 'scheduled'
    | 'finished' => {
    switch (status) {
      case 'STATUS_IN_PROGRESS':
        return 'live';
      case 'STATUS_FINAL':
        return 'finished';
      case 'STATUS_SCHEDULED':
      default:
        return 'scheduled';
    }
  };

  const formatTime = (date: string): string => {
    try {
      const d = new Date(date);
      return d.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const isScheduled = status === 'STATUS_SCHEDULED';

  return (
    <View style={[styles.card, elevation.e2]}>
      {/* Badge de Status */}
      <View style={styles.badgeContainer}>
        <PulseBadge variant={getBadgeVariant()} />
      </View>

      {/* Conteúdo do placar */}
      <View style={styles.content}>
        {/* Time da Casa */}
        <View style={styles.teamContainer}>
          {timeCasa.logo && (
            <Image
              source={{ uri: timeCasa.logo }}
              style={styles.logo}
              resizeMode="contain"
            />
          )}
          <Text
            style={[typography.subtitle2, { color: colors.text.primary }]}
            numberOfLines={1}
          >
            {timeCasa.nome}
          </Text>
        </View>

        {/* Placar ou VS */}
        <View style={styles.scoreContainer}>
          {isScheduled ? (
            <>
              <Text
                style={[
                  typography.body1,
                  { color: colors.text.tertiary },
                ]}
              >
                VS
              </Text>
              <Text
                style={[
                  typography.caption,
                  { color: colors.text.tertiary },
                ]}
              >
                {formatTime(dataJogo)}
              </Text>
            </>
          ) : (
            <Animated.View
              style={[
                styles.scoreRow,
                { transform: [{ scale: scoreScale }] },
              ]}
            >
              <Text
                style={[
                  typography.number,
                  { color: colors.text.primary },
                ]}
              >
                {golsCasa}
              </Text>
              <Text
                style={[
                  typography.body1,
                  { color: colors.text.tertiary },
                ]}
              >
                -
              </Text>
              <Text
                style={[
                  typography.number,
                  { color: colors.text.primary },
                ]}
              >
                {golsVisitante}
              </Text>
            </Animated.View>
          )}
        </View>

        {/* Time Visitante */}
        <View style={[styles.teamContainer, styles.teamRight]}>
          <Text
            style={[typography.subtitle2, { color: colors.text.primary }]}
            numberOfLines={1}
          >
            {timeVisitante.nome}
          </Text>
          {timeVisitante.logo && (
            <Image
              source={{ uri: timeVisitante.logo }}
              style={styles.logo}
              resizeMode="contain"
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },

  badgeContainer: {
    alignItems: 'flex-start',
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  teamContainer: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },

  teamRight: {
    alignItems: 'flex-end',
  },

  logo: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
  },

  scoreContainer: {
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },

  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
