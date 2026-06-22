import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  FlatList,
  Switch,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/contexts/AuthContext';
import { apiSports } from '@/services/apiSports';
import {
  carregarJogosDisponiveis,
  marcarJogoAberto,
  marcarJogoFechado,
  processarFimDeRodada,
  obterApostasDoFixture,
  obterJogosDisponiveis,
  Jogo,
} from '@/app/Store';

const JANELA_ANTECEDENCIA_HORAS = 48; // Garante o dia de hoje, amanhã e depois
const JANELA_ANTECEDENCIA_MS = JANELA_ANTECEDENCIA_HORAS * 60 * 60 * 1000;

const TEMPO_TOTAL_JOGO_MINUTOS = 150; // 120min de bola rolando + 30min de retenção na tela
const TEMPO_TOTAL_JOGO_MS = TEMPO_TOTAL_JOGO_MINUTOS * 60 * 1000;

const filtrarJogosComInteligencia = (fixtures: any[]): any[] => {
  const agora = Date.now();

  return fixtures.filter(fixture => {
    // Força a leitura direta da string para evitar falhas de NaN
    const dataOriginalDoJogo = new Date(fixture.dataJogo).getTime();

    // Se a data for inválida, remove o jogo
    if (isNaN(dataOriginalDoJogo)) return false;

    const tempoDesdeInicio = agora - dataOriginalDoJogo;
    const tempoAteInicio = dataOriginalDoJogo - agora;

    // Regra 1: AO VIVO - Sempre exibe
    if (fixture.status === 'STATUS_IN_PROGRESS') {
      return true;
    }

    // Regra 2: FINALIZADO - Exibe apenas se não passou de 150 minutos desde o apito inicial
    if (fixture.status === 'STATUS_FINAL') {
      return tempoDesdeInicio <= TEMPO_TOTAL_JOGO_MS;
    }

    // Regra 3: AGENDADO - Exibe se for acontecer nas próximas 48 horas.
    // O "-3600000" (1 hora negativa) impede que o jogo suma se a ESPN atrasar para mudar o status para AO VIVO.
    if (fixture.status === 'STATUS_SCHEDULED') {
      return tempoAteInicio >= -3600000 && tempoAteInicio <= JANELA_ANTECEDENCIA_MS;
    }

    return false;
  });
};

