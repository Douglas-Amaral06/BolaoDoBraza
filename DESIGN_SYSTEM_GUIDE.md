# PALPITE 10 — Design System Guide
**Versão**: 2.0 · **Status**: Implementado · **Escopo**: React Native (Expo)

> Documento normativo. Toda decisão visual do app deve ser derivada deste guia.  
> A IA da IDE deve ler este arquivo antes de qualquer alteração de UI.

---

## 1. Filosofia

O Palpite 10 tem identidade verde-Brasil com urgência de tempo real. O Design System reflete isso:

- **Verde como âncora** — a cor primária carrega autoridade em toda a hierarquia
- **Vermelho para urgência** — jogos ao vivo têm tratamento visual distinto e imediato
- **Motion com propósito** — animações reforçam estado (placar mudou, jogo ao vivo) e não decoram
- **Zero hardcode** — todos os valores saem de tokens; trocar o tema é trocar um arquivo

---

## 2. Tokens de Cor

**Arquivo**: `app/design/colors.ts`  
**Import**: `import { colors } from '@/app/design'`

### Primárias

| Token | Hex | Uso |
|---|---|---|
| `colors.primary.DEFAULT` | `#0F6B32` | Ações principais, headers, ícones brand |
| `colors.primary.light` | `#0FA946` | CTAs secundários, destaques |
| `colors.primary.dark` | `#044A22` | Backgrounds elevados escuros |
| `colors.primary.bg` | `#D1E8D9` | Fundo de badges verdes |
| `colors.primary.muted` | `#E8F5EC` | Fundo de ícones, áreas sutis |

### Status de Jogo

| Token | Hex | Uso |
|---|---|---|
| `colors.game.live` | `#EF4444` | Badge AO VIVO, barra lateral card |
| `colors.game.liveBg` | `#FEE2E2` | Fundo badge AO VIVO |
| `colors.game.scheduled` | `#3B82F6` | Badge AGENDADO |
| `colors.game.scheduledBg` | `#DBEAFE` | Fundo badge AGENDADO |
| `colors.game.finished` | `#22C55E` | Badge FINALIZADO |
| `colors.game.finishedBg` | `#DCFCE7` | Fundo badge FINALIZADO |

### Semânticos

| Token | Uso |
|---|---|
| `colors.text.primary` | Texto principal (`#374151`) |
| `colors.text.secondary` | Texto secundário (`#4B5563`) |
| `colors.text.tertiary` | Texto desabilitado/hints (`#6B7280`) |
| `colors.text.brand` | Texto verde brand (`#0F6B32`) |
| `colors.bg.secondary` | Background de tela (`#F9FAFB`) |
| `colors.border.light` | Divisores (`#E5E7EB`) |

### Especiais

| Token | Hex | Uso |
|---|---|---|
| `colors.gold` | `#FBBF24` | 1º lugar, troféus |
| `colors.silver` | `#D1D5DB` | 2º lugar |
| `colors.bronze` | `#92400E` | 3º lugar |
| `colors.prize` | `#0A47D5` | Cards de prêmio/bolão |

---

## 3. Tipografia

**Arquivo**: `app/design/typography.ts`  
**Import**: `import { typography } from '@/app/design'`

```tsx
// Uso:
<Text style={[typography.subtitle1, { color: colors.text.primary }]}>
  Texto
</Text>
```

| Token | fontSize | fontWeight | Uso |
|---|---|---|---|
| `heading1` | 32 | 900 | Títulos de página grandes |
| `heading2` | 28 | 900 | Títulos de seção destaque |
| `heading3` | 24 | 700 | Títulos de seção padrão |
| `subtitle1` | 18 | 700 | Títulos de card, labels primários |
| `subtitle2` | 16 | 600 | Labels, tags |
| `body1` | 14 | 500 | Texto de corpo, descrições |
| `body2` | 13 | 400 | Texto terciário |
| `caption` | 12 | 400 | Timestamps, datas, hints |
| `caption2` | 11 | 400 | Extra small |
| `number` | 24 | 800 | Placares (tabular-nums) |
| `numberSm` | 18 | 700 | Placares compactos |
| `buttonLg` | 16 | 700 | Botões grandes |
| `buttonMd` | 14 | 600 | Botões médios |
| `label` | 12 | 700 | Labels em caps, badges |

