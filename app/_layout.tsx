import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import AuthScreen from './auth';
import { View, ActivityIndicator } from 'react-native';

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { isLoggedIn, isLoading } = useAuth();

  // Tela de loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F6B32' }}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  // Se não está logado, mostrar tela de autenticação
  if (!isLoggedIn) {
    return <AuthScreen />;
  }

  // Se está logado, mostrar aplicação normal
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="rules" options={{ headerShown: false }} />
        <Stack.Screen name="support" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}

export const unstable_settings = {
  anchor: '(tabs)',
};
