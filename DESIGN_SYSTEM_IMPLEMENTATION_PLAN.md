# Design System Implementation — Plano de Execução

**Status**: ✅ Infraestrutura Criada  
**Data**: Junho 2026  
**Próximo Passo**: Refatoração de Telas

---

## ✅ Etapa 1: Infraestrutura (COMPLETA)

### Design Tokens
- ✅ `app/design/colors.ts` — Paleta completa (primárias, status de jogo, semânticos, especiais)
- ✅ `app/design/typography.ts` — 14 estilos tipográficos (headings, body, numbers, buttons, labels)
- ✅ `app/design/spacing.ts` — Escala de espaçamento (xs-xxl) + border-radius (sm-full)
- ✅ `app/design/elevation.ts` — 6 níveis de sombra (e0-e4, brand)
- ✅ `app/design/index.ts` — Barrel export

### Componentes UI
- ✅ `components/ui/AnimatedButton.tsx` — CTA com scale animation + haptics
- ✅ `components/ui/PulseBadge.tsx` — Status badges (live/scheduled/finished) com pulse
- ✅ `components/ui/SkeletonCard.tsx` — Loading shimmer para game/ranking/score
- ✅ `components/ui/UserAvatar.tsx` — Avatar com cor auto-gerada por nome + rank badge
- ✅ `components/ui/LiveScoreCard.tsx` — Card de placar completo com animação
- ✅ `components/ui/index.ts` — Barrel export

### Hooks
- ✅ `hooks/useHaptics.ts` — select, impact, success, warning, error, light
- ✅ `hooks/useButtonPress.ts` — Spring animation para botões
- ✅ `hooks/usePulseAnimation.ts` — Opacity + scale pulse para badges

---

## 📋 Etapa 2: Refatoração de Telas (PRÓXIMA)

### Screen 1: `app/(tabs)/index.tsx` (Home)
**Status**: Pendente  
**Componentes a usar**:
- `AnimatedButton` para predições (substituir TouchableOpacity)
- `PulseBadge` para badge de "JOGOS AO VIVO"
- `SkeletonCard` para loading (substituir ActivityIndicator)
- `MotiView` para fade-in de stats com delay
- `useHaptics` em todos CTAs

**Checklist**:
- [ ] Remover cores hardcoded → usar `colors.*`
- [ ] Remover padding/margin hardcoded → usar `spacing.*`
- [ ] AnimatedButton em "Fazer Palpite", "Ver Bolões"
- [ ] Substituir ActivityIndicator por SkeletonCard
- [ ] Adicionar haptics em CTAs
- [ ] MotiView com delay = index * 50ms em lista de stats

---

### Screen 2: `app/(tabs)/BetScreen.tsx` (Apostas)
**Status**: Pendente  
**Componentes a usar**:
- `AnimatedButton` para "Confirmar Aposta"
- `useButtonPress` em score selector (incrementar/decrementar)
- `useHaptics` com feedback `select` ao mudar score
- `SkeletonCard` para loading durante busca
- `PulseBadge` para status do jogo
- `BlurView` em modal de QR (se existir)

**Checklist**:
- [ ] Remover TouchableOpacity → AnimatedButton
- [ ] useHaptics.select() ao incrementar/decrementar
- [ ] useHaptics.impact() em "Confirmar Aposta"
- [ ] Substituir ActivityIndicator por SkeletonCard
- [ ] Remover cores/spacing hardcoded

---

### Screen 3: `app/(tabs)/BolaoScreen.tsx` (Bolão)
**Status**: Pendente  
**Componentes a usar**:
- `LiveScoreCard` para exibir placares
- `PulseBadge` para status de jogo
- `UserAvatar` para avatares de membros
- `SkeletonCard` para loading
- `MotiView` com delay escalonado

**Checklist**:
- [ ] Substituir card de placar manual por `LiveScoreCard`
- [ ] UserAvatar em lista de membros
- [ ] PulseBadge em status de jogo
- [ ] SkeletonCard durante fetch de dados
- [ ] MotiView em listas com delay = index * 60ms

---

### Screen 4: `app/(tabs)/RankingScreen.tsx` (Ranking)
**Status**: Pendente  
**Componentes a usar**:
- `UserAvatar` com `rank={1|2|3}` (cores ouro/prata/bronze)
- `MotiView` com delay escalonado para rankings
- `SkeletonCard` para loading
- `AnimatedButton` para CTAs

**Checklist**:
- [ ] UserAvatar com rank props (1=ouro, 2=prata, 3=bronze)
- [ ] MotiView fade-in com delay = index * 50ms
- [ ] SkeletonCard durante fetch
- [ ] Remover cores/spacing hardcoded

---

### Screen 5: `app/(tabs)/ProfileScreen.tsx` (Perfil)
**Status**: Pendente  
**Componentes a usar**:
- `UserAvatar` (grande) para foto de perfil
- `AnimatedButton` para "Logout", "Editar Perfil"
- Animated pontos com scale effect ao mudar
- `MotiView` para fade-in de seções
- `useHaptics` em CTAs

**Checklist**:
- [ ] UserAvatar com size="xl"
- [ ] AnimatedButton em "Logout" e "Editar Perfil"
- [ ] Animated counter para pontos (scale effect)
- [ ] useHaptics.impact() em CTAs
- [ ] MotiView em seções com delay

---

## 🎯 Ordem de Execução

1. **Home (index.tsx)** — UI mais simples, boa para validar padrões
2. **BetScreen.tsx** — Adiciona complexidade com score selector + haptics
3. **BolaoScreen.tsx** — Introduz LiveScoreCard + UserAvatar
4. **RankingScreen.tsx** — Rank badge com cores especiais
5. **ProfileScreen.tsx** — Animações de números + avatar grande

---

## ✅ Conformidade Obrigatória

Antes de qualquer PR:

- [ ] **Nenhuma cor hardcoded** — Todas vindo de `colors.*`
- [ ] **Nenhum spacing hardcoded** — Todas usando `spacing.*` ou `radius.*`
- [ ] **Nenhuma sombra hardcoded** — Usar `elevation.e1-e4` ou `elevation.brand`
- [ ] **ActivityIndicator → SkeletonCard** em todos loading
- [ ] **Emojis de status → PulseBadge** (📺📅✅)
- [ ] **TouchableOpacity CTAs → AnimatedButton** quando primário
- [ ] **Haptics em TODA ação de usuário** (CTA, toggle, score)
- [ ] **MotiView com delay escalonado** em todas listas
- [ ] **Lógica de negócio, Store e API INTACTOS** (UI ONLY)

---

## 🔗 Import Pattern

```tsx
// Tokens
import { colors, typography, spacing, radius, elevation } from '@/app/design';

// Componentes
import { AnimatedButton, PulseBadge, SkeletonCard, UserAvatar, LiveScoreCard } from '@/components/ui';

// Hooks
import { useHaptics } from '@/hooks/useHaptics';
import { useButtonPress } from '@/hooks/useButtonPress';
import { usePulseAnimation } from '@/hooks/usePulseAnimation';

// Motion
import { MotiView } from 'moti';
```

---

*Design System Implementation v2.0 — Junho 2026*
