import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { apiSports } from '@/services/apiSports';
import { 
  obterTotalParticipantes, 
  obterListaParticipantes,
  obterJogosAbertosFormatados,
} from '@/app/Store';

interface Participante {
  id: string;
  nome: string;
  tempo: string;
}

interface PlacarAoVivo {
  fixtureId: string;
  timeCasa: string;
  timeVisitante: string;
  golsCasa: number;
  golsVisitante: number;
  status: string;
}

export default function BolaoScreen() {
  const insets = useSafeAreaInsets();
  const [listaParticipantes, setListaParticipantes] = useState<Participante[]>([]);
  const [placares, setPlacares] = useState<PlacarAoVivo[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [carregandoPlacares, setCarregandoPlacares] = useState(false);
  const valorPorPessoa = 10;
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Função para atualizar placares em tempo real
  const atualizarPlacares = useCallback(async () => {
    try {
      setCarregandoPlacares(true);
      const jogosAbertos = obterJogosAbertosFormatados();
      
      if (jogosAbertos.length === 0) {
        setPlacares([]);
        return;
      }

      const promessas = jogosAbertos.map(jogo =>
        apiSports.buscarPlacarAoVivo(jogo.fixtureId)
          .then(placar => {
            if (!placar) return null;
            
            // Apenas mostrar se está em andamento ou finalizado
            if (placar.status !== 'STATUS_IN_PROGRESS' && placar.status !== 'STATUS_FINAL') {
              return null;
            }

            return {
              fixtureId: placar.fixtureId,
              timeCasa: jogo.timeCasa.nome,
              timeVisitante: jogo.timeVisitante.nome,
              golsCasa: placar.golsCasa,
              golsVisitante: placar.golsVisitante,
              status: placar.status,
            };
          })
          .catch(() => null)
      );

      const resultados = await Promise.all(promessas);
      setPlacares(resultados.filter((p): p is PlacarAoVivo => p !== null));
    } catch (error) {
      console.error('❌ Erro ao atualizar placares:', error);
    } finally {
      setCarregandoPlacares(false);
    }
  }, []);

  // Carrega dados do bolão
  const carregarDadosBolao = useCallback(() => {
    try {
      const dadosFormatados = obterListaParticipantes();
      setListaParticipantes(dadosFormatados);
      console.log('✅ Dados do bolão atualizados:', dadosFormatados.length, 'participantes');
    } catch (error) {
      console.log('ℹ️ Erro ao carregar dados:', error);
      setListaParticipantes([]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Setup polling de placares ao entrar na tela
  useFocusEffect(
    useCallback(() => {
      carregarDadosBolao();
      atualizarPlacares();

      // Polling a cada 60 segundos para sincronizar placares ao vivo
      // Mantém ativo enquanto houver jogos em andamento (STATUS_IN_PROGRESS)
      pollingIntervalRef.current = setInterval(() => {
        atualizarPlacares();
      }, 60000);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }, [carregarDadosBolao, atualizarPlacares])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregarDadosBolao();
    atualizarPlacares();
  }, [carregarDadosBolao, atualizarPlacares]);

  const totalParticipantes = obterTotalParticipantes();
  const premioTotal = totalParticipantes * valorPorPessoa;

  const renderAvatar = (nome: string) => {
    const iniciais = nome
      .split('.')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return (
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{iniciais || '?'}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bolão</Text>
        <TouchableOpacity onPress={() => router.push('/')}>
          <Ionicons name="settings" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={listaParticipantes}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0F6B32"
            progressBackgroundColor="#FFF"
          />
        }
        ListHeaderComponent={() => (
          <>
            {/* CARD PARTICIPANTES */}
            <View style={styles.liveCard}>
              <View style={styles.peopleCircle}>
                <Ionicons name="people" size={32} color="#FFF" />
              </View>
              <View>
                <Text style={styles.liveLabel}>Total de participantes</Text>
                <Text style={styles.liveNumber}>{totalParticipantes} pessoas</Text>
                <View style={styles.liveRow}>
                  <View style={styles.liveBadge}>
                    <Text style={styles.liveBadgeText}>● AO VIVO</Text>
                  </View>
                  <Text style={styles.liveUpdate}>Atualizando agora</Text>
                </View>
              </View>
            </View>

            {/* CARD APOSTA */}
            <View style={styles.betCard}>
              <View>
                <Text style={styles.betLabel}>Aposta fixa por pessoa</Text>
                <Text style={styles.betValue}>{valorPorPessoa} BRL</Text>
              </View>
              <View style={styles.coinCircle}>
                <Ionicons name="cash" size={24} color="#F7B500" />
              </View>
            </View>

            {/* SEÇÃO DE PLACARES AO VIVO */}
            {placares.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Placares ao vivo</Text>
                  {carregandoPlacares && <ActivityIndicator size="small" color="#0F6B32" />}
                </View>

                {placares.map(placar => (
                  <View key={placar.fixtureId} style={styles.placarCard}>
                    <View style={styles.placarContent}>
                      <Text style={styles.placarTime} numberOfLines={1}>{placar.timeCasa}</Text>
                      <View style={styles.placarScore}>
                        <Text style={styles.placarGols}>{placar.golsCasa}</Text>
                        <Text style={styles.placarX}>-</Text>
                        <Text style={styles.placarGols}>{placar.golsVisitante}</Text>
                      </View>
                      <Text style={styles.placarTime} numberOfLines={1}>{placar.timeVisitante}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <Text style={[
                        styles.statusText,
                        placar.status === 'STATUS_FINAL' && styles.statusFt,
                        placar.status === 'STATUS_IN_PROGRESS' && styles.statusInProgress,
                      ]}>
                        {placar.status === 'STATUS_FINAL' ? '✓ FIM' : '📺 AO VIVO'}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            <Text style={styles.sectionTitle}>Últimos participantes</Text>
          </>
        )}
        renderItem={({ item }) => (
          <View style={styles.participantItem}>
            <View style={styles.leftArea}>
              {renderAvatar(item.nome)}
              <View>
                <Text style={styles.participantName}>{item.nome}</Text>
                <Text style={styles.participantTime}>{item.tempo}</Text>
              </View>
            </View>
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>10 BRL</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum palpite pago e validado ainda.</Text>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* CARD PRÊMIO */}
      <View style={styles.prizeCard}>
        <Ionicons name="trophy" size={45} color="#FFD700" />
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={styles.prizeTitle}>Bolão acumulado</Text>
          <Text style={styles.prizeValue}>{premioTotal} BRL</Text>
          <Text style={styles.prizeSub}>Valor total do prêmio</Text>
        </View>
        <Ionicons name="logo-usd" size={40} color="#FFD700" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F6F8' 
  },

  header: { 
    backgroundColor: '#0F6B32', 
    height: 90, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },

  headerTitle: { 
    color: '#FFF', 
    fontSize: 22, 
    fontWeight: '700' 
  },

  liveCard: { 
    margin: 15, 
    backgroundColor: '#0C5E2A', 
    borderRadius: 20, 
    padding: 20, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },

  peopleCircle: { 
    width: 65, 
    height: 65, 
    borderRadius: 32, 
    backgroundColor: '#1DA34A', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15 
  },

  liveLabel: { 
    color: '#FFF', 
    fontSize: 14 
  },

  liveNumber: { 
    color: '#FFF', 
    fontSize: 36, 
    fontWeight: 'bold' 
  },

  liveRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },

  liveBadge: { 
    backgroundColor: '#0FA946', 
    borderRadius: 10, 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    marginRight: 10 
  },

  liveBadgeText: { 
    color: '#FFF', 
    fontSize: 10, 
    fontWeight: 'bold' 
  },

  liveUpdate: { 
    color: '#FFF', 
    fontSize: 12 
  },

  betCard: { 
    backgroundColor: '#FFF', 
    marginHorizontal: 15, 
    borderRadius: 15, 
    padding: 18, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOpacity: 0.03, 
    shadowRadius: 5, 
    elevation: 1 
  },

  betLabel: { 
    color: '#777', 
    fontSize: 12 
  },

  betValue: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#222' 
  },

  coinCircle: { 
    width: 55, 
    height: 55, 
    borderRadius: 28, 
    backgroundColor: '#FFF7D7', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  sectionHeader: {
    marginTop: 20,
    marginLeft: 15,
    marginRight: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#222', 
    marginBottom: 10 
  },

  placarCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  placarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  placarTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },

  placarScore: {
    alignItems: 'center',
    marginHorizontal: 8,
  },

  placarGols: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F6B32',
  },

  placarX: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999',
  },

  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F6B32',
  },

  statusFt: {
    color: '#0FA946',
  },

  status1H: {
    color: '#FF9800',
  },

  statusInProgress: {
    color: '#FF6B6B',
  },

  participantItem: { 
    paddingHorizontal: 15, 
    paddingVertical: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    marginHorizontal: 15, 
    marginBottom: 8, 
    borderRadius: 12 
  },

  leftArea: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },

  avatar: { 
    width: 45, 
    height: 45, 
    borderRadius: 22, 
    backgroundColor: '#0F6B32', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },

  avatarText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 14 
  },

  participantName: { 
    fontWeight: '700', 
    color: '#222', 
    fontSize: 15 
  },

  participantTime: { 
    color: '#777', 
    fontSize: 12, 
    marginTop: 2 
  },

  priceTag: { 
    backgroundColor: '#E7F8EA', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 8 
  },

  priceText: { 
    color: '#0F6B32', 
    fontWeight: '700' 
  },

  listContent: {
    paddingBottom: 100,
  },

  prizeCard: { 
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    margin: 15, 
    marginBottom: 20,
    backgroundColor: '#0A47D5', 
    borderRadius: 20, 
    padding: 20, 
    flexDirection: 'row', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  prizeTitle: { 
    color: '#FFF', 
    fontSize: 16 
  },

  prizeValue: { 
    color: '#FFF', 
    fontSize: 38, 
    fontWeight: 'bold' 
  },

  prizeSub: { 
    color: '#DCE6FF', 
    fontSize: 12 
  },

  emptyText: { 
    textAlign: 'center', 
    color: '#777', 
    marginTop: 30, 
    fontSize: 14, 
    fontStyle: 'italic' 
  }
});
