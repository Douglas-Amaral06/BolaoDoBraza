import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';

type DrawerNavigation = DrawerNavigationProp<any>;

export default function CustomHeader() {
  const navigation = useNavigation<DrawerNavigation>();

  const handleMenuPress = () => {
    navigation.toggleDrawer();
  };

  return (
    <View style={styles.container}>
      {/* Menu Hambúrguer */}
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={handleMenuPress}
      >
        <Ionicons name="menu" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Logo Palpite 10 */}
      <View style={styles.logoContainer}>
        <Ionicons name="football" size={24} color="#FFF" style={{ marginRight: 8 }} />
        <Text style={styles.logoPalpite}>Palpite </Text>
        <Text style={styles.logo10}>10</Text>
      </View>

      {/* Ícone de Notificação */}
      <TouchableOpacity style={styles.notificationButton}>
        <Ionicons name="notifications-outline" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: '#0F6B32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoPalpite: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  logo10: {
    color: '#FFDF00',
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
