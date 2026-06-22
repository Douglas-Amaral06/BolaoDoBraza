import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function RulesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Regras do Bolão</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Objetivo</Text>
          <Text style={styles.sectionText}>
            Acertar o placar exato do jogo para ganhar o prêmio total acumulado.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Valor da Aposta</Text>
          <Text style={styles.sectionText}>
            Cada palpite custa R$ 10,00 (fictício). O valor total acumulado é dividido entre os vencedores.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎲 Como Funciona</Text>
          <Text style={styles.sectionText}>
            1. Acesse a tela "Apostar" e escolha o placar que você acredita que o Brasil e a Escócia marcarão.{'\n'}
            2. Clique em "Confirmar palpite".{'\n'}
            3. Faça o pagamento via PIX (valor fictício para fins de demonstração).{'\n'}
            4. Você pode acompanhar todos os participantes na tela "Bolão".
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Critérios de Vitória</Text>
          <Text style={styles.sectionText}>
            • Apenas quem acertar o placar EXATO ganha pontos.{'\n'}
            • Cada vitória = +50 pontos.{'\n'}
            • Os pontos são acumulados no histórico do perfil.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Restrições</Text>
          <Text style={styles.sectionText}>
            • Um único palpite por pessoa por rodada.{'\n'}
            • Após confirmar o palpite, você não pode mudá-lo.{'\n'}
            • Apenas o administrador pode finalizar a rodada e distribuir pontos.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👨‍⚖️ Responsabilidade do Admin</Text>
          <Text style={styles.sectionText}>
            O administrador é responsável por:
            {'\n'}• Decretar o resultado oficial do jogo{'\n'}• Validar pagamentos{'\n'}• Distribuir pontos aos vencedores
          </Text>
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
  header: {
    backgroundColor: '#0F6B32',
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F6B32',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});
