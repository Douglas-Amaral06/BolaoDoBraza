import { useRef } from 'react';
import { Animated } from 'react-native';

export function useButtonPress() {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      friction: 7,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 7,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    transform: [{ scale }],
  };

  return {
    scale,
    animatedStyle,
    onPressIn,
    onPressOut,
  };
}
