import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { removerParticipante, definirPlacorOficial, liquidarJogo, dadosGlobais, adicionarNotificacao, tornarAdmin } from '@/app/Store';

export default function AdminPanel() {
  const { logout, userEmail, isAdmin } = useAuth();
  const insets = useSafeAreaInsets();
  const [usuariosAuditoria, setUsuariosAuditoria] = useState<any[]>([]);
  const [golsBrasil, setGolsBrasil] = useState(0);
  const [golsEscocia, setGolsEscocia] = useState(0);

  // Carregar usuários da Store quando a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      carregarUsuariosAuditoria();
    }, [])
  );

  const carregarUsuariosAuditoria = () => {
    try {
      const usuariosFormatados = dadosGlobais.usuariosCadastrados.map((usuario) => ({
        id: usuario.email, // Usar email como ID único
        email: usuario.email,
        cpf: usuario.cpf,
        senha: usuario.senha,
        isAdmin: usuario.isAdmin
      }));
      setUsuariosAuditoria(usuariosFormatados);
      console.log('✅ Usuários carregados:', usuariosFormatados.length);
    } catch (e) {
      console.error('❌ Erro ao carregar usuários:', e);
      Alert.alert('Erro', 'Erro ao carregar usuários');
    }
  };

  // Proteção: só renderiza se for admin
  if (!isAdmin) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.deniedContainer}>
          <Ionicons name="lock-closed" size={80} color="#DC3545" />
          <Text style={styles.deniedTitle}>Acesso Negado</Text>
          <Text style={styles.deniedText}>Você não tem permissão para acessar o Painel Administrativo.</Text>
        </View>
      </View>
    );
  }

  const encerrarJogoEDistribuirPontos = () => {
    // Validar se apenas adminpalpite10@gmail.com pode fazer isso
    if (userEmail !== 'adminpalpite10@gmail.com') {
      Alert.alert('Permissão negada', 'Apenas o admin principal pode encerrar o jogo.');
      return;
    }

    Alert.alert(
      'Confirmar',
      `Encerrar jogo com placar Brasil ${golsBrasil} x ${golsEscocia} Escócia?\n\nEsta ação não pode ser desfeita.`,
      [
        {
          text: 'Cancelar',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Sim, Encerrar Jogo',
          onPress: () => {
            try {
              // Definir placar oficial
              definirPlacorOficial(golsBrasil, golsEscocia);
              
              // Liquidar jogo e distribuir pontos
              const vencedoresCount = liquidarJogo();
              
              // Adicionar notificação de resultado
              if (vencedoresCount > 0) {
                adicionarNotificacao(
                  "Vitória!",
                  `Parabéns! Seu palpite foi correto. Você ganhou 50 pontos!`,
                  "resultado"
                );
              } else {
                adicionarNotificacao(
                  "Derrota",
                  `O placar foi ${golsBrasil}x${golsEscocia}. Seu palpite não foi dessa vez.`,
                  "resultado"
                );
              }
              
              console.log(`✅ Jogo encerrado com ${vencedoresCount} vencedor(es)`);
              Alert.alert(
                'Sucesso!',
                `Jogo encerrado!\n\n${vencedoresCount} vencedor(es) encontrado(s).\nCada um recebeu +50 pontos.`
              );
              setGolsBrasil(0);
              setGolsEscocia(0);
            } catch (e) {
              console.error('❌ Erro ao encerrar jogo:', e);
              Alert.alert('Erro', 'Erro ao encerrar jogo e distribuir pontos');
            }
          },
        },
      ]
    );
  };

  const removerParticipanteDoPalpite = (email: string, userName: string) => {
    if (userEmail !== 'adminpalpite10@gmail.com') {
      Alert.alert('Permissão negada', 'Apenas o admin principal pode remover participantes do palpite.');
      return;
    }

    Alert.alert(
      'Confirmar',
      `Remover ${userName} do palpite? Isso permitirá que ele vote novamente.`,
      [
        {
          text: 'Cancelar',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Sim, Remover',
          onPress: () => {
            try {
              removerParticipante(email);
              console.log(`✅ Participante ${email} removido do palpite`);
              Alert.alert('Sucesso', `${userName} foi removido do palpite e pode votar novamente!`);
              carregarUsuariosAuditoria();
            } catch (e) {
              console.error('❌ Erro ao remover participante:', e);
              Alert.alert('Erro', 'Erro ao remover participante');
            }
          },
        },
      ]
    );
  };

  const promoverUsuarioAdmin = (email: string, userName: string) => {
    if (userEmail !== 'adminpalpite10@gmail.com') {
      Alert.alert('Permissão negada', 'Apenas o admin principal pode promover usuários.');
      return;
    }

    Alert.alert(
      'Confirmar',
      `Tornar ${userName} um ADMIN?\n\nEle terá permissão para gerenciar o bolão.`,
      [
        {
          text: 'Cancelar',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Sim, Promover',
          onPress: () => {
            try {
              const sucesso = tornarAdmin(email);
              if (sucesso) {
                console.log(`✅ Usuário ${email} promovido a admin`);
                Alert.alert('Sucesso', `${userName} agora é um ADMIN! 👑`);
                carregarUsuariosAuditoria();
              } else {
                Alert.alert('Erro', 'Usuário não encontrado.');
              }
            } catch (e) {
              console.error('❌ Erro ao promover usuário:', e);
              Alert.alert('Erro', 'Erro ao promover usuário');
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirmação',
      'Deseja sair da aplicação?',
      [
        {
          text: 'Cancelar',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Sair',
          onPress: () => {
            logout();
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderUsuarioCard = ({ item }: { item: any }) => (
    <View style={styles.usuarioCard}>
      <View style={styles.usuarioInfo}>
        <View style={styles.emailBadge}>
          <Ionicons name="mail" size={14} color="#0F6B32" />
          <Text style={styles.emailText}>{item.email}</Text>
        </View>
        <View style={styles.cpfRow}>
          <Ionicons name="id-card" size={14} color="#666" />
          <Text style={styles.cpfText}>CPF: {item.cpf}</Text>
        </View>
        <View style={styles.senhaRow}>
          <Ionicons name="lock-closed" size={14} color="#666" />
          <Text style={styles.senhaText}>Senha: {item.senha}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={[styles.statusBadge, item.isAdmin && styles.statusAdmin]}>
            {item.isAdmin ? '👑 ADMIN' : '👤 USUÁRIO'}
          </Text>
        </View>
      </View>
      
      <View style={styles.botoesContainer}>
        {!item.isAdmin && (
          <TouchableOpacity
            style={styles.promoverBtn}
            onPress={() => promoverUsuarioAdmin(item.email, item.email)}
          >
            <Ionicons name="star" size={16} color="#FFF" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => removerParticipanteDoPalpite(item.email, item.email)}
        >
          <Ionicons name="trash" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.adminContainer}>
        <Ionicons name="shield-checkmark" size={80} color="#FFD700" />
        <Text style={styles.adminTitle}>Painel Administrativo</Text>
        <Text style={styles.adminSubtitle}>Gerenciar Jogo e Usuários</Text>

        {/* SEÇÃO DE ENCERRAMENTO DE JOGO */}
        <View style={styles.gameResultSection}>
          <Text style={styles.sectionTitle}>Decretar Resultado do Jogo</Text>
          
          <View style={styles.scoreSelectorsRow}>
            {/* BRASIL */}
            <View style={styles.scoreSelector}>
              <Text style={styles.scoreSelectorLabel}>Brasil</Text>
              
              <TouchableOpacity onPress={() => setGolsBrasil(golsBrasil + 1)}>
                <Ionicons name="chevron-up" size={28} color="#FFF" />
              </TouchableOpacity>
              
              <Text style={styles.scoreValue}>{golsBrasil}</Text>
              
              <TouchableOpacity onPress={() => golsBrasil > 0 && setGolsBrasil(golsBrasil - 1)}>
                <Ionicons name="chevron-down" size={28} color="#FFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.middleX}>X</Text>

            {/* ESCÓCIA */}
            <View style={styles.scoreSelector}>
              <Text style={styles.scoreSelectorLabel}>Escócia</Text>
              
              <TouchableOpacity onPress={() => setGolsEscocia(golsEscocia + 1)}>
                <Ionicons name="chevron-up" size={28} color="#FFF" />
              </TouchableOpacity>
              
              <Text style={styles.scoreValue}>{golsEscocia}</Text>
              
              <TouchableOpacity onPress={() => golsEscocia > 0 && setGolsEscocia(golsEscocia - 1)}>
                <Ionicons name="chevron-down" size={28} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.finishGameButton}
            onPress={encerrarJogoEDistribuirPontos}
          >
            <Ionicons name="checkmark-circle" size={20} color="#FFF" />
            <Text style={styles.finishGameButtonText}>Encerrar Jogo e Distribuir Pontos</Text>
          </TouchableOpacity>
        </View>

        {/* SEÇÃO DE AUDITORIA DE USUÁRIOS */}
        <View style={styles.auditSection}>
          <View style={styles.auditHeader}>
            <Ionicons name="people" size={24} color="#0F6B32" />
            <Text style={styles.auditTitle}>Auditoria de Usuários</Text>
            <TouchableOpacity onPress={carregarUsuariosAuditoria}>
              <Ionicons name="refresh" size={20} color="#0F6B32" />
            </TouchableOpacity>
          </View>

          <Text style={styles.usuariosCount}>
            Total: {usuariosAuditoria.length} usuário(s)
          </Text>

          {usuariosAuditoria.length > 0 ? (
            <FlatList
              data={usuariosAuditoria}
              renderItem={renderUsuarioCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.usuariosList}
              removeClippedSubviews={false}
            />
          ) : (
            <Text style={styles.noUsersText}>Nenhum usuário cadastrado</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.adminLogoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={22} color="#FFF" />
          <Text style={styles.adminLogoutButtonText}>Sair (Logout)</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F6B32',
  },

  adminContainer: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },

  adminTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 20,
    marginBottom: 5,
    textAlign: 'center',
  },

  adminSubtitle: {
    fontSize: 16,
    color: '#DDEEDF',
    marginBottom: 30,
    textAlign: 'center',
  },

  gameResultSection: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  sectionTitle: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },

  scoreSelectorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },

  scoreSelector: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
  },

  scoreSelectorLabel: {
    color: '#DDEEDF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },

  scoreValue: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
    minWidth: 40,
    textAlign: 'center',
  },

  middleX: {
    color: '#FFD700',
    fontSize: 28,
    fontWeight: 'bold',
  },

  finishGameButton: {
    backgroundColor: '#0FA946',
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },

  finishGameButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },

  auditSection: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },

  auditHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  auditTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F6B32',
    flex: 1,
    marginLeft: 10,
  },

  usuariosCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '600',
  },

  usuariosList: {
    gap: 12,
  },

  usuarioCard: {
    backgroundColor: '#F5F7FA',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0F6B32',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  usuarioInfo: {
    flex: 1,
  },

  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },

  emailText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F6B32',
  },

  cpfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },

  cpfText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  senhaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },

  senhaText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  statusRow: {
    marginTop: 6,
  },

  statusBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#E8E8E8',
    alignSelf: 'flex-start',
  },

  statusAdmin: {
    backgroundColor: '#FFE066',
    color: '#000',
  },

  removeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },

  botoesContainer: {
    flexDirection: 'row',
    gap: 10,
  },

  promoverBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },

  adminLogoutButton: {
    backgroundColor: '#FFF',
    height: 58,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 4,
  },

  adminLogoutButtonText: {
    color: '#0F6B32',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },

  noUsersText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },

  deniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F6B32',
  },

  deniedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#DC3545',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },

  deniedText: {
    fontSize: 16,
    color: '#DDEEDF',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
