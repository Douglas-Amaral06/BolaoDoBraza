import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';

type DrawerNavigation = DrawerNavigationProp<any>;

export default function CustomDrawer() {
  const { isAdmin, logout } = useAuth();
  const navigation = useNavigation<DrawerNavigation>();

  const handleNavigateToRules = () => {
    navigation.closeDrawer();
    router.push('/rules');
  };

  const handleOpenSupport = () => {
    const whatsappUrl = 'https://wa.me/5511989336439?text=Olá%20Douglas!%20Preciso%20de%20suporte.';
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
    });
    navigation.closeDrawer();
  };

  const handleAdminPanel = () => {
    navigation.closeDrawer();
    // Navigation will happen automatically since AdminPanel is in tabs
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirmação',
      'Deseja realmente sair?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          onPress: () => {
            logout();
            navigation.closeDrawer();
            router.replace('/auth');
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header do Drawer */}
      <View style={styles.drawerHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#FFF" />
        </View>
        <Text style={styles.headerText}>Menu</Text>
      </View>

      {/* Divisor */}
      <View style={styles.divider} />

      {/* Itens do Menu */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={handleNavigateToRules}
      >
        <Ionicons name="document-text-outline" size={24} color="#0F6B32" />
        <Text style={styles.menuItemText}>Regras do Bolão</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={handleOpenSupport}
      >
        <Ionicons name="chatbubble-outline" size={24} color="#0F6B32" />
        <Text style={styles.menuItemText}>Suporte</Text>
      </TouchableOpacity>

      {isAdmin && (
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleAdminPanel}
        >
          <Ionicons name="shield-checkmark" size={24} color="#FFD700" />
          <Text style={[styles.menuItemText, styles.adminText]}>Painel Admin</Text>
        </TouchableOpacity>
      )}

      {/* Divisor antes do logout */}
      <View style={styles.divider} />

      {/* Logout */}
      <TouchableOpacity
        style={[styles.menuItem, styles.logoutItem]}
        onPress={handleLogout}
      >
        <Ionicons name="exit-outline" size={24} color="#DC3545" />
        <Text style={[styles.menuItemText, styles.logoutText]}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    paddingVertical: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0F6B32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F6B32',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F6B32',
    marginLeft: 16,
  },
  adminText: {
    color: '#FFD700',
    fontWeight: '700',
  },
  logoutItem: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
  },
  logoutText: {
    color: '#DC3545',
    fontWeight: '700',
  },
});
