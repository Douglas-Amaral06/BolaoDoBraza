import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Image, RefreshControl, Modal, Alert, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { obterTotalParticipantes, obterNotificacoes, marcarNotificacaoComoLida } from '@/app/Store';
import { router } from 'expo-router';

export default function App() {
  const { userEmail, isAdmin, logout } = useAuth();
  const [userName, setUserName] = useState('(User)');
  const [apostadoresCount, setApostadoresCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  const [notificacoesList, setNotificacoesList] = useState<any[]>([]);
  const bolaoAcumulado = apostadoresCount * 10;

  const flagBrasil = "https://flagcdn.com/w160/br.png";
  const flagEscocia = "https://flagcdn.com/w160/gb-sct.png";

  useFocusEffect(
    useCallback(() => {
      if (userEmail) {
        const parteAntesDoAt = userEmail.split('@')[0];
        const nomeTratado = parteAntesDoAt
          .split('.')
          .map(pala => pala.charAt(0).toUpperCase() + pala.slice(1))
          .join('.');
        setUserName(nomeTratado);
      }
    }, [userEmail])
  );

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
    router.push('/regras');
  };

  const handleSuporte = () => {
    setShowMenu(false);
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
          onPress: () => {
            logout();
            setShowMenu(false);
            router.replace('/auth');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderNotificacao = ({ item }: { item: any }) => (
    <View style={[styles.notificacaoItem, !item.lida && styles.notificacaoNaoLida]}>
      <View style={[
        styles.notificacaoIcon,
        item.tipo === 'sucesso' && styles.iconSucesso,
        item.tipo === 'resultado' && styles.iconResultado,
        item.tipo === 'sistema' && styles.iconSistema,
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
        <Text style={styles.notificacaoTitulo}>{item.titulo}</Text>
        <Text style={styles.notificacaoMensagem}>{item.mensagem}</Text>
        <Text style={styles.notificacaoHora}>
          {new Date(item.timestamp).toLocaleTimeString('pt-BR')}
        </Text>
      </View>
      {!item.lida && (
        <TouchableOpacity 
          onPress={() => {
            marcarNotificacaoComoLida(item.id);
            carregarDadosBolao();
          }}
        >
          <View style={styles.leiaPonto} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F6B32" />
      
      <View style={styles.greenTopBg} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0F6B32"
            progressBackgroundColor="#FFF"
          />
        }
      >
        
        <View style={styles.headerTopBar}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setShowMenu(true)}
          >
            <Ionicons name="menu" size={32} color="#FFF" />
          </TouchableOpacity>
          
          <View style={styles.centerContent}>
            <Ionicons name="football" size={26} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.logoText}>
              <Text style={styles.logoPalpite}>Palpite </Text>
              <Text style={styles.logo10}>10</Text>
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => setShowNotificacoes(true)}
          >
            <Ionicons name="notifications-outline" size={26} color="#FFF" />
            {notificacoesList.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{notificacoesList.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.matchCard}>
          <View style={styles.badgeTop}>
            <Text style={styles.badgeText}>PRÓXIMO JOGO</Text>
          </View>
          
          <Text style={styles.matchTitle}>Brasil x Escócia</Text>
          
          <View style={styles.teamsContainer}>
            <View style={styles.team}>
              <Image source={{ uri: flagBrasil }} style={styles.flagCircle} />
              <Text style={styles.teamName}>BRASIL</Text>
            </View>
            
            <Text style={styles.versus}>X</Text>
            
            <View style={styles.team}>
              <Image source={{ uri: flagEscocia }} style={styles.flagCircle} />
              <Text style={styles.teamName}>ESCÓCIA</Text>
            </View>
          </View>

          <View style={styles.matchInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color="#8B9BB4" />
              <Text style={styles.infoText}>24/06/2026 (Qua)</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color="#8B9BB4" />
              <Text style={styles.infoText}>19:00</Text>
            </View>
          </View>

          <View style={styles.betInfo}>
            <Ionicons name="cash-outline" size={18} color="#0F6B32" />
            <Text style={styles.betText}>Aposta fixa: R$ 10,00</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quem você acha que vence?</Text>
        <View style={styles.predictionContainer}>
          <View style={[styles.predictBtn, styles.btnBrasil]}>
            <Image source={{ uri: flagBrasil }} style={styles.smallFlagCircle} />
            <Text style={styles.predictBtnTextDark}>BRASIL</Text>
          </View>
          
          <View style={[styles.predictBtn, styles.btnAdversario]}>
            <Image source={{ uri: flagEscocia }} style={styles.smallFlagCircle} />
            <Text style={styles.predictBtnTextDark}>ESCÓCIA</Text>
          </View>
        </View>

        <View style={styles.liveContainer}>
          <View style={styles.liveHeader}>
            <Text style={styles.liveTitle}>AO VIVO NO BOLÃO</Text>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>● AO VIVO</Text>
            </View>
          </View>

          <View style={styles.statsCards}>
            <View style={styles.statBox}>
              <View style={styles.iconCircleGreen}>
                <Ionicons name="people" size={24} color="#FFF" />
              </View>
              <View style={styles.statTextColumn}>
                <Text style={styles.statNumber}>{apostadoresCount}</Text>
                <Text style={styles.statLabel}>pessoas{'\n'}apostando</Text>
              </View>
            </View>
            
            <View style={styles.statBox}>
              <View style={styles.iconCircleYellow}>
                <Ionicons name="layers" size={22} color="#FFF" />
              </View>
              <View style={styles.statTextColumn}>
                <Text style={styles.statNumber}>{bolaoAcumulado} <Text style={styles.currencyText}>BRL</Text></Text>
                <Text style={styles.statLabel}>bolão{'\n'}acumulado</Text>
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
        <SafeAreaView style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Menu</Text>
            <TouchableOpacity onPress={() => setShowMenu(false)}>
              <Ionicons name="close" size={28} color="#0F6B32" />
            </TouchableOpacity>
          </View>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={handleRegras}>
            <Ionicons name="document-text-outline" size={24} color="#0F6B32" />
            <Text style={styles.menuItemText}>📜 Regras do Bolão</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleSuporte}>
            <Ionicons name="chatbubble-outline" size={24} color="#0F6B32" />
            <Text style={styles.menuItemText}>💬 Suporte</Text>
          </TouchableOpacity>

          {isAdmin && (
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                router.push('/(tabs)/AdminPanel');
              }}
            >
              <Ionicons name="shield-checkmark" size={24} color="#FFD700" />
              <Text style={[styles.menuItemText, styles.adminMenuText]}>👑 Painel Admin</Text>
            </TouchableOpacity>
          )}

          <View style={styles.menuDivider} />

          <TouchableOpacity style={[styles.menuItem, styles.logoutMenuItem]} onPress={handleLogout}>
            <Ionicons name="exit-outline" size={24} color="#DC3545" />
            <Text style={[styles.menuItemText, styles.logoutMenuText]}>🚪 Sair</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      {/* MODAL NOTIFICAÇÕES */}
      <Modal
        visible={showNotificacoes}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotificacoes(false)}
      >
        <SafeAreaView style={styles.notificacoesContainer}>
          <View style={styles.notificacoesHeader}>
            <Text style={styles.notificacoesTitle}>Notificações</Text>
            <TouchableOpacity onPress={() => setShowNotificacoes(false)}>
              <Ionicons name="close" size={28} color="#0F6B32" />
            </TouchableOpacity>
          </View>

          {notificacoesList.length > 0 ? (
            <FlatList
              data={notificacoesList}
              renderItem={renderNotificacao}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.notificacoesList}
            />
          ) : (
            <View style={styles.notificacoesVazias}>
              <Ionicons name="notifications-off" size={64} color="#CCC" />
              <Text style={styles.notificacoesVaziasText}>Nenhuma notificação</Text>
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
    backgroundColor: '#F4F7FB',
  },
  greenTopBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 310,
    backgroundColor: '#0F6B32', 
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  headerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
    marginTop: 10,
  },
  menuButton: {
    padding: 4,
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
    color: '#FFDF00',
    fontSize: 26,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  notificationButton: {
    padding: 4,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    paddingTop: 35, 
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, 
  },
  badgeTop: {
    position: 'absolute',
    top: -14,
    alignSelf: 'center',
    backgroundColor: '#FFDF00',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
    zIndex: 10,
    elevation: 6,
  },
  badgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A202C',
    marginBottom: 25,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  team: {
    alignItems: 'center',
  },
  flagCircle: {
    width: 65,
    height: 65,
    borderRadius: 35,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    resizeMode: 'cover',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1A202C',
  },
  versus: {
    fontSize: 24,
    fontWeight: '900',
    color: '#A0AEC0',
  },
  matchInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  infoText: {
    color: '#4A5568',
    fontSize: 12,
    fontWeight: '600',
  },
  betInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FFF4',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C6F6D5',
    width: '100%',
    justifyContent: 'center',
  },
  betText: {
    color: '#0F6B32',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionTitle: {
    color: '#1A202C', 
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  predictionContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 35,
  },
  predictBtn: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  smallFlagCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  btnBrasil: {
    backgroundColor: '#FFDF00',
  },
  btnAdversario: {
    backgroundColor: '#D6E4FF', 
  },
  predictBtnTextDark: {
    color: '#1A202C',
    fontWeight: '900',
    fontSize: 15,
  },
  liveContainer: {
    backgroundColor: '#044A22',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  liveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  liveTitle: {
    color: '#F9E076',
    fontWeight: 'bold',
    fontSize: 15,
  },
  liveBadge: {
    backgroundColor: '#0FA946',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  liveBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  statsCards: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0B6E36',
    padding: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#118C44',
  },
  iconCircleGreen: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0FA946',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#26C761',
  },
  iconCircleYellow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F9E076',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#FFF1A0',
  },
  statTextColumn: {
    flex: 1,
  },
  statNumber: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  currencyText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#D1E8D9',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 14,
  },
  menuContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  menuHeader: {
    backgroundColor: '#0F6B32',
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  menuTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 12,
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F6B32',
    marginLeft: 16,
  },
  adminMenuText: {
    color: '#FFD700',
    fontWeight: '700',
  },
  logoutMenuItem: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
  },
  logoutMenuText: {
    color: '#DC3545',
    fontWeight: '700',
  },
  notificacoesContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  notificacoesHeader: {
    backgroundColor: '#0F6B32',
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  notificacoesTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
  },
  notificacoesList: {
    padding: 16,
  },
  notificacaoItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#E8E8E8',
  },
  notificacaoNaoLida: {
    backgroundColor: '#F0FFF4',
    borderLeftColor: '#0F6B32',
  },
  notificacaoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconSucesso: {
    backgroundColor: '#0FA946',
  },
  iconResultado: {
    backgroundColor: '#FFD700',
  },
  iconSistema: {
    backgroundColor: '#0F6B32',
  },
  notificacaoTexto: {
    flex: 1,
  },
  notificacaoTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 4,
  },
  notificacaoMensagem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  notificacaoHora: {
    fontSize: 11,
    color: '#999',
  },
  leiaPonto: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0F6B32',
  },
  notificacoesVazias: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificacoesVaziasText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
});
