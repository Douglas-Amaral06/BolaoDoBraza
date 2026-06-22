import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Image, RefreshControl, Modal, Alert, FlatList, Pressable, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { obterTotalParticipantes, obterNotificacoes, marcarNotificacaoComoLida } from '@/app/Store';
import { router } from 'expo-router';
import { AnimatedButton, PulseBadge } from '@/components/ui';
import { colors, typography, spacing, radius, elevation } from '@/app/design';
import { useHaptics } from '@/hooks/useHaptics';

export default function App() {
  const { userEmail, isAdmin, logout } = useAuth();
  const haptics = useHaptics();
  const [apostadoresCount, setApostadoresCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  const [notificacoesList, setNotificacoesList] = useState<any[]>([]);
  const bolaoAcumulado = apostadoresCount * 10;

  const flagBrasil = "https://flagcdn.com/w160/br.png";
  const flagEscocia = "https://flagcdn.com/w160/gb-sct.png";

  const carregarDadosBolao = useCallback(() => {
    try {
      const totalParticipantes = obterTotalParticipantes();
      setApostadoresCount(totalParticipantes);
      
      const notificacoes = obterNotificacoes();
      setNotificacoesList(notificacoes);
    } catch (error) {
      console.log('ℹ️ Erro ao carregar dados:', error);
      setApostadoresCount(0);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarDadosBolao();
    }, [carregarDadosBolao])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregarDadosBolao();
  }, [carregarDadosBolao]);

  const handleRegras = () => {
    setShowMenu(false);
    haptics.select();
    router.push('/regras');
  };

  const handleSuporte = () => {
    setShowMenu(false);
    haptics.select();
    router.push('/support');
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
          onPress: async () => {
            haptics.impact();
            logout();
            setShowMenu(false);
            router.replace('/auth');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderNotificacao = ({ item, index }: { item: any; index: number }) => {
    const fadeIn = new Animated.Value(0);
    React.useEffect(() => {
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 300,
        delay: index * 40,
        useNativeDriver: true,
      }).start();
    }, []);

    return (
      <Animated.View style={{ opacity: fadeIn, transform: [{ translateX: fadeIn.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }] }}>
        <View style={[
          styles.notificacaoItem,
          !item.lida && { backgroundColor: colors.primary.muted },
          { borderLeftColor: !item.lida ? colors.primary.DEFAULT : colors.border.light },
        ]}>
          <View style={[
            styles.notificacaoIcon,
            {
              backgroundColor: item.tipo === 'sucesso'
                ? colors.game.finished
                : item.tipo === 'resultado'
                  ? colors.gold
                  : colors.primary.DEFAULT,
            },
          ]}>
            <Ionicons 
              name={
                item.tipo === 'sucesso' ? 'checkmark-circle' :
                item.tipo === 'resultado' ? 'trophy' :
                'information'
              } 
              size={24} 
              color="#FFF" 
            />
          </View>
          <View style={styles.notificacaoTexto}>
            <Text style={[styles.notificacaoTitulo, { color: colors.text.primary }]}>{item.titulo}</Text>
            <Text style={[styles.notificacaoMensagem, { color: colors.text.secondary }]}>{item.mensagem}</Text>
            <Text style={[styles.notificacaoHora, { color: colors.text.tertiary }]}>
              {new Date(item.timestamp).toLocaleTimeString('pt-BR')}
            </Text>
          </View>
          {!item.lida && (
            <Pressable 
              onPress={() => {
                haptics.select();
                marcarNotificacaoComoLida(item.id);
                carregarDadosBolao();
              }}
            >
              <View style={[styles.leiaPonto, { backgroundColor: colors.primary.DEFAULT }]} />
            </Pressable>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg.secondary }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary.DEFAULT} />
      
      <View style={[styles.greenTopBg, { backgroundColor: colors.primary.DEFAULT }]} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.DEFAULT}
            progressBackgroundColor="#FFF"
          />
        }
      >
        
        <View style={styles.headerTopBar}>
          <Pressable 
            style={styles.menuButton}
            onPress={() => {
              haptics.select();
              setShowMenu(true);
            }}
          >
            <Ionicons name="menu" size={32} color="#FFF" />
          </Pressable>
          
          <View style={styles.centerContent}>
            <Ionicons name="football" size={26} color="#FFF" style={{ marginRight: spacing.xs }} />
            <Text style={styles.logoText}>
              <Text style={styles.logoPalpite}>Palpite </Text>
              <Text style={styles.logo10}>10</Text>
            </Text>
          </View>
          
          <Pressable 
            style={styles.notificationButton}
            onPress={() => {
              haptics.select();
              setShowNotificacoes(true);
            }}
          >
            <Ionicons name="notifications-outline" size={26} color="#FFF" />
            {notificacoesList.length > 0 && (
              <View style={[styles.notificationBadge, { backgroundColor: colors.game.live }]}>
                <Text style={[styles.notificationBadgeText, { color: '#FFF' }]}>{notificacoesList.length}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={[styles.matchCard, elevation.e2]}>
          <View style={[
            styles.badgeTop,
            { backgroundColor: colors.gold }
          ]}>
            <Text style={[styles.badgeText, { color: '#000' }, typography.label]}>PRÓXIMO JOGO</Text>
          </View>
          
          <Text style={[styles.matchTitle, typography.heading3, { color: colors.text.primary }]}>Brasil x Escócia</Text>
          
          <View style={styles.teamsContainer}>
            <View style={styles.team}>
              <Image source={{ uri: flagBrasil }} style={styles.flagCircle} />
              <Text style={[styles.teamName, typography.subtitle2, { color: colors.text.primary }]}>BRASIL</Text>
            </View>
            
            <Text style={[styles.versus, { color: colors.text.tertiary }]}>X</Text>
            
            <View style={styles.team}>
              <Image source={{ uri: flagEscocia }} style={styles.flagCircle} />
              <Text style={[styles.teamName, typography.subtitle2, { color: colors.text.primary }]}>ESCÓCIA</Text>
            </View>
          </View>

          <View style={styles.matchInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.text.tertiary} />
              <Text style={[styles.infoText, typography.body2, { color: colors.text.secondary }]}>24/06/2026 (Qua)</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color={colors.text.tertiary} />
              <Text style={[styles.infoText, typography.body2, { color: colors.text.secondary }]}>19:00</Text>
            </View>
          </View>

          <View style={[
            styles.betInfo,
            { backgroundColor: colors.primary.muted, borderColor: colors.primary.light }
          ]}>
            <Ionicons name="cash-outline" size={18} color={colors.primary.DEFAULT} />
            <Text style={[styles.betText, typography.subtitle2, { color: colors.primary.DEFAULT }]}>Aposta fixa: R$ 10,00</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, typography.subtitle1, { color: colors.text.primary, marginBottom: spacing.lg }]}>Quem você acha que vence?</Text>
        <View style={[styles.predictionContainer, { gap: spacing.md, marginBottom: spacing.xl }]}>
          <Pressable 
            onPress={() => {
              haptics.impact();
              router.push('/(tabs)/BetScreen');
            }}
            style={[styles.predictBtn, { backgroundColor: colors.gold }]}
          >
            <Image source={{ uri: flagBrasil }} style={styles.smallFlagCircle} />
            <Text style={[styles.predictBtnTextDark, typography.subtitle2, { color: colors.text.primary }]}>BRASIL</Text>
          </Pressable>
          
          <Pressable 
            onPress={() => {
              haptics.impact();
              router.push('/(tabs)/BetScreen');
            }}
            style={[styles.predictBtn, { backgroundColor: colors.game.scheduledBg }]}
          >
            <Image source={{ uri: flagEscocia }} style={styles.smallFlagCircle} />
            <Text style={[styles.predictBtnTextDark, typography.subtitle2, { color: colors.text.primary }]}>ESCÓCIA</Text>
          </Pressable>
        </View>

        <View style={[styles.liveContainer, { backgroundColor: colors.primary.dark }]}>
          <View style={styles.liveHeader}>
            <Text style={[styles.liveTitle, typography.subtitle2, { color: colors.gold }]}>AO VIVO NO BOLÃO</Text>
            <PulseBadge variant="live" compact />
          </View>

          <View style={[styles.statsCards, { gap: spacing.md }]}>
            <View style={[
              styles.statBox,
              { 
                backgroundColor: colors.primary.light,
                borderColor: colors.game.finished,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.md,
              }
            ]}>
              <View style={[
                styles.iconCircleGreen,
                { backgroundColor: colors.game.finished }
              ]}>
                <Ionicons name="people" size={24} color="#FFF" />
              </View>
              <View style={styles.statTextColumn}>
                <Text style={[styles.statNumber, typography.number, { color: '#FFF' }]}>{apostadoresCount}</Text>
                <Text style={[styles.statLabel, typography.caption, { color: colors.primary.muted, lineHeight: 16 }]}>pessoas{'\n'}apostando</Text>
              </View>
            </View>
            
            <View style={[
              styles.statBox,
              { 
                backgroundColor: colors.primary.light,
                borderColor: colors.gold,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.md,
              }
            ]}>
              <View style={[
                styles.iconCircleYellow,
                { backgroundColor: colors.gold }
              ]}>
                <Ionicons name="layers" size={22} color="#1A202C" />
              </View>
              <View style={styles.statTextColumn}>
                <Text style={[styles.statNumber, typography.number, { color: '#FFF' }]}>{bolaoAcumulado} <Text style={[styles.currencyText, typography.caption, { color: '#FFF' }]}>BRL</Text></Text>
                <Text style={[styles.statLabel, typography.caption, { color: colors.primary.muted, lineHeight: 16 }]}>bolão{'\n'}acumulado</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* MODAL MENU */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMenu(false)}
      >
        <SafeAreaView style={[styles.menuContainer, { backgroundColor: colors.bg.secondary }]}>
          <View style={[styles.menuHeader, { backgroundColor: colors.primary.DEFAULT }]}>
            <Text style={[styles.menuTitle, typography.heading3, { color: '#FFF' }]}>Menu</Text>
            <Pressable onPress={() => setShowMenu(false)}>
              <Ionicons name="close" size={28} color="#FFF" />
            </Pressable>
          </View>

          <View style={[styles.menuDivider, { backgroundColor: colors.border.light }]} />

          <Pressable style={styles.menuItem} onPress={handleRegras}>
            <Ionicons name="document-text-outline" size={24} color={colors.primary.DEFAULT} />
            <Text style={[styles.menuItemText, typography.subtitle2, { color: colors.primary.DEFAULT, marginLeft: spacing.md }]}>📜 Regras do Bolão</Text>
          </Pressable>

          <Pressable style={styles.menuItem} onPress={handleSuporte}>
            <Ionicons name="chatbubble-outline" size={24} color={colors.primary.DEFAULT} />
            <Text style={[styles.menuItemText, typography.subtitle2, { color: colors.primary.DEFAULT, marginLeft: spacing.md }]}>💬 Suporte</Text>
          </Pressable>

          {isAdmin && (
            <Pressable 
              style={styles.menuItem}
              onPress={() => {
                haptics.select();
                setShowMenu(false);
                router.push('/(tabs)/AdminPanel');
              }}
            >
              <Ionicons name="shield-checkmark" size={24} color={colors.gold} />
              <Text style={[styles.menuItemText, typography.subtitle2, { color: colors.gold, marginLeft: spacing.md, fontWeight: '700' }]}>👑 Painel Admin</Text>
            </Pressable>
          )}

          <View style={[styles.menuDivider, { backgroundColor: colors.border.light }]} />

          <Pressable 
            style={[styles.menuItem, { backgroundColor: 'rgba(220, 53, 69, 0.1)' }]} 
            onPress={handleLogout}
          >
            <Ionicons name="exit-outline" size={24} color={colors.game.live} />
            <Text style={[styles.menuItemText, typography.subtitle2, { color: colors.game.live, marginLeft: spacing.md, fontWeight: '700' }]}>🚪 Sair</Text>
          </Pressable>
        </SafeAreaView>
      </Modal>

      {/* MODAL NOTIFICAÇÕES */}
      <Modal
        visible={showNotificacoes}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotificacoes(false)}
      >
        <SafeAreaView style={[styles.notificacoesContainer, { backgroundColor: colors.bg.secondary }]}>
          <View style={[styles.notificacoesHeader, { backgroundColor: colors.primary.DEFAULT }]}>
            <Text style={[styles.notificacoesTitle, typography.heading3, { color: '#FFF' }]}>Notificações</Text>
            <Pressable onPress={() => setShowNotificacoes(false)}>
              <Ionicons name="close" size={28} color="#FFF" />
            </Pressable>
          </View>

          {notificacoesList.length > 0 ? (
            <FlatList
              data={notificacoesList}
              renderItem={renderNotificacao}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[styles.notificacoesList, { padding: spacing.md }]}
            />
          ) : (
            <View style={styles.notificacoesVazias}>
              <Ionicons name="notifications-off" size={64} color={colors.border.light} />
              <Text style={[styles.notificacoesVaziasText, typography.subtitle2, { color: colors.text.tertiary, marginTop: spacing.md }]}>Nenhuma notificação</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  greenTopBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 310,
  },
  scrollContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  headerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl + spacing.lg,
    marginTop: spacing.md,
  },
  menuButton: {
    padding: spacing.xs,
  },
  centerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    flexDirection: 'row',
  },
  logoPalpite: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  logo10: {
    color: colors.gold,
    fontSize: 26,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  notificationButton: {
    padding: spacing.xs,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchCard: {
    backgroundColor: colors.bg.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    paddingTop: spacing.xl + spacing.lg, 
    alignItems: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
  },
  badgeTop: {
    position: 'absolute',
    top: -14,
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    zIndex: 10,
  },
  badgeText: {
  },
  matchTitle: {
    marginBottom: spacing.xl + spacing.md,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl + spacing.md,
  },
  team: {
    alignItems: 'center',
  },
  flagCircle: {
    width: 65,
    height: 65,
    borderRadius: 35,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    resizeMode: 'cover',
  },
  teamName: {
  },
  versus: {
    fontSize: 24,
    fontWeight: '900',
  },
  matchInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
  },
  betInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    width: '100%',
    justifyContent: 'center',
  },
  betText: {
  },
  sectionTitle: {
    textAlign: 'center',
  },
  predictionContainer: {
    flexDirection: 'row',
  },
  predictBtn: {
    flex: 1,
    paddingVertical: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallFlagCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  predictBtnTextDark: {
  },
  liveContainer: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  liveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  liveTitle: {
  },
  statsCards: {
    flexDirection: 'row',
  },
  statBox: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  iconCircleGreen: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
  },
  iconCircleYellow: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
  },
  statTextColumn: {
    flex: 1,
  },
  statNumber: {
  },
  currencyText: {
  },
  statLabel: {
  },
  menuContainer: {
    flex: 1,
  },
  menuHeader: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  menuTitle: {
  },
  menuDivider: {
    height: 1,
    marginVertical: spacing.md,
    marginHorizontal: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  menuItemText: {
  },
  notificacoesContainer: {
    flex: 1,
  },
  notificacoesHeader: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  notificacoesTitle: {
  },
  notificacoesList: {
    paddingHorizontal: spacing.md,
  },
  notificacaoItem: {
    backgroundColor: colors.bg.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  notificacaoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  notificacaoTexto: {
    flex: 1,
  },
  notificacaoTitulo: {
    marginBottom: spacing.xs,
  },
  notificacaoMensagem: {
    marginBottom: spacing.sm,
  },
  notificacaoHora: {
  },
  leiaPonto: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
  },
  notificacoesVazias: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificacoesVaziasText: {
  },
});
