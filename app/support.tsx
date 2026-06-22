import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { CONFIG } from './config';

interface Mensagem {
  id: string;
  tipo: 'usuario' | 'ia' | 'erro';
  texto: string;
  timestamp: number;
}

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const SYSTEM_PROMPT = `Você é o assistente virtual de suporte do aplicativo 'Palpite 10'. 

REGRAS DO APP:
- O bolão custa um valor fixo de R$ 10,00 via Pix Copia e Cola
- O usuário tem direito a apenas 1 palpite por jogo
- Quem acertar o placar exato ganha +1 vitória, +50 pontos no ranking e leva o bolão acumulado

SUA POSTURA:
- Seja educado, rápido e direto
- IMPORTANTE: Use **texto entre asteriscos duplos** para destacar informações importantes (será renderizado em negrito)
- NÃO use markdown, itálico ou outros símbolos de formatação
- Se o usuário disser que fez o pagamento e não caiu, que encontrou um bug, ou fizer perguntas complexas que você não sabe resolver:
  - Peça desculpas e forneça o link direto para o administrador humano no WhatsApp: https://wa.me/5511989336439
  - NUNCA invente informações sobre o status do pagamento do usuário

DIRETIVAS DE COMUNICAÇÃO:
- Aja de forma natural, humana e fluida. Varie seu vocabulário a cada resposta.
- NUNCA inicie a resposta com saudações (Olá, Oi, Bem-vindo) se o usuário já estiver no meio de uma conversa. Responda diretamente à pergunta.
- Não pareça um robô repetindo o mesmo roteiro.
- Mantenha um tom conversacional e amigável.`;

interface GeminiMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

const gerarRespostaIA = async (
  historicoMensagens: Mensagem[],
  novoPrompt: string
): Promise<string> => {
  // Obter chave de API em tempo de execução
  const API_KEY = CONFIG.GEMINI_API_KEY;

  if (!API_KEY) {
    console.error('❌ Chave de API não configurada.');
    return '❌ Erro: Chave de API não configurada. Entre em contato com o administrador: https://wa.me/5511989336439';
  }

  // Mapear histórico para o formato do Gemini
  const contents: GeminiMessage[] = historicoMensagens
    .filter(msg => msg.tipo !== 'erro') // Ignorar mensagens de erro
    .map(msg => ({
      role: msg.tipo === 'usuario' ? 'user' : 'model',
      parts: [{ text: msg.texto }],
    }));

  // Adicionar nova mensagem do usuário
  contents.push({
    role: 'user',
    parts: [{ text: novoPrompt }],
  });

  let tentativas = 0;
  const maxTentativas = 5;

  while (tentativas < maxTentativas) {
    try {
      tentativas++;
      console.log(`[IA] Tentativa ${tentativas}/${maxTentativas}`);

      const body = {
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents,
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 500,
        },
      };

      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      // Erro 429 - Rate limit
      if (response.status === 429) {
        console.warn('⚠️ Rate limit atingido. Aguardando 60 segundos...');
        if (tentativas < maxTentativas) {
          await new Promise(resolve => setTimeout(resolve, 60000));
          continue;
        }
      }

      // Erro de quota ou outro erro
      if (!response.ok) {
        console.error('❌ Erro da API:', response.status, data);
        if (tentativas < maxTentativas) {
          const tempoEspera = Math.min(2000 * Math.pow(2, tentativas - 1), 30000);
          console.log(`⏳ Aguardando ${tempoEspera / 1000}s antes de retry...`);
          await new Promise(resolve => setTimeout(resolve, tempoEspera));
          continue;
        }
      }

      // Sucesso
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const textoResposta = data.candidates[0].content.parts[0].text;
        console.log('✅ Resposta gerada com sucesso');
        return textoResposta;
      }

      throw new Error('Resposta inválida da API');
    } catch (error) {
      console.error(`❌ Erro na tentativa ${tentativas}:`, error);

      if (tentativas < maxTentativas) {
        const tempoEspera = Math.min(2000 * Math.pow(2, tentativas - 1), 30000);
        console.log(`⏳ Aguardando ${tempoEspera / 1000}s antes de retry...`);
        await new Promise(resolve => setTimeout(resolve, tempoEspera));
      }
    }
  }

  return '❌ Desculpe, não consegui processar sua solicitação neste momento. Por favor, tente novamente mais tarde ou entre em contato com o administrador: https://wa.me/5511989336439';
};

