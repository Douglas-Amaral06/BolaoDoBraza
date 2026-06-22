import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function useHaptics() {
  const isEnabled = Platform.OS !== 'web';

  return {
    select: async () => {
      if (!isEnabled) return;
      try {
        await Haptics.selectionAsync();
      } catch (error) {
        // Silenciosamente ignora erros em dispositivos sem suporte
      }
    },

    impact: async () => {
      if (!isEnabled) return;
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (error) {
        // Silenciosamente ignora erros
      }
    },

    success: async () => {
      if (!isEnabled) return;
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      } catch (error) {
        // Silenciosamente ignora erros
      }
    },

    warning: async () => {
      if (!isEnabled) return;
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning
        );
      } catch (error) {
        // Silenciosamente ignora erros
      }
    },

    error: async () => {
      if (!isEnabled) return;
      try {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        );
      } catch (error) {
        // Silenciosamente ignora erros
      }
    },

    light: async () => {
      if (!isEnabled) return;
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        // Silenciosamente ignora erros
      }
    },
  };
}
