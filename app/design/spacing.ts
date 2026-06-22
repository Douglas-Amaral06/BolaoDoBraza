// Escala de espaçamento (base 4px)
export const spacing = {
  xs: 4,      // Gap entre ícone e label
  sm: 8,      // Gap interno de badge, padding pequeno
  md: 16,     // **Padding padrão de card e container**
  lg: 24,     // Espaço entre seções
  xl: 32,     // Espaço maior entre blocos
  xxl: 48,    // paddingBottom de ScrollView
} as const;

// Border radius
export const radius = {
  sm: 8,      // Chips, tags pequenas
  md: 12,     // Cards padrão
  lg: 16,     // Cards principais, botões
  xl: 20,     // Cards de destaque
  full: 9999, // Badges redondas, avatares
} as const;
