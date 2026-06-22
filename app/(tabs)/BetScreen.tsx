import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Alert,
  Linking,
  FlatList,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  obterJogosAbertosFormatados, 
  adicionarApostaMultiplo,
  adicionarNotificacao,
  obterApostaAtual,
  Jogo,
} from '@/app/Store';

export default function BetScreen() {
  const { userEmail } = useAuth();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const fixtureId = params.fixtureId ? String(params.fixtureId) : null;

  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [jogoSelecionado, setJogoSelecionado] = useState<Jogo | null>(null);
  const [brasil, setBrasil] = useState(0);
  const [escocia, setEscocia] = useState(0);
  const [showQRCode, setShowQRCode] = useState(false);
  const [palpiteConfirmado, setPalpiteConfirmado] = useState(false);
  const [loading, setLoading] = useState(false);

  const qrCodeImage = require('./727718782_1723399332028610_4972966599462564276_n.jpg');
  const chavePix = "00020126580014br.gov.bcb.pix0136af424c4a-a90d-4ce7-97fe-538a230ecb7c520400005303986540510.005802BR5925DOUGLAS GABRIEL ESTEVO DO60085500019962070503***63049162";

  useFocusEffect(
    useCallback(() => {
      carregarJogosAbertos();
    }, [])
  );

  const carregarJogosAbertos = async () => {
    try {
      setLoading(true);
      const jogosAbertos = obterJogosAbertosFormatados();
      setJogos(jogosAbertos);

      if (fixtureId) {
        const jogo = jogosAbertos.find(j => j.fixtureId === fixtureId);
        if (jogo) {
          setJogoSelecionado(jogo);
        }
      } else if (jogosAbertos.length > 0) {
        setJogoSelecionado(jogosAbertos[0]);
      }

      // Verificar se já tem aposta do usuário
      if (userEmail) {
        const apostaExistente = obterApostaAtual(userEmail);
        setPalpiteConfirmado(!!apostaExistente);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar jogos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os jogos');
    } finally {
      setLoading(false);
    }
  };

  const copiarChavePix = async () => {
    try {
      await Clipboard.setStringAsync(chavePix);
      Alert.alert("Sucesso!", "Chave Pix copiada para a área de transferência.");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível copiar a chave Pix.");
    }
  };

  const handleConfirmarPagamentoReal = async () => {
    if (!userEmail || !jogoSelecionado) {
      Alert.alert("Erro", "Dados inválidos.");
      return;
    }

    try {
      const sucesso = adicionarApostaMultiplo(userEmail, jogoSelecionado.fixtureId, brasil, escocia);

      if (!sucesso) {
        Alert.alert("Erro", "Não foi possível registrar a aposta. Verifique se o jogo ainda está aberto.");
        return;
      }

      setPalpiteConfirmado(true);
      Alert.alert("Sucesso!", "Palpite registrado! Agora é com o WhatsApp.");
      
      adicionarNotificacao(
        "Aposta Confirmada!",
        `Seu palpite de R$ 10,00 foi registrado.\n${jogoSelecionado.timeCasa.nome} ${brasil} x ${escocia} ${jogoSelecionado.timeVisitante.nome}`,
        "sucesso"
      );
      
      const numeroWhatsApp = "5511989336439";
      const mensagem = `Fala, Douglas! Acabei de fazer o Pix de R$ 10,00 para o Bolão.\n\nMeu palpite foi: ${jogoSelecionado.timeCasa.nome} ${brasil} x ${escocia} ${jogoSelecionado.timeVisitante.nome}.\n\nSegue o comprovante:`;
      
      Linking.openURL(`whatsapp://send?phone=${numeroWhatsApp}&text=${encodeURIComponent(mensagem)}`);
      setShowQRCode(false);
    } catch (error) {
      console.error('❌ Erro ao confirmar pagamento:', error);
      Alert.alert('Erro', 'Erro ao processar aposta');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')}>
          <Ionicons name="arrow-back" size={26} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fazer meu palpite</Text>
        <TouchableOpacity style={styles.helpButton} onPress={() => router.push('/regras')}>
          <Ionicons name="help" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0FA946" />
          <Text style={styles.loaderText}>Carregando jogos disponíveis...</Text>
        </View>
      ) : jogos.length === 0 ? (
        <View style={styles.noGamesContainer}>
          <Ionicons name="lock-closed" size={60} color="#999" />
          <Text style={styles.noGamesText}>Nenhum jogo aberto para apostas no momento</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* SELETOR DE JOGOS */}
          {jogos.length > 1 && (
            <FlatList
              data={jogos}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.jogoTab, jogoSelecionado?.fixtureId === item.fixtureId && styles.jogoTabActive]}
                  onPress={() => {
                    setJogoSelecionado(item);
                    setBrasil(0);
                    setEscocia(0);
                  }}
                >
                  <Text style={[styles.jogoTabText, jogoSelecionado?.fixtureId === item.fixtureId && styles.jogoTabTextActive]}>
                    {item.timeCasa.nome.split(' ')[0]} vs {item.timeVisitante.nome.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => String(item.fixtureId)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.jogoTabsList}
            />
          )}

          {jogoSelecionado && (
            <>
              {/* CARD JOGO */}
              <View style={styles.gameCard}>
                <View style={styles.teamsRow}>
                  <View style={styles.team}>
                    <Image source={{ uri: jogoSelecionado.timeCasa.logo }} style={styles.flag} />
                    <Text style={styles.teamName}>{jogoSelecionado.timeCasa.nome}</Text>
                  </View>
                  <Text style={styles.x}>X</Text>
                  <View style={styles.team}>
                    <Image source={{ uri: jogoSelecionado.timeVisitante.logo }} style={styles.flag} />
                    <Text style={styles.teamName}>{jogoSelecionado.timeVisitante.nome}</Text>
                  </View>
                </View>
                <Text style={styles.date}>
                  {new Date(jogoSelecionado.dataJogo).toLocaleString('pt-BR')}
                </Text>
              </View>

              {/* CARD PALPITE */}
              <View style={styles.betCard}>
                <View style={styles.titleRow}>
                  <Text style={styles.betTitle}>Palpite de placar exato</Text>
                  <Ionicons name="information-circle-outline" size={18} color="#777" />
                </View>

                <View style={styles.scoreSection}>
                  {/* CASA */}
                  <View style={styles.scoreTeam}>
                    <Text style={styles.scoreLabel}>{jogoSelecionado.timeCasa.nome.toUpperCase()}</Text>
                    <View style={styles.selectorBox}>
                      <TouchableOpacity onPress={() => setBrasil(brasil + 1)}>
                        <Ionicons name="chevron-up" size={28} color="#222" />
                      </TouchableOpacity>
                      <Text style={styles.score}>{brasil}</Text>
                      <TouchableOpacity onPress={() => brasil > 0 && setBrasil(brasil - 1)}>
                        <Ionicons name="chevron-down" size={28} color="#222" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.middleX}>X</Text>

                  {/* VISITANTE */}
                  <View style={styles.scoreTeam}>
                    <Text style={styles.scoreLabel}>{jogoSelecionado.timeVisitante.nome.toUpperCase()}</Text>
                    <View style={styles.selectorBox}>
                      <TouchableOpacity onPress={() => setEscocia(escocia + 1)}>
                        <Ionicons name="chevron-up" size={28} color="#222" />
                      </TouchableOpacity>
                      <Text style={styles.score}>{escocia}</Text>
                      <TouchableOpacity onPress={() => escocia > 0 && setEscocia(escocia - 1)}>
                        <Ionicons name="chevron-down" size={28} color="#222" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* CARD INFORMATIVO */}
                <View style={styles.infoCard}>
                  <View style={styles.infoIcon}>
                    <Ionicons name="checkmark-circle-outline" size={28} color="#001A4D" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoTitle}>Acerta o placar e leva o bolão!</Text>
                    <Text style={styles.infoDescription}>Bateu o placar exato? O prêmio é todo seu.</Text>
                  </View>
                </View>

                {/* BOTÃO CONFIRMAR */}
                <TouchableOpacity 
                  style={[
                    styles.confirmButton,
                    palpiteConfirmado && styles.confirmButtonDisabled
                  ]}
                  onPress={() => !palpiteConfirmado && setShowQRCode(true)}
                  disabled={palpiteConfirmado}
                >
                  <Text style={styles.confirmButtonText}>
                    {palpiteConfirmado ? 'Palpite Finalizado' : 'Confirmar palpite'}
                  </Text>
                  <View style={[
                    styles.confirmIcon,
                    palpiteConfirmado && styles.confirmIconDisabled
                  ]}>
                    <Ionicons
                      name={palpiteConfirmado ? "checkmark-done" : "checkmark"}
                      size={18}
                      color={palpiteConfirmado ? "#999" : "#0F6B32"}
                    />
                  </View>
                </TouchableOpacity>

                <Text style={styles.betFooter}>🔒 Aposta fixa: 10 BRL por pessoa</Text>
              </View>
            </>
          )}
        </ScrollView>
      )}

      {/* MODAL QR CODE PIX */}
      <Modal
        visible={showQRCode}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQRCode(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowQRCode(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Escaneie o QR Code</Text>
            <Text style={styles.modalSubtitle}>Valor fixo: R$ 10,00</Text>

            <Image source={qrCodeImage} style={styles.qrCode} />

            <Text style={styles.copyLabel}>Ou use o Pix Copia e Cola:</Text>
            
            <View style={styles.copyContainer}>
              <Text 
                style={styles.pixKey}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {chavePix}
              </Text>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={() => {
                  Clipboard.setStringAsync(chavePix);
                  Alert.alert("Sucesso!", "Chave Pix copiada!");
                }}
              >
                <Ionicons name="copy-outline" size={20} color="#0FB132" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.paymentButton}
              onPress={handleConfirmarPagamentoReal}
            >
              <Text style={styles.paymentButtonText}>Já fiz o pagamento</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowQRCode(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar aposta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  header: {
    backgroundColor: '#0F6B32',
    height: 90,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },

  helpButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loaderText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },

  noGamesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  noGamesText: {
    marginTop: 12,
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },

  jogoTabsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },

  jogoTab: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },

  jogoTabActive: {
    backgroundColor: '#0FA946',
    borderColor: '#0FA946',
  },

  jogoTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },

  jogoTabTextActive: {
    color: '#FFF',
  },

  gameCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginTop: 8,
  },

  teamsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  team: {
    alignItems: 'center',
  },

  flag: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },

  teamName: {
    marginTop: 8,
    fontWeight: '700',
    color: '#333',
    fontSize: 13,
  },

  x: {
    fontSize: 26,
    fontWeight: '800',
    color: '#222',
  },

  date: {
    textAlign: 'center',
    marginTop: 18,
    color: '#888',
    fontSize: 14,
  },

  betCard: {
    backgroundColor: '#FFF',
    marginTop: 10,
    padding: 20,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },

  betTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginRight: 6,
  },

  scoreSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  scoreTeam: {
    alignItems: 'center',
  },

  scoreLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F6B32',
    marginBottom: 12,
  },

  selectorBox: {
    width: 90,
    height: 150,
    backgroundColor: '#FFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 4,
  },

  score: {
    fontSize: 44,
    fontWeight: '800',
    color: '#222',
  },

  middleX: {
    fontSize: 34,
    fontWeight: '900',
    color: '#333',
    marginTop: 25,
  },

  infoCard: {
    marginTop: 30,
    backgroundColor: '#E6EFF9',
    borderWidth: 2,
    borderColor: '#D0E0F0',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    marginRight: 14,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#001A4D',
    marginBottom: 2,
  },

  infoDescription: {
    fontSize: 13,
    color: '#6B7C99',
    fontWeight: '500',
  },

  confirmButton: {
    marginTop: 16,
    backgroundColor: '#0FB132',
    height: 62,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 6,
  },

  confirmButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },

  confirmButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  confirmIcon: {
    position: 'absolute',
    right: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 3,
  },

  confirmIconDisabled: {
    backgroundColor: '#E8E8E8',
    shadowOpacity: 0,
    elevation: 0,
  },

  betFooter: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 13,
    color: '#9DA3B0',
    fontWeight: '500',
  },

  /* MODAL STYLES */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '85%',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 10,
  },

  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    marginTop: 10,
    marginBottom: 8,
  },

  modalSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },

  qrCode: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 24,
  },

  paymentButton: {
    backgroundColor: '#0FB132',
    height: 50,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 4,
  },

  paymentButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },

  cancelButton: {
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#0FB132',
    fontSize: 16,
    fontWeight: '600',
  },

  copyLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
    fontWeight: '600',
  },

  copyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 24,
    width: '100%',
  },

  pixKey: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    marginRight: 8,
  },

  copyButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

});
