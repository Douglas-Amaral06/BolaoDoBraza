# UI/UX Master Plan - Palpite 10
## Elevação para Padrão World Class

**Versão**: 1.0  
**Data**: Junho 2026  
**Status**: Guia de Implementação  
**Escopo**: React Native (iOS/Android) | Design System Robusto

---

## 📊 EXECUTIVE SUMMARY

O Palpite 10 possui uma arquitetura de backend estável e funcional. O frontend atual demonstra compreensão de fundamentos (cores, hierarquia, espaçamento), mas carece de polimento que diferencia apps "bons" de apps "excelentes". Este documento mapeia as melhorias visuais e de experiência necessárias para atingir padrão de empresas como Nubank, Airbnb e Apple.

**Foco Principal**: Micro-interações, profundidade visual, feedback sensitivo e hierarchy refinada.

---

## 1️⃣ AUDITORIA VISUAL E HEURÍSTICA

### 1.1 Análise por Tela

#### **HOME (index.tsx)** ✅ **Bom**
**Pontos Fortes**:
- Header com logo bem posicionado (Palpite + 10 em cores distintas)
- Match card com layout centralizado e badge de "PRÓXIMO JOGO" flutuante
- Hierarquia clara de seções (Próximo Jogo → Previsão → Bolão Ao Vivo)
- Stats cards com ícones circulares criando profundidade
- Live badge com ponto animável (● AO VIVO)

**Problemas Identificados** ⚠️:
- **Sombras inconsistentes**: Alguns cards têm `shadowOpacity: 0.1`, outros `0.03` — sem padrão
- **Espaçamento**: Match card tem `paddingTop: 35` devido ao badge flutuante — frágil em diferentes tamanhos
- **Predictions buttons** (`btnBrasil`, `btnAdversario`): Cores amarela/azul sem feedback haptic ao toque
- **Modal menu**: Fundo não tem backdrop blur, parece abrir sem peso visual
- **SafeAreaView deprecado**: Usar `useSafeAreaInsets` em vez de componente

#### **BET SCREEN (BetScreen.tsx)** ⚠️ **Amador**
**Problemas Críticos**:
- **Score selector**: Chevron buttons são simples — sem feedback visual ao alcançar min/max
- **Modal QR Code**: Overlay completamente opaco (rgba 0,0,0,0.7) — muito agressivo
- **Copy button**: Sem loading state ou animação de confirmação ("Copiado!")
- **ActivityIndicator**: Padrão RN sem customização — não combina com design
- **Info card**: Ícone genérico — deveria ser mais icônico (e.g., pulse animation)

**Padrão Positivo**:
- Confirmação com checkmark é inteligente
- Card de bet bem estruturado

#### **BOLÃO SCREEN (BolaoScreen.tsx)** ⚠️ **Aceitável mas Plano**
**Pontos Fracos**:
- **Placares ao vivo**: Cards de placar são muito simples
  - Sem animação quando scores mudam
  - Status badge não pulsa mesmo com "AO VIVO"
  - Falta indicador visual de urgência
- **Participantes**: Avatares genéricos com iniciais
  - Não há variação de cores por usuário
  - Sem estado de hover/press
- **Prize card**: Posicionado absolute no bottom — pode ser coberto ao scroll
- **ActivityIndicator**: Novo placeholder state quando carregandoPlacares

#### **GERENCIAR RODADA (GerenciarRodadaScreen.tsx)** ⚠️ **Desconexo**
**Estrutura**:
- Cards de jogo são bem estruturados
- Switches são funcionais mas sem micro-feedback

**Problemas**:
- **Transições**: Cards aparecem/desaparecem sem fade-in
- **Loading state**: Skeleton screens ausentes — apenas ActivityIndicator
- **Empty state**: Ícone genérico + texto — sem call-to-action visual
- **Status indicators**: 📺 📅 ✅ — emojis não escaláveis com tamanho fonte

#### **PROFILE SCREEN (ProfileScreen.tsx)** ✅ **Bem Estruturado**
**Pontos Positivos**:
- Avatar grande e centrado
- Cards de resultado com cores contextuais (verde/vermelho)
- Tipografia clara

**Melhorias**:
- Sem animação de progresso para pontos (contador animado)
- Background do avatar poderia ter gradiente

