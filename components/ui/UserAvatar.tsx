import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, spacing, radius, typography } from '@/app/design';

interface UserAvatarProps {
  nome: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rank?: 1 | 2 | 3;
}

export function UserAvatar({ nome, size = 'md', rank }: UserAvatarProps) {
  // Gera cor consistente baseada no nome
  const backgroundColor = useMemo(() => {
    const hashes = [
      colors.game.live,
      colors.game.scheduled,
      colors.game.finished,
      colors.primary.light,
      colors.prize,
      colors.gold,
      colors.silver,
      colors.bronze,
    ];
    const code = nome.charCodeAt(0);
    return hashes[code % hashes.length];
  }, [nome]);

  // Iniciais do nome
  const initials = nome
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  const sizeConfig = {
    sm: { size: 32, fontSize: 12 },
    md: { size: 44, fontSize: 14 },
    lg: { size: 56, fontSize: 16 },
    xl: { size: 72, fontSize: 18 },
  };

  const { size: containerSize, fontSize } = sizeConfig[size];

  // Se tem rank, usa cor de medalha
  const rankColor =
    rank === 1 ? colors.gold : rank === 2 ? colors.silver : colors.bronze;

  return (
    <View>
      <View
        style={[
          styles.avatar,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: containerSize / 2,
            backgroundColor: rank ? rankColor : backgroundColor,
          },
        ]}
      >
        <Text
          style={[
            {
              fontSize,
              color: rank ? '#000' : '#FFF',
              fontWeight: '700',
            },
          ]}
        >
          {initials}
        </Text>
      </View>
      {rank && (
        <View
          style={[
            styles.rankBadge,
            {
              backgroundColor: rankColor,
              borderColor: '#FFF',
            },
          ]}
        >
          <Text style={styles.rankText}>{rank}º</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  rankBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },

  rankText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
});
