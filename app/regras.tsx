import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function RegrasScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Regras do Bolão</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* CONTEÚDO */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.iconSection}>
            <Ionicons name="document-text" size={50} color="#0F6B32" />
            <Text style={styles.cardTitle}>Como Funciona o Palpite 10</Text>
          </View>

          {/* Seção 1 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>1</Text>
              <Text style={styles.sectionTitle}>Objetivo</Text>
            </View>
            <Text style={styles.sectionText}>
              O Palpite 10 é um bolão de futebol onde você coloca R$ 10,00 para fazer um palpite de placar exato de um jogo. Quem acertar o placar exato divide o prêmio total do bolão igualmente.
            </Text>
          </View>

          {/* Seção 2 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>2</Text>
              <Text style={styles.sectionTitle}>Participação</Text>
            </View>
            <Text style={styles.sectionText}>
              • Apostar é simples: entre na aba "Apostar"\n
              • Escolha seu palpite de placar exato\n
              • Pague R$ 10,00 via Pix\n
              • Confirme o pagamento no WhatsApp\n
              • Seu palpite fica registrado no bolão
            </Text>
          </View>

          {/* Seção 3 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>3</Text>
              <Text style={styles.sectionTitle}>Resultado</Text>
            </View>
            <Text style={styles.sectionText}>
              • O administrador decreta o resultado oficial do jogo\n
              • Se acertou o placar exato: você ganha +50 pontos\n
              • Se errou: você recebe 0 pontos naquela rodada\n
              • Todos os acertadores dividem igualmente o bolão
            </Text>
          </View>

          {/* Seção 4 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>4</Text>
              <Text style={styles.sectionTitle}>Ranking</Text>
            </View>
            <Text style={styles.sectionText}>
              • Acompanhe sua pontuação na aba "Ranking"\n
              • Ganhe pontos a cada acerto\n
              • Competir com amigos e tentar ser o melhor\n
              • Histórico completo de suas apostas
            </Text>
          </View>

          {/* Seção 5 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>5</Text>
              <Text style={styles.sectionTitle}>Importante</Text>
            </View>
            <Text style={styles.sectionText}>
              • Você só pode fazer 1 palpite por jogo\n
              • O pagamento é obrigatório para validação\n
              • Não há reembolso em caso de arrependimento\n
              • Aproveite e chame seus amigos para participar!
            </Text>
          </View>

          {/* Rodapé */}
          <View style={styles.footer}>
            <Ionicons name="checkmark-circle" size={32} color="#0FA946" />
            <Text style={styles.footerText}>Agora você já sabe as regras!</Text>
            <Text style={styles.footerSubtext}>Boa sorte nas suas apostas! 🍀</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F6B32',
  },

  header: {
    height: 70,
    backgroundColor: '#0F6B32',
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

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  iconSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#F0F0F0',
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A202C',
    marginTop: 12,
    textAlign: 'center',
  },

  section: {
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },

  sectionNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    backgroundColor: '#0F6B32',
    width: 36,
    height: 36,
    borderRadius: 18,
    textAlign: 'center',
    lineHeight: 36,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F6B32',
    flex: 1,
  },

  sectionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginLeft: 48,
  },

  footer: {
    marginTop: 30,
    paddingTop: 24,
    borderTopWidth: 2,
    borderTopColor: '#F0F0F0',
    alignItems: 'center',
  },

  footerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    marginTop: 12,
  },

  footerSubtext: {
    fontSize: 14,
    color: '#0F6B32',
    fontWeight: '600',
    marginTop: 6,
  },
});
