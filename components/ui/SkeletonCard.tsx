import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Animated, FlatList, ViewStyle } from 'react-native';
import { colors, spacing, radius, elevation } from '@/app/design';

interface SkeletonCardProps {
  variant: 'game' | 'ranking' | 'score';
  count?: number;
}

export function SkeletonCard({ variant, count = 3 }: SkeletonCardProps) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, [opacity]);

  const SkeletonLine = ({
    width = '100%',
    height = 12,
    style,
  }: {
    width?: string | number;
    height?: number;
    style?: ViewStyle;
  }) => (
    <Animated.View
      style={[
        styles.skeletonLine,
        { width, height, opacity },
        style,
      ]}
    />
  );

  const GameCardSkeleton = () => (
    <View style={[styles.card, elevation.e1]}>
      <View style={styles.gameContent}>
        {/* Times */}
        <View style={styles.teamRow}>
          <View style={styles.teamLeft}>
            <SkeletonLine width={40} height={40} style={styles.logo} />
            <SkeletonLine width="60%" height={12} />
          </View>
          <View style={styles.scoreCenter}>
            <SkeletonLine width={30} height={20} />
          </View>
          <View style={styles.teamRight}>
            <SkeletonLine width="60%" height={12} style={{ alignSelf: 'flex-end' }} />
            <SkeletonLine width={40} height={40} style={styles.logo} />
          </View>
        </View>
        {/* Time de jogo */}
        <SkeletonLine width="40%" height={10} />
      </View>
    </View>
  );

  const RankingCardSkeleton = () => (
    <View style={[styles.card, elevation.e1, styles.rankingCard]}>
      <SkeletonLine width={40} height={40} style={styles.avatar} />
      <View style={styles.rankingContent}>
        <SkeletonLine width="60%" height={12} />
        <SkeletonLine width="40%" height={10} style={styles.mt} />
      </View>
      <SkeletonLine width={50} height={14} />
    </View>
  );

  const ScoreCardSkeleton = () => (
    <View style={[styles.card, elevation.e1, styles.scoreCard]}>
      <SkeletonLine width="45%" height={14} />
      <SkeletonLine width="10%" height={16} />
      <SkeletonLine width="45%" height={14} />
    </View>
  );

  const skeletons = Array.from({ length: count }).map((_, i) => ({
    id: String(i),
  }));

  const renderItem = () => {
    switch (variant) {
      case 'game':
        return <GameCardSkeleton />;
      case 'ranking':
        return <RankingCardSkeleton />;
      case 'score':
        return <ScoreCardSkeleton />;
      default:
        return <GameCardSkeleton />;
    }
  };

  return (
    <FlatList
      data={skeletons}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      gap={spacing.md}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.primary,
    borderRadius: radius.md,
    padding: spacing.md,
  },

  gameContent: {
    gap: spacing.md,
  },

  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  teamLeft: {
    flex: 1,
    gap: spacing.sm,
  },

  teamRight: {
    flex: 1,
    alignItems: 'flex-end',
    gap: spacing.sm,
  },

  scoreCenter: {
    alignItems: 'center',
    minWidth: 60,
  },

  logo: {
    borderRadius: radius.sm,
  },

  rankingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  avatar: {
    borderRadius: radius.full,
  },

  rankingContent: {
    flex: 1,
    gap: spacing.xs,
  },

  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },

  skeletonLine: {
    backgroundColor: colors.border.light,
    borderRadius: radius.sm,
  },

  mt: {
    marginTop: spacing.xs,
  },
});