#### **RANKING SCREEN (RankingScreen.tsx)** ✅ **Bom**
**Pontos Positivos**:
- Top 3 com troféus (🥇🥈🥉) — excelente detalhe
- Indicadores visuais claros
- Cores por posição inteligentes

**Melhorias**:
- Ranking list poderia ter scroll com sticky header
- Sem animação de entrada para itens

---

### 1.2 Inconsistências de Paddings, Margins e Border-Radius

**Problema**: Valores inconsistentes em todo o app

| Componente | Atual | Padrão Proposto |
|-----------|-------|-----------------|
| **Card padding** | 16, 18, 20, 24 | 16 (padrão), 20 (destaque) |
| **Container padding** | 15, 16, 20 | 16 (padrão) |
| **Border radius** | 12, 14, 15, 20, 24 | 12 (pequeno), 16 (médio), 20 (grande) |
| **Spacing gaps** | 8, 12, 15, 20, 25, 35 | 8, 12, 16, 24, 32 (escala 1.5x) |
| **Shadow elevation** | 1, 3, 5, 6, 10 | 2, 4, 8, 12 (padrão iOS) |

---

## 2️⃣ REFINAMENTO DO DESIGN SYSTEM

### 2.1 Paleta de Cores Estendida

**Cores Primárias** (Existentes):
```
Verde Primário:      #0F6B32 (Ações principais)
Verde Destaque:      #0FA946 (CTAs, ativas)
Verde Escuro:        #044A22 (Backgrounds elevados)
Verde Claro:         #D1E8D9 (Backgrounds leves)
Branco:              #FFFFFF (Backgrounds limpos)
```

**Paleta Expandida Proposta**:

#### **Cores de Status**
```
Sucesso:             #22C55E (Mais brilhante que #0FA946)
  - Light:           #DCFCE7
  - Dark:            #15803D
  
Erro/Alerta:         #EF4444
  - Light:           #FEE2E2
  - Dark:            #991B1B

Aviso:               #F59E0B
  - Light:           #FEF3C7
  - Dark:            #B45309

Info:                #3B82F6
  - Light:           #DBEAFE
  - Dark:            #1E40AF
```

#### **Escala de Cinzas (Tipografia + Backgrounds)**
```
Cinza-50:            #F9FAFB (Backgrounds muito leves)
Cinza-100:           #F3F4F6 (Backgrounds leves)
Cinza-200:           #E5E7EB (Borders, dividers)
Cinza-300:           #D1D5DB (Secondary text)
Cinza-400:           #9CA3AF (Tertiary text)
Cinza-500:           #6B7280 (Disabled state)
Cinza-600:           #4B5563 (Primary text - dark mode ready)
Cinza-700:           #374151 (Headlines)
Cinza-900:           #111827 (Maximum contrast)
```

#### **Cores Secundárias (Contexto)**
```
Ouro (1º lugar):     #FBBF24 (Troféus, badges premium)
Prata (2º lugar):    #D1D5DB
Bronze (3º lugar):   #92400E

Prêmio/Bolão:        #0A47D5 (Azul específico para cards de prêmio)
```

### 2.2 Tipografia e Hierarquia

**Font Stack Proposto** (implementar via expo):
```typescript
const fonts = {
  // Usar: Inter (preferencial), Roboto (fallback)
  
  // Headlines (Peso: 700/900)
  heading1: { fontSize: 32, fontWeight: '900', lineHeight: 40 },     // Títulos de página
  heading2: { fontSize: 28, fontWeight: '900', lineHeight: 36 },     // Card titles
  heading3: { fontSize: 24, fontWeight: '700', lineHeight: 32 },     // Seção
  
  // Subheadings (Peso: 600/700)
  subtitle1: { fontSize: 18, fontWeight: '700', lineHeight: 28 },    // Card titles, botões
  subtitle2: { fontSize: 16, fontWeight: '600', lineHeight: 24 },    // Labels, tags
  
  // Body Text (Peso: 400/500)
  body1: { fontSize: 14, fontWeight: '500', lineHeight: 22 },        // Body, descriptions
  body2: { fontSize: 13, fontWeight: '400', lineHeight: 20 },        // Tertiary text
  
  // Caption (Peso: 400)
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 18 },      // Timestamps, hints
  caption2: { fontSize: 11, fontWeight: '400', lineHeight: 16 },     // Extra small
  
  // Number (Monospaced)
  number: { fontSize: 18, fontWeight: '700', fontFamily: 'monospace' } // Scores
}
```

