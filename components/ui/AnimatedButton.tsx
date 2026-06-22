import React, { useRef } from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { colors, spacing, radius, typography, elevation } from '@/app/design';
import { useHaptics } from '@/hooks/useHaptics';

interface AnimatedButtonProps extends Omit<PressableProps, 'onPress'> {
  label: string;
  onPress: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function AnimatedButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  ...props
}: AnimatedButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const haptics = useHaptics();

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = async () => {
    haptics.impact();
    try {
      await onPress();
    } catch (error) {
      haptics.error();
      throw error;
    }
  };

  const isDisabled = disabled || loading;

  const variantStyles = {
    primary: [
      styles.buttonPrimary,
      elevation.brand,
    ],
    secondary: [
      styles.buttonSecondary,
      elevation.e1,
    ],
    danger: [
      styles.buttonDanger,
      elevation.e1,
    ],
    ghost: [
      styles.buttonGhost,
    ],
  };

  const sizeStyles = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
  };

  const textSizeStyles = {
    sm: typography.buttonMd,
    md: typography.buttonMd,
    lg: typography.buttonLg,
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.button,
          variantStyles[variant],
          sizeStyles[size],
          isDisabled && styles.disabled,
        ]}
        {...props}
      >
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          {loading ? (
            <ActivityIndicator
              size="small"
              color={variant === 'ghost' ? colors.primary.DEFAULT : '#FFF'}
            />
          ) : (
            <Text
              style={[
                textSizeStyles[size],
                variant === 'ghost'
                  ? { color: colors.primary.DEFAULT }
                  : { color: '#FFF' },
              ]}
            >
              {label}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.lg,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  iconContainer: {
    marginRight: spacing.xs,
  },

  buttonPrimary: {
    backgroundColor: colors.primary.DEFAULT,
  },

  buttonSecondary: {
    backgroundColor: colors.primary.light,
  },

  buttonDanger: {
    backgroundColor: colors.game.live,
  },

  buttonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary.DEFAULT,
  },

  sizeSm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 32,
  },

  sizeMd: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
  },

  sizeLg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },

  disabled: {
    opacity: 0.5,
  },
});