export default function GerenciarRodadaScreen() {
  const { userEmail, isAdmin } = useAuth();
  const insets = useSafeAreaInsets();
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({});
  const [aguardandoProximos, setAguardandoProximos] = useState(false);

  // Timer para refresh de placares ao vivo a cada 30 seg
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (jogos.some(j => j.status === 'STATUS_IN_PROGRESS')) {
      interval = setInterval(() => {
        console.log('🔄 Atualizando placares ao vivo...');
        carregarJogosDoServer();
      }, 30000); // 30 segundos
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [jogos]);

  useFocusEffect(
    useCallback(() => {
      if (isAdmin) {
        carregarJogosDoServer();
      }
    }, [isAdmin])
  );

  const carregarJogosDoServer = async () => {
    try {
      setLoading(true);
      setAguardandoProximos(false);

      // Buscar todos os jogos (sem filtro de tempo no serviço)
      const todosOsJogos = await apiSports.buscarTodosJogosComStatus();
      
      if (!todosOsJogos || todosOsJogos.length === 0) {
        console.log('⏳ Nenhum jogo encontrado');
        setAguardandoProximos(true);
        setJogos([]);
        return;
      }

      // Aplicar inteligência de exibição
      const jogosFiltrados = filtrarJogosComInteligencia(todosOsJogos);

      if (jogosFiltrados.length === 0) {
        console.log('⏳ Nenhum jogo na janela de exibição');
        setAguardandoProximos(true);
        setJogos([]);
        return;
      }

      // Obter estado anterior dos jogos da Store
      const jogosAntigosStore = obterJogosDisponiveis();

      const jogosFormatados: Jogo[] = jogosFiltrados.map(j => {
        // CORREÇÃO 3: Verificar persistência com comparação segura de string
        const jogoAntigo = jogosAntigosStore.find(
          a => String(a.fixtureId) === String(j.fixtureId)
        );
        const isAberto = jogoAntigo ? jogoAntigo.aberto : false;

        return {
          fixtureId: j.fixtureId,
          timeCasa: j.timeCasa,
          timeVisitante: j.timeVisitante,
          dataJogo: j.dataJogo,
          status: j.status,
          aberto: isAberto, // Usa estado anterior com segurança
          golsCasa: j.golsCasa, // CORREÇÃO 1: Adiciona placar ao Jogo
          golsVisitante: j.golsVisitante, // CORREÇÃO 1: Adiciona placar ao Jogo
        };
      });

      carregarJogosDisponiveis(jogosFormatados);
      setJogos(jogosFormatados);

      // Inicializar toggles com estado anterior
      const togglesIniciais: Record<string, boolean> = {};
      jogosFormatados.forEach(jogo => {
        togglesIniciais[jogo.fixtureId] = jogo.aberto;
      });
      setToggleStates(togglesIniciais);

      console.log(`✅ ${jogosFormatados.length} jogos carregados (${todosOsJogos.length} totais na ESPN)`);
    } catch (error) {
      console.error('❌ Erro ao carregar jogos:', error);
      Alert.alert('Aviso', 'Erro ao carregar os jogos. Verifique sua conexão com a Internet.');
    } finally {
      setLoading(false);
    }
  };

  const alternarJogo = (fixtureId: string, novoEstado: boolean) => {
    if (novoEstado) {
      marcarJogoAberto(fixtureId);
    } else {
      marcarJogoFechado(fixtureId);
    }

    setToggleStates(prev => ({
      ...prev,
      [fixtureId]: novoEstado,
    }));

    const acao = novoEstado ? 'aberto' : 'fechado';
    console.log(`✅ Jogo ${fixtureId} ${acao} para apostas`);
  };

  const processarEncerramento = async () => {
    if (userEmail !== 'adminpalpite10@gmail.com') {
      Alert.alert('Permissão negada', 'Apenas o admin principal pode encerrar a rodada.');
      return;
    }

    try {
      setProcessando(true);

      // Buscar placares finalizados da ESPN
      const placares = await apiSports.buscarPlacaresFinalizado();

      if (placares.length === 0) {
        Alert.alert('Aviso', 'Nenhum jogo finalizado encontrado no momento.');
        setProcessando(false);
        return;
      }

      // Processar fim de rodada com dados da ESPN
      const vencedores = await processarFimDeRodada(
        placares.map((p: any) => ({
          fixtureId: p.fixtureId,
          golsCasa: p.golsCasa,
          golsVisitante: p.golsVisitante,
        }))
      );

      Alert.alert(
        'Rodada Encerrada!',
        `${placares.length} jogo(s) processado(s)\n${vencedores} vencedor(es) encontrado(s)`
      );

      // Recarregar jogos
      await carregarJogosDoServer();
    } catch (error) {
      console.error('❌ Erro ao processar encerramento:', error);
      Alert.alert('Aviso', 'Erro ao encerrar a rodada. Verifique sua conexão com a Internet.');
    } finally {
      setProcessando(false);
    }
  };

  if (!isAdmin) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.deniedContainer}>
          <Ionicons name="lock-closed" size={80} color="#DC3545" />
          <Text style={styles.deniedTitle}>Acesso Negado</Text>
          <Text style={styles.deniedText}>Apenas admins podem gerenciar rodadas.</Text>
        </View>
      </View>
    );
  }

  const renderJogoCard = ({ item }: { item: Jogo }) => {
    // Indicador visual do status
    const getStatusIcon = () => {
      if (item.status === 'STATUS_IN_PROGRESS') return '📺';
      if (item.status === 'STATUS_FINAL') return '✅';
      return '📅';
    };

    const getStatusColor = () => {
      if (item.status === 'STATUS_IN_PROGRESS') return '#FF6B6B';
      if (item.status === 'STATUS_FINAL') return '#95DE64';
      return '#4ECDC4';
    };

    // CORREÇÃO 1: Renderização condicional VS vs Placar
    const renderPlacarOuVS = () => {
      if (item.status === 'STATUS_IN_PROGRESS' || item.status === 'STATUS_FINAL') {
        return (
          <View style={styles.placarContainer}>
            <Text style={styles.placarTexto}>{item.golsCasa ?? 0}</Text>
            <Text style={styles.placarSeparador}>-</Text>
            <Text style={styles.placarTexto}>{item.golsVisitante ?? 0}</Text>
          </View>
        );
      }
      return <Text style={styles.vs}>VS</Text>;
    };

    // Exibir horário para jogos agendados
    const exibirHorario = () => {
      if (item.status === 'STATUS_SCHEDULED') {
        const horario = new Date(item.dataJogo).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });
        return <Text style={styles.horarioJogo}>{horario}</Text>;
      }
      return null;
    };

    return (
      <View style={[styles.jogoCard, { borderLeftColor: getStatusColor(), borderLeftWidth: 4 }]}>
        <View style={styles.jogoHeader}>
          <View>
            <Text style={styles.dataJogo}>{new Date(item.dataJogo).toLocaleDateString('pt-BR')}</Text>
            <Text style={[styles.statusBadge, { color: getStatusColor() }]}>
              {getStatusIcon()} {item.status === 'STATUS_IN_PROGRESS' ? 'AO VIVO' : item.status === 'STATUS_FINAL' ? 'FINALIZADO' : 'AGENDADO'}
            </Text>
          </View>
          <Text style={[styles.statusBadge, { color: item.aberto ? '#0F6B32' : '#999' }]}>
            {item.aberto ? '🟢 Aberto' : '⚪ Fechado'}
          </Text>
        </View>

        <View style={styles.teamsContainer}>
          <View style={styles.team}>
            <Image source={{ uri: item.timeCasa.logo }} style={styles.logo} />
            <Text style={styles.teamName}>{item.timeCasa.nome}</Text>
          </View>

          {renderPlacarOuVS()}

          <View style={styles.team}>
            <Image source={{ uri: item.timeVisitante.logo }} style={styles.logo} />
            <Text style={styles.teamName}>{item.timeVisitante.nome}</Text>
          </View>
        </View>

        {exibirHorario()}

        {item.status !== 'STATUS_FINAL' && (
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>
              {toggleStates[item.fixtureId] ? 'Apostas Abertas' : 'Apostas Fechadas'}
            </Text>
            <Switch
              value={toggleStates[item.fixtureId] || false}
              onValueChange={(novoEstado) => alternarJogo(item.fixtureId, novoEstado)}
              trackColor={{ false: '#ddd', true: '#81C784' }}
              thumbColor={toggleStates[item.fixtureId] ? '#0F6B32' : '#999'}
            />
          </View>
        )}

        <View style={styles.apostasInfo}>
          <Ionicons name="people" size={16} color="#666" />
          <Text style={styles.apostasText}>
            {obterApostasDoFixture(item.fixtureId).length} aposta(s)
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="layers" size={32} color="#0F6B32" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Gerenciar Rodada Copa 2026</Text>
            <Text style={styles.headerSubtitle}>Inteligência de exibição em tempo real</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#0F6B32" />
            <Text style={styles.loaderText}>Sincronizando com ESPN...</Text>
          </View>
        ) : aguardandoProximos ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="hourglass" size={64} color="#FF9800" />
            <Text style={styles.emptyStateTitle}>Transição de Fase</Text>
            <Text style={styles.emptyStateText}>
              Aguardando a definição oficial dos próximos confrontos da FIFA.
            </Text>
            <Text style={styles.emptyStateSubtext}>Atualize em instantes</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={carregarJogosDoServer}
            >
              <Ionicons name="refresh" size={18} color="#FFF" />
              <Text style={styles.refreshButtonText}>Atualizar Agora</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {jogos.length > 0 ? (
              <FlatList
                data={jogos}
                renderItem={renderJogoCard}
                keyExtractor={(item) => String(item.fixtureId)}
                scrollEnabled={false}
                contentContainerStyle={styles.jogosList}
                ListHeaderComponent={() => (
                  <View style={styles.filaHeader}>
                    <Ionicons name="list" size={20} color="#0F6B32" />
                    <Text style={styles.filaHeaderText}>Gerenciamento ({jogos.length})</Text>
                  </View>
                )}
              />
            ) : (
              <Text style={styles.noGamesText}>Nenhum jogo na janela de exibição</Text>
            )}

            <TouchableOpacity
              style={[styles.encerrarButton, processando && styles.encerrarButtonDisabled]}
              onPress={processarEncerramento}
              disabled={processando}
            >
              {processando ? (
                <>
                  <ActivityIndicator size="small" color="#FFF" />
                  <Text style={styles.encerrarButtonText}>Processando...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                  <Text style={styles.encerrarButtonText}>Encerrar Rodada e Processar</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  content: {
    padding: 16,
    paddingBottom: 30,
  },

  header: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0F6B32',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F6B32',
  },

  headerSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },

  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  loaderText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },

  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },

  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FF9800',
    marginTop: 16,
    marginBottom: 8,
  },

  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 4,
  },

  emptyStateSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  refreshButton: {
    marginTop: 20,
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  refreshButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },

  filaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  filaHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F6B32',
    marginLeft: 8,
  },

  jogosList: {
    gap: 12,
    marginBottom: 20,
  },

  jogoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },

  jogoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  dataJogo: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },

  statusBadge: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },

  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
  },

  team: {
    alignItems: 'center',
    flex: 1,
  },

  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },

  teamName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },

  vs: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F6B32',
    marginHorizontal: 12,
  },

  placarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 12,
  },

  placarTexto: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F6B32',
  },

  placarSeparador: {
    fontSize: 18,
    fontWeight: '800',
    color: '#999',
  },

  horarioJogo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F6B32',
    textAlign: 'center',
    marginBottom: 12,
  },

  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },

  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  apostasInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },

  apostasText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  encerrarButton: {
    backgroundColor: '#0F6B32',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  encerrarButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },

  encerrarButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },

  noGamesText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 40,
  },

  deniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  deniedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#DC3545',
    marginTop: 20,
    marginBottom: 10,
  },

  deniedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