**Aplicação por Contexto**:
- Logo: `heading1` + Italic + Verde/Amarelo
- Section titles: `heading3` + Verde Primário
- Card titles: `subtitle1` + Cinza-700
- Body description: `body1` + Cinza-600
- Timestamps: `caption` + Cinza-400

---

## 3️⃣ MICRO-INTERAÇÕES E ANIMAÇÕES

### 3.1 Haptic Feedback (Tátil)

**Implementação**:
```typescript
import * as Haptics from 'expo-haptics';

// Padrões sugeridos:
const hapticPatterns = {
  // Confirmação suave
  select: () => Haptics.selectionAsync(),          // Vibração leve
  
  // Sucesso/vitória
  success: () => Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Success        // Padrão "deu certo"
  ),
  
  // Alerta
  warning: () => Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Warning        // Duplo/ritmo
  ),
  
  // Erro
  error: () => Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Error          // Padrão negativo
  ),
  
  // Impacto
  impact: () => Haptics.impactAsync(
    Haptics.ImpactFeedbackStyle.Medium              // Pressão
  )
};
```

**Onde Aplicar**:
| Ação | Haptic | Localização |
|------|--------|------------|
| Toque em botão (CTA) | `select` + `impact` | BetScreen confirmação, BolaoScreen |
| Score incrementado | `select` | BetScreen score selector |
| Aposta confirmada | `success` + `select` | BetScreen modal confirmação |
| Erro de cópia Pix | `error` | BetScreen QR modal |
| Switch ativado/desativado | `select` | GerenciarRodada toggles |
| Score ao vivo atualizado | `light impact` | BolaoScreen placares |

---

### 3.2 Transições e Animações (React Native Reanimated / Moti)

#### **3.2.1 Cards com Fade-In + Slide-Up**

```typescript
import { MotiView } from 'moti';

<MotiView
  from={{ opacity: 0, translateY: 20 }}
  animate={{ opacity: 1, translateY: 0 }}
  transition={{ type: 'timing', duration: 400 }}
>
  {/* Card conteúdo */}
</MotiView>
```

**Aplicações**:
- **Home**: Match card, stats cards ao carregar
- **BolaoScreen**: Placar cards quando scores atualizam
- **GerenciarRodada**: Jogo cards ao filtrar
- **Ranking**: Itens ao scroll

#### **3.2.2 Botões com Pressão (Press Effect)**

```typescript
import { Pressable } from 'react-native';
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const useButtonPress = () => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));
  
  const onPressIn = () => {
    scale.value = withSpring(0.96); // Afunda 4%
  };
  
  const onPressOut = () => {
    scale.value = withSpring(1);
  };
  
  return { animatedStyle, onPressIn, onPressOut };
};
```

**Implementar em**:
- CTAs (Confirmar palpite, Encerrar rodada)
- Menu items
- Score selector chevrons

#### **3.2.3 Badge "AO VIVO" com Pulso**

```typescript
import { Animated } from 'react-native';

const usePulseAnimation = () => {
  const pulse = new Animated.Value(0);
  
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false
        })
      ])
    ).start();
  }, []);
  
  return pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15] // Cresce 15%
  });
};
```

**Aplicar em**:
- Badge "● AO VIVO" no home
- Status de placar ao vivo em BolaoScreen

#### **3.2.4 Score Incremento com Animação de Transição**

Quando a ESPN atualiza um score (2 → 3):

```typescript
const scoreValue = useSharedValue(2);

useEffect(() => {
  scoreValue.value = withSpring(3, {
    damping: 10,
    mass: 1,
    stiffness: 100
  });
}, [newScore]);

const numberStyle = useAnimatedStyle(() => ({
  fontSize: interpolate(scoreValue.value, [2, 3], [24, 28]),
  color: color // Mantém cor constante
}));
```

---

### 3.3 Skeleton Screens (Substituto para ActivityIndicator)

Implementar shimmer loading enquanto API responde:

```typescript
// Exemplo de Skeleton para Placar Card
<SkeletonCard>
  <Shimmer
    animating={loading}
    duration={1000}
  >
    <View style={styles.skeletonTeamName} />
    <View style={styles.skeletonScore} />
    <View style={styles.skeletonTeamName} />
  </Shimmer>
</SkeletonCard>
```

