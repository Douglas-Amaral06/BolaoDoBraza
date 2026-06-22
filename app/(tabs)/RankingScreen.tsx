import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { calcularRanking, RankingItem } from '@/app/Store';

export default function RankingScreen() {
  const insets = useSafeAreaInsets();
  const [listaRanking, setListaRanking] = useState<RankingItem[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Função para atualizar ranking quando tela ganha foco
  useFocusEffect(
    useCallback(() => {
      atualizarRanking();
    }, [])
  );

  const atualizarRanking = () => {
    try {
      setCarregando(true);
      const ranking = calcularRanking();
      setListaRanking(ranking);
      console.log('✅ Ranking atualizado na tela:', ranking.length, 'usuários');
    } catch (error) {
      console.error('❌ Erro ao atualizar ranking:', error);
      setListaRanking([]);
    } finally {
      setCarregando(false);
    }
  };

  const getTrofeuIcon = (posicao: number) => {
    switch (posicao) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const getPosicaoColor = (posicao: number): string => {
    switch (posicao) {
      case 1:
        return '#FFD700'; // Ouro
      case 2:
        return '#C0C0C0'; // Prata
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return '#0F6B32'; // Verde padrão
    }
  };

  const renderItemRanking = ({ item, index }: { item: RankingItem; index: number }) => {
    const posicao = index + 1;
    const trofeu = getTrofeuIcon(posicao);
    const corPosicao = getPosicaoColor(posicao);

    return (
      <View 
        style={[
          styles.row,
          posicao <= 3 && styles.rowTopTres
        ]}
      >
        {/* POSIÇÃO COM TROFÉU */}
        <View style={styles.posicaoContainer}>
          <Text 
            style={[
              styles.position,
              { color: corPosicao, fontWeight: posicao <= 3 ? '900' : '700' }
            ]}
          >
            {trofeu ? trofeu : `${posicao}°`}
          </Text>
        </View>

        {/* NOME DO USUÁRIO */}
        <View style={styles.nomeContainer}>
          <Text 
            style={[
              styles.name,
              posicao <= 3 && styles.nameTopTres
            ]}
          >
            {item.nome}
          </Text>
          <Text style={styles.emailSmall}>
            {item.email}
          </Text>
        </View>

        {/* PONTOS COM ÍCONE */}
        <View style={styles.pontosContainer}>
          <Ionicons 
            name="star" 
            size={14} 
            color={posicao <= 3 ? corPosicao : '#0F6B32'} 
            style={{ marginRight: 4 }}
          />
          <Text 
            style={[
              styles.points,
              { color: corPosicao, fontWeight: posicao <= 3 ? '900' : '700' }
            ]}
          >
            {item.pontos}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* BANNER */}
      <View style={styles.banner}>
        <Ionicons name="trophy" size={32} color="#FFD700" style={{ marginRight: 8 }} />
        <Text style={styles.bannerText}>
          Top 10 Pontuadores
        </Text>
      </View>

      {/* LISTA DE RANKING */}
      {carregando ? (
        <View style={styles.carregandoContainer}>
          <Ionicons name="hourglass-outline" size={48} color="#0F6B32" />
          <Text style={styles.carregandoText}>Carregando ranking...</Text>
        </View>
      ) : listaRanking.length > 0 ? (
        <FlatList
          data={listaRanking}
          keyExtractor={(item) => item.id}
          renderItem={renderItemRanking}
          scrollEnabled={true}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={true}
        />
      ) : (
        <View style={styles.vazioContainer}>
          <Ionicons name="file-tray-outline" size={48} color="#CCC" />
          <Text style={styles.vazioText}>Nenhum dado de ranking disponível</Text>
          <Text style={styles.vazioSubtext}>Registre suas apostas para aparecer no ranking!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  banner: {
    backgroundColor: '#0F6B32',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  bannerText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  rowTopTres: {
    backgroundColor: '#FFFEF7',
    borderLeftWidth: 4,
  },
  posicaoContainer: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  position: {
    fontSize: 20,
    textAlign: 'center',
    minWidth: 30,
  },
  nomeContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  nameTopTres: {
    fontSize: 15,
    fontWeight: '700',
  },
  emailSmall: {
    fontSize: 11,
    color: '#999',
    fontWeight: '400',
  },
  pontosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  points: {
    fontWeight: '700',
    fontSize: 14,
    color: '#0F6B32',
  },
  carregandoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  carregandoText: {
    fontSize: 16,
    color: '#0F6B32',
    fontWeight: '600',
  },
  vazioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  vazioText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  vazioSubtext: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
});