export default function ChatSupportScreen() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: '0',
      tipo: 'ia',
      texto: '👋 Olá! Bem-vindo ao suporte Palpite 10. Como posso ajudá-lo?',
      timestamp: Date.now()
    }
  ]);
  const [inputTexto, setInputTexto] = useState('');
  const [carregando, setCarregando] = useState(false);

  const scrollParaFim = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollParaFim();
  }, [mensagens]);

  const enviarMensagem = async () => {
    if (!inputTexto.trim()) return;

    const mensagemUsuario: Mensagem = {
      id: String(Date.now()),
      tipo: 'usuario',
      texto: inputTexto,
      timestamp: Date.now()
    };

    setMensagens(prev => [...prev, mensagemUsuario]);
    setInputTexto('');
    setCarregando(true);

    try {
      // Passar o histórico completo e o novo prompt
      const respostaIA = await gerarRespostaIA(mensagens, inputTexto);
      
      const mensagemIA: Mensagem = {
        id: String(Date.now() + 1),
        tipo: 'ia',
        texto: respostaIA,
        timestamp: Date.now()
      };

      setMensagens(prev => [...prev, mensagemIA]);
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      
      const mensagemErro: Mensagem = {
        id: String(Date.now() + 1),
        tipo: 'ia',
        texto: '❌ Desculpe, ocorreu um erro. Tente novamente ou entre em contato com o administrador.',
        timestamp: Date.now()
      };
      
      setMensagens(prev => [...prev, mensagemErro]);
    } finally {
      setCarregando(false);
      scrollParaFim();
    }
  };

  // Função para processar markdown simples e renderizar com Text nested
  const renderTextComMarkdown = (texto: string) => {
    // Remove asteriscos de markdown e renderiza com negrito
    // Padrão: **texto** -> negrito
    const parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    const regex = /\*\*(.*?)\*\*/g;
    let match;

    while ((match = regex.exec(texto)) !== null) {
      // Adiciona texto normal antes do match
      if (match.index > lastIndex) {
        parts.push(texto.substring(lastIndex, match.index));
      }
      // Adiciona texto em negrito
      parts.push(
        <Text key={`bold-${match.index}`} style={{ fontWeight: '700' }}>
          {match[1]}
        </Text>
      );
      lastIndex = regex.lastIndex;
    }

    // Adiciona texto restante
    if (lastIndex < texto.length) {
      parts.push(texto.substring(lastIndex));
    }

    return parts.length > 0 ? parts : texto;
  };

  const renderMensagem = (msg: Mensagem) => {
    const isUsuario = msg.tipo === 'usuario';

    return (
      <View
        key={msg.id}
        style={[
          styles.mensagemContainer,
          isUsuario ? styles.mensagemUsuario : styles.mensagemIA
        ]}
      >
        <View
          style={[
            styles.balao,
            isUsuario ? styles.balaoUsuario : styles.balaoIA
          ]}
        >
          <Text
            style={[
              styles.balaoTexto,
              isUsuario ? styles.balaoTextoBranco : styles.balaoTextoEscuro
            ]}
          >
            {renderTextComMarkdown(msg.texto)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingTop: insets.top }]}
      keyboardVerticalOffset={90}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suporte - Palpite 10</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* ÁREA DE MENSAGENS */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.mensagensArea}
        showsVerticalScrollIndicator={false}
      >
        {mensagens.map(renderMensagem)}

        {carregando && (
          <View style={styles.carregandoContainer}>
            <ActivityIndicator size="large" color="#0F6B32" />
            <Text style={styles.carregandoTexto}>Digitando...</Text>
          </View>
        )}
      </ScrollView>

      {/* INPUT DE MENSAGEM */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
        <TextInput
          style={styles.input}
          placeholder="Digite sua mensagem..."
          placeholderTextColor="#999"
          value={inputTexto}
          onChangeText={setInputTexto}
          multiline
          maxLength={500}
          editable={!carregando}
        />
        <TouchableOpacity
          style={[
            styles.botaoEnviar,
            (carregando || !inputTexto.trim()) && styles.botaoEnviarDesabilitado
          ]}
          onPress={enviarMensagem}
          disabled={carregando || !inputTexto.trim()}
        >
          <Ionicons
            name="send"
            size={20}
            color={carregando || !inputTexto.trim() ? '#CCC' : '#FFF'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  mensagensArea: {
    padding: 16,
    paddingBottom: 20,
  },
  mensagemContainer: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  mensagemUsuario: {
    justifyContent: 'flex-end',
  },
  mensagemIA: {
    justifyContent: 'flex-start',
  },
  balao: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  balaoUsuario: {
    backgroundColor: '#0F6B32',
    borderBottomRightRadius: 4,
  },
  balaoIA: {
    backgroundColor: '#E5E7EB',
    borderBottomLeftRadius: 4,
  },
  balaoTexto: {
    fontSize: 15,
    lineHeight: 20,
  },
  balaoTextoBranco: {
    color: '#FFF',
  },
  balaoTextoEscuro: {
    color: '#1A202C',
  },
  carregandoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 12,
  },
  carregandoTexto: {
    color: '#0F6B32',
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingHorizontal: 12,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
    backgroundColor: '#F9F9F9',
  },
  botaoEnviar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F6B32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  botaoEnviarDesabilitado: {
    backgroundColor: '#CCC',
  },
});