---

## 4. Espaçamento

**Arquivo**: `app/design/spacing.ts`  
**Import**: `import { spacing, radius } from '@/app/design'`

### Escala de espaço (base 4px)

| Token | px | Uso típico |
|---|---|---|
| `spacing.xs` | 4 | Gap entre ícone e label |
| `spacing.sm` | 8 | Gap interno de badge, padding pequeno |
| `spacing.md` | 16 | **Padding padrão de card e container** |
| `spacing.lg` | 24 | Espaço entre seções |
| `spacing.xl` | 32 | Espaço maior entre blocos |
| `spacing.xxl` | 48 | paddingBottom de ScrollView |

### Border Radius

| Token | px | Uso |
|---|---|---|
| `radius.sm` | 8 | Chips, tags pequenas |
| `radius.md` | 12 | Cards padrão |
| `radius.lg` | 16 | Cards principais, botões |
| `radius.xl` | 20 | Cards de destaque |
| `radius.full` | 9999 | Badges redondas, avatares |

---

## 5. Elevation (Sombras)

**Arquivo**: `app/design/elevation.ts`  
**Import**: `import { elevation } from '@/app/design'`

```tsx
// Uso (spread no style):
<View style={[styles.card, elevation.e2]}>
```

| Token | Uso |
|---|---|
| `elevation.e0` | Sem sombra |
| `elevation.e1` | Cards padrão, listas, logos |
| `elevation.e2` | Cards interativos, match card principal |
| `elevation.e3` | Floating cards, elementos flutuantes |
| `elevation.e4` | Modals, dialogs |
| `elevation.brand` | CTAs verdes (sombra colorida) |

---

## 6. Componentes UI

**Import**: `import { AnimatedButton, PulseBadge, SkeletonCard, UserAvatar, LiveScoreCard } from '@/components/ui'`

---

### `AnimatedButton`

Substitui **todos** os `TouchableOpacity` de ação principal.

```tsx
<AnimatedButton
  label="Confirmar Palpite"
  onPress={handleSubmit}
  variant="primary"   // 'primary' | 'secondary' | 'danger' | 'ghost'
  size="lg"           // 'sm' | 'md' | 'lg'
  loading={enviando}
  disabled={false}
  icon={<Ionicons name="checkmark" size={20} color="#FFF" />}
/>
```

**Comportamento automático**: press effect (scale 0.96) + haptic `impact`.

---

### `PulseBadge`

Substitui emojis de status (`📺 AO VIVO`, `📅 AGENDADO`, `✅ FINALIZADO`).

```tsx
<PulseBadge variant="live" />       // Badge completo com texto
<PulseBadge variant="scheduled" />
<PulseBadge variant="finished" />
<PulseBadge variant="live" compact /> // Só o ponto pulsante
```

Variante `"live"` pulsa automaticamente com animação de opacidade e scale.

---

### `SkeletonCard`

Substitui `ActivityIndicator` em loading de listas e cards.

```tsx
// Durante loading de jogos:
{loading ? (
  <SkeletonCard variant="game" count={3} />
) : (
  <FlatList ... />
)}

// Variantes disponíveis:
<SkeletonCard variant="game" />     // Card de jogo (times + placar + toggle)
<SkeletonCard variant="ranking" />  // Item de ranking (avatar + nome + pontos)
<SkeletonCard variant="score" />    // Card de placar compacto
```

---

### `UserAvatar`

Substitui avatares genéricos com iniciais de cor fixa.

```tsx
<UserAvatar
  nome="João Silva"
  size="md"        // 'sm' | 'md' | 'lg' | 'xl'
  rank={1}         // Opcional: 1|2|3 usa cor de medalha
/>
```

Cor gerada automaticamente e consistente por nome (mesmo usuário sempre tem a mesma cor).

---

### `LiveScoreCard`

Card completo de placar com badge pulsante e animação ao mudar score.

