import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function usePulseAnimation(isActive: boolean = false) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isActive) {
      opacity.setValue(1);
      scale.setValue(1);
      return;
    }

    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [isActive, opacity, scale]);

  const pulseStyle = {
    opacity,
    transform: [{ scale }],
  };

  return {
    opacity,
    scale,
    pulseStyle,
  };
}
