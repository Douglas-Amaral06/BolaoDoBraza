import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAdmin } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="BetScreen"
        options={{
          title: 'Apostar',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="cash-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="BolaoScreen"
        options={{
          title: 'Bolão',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="people-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: 'Ranking',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="person-outline" color={color} />,
        }}
      />
      {isAdmin && (
        <Tabs.Screen
          name="AdminPanel"
          options={{
            title: 'Admin',
            tabBarIcon: ({ color }) => <Ionicons size={28} name="shield-checkmark" color={color} />,
          }}
        />
      )}
    </Tabs>
  );
}