```tsx
<LiveScoreCard
  timeCasa={{ nome: 'Brasil', logo: 'https://...' }}
  timeVisitante={{ nome: 'Argentina', logo: 'https://...' }}
  golsCasa={2}
  golsVisitante={1}
  status="STATUS_IN_PROGRESS"
  dataJogo="2026-06-22T18:00:00Z"
/>
```

---

## 7. Hooks

**Import**: `import { useHaptics } from '@/hooks/useHaptics'`

### `useHaptics`

```tsx
const haptics = useHaptics();

haptics.select()   // Seleção leve — toggle, checkboxes
haptics.impact()   // Impacto médio — botões de CTA
haptics.success()  // Padrão iOS de sucesso — confirmação de aposta
haptics.warning()  // Alerta duplo — ação irreversível
haptics.error()    // Negativo — falha, acesso negado
haptics.light()    // Impacto leve — score ao vivo
```

**Tabela de uso por ação**:

| Ação | Haptic |
|---|---|
| Toque em CTA (confirmar palpite, encerrar rodada) | `impact` |
| Incrementar/decrementar score | `select` |
| Aposta confirmada com sucesso | `success` |
| Toggle abrir/fechar jogo | `select` |
| Erro / acesso negado | `error` |
| Score ao vivo atualizado | `light` |

---

### `useButtonPress`

```tsx
const { animatedStyle, onPressIn, onPressOut } = useButtonPress();
// Aplicar em Pressable + Animated.View
```

Escala de 1 → 0.96 com spring ao pressionar. Já embutido no `AnimatedButton`.

---

### `usePulseAnimation`

```tsx
const { pulseStyle } = usePulseAnimation(isActive);
// Aplicar em Animated.View — pulsa opacidade e scale quando isActive=true
```

Já embutido no `PulseBadge`. Use diretamente para casos customizados.

---

## 8. Motion (MotiView)

**Import**: `import { MotiView } from 'moti'`

### Padrão de fade-in de lista (delay escalonado)

```tsx
<FlatList
  renderItem={({ item, index }) => (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 350, delay: index * 60 }}
    >
      <ItemCard item={item} />
    </MotiView>
  )}
/>
```

### Padrão de empty/error state

```tsx
<MotiView
  from={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ type: 'timing', duration: 400 }}
>
  {/* Conteúdo do empty state */}
</MotiView>
```

### Padrão de header de tela

```tsx
<MotiView
  from={{ opacity: 0, translateY: -8 }}
  animate={{ opacity: 1, translateY: 0 }}
  transition={{ type: 'timing', duration: 400 }}
>
  {/* Header */}
</MotiView>
```

---

## 9. Checklist de Conformidade

Antes de qualquer PR que altere UI, verificar:

- [ ] Nenhuma cor hardcoded (`'#0F6B32'` → `colors.primary.DEFAULT`)
- [ ] Nenhum padding/margin numérico avulso (`16` → `spacing.md`)
- [ ] Nenhum border-radius avulso (`12` → `radius.md`)
- [ ] Nenhuma sombra avulsa → usar `elevation.e1` a `elevation.e4`
- [ ] `ActivityIndicator` em loading de lista → substituído por `SkeletonCard`
- [ ] Emojis de status (`📺📅✅`) → substituídos por `PulseBadge`
- [ ] CTAs principais usam `AnimatedButton`
- [ ] Haptic em toda ação de usuário (CTA, toggle, confirmação)
- [ ] Listas usam `MotiView` com delay escalonado por index
- [ ] Lógica de negócio, Store e API intactos

---

## 10. Estrutura de Arquivos

```
bolao-app/
├── app/
│   └── design/
│       ├── colors.ts       ← paleta
│       ├── typography.ts   ← escala tipográfica
│       ├── spacing.ts      ← espaçamento e radius
│       ├── elevation.ts    ← sombras
│       └── index.ts        ← barrel export
├── components/
│   └── ui/
│       ├── AnimatedButton.tsx
│       ├── PulseBadge.tsx
│       ├── SkeletonCard.tsx
│       ├── UserAvatar.tsx
│       ├── LiveScoreCard.tsx
│       └── index.ts
└── hooks/
    ├── useHaptics.ts
    ├── useButtonPress.ts
    └── usePulseAnimation.ts
```

---

*PALPITE 10 Design System v2.0 — Junho 2026*