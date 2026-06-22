import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { 
  obterHistoricoUsuario,
  obterUltimoRegistroUsuario,
  obterApostaAtual,
  contarVitoriasUsuario,
  calcularPontosUsuario,
  RegistroHistorico,
  Aposta
} from '@/app/Store';

export default function ProfileScreen() {
  const { userEmail } = useAuth();
  const [nomeExibicao, setNomeExibicao] = useState('');
  const [vitórias, setVitórias] = useState(0);
  const [pontos, setPontos] = useState(0);
  const [ultimoRegistro, setUltimoRegistro] = useState<RegistroHistorico | null>(null);
  const [apostaAtual, setApostaAtual] = useState<Aposta | null>(null);

  // Buscar dados do usuário quando a tela entra em foco
  useFocusEffect(
    useCallback(() => {
      if (userEmail) {
        // Formatar nome para exibição
        const parteAntesDoAt = userEmail.split('@')[0];
        const nomeTratado = parteAntesDoAt
          .split('.')
          .map(pala => pala.charAt(0).toUpperCase() + pala.slice(1))
          .join('.');
        setNomeExibicao(nomeTratado);

        // Obter aposta atual (mostrada no card "Aguardando Resultado")
        const aposta = obterApostaAtual(userEmail);
        setApostaAtual(aposta);

        // Obter histórico e estatísticas
        const totalVitorias = contarVitoriasUsuario(userEmail);
        const totalPontos = calcularPontosUsuario(userEmail);
        const ultimo = obterUltimoRegistroUsuario(userEmail);

        setVitórias(totalVitorias);
        setPontos(totalPontos);
        setUltimoRegistro(ultimo);

        console.log('✅ Dados do perfil atualizados:', { 
          userEmail, 
          nomeTratado, 
          apostaAtual: aposta,
          totalVitorias,
          totalPontos,
          ultimoResultado: ultimo?.resultado 
        });
      }
    }, [userEmail])
  );

  // Extrair iniciais do nome para avatar
  const extrairIniciais = (nome: string) => {
    const partes = nome.split('.');
    return partes.map(p => p.charAt(0).toUpperCase()).join('').substring(0, 2);
  };

  const iniciais = nomeExibicao ? extrairIniciais(nomeExibicao) : 'XX';
  // Contar: aposta atual (se existe) + histórico de apostas finalizadas
  const palpitesRealizados = (apostaAtual ? 1 : 0) + obterHistoricoUsuario(userEmail || '').length;

  // Determinar estilo do card de resultado
  const getCardStyle = () => {
    // Se tem aposta atual, mostrar "Aguardando Resultado"
    if (apostaAtual && !ultimoRegistro) {
      return { 
        backgroundColor: '#F0F0F0',
        borderLeftColor: '#999',
        statusText: '⏳ Aguardando resultado',
        statusColor: '#666',
        showBet: true,
        bet: apostaAtual
      };
    }

    // Se não tem aposta atual mas tem histórico
    if (!apostaAtual && ultimoRegistro) {
      if (ultimoRegistro.resultado === 'vitoria') {
        return {
          backgroundColor: '#D4EDDA',
          borderLeftColor: '#0F6B32',
          statusText: '✅ Vitória no Resultado',
          statusColor: '#0F6B32',
          showBet: true,
          bet: ultimoRegistro
        };
      }
      
      return {
        backgroundColor: '#F8D7DA',
        borderLeftColor: '#DC3545',
        statusText: '❌ Derrota do Resultado',
        statusColor: '#DC3545',
        showBet: true,
        bet: ultimoRegistro
      };
    }

    // Se tem aposta atual E histórico (rodada atual com histórico anterior)
    if (apostaAtual && ultimoRegistro) {
      if (ultimoRegistro.resultado === 'vitoria') {
        return {
          backgroundColor: '#D4EDDA',
          borderLeftColor: '#0F6B32',
          statusText: '✅ Vitória no Resultado',
          statusColor: '#0F6B32',
          showBet: true,
          bet: ultimoRegistro
        };
      }
      
      return {
        backgroundColor: '#F8D7DA',
        borderLeftColor: '#DC3545',
        statusText: '❌ Derrota do Resultado',
        statusColor: '#DC3545',
        showBet: true,
        bet: ultimoRegistro
      };
    }

    // Sem aposta e sem histórico
    return { 
      backgroundColor: '#E8E8E8',
      borderLeftColor: '#999',
      statusText: '⏳ Aguardando resultado',
      statusColor: '#666',
      showBet: false
    };
  };

  const cardStyle = getCardStyle();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {iniciais}
          </Text>
        </View>

        <Text style={styles.name}>
          {nomeExibicao}
        </Text>

        <Text style={styles.email}>
          {userEmail}
        </Text>

        {/* CARD DE ESTATÍSTICAS */}
        <View style={styles.card}>
          <View style={styles.itemContainer}>
            <Text style={styles.itemLabel}>Palpites realizados</Text>
            <Text style={styles.itemValue}>{palpitesRealizados}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.itemContainer}>
            <Text style={styles.itemLabel}>Vitórias</Text>
            <Text style={styles.itemValue}>{vitórias}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.itemContainer}>
            <Text style={styles.itemLabel}>Pontuação total</Text>
            <Text style={styles.itemValue}>{pontos}</Text>
          </View>
        </View>

        {/* CARD DE RESULTADO */}
        <View 
          style={[
            styles.resultCard,
            { backgroundColor: cardStyle.backgroundColor }
          ]}
        >
          <View style={[styles.resultLeftBorder, { borderLeftColor: cardStyle.borderLeftColor }]} />
          
          <View style={styles.resultContent}>
            <Text style={[styles.resultStatus, { color: cardStyle.statusColor }]}>
              {cardStyle.statusText}
            </Text>

            {cardStyle.showBet && cardStyle.bet && (
              <>
                <View style={styles.resultBetContainer}>
                  <View style={styles.resultBetTeam}>
                    <Text style={styles.resultBetTeamName}>Brasil</Text>
                    <Text style={styles.resultBetScore}>
                      {('golsCasa' in cardStyle.bet) ? cardStyle.bet.golsCasa : cardStyle.bet.palpiteBrasil}
                    </Text>
                  </View>
                  <Text style={styles.resultBetX}>X</Text>
                  <View style={styles.resultBetTeam}>
                    <Text style={styles.resultBetTeamName}>Escócia</Text>
                    <Text style={styles.resultBetScore}>
                      {('golsVisitante' in cardStyle.bet) ? cardStyle.bet.golsVisitante : cardStyle.bet.palpiteEscocia}
                    </Text>
                  </View>
                </View>

                {ultimoRegistro && ultimoRegistro.resultado === 'vitoria' && (
                  <Text style={styles.pointsEarned}>
                    +{ultimoRegistro.pontosGanhos} pontos ganhos
                  </Text>
                )}
              </>
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0F6B32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#222',
  },
  email: {
    color: '#777',
    fontSize: 14,
    marginBottom: 30,
  },
  card: {
    width: '90%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  itemValue: {
    fontSize: 18,
    color: '#0F6B32',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
    width: '100%',
  },
  resultCard: {
    width: '90%',
    borderRadius: 15,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  resultLeftBorder: {
    width: 4,
  },
  resultContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  resultStatus: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  resultBetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultBetTeam: {
    alignItems: 'center',
  },
  resultBetTeamName: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    marginBottom: 3,
  },
  resultBetScore: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F6B32',
  },
  resultBetX: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  pointsEarned: {
    fontSize: 12,
    color: '#0F6B32',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
});