**Onde aplicar**:
- BolaoScreen: Enquanto carregandoPlacares
- GerenciarRodada: Enquanto carregarJogosDoServer
- Home: Enquanto carregarDadosBolao

---

## 4️⃣ POLIMENTO DE COMPONENTES

### 4.1 Profundidade Visual (Shadows/Elevation)

**Padronizar shadows com sistema de elevação**:

```typescript
const elevation = {
  // Nível 1: Subtle (cards padrão, backgrounds)
  e1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2
  },
  
  // Nível 2: Medium (cards interativos, botões)
  e2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4
  },
  
  // Nível 3: Heavy (floating cards, overlays)
  e3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8
  },
  
  // Nível 4: Maximum (modals, dialogs)
  e4: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12
  }
};
```

**Aplicação**:
- Home match card: `e2` (mais destaque que outros)
- Stats cards: `e1` (sutil)
- Modal backgrounds: `e4` (máximo peso visual)

### 4.2 Escudos das Seleções (Team Logos)

**Melhorias**:
- Logos com bordas reforçadas (`borderWidth: 2, borderColor: '#FFF'`)
- Sombra individualmente: `elevation: 3`
- Tamanhos consistentes (`flagCircle: 65x65` para destaque, `50x50` para secundário)

```typescript
const flagCircle = {
  width: 65,
  height: 65,
  borderRadius: 35,
  borderWidth: 2,
  borderColor: '#FFF',
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3
};
```

### 4.3 Exibição de Placares ao Vivo

**Atual**: Cards simples com "X" separador

**Proposto**:
```typescript
// Placar com indicador de movimento
<View style={styles.placarContainer}>
  <TeamSection>
    <TeamLogo />
    <Animated.Text style={scoreAnimation}>
      {currentScore}
    </Animated.Text>
  </TeamSection>
  
  <View style={styles.separator}>
    <Text style={styles.dash}>—</Text>
    <Animated.Text style={pulseAnimation}>
      🔴 LIVE
    </Animated.Text>
  </View>
  
  <TeamSection>
    {/* Visitante */}
  </TeamSection>
</View>
```

**Features**:
- Separador com animação ao mudar score
- Badge "LIVE" pulsando (apenas STATUS_IN_PROGRESS)
- Mudança de cor ao finalizar (verde → cinza)

### 4.4 Avatares de Usuário

**Melhorias**:
```typescript
// Avatar com cor automática baseada no nome
const getAvatarColor = (nome: string): string => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
  const hash = nome.charCodeAt(0) + nome.charCodeAt(1);
  return colors[hash % colors.length];
};

// Resultado: cada usuário tem cor única e consistente
```

**Aplicar em**:
- BolaoScreen: Participant list avatars
- Home: Futura seção de amigos/grupo

---

## 5️⃣ GUIA DE IMPLEMENTAÇÃO

### 5.1 Cronograma de Refatoração (Zero Backend Impact)

**Fase 1: Foundations (1-2 sprints)**
- [ ] Criar Design System Constants (cores, tipografia, spacing)
- [ ] Implementar sistema de elevation/shadows
- [ ] Deprecate SafeAreaView (substituir por useSafeAreaInsets)
- [ ] Instalar/configurar: `react-native-reanimated`, `moti`, `expo-haptics`

**Fase 2: Home & Core (2-3 sprints)**
- [ ] Refatorar Home (index.tsx):
  - Adicionar fade-in animations aos cards
  - Implementar haptics em buttons
  - Polir sombras e espaçamentos
  - Adicionar blur no modal menu

- [ ] Refatorar Ranking (RankingScreen.tsx):
  - Adicionar scroll sticky header
  - Animar entrada dos itens
  - Refinar cores top 3

**Fase 3: Bet Flow (2-3 sprints)**
- [ ] BetScreen: Score selector com feedback
- [ ] QR Modal: Reduzir opacidade overlay, adicionar blur
- [ ] Implementar haptics em confirmação
- [ ] Skeleton screen para loading

**Fase 4: Admin & Live (2-3 sprints)**
- [ ] GerenciarRodada:
  - Substituir ActivityIndicator por skeleton
  - Fade-in animations nos cards
  - Haptics nos toggles

