export const colors = {
  // Primárias
  primary: {
    DEFAULT: '#0F6B32',    // Verde Brasil
    light: '#0FA946',      // Verde claro
    dark: '#044A22',       // Verde escuro
    bg: '#D1E8D9',         // Fundo badge verde
    muted: '#E8F5EC',      // Fundo ícone, áreas sutis
  },

  // Status de Jogo
  game: {
    live: '#EF4444',       // Vermelho ao vivo
    liveBg: '#FEE2E2',     // Fundo badge ao vivo
    scheduled: '#3B82F6',  // Azul agendado
    scheduledBg: '#DBEAFE',// Fundo badge agendado
    finished: '#22C55E',   // Verde finalizado
    finishedBg: '#DCFCE7', // Fundo badge finalizado
  },

  // Semânticos — Texto
  text: {
    primary: '#374151',    // Cinza escuro — texto principal
    secondary: '#4B5563',  // Cinza médio — texto secundário
    tertiary: '#6B7280',   // Cinza claro — hints, desabilitado
    brand: '#0F6B32',      // Verde brand — destaques
  },

  // Semânticos — Background
  bg: {
    primary: '#FFFFFF',    // Fundo principal (branco)
    secondary: '#F9FAFB',  // Fundo de tela (cinza claro)
    tertiary: '#F3F4F6',   // Fundo alternativo
  },

  // Divisores
  border: {
    light: '#E5E7EB',      // Divisor padrão
    lighter: '#F3F4F6',    // Divisor ainda mais suave
  },

  // Especiais — Ranking
  gold: '#FBBF24',         // 1º lugar
  silver: '#D1D5DB',       // 2º lugar
  bronze: '#92400E',       // 3º lugar
  prize: '#0A47D5',        // Cards de prêmio/bolão

  // Feedback (opcional, para futura expansão)
  success: '#22C55E',
  warning: '#EAB308',
  error: '#EF4444',
  info: '#3B82F6',
} as const;