- [ ] BolaoScreen:
  - Badge "LIVE" pulsando
  - Score animations ao atualizar
  - Melhorar placar cards

**Fase 5: Polish & QA (1-2 sprints)**
- [ ] ProfileScreen: Contador animado de pontos
- [ ] Micro-interactions em todos os botões
- [ ] Teste em dispositivos reais (iPhone/Android)
- [ ] A/B testing em subset de usuários

---

### 5.2 Ordem de Prioridade (ROI)

**Alto ROI (Começar aqui)**:
1. Design System Constants (base para tudo)
2. Haptics em CTAs (cheap win, alto impacto)
3. Skeleton screens (melhor UX de loading)
4. Sombras consistentes ("professional" instant)
5. Fade-in animations em cards (detalhe premium)

**Médio ROI**:
6. Score animations (específico para live data)
7. Button press effects (micro detalhe)
8. Blur em modals (aesthetic)
9. Avatar colors automáticas (diferenciação)

**Baixo ROI (Último)**:
10. Pulso em badges (nice-to-have)

---

## 6️⃣ ESPECIFICAÇÕES TÉCNICAS

### 6.1 Dependências Necessárias

```json
{
  "react-native-reanimated": "^3.5.0",
  "moti": "^0.28.0",
  "expo-haptics": "^12.8.0",
  "@react-native-menu/menu-actions": "^1.0.0"
}
```

### 6.2 File Structure para Design System

```
bolao-app/
├── app/
│   ├── design/
│   │   ├── colors.ts        // Paleta completa
│   │   ├── typography.ts    // Font scales
│   │   ├── spacing.ts       // Padding/margin constants
│   │   ├── elevation.ts     // Shadow presets
│   │   └── animations.ts    // Reanimated hooks
│   ├── components/
│   │   ├── ui/
│   │   │   ├── SkeletonCard.tsx
│   │   │   ├── AnimatedButton.tsx
│   │   │   └── PulseBadge.tsx
│   │   └── screens/
│   └── hooks/
│       ├── useButtonPress.ts
│       ├── usePulseAnimation.ts
│       └── useHaptics.ts
```

### 6.3 Import Pattern (Design Tokens)

```typescript
// Ao invés de hardcoding cores:
import { colors, elevation, spacing } from '@/app/design';

// Uso:
<View style={{
  padding: spacing.md,
  backgroundColor: colors.bg.secondary,
  ...elevation.e2
}}>
```

---

## 7️⃣ MÉTRICAS DE SUCESSO

Após implementação, medir:

| Métrica | Objetivo | Ferramenta |
|---------|----------|-----------|
| **Time to Interactive (TTI)** | < 3s (com animations) | Lighthouse, Firebase Perf. |
| **Bounce Rate** | -15% vs baseline | Analytics |
| **Retention Day 7** | +20% | Firebase Analytics |
| **Session Duration** | +25% | Analytics |
| **App Store Rating** | +0.5 stars | App Store data |
| **User Feedback (NPS)** | "Feels premium" | In-app survey |

---

## 8️⃣ NOTAS IMPORTANTES

✅ **Princípios Mantidos**:
- ZERO mudanças em lógica de negócio
- ZERO mudanças em estrutura de estado (Store.ts)
- ZERO mudanças em chamadas de API
- Backend 100% intacto

✅ **Garantias**:
- Todas as animações rodam a 60 FPS em dispositivos reais
- Compatibilidade com Expo managed workflow
- Fallbacks em dispositivos com performance limitada
- Acessibilidade preservada (semantics + color contrast)

---

## 9️⃣ PRÓXIMOS PASSOS

1. **Semana 1**: Aprovação do Design System proposto
2. **Semana 2**: Setup de bibliotecas + constants iniciais
3. **Semana 3-4**: Refatoração piloto (Home screen como proof-of-concept)
4. **Semana 5-10**: Rollout progressivo por tela
5. **Semana 11**: QA e testes em dispositivos reais
6. **Semana 12**: Release com incremento de versão (v1.1.0)

---

**Documento Assinado**: UI/UX Master Plan v1.0  
**Escopo**: Palpite 10 - React Native App  
**Restrição**: Implementação é opcional (guia, não mandatório)  
**Status**: Pronto para implementação

