interface Fixture {
  fixtureId: string;
  timeCasa: {
    id: string;
    nome: string;
    logo: string;
  };
  timeVisitante: {
    id: string;
    nome: string;
    logo: string;
  };
  dataJogo: string;
  dataKickoff: number;
  status: string;
  golsCasa: number;
  golsVisitante: number;
  tempoRestante?: number;
}

interface Placar {
  fixtureId: string;
  status: string;
  golsCasa: number;
  golsVisitante: number;
  finalizado: boolean;
  timeCasa: string;
  timeVisitante: string;
}

const ESPN_COPA_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';

/**
 * Mapeia status da ESPN para status padronizados da aplicação
 * ESPN status values: 'pre', 'post', 'postponed', 'in_progress', etc
 */
const mapearStatusESPN = (statusESPN: string): string => {
  if (!statusESPN) return 'STATUS_SCHEDULED';
  
  // Finalizado
  if (statusESPN === 'post' || statusESPN === 'STATUS_FINAL') {
    return 'STATUS_FINAL';
  }
  
  // Agendado/Pré-jogo
  if (statusESPN === 'pre' || statusESPN === 'STATUS_SCHEDULED') {
    return 'STATUS_SCHEDULED';
  }
  
  // Adiado
  if (statusESPN === 'postponed') {
    return 'STATUS_POSTPONED';
  }
  
  // Tudo o mais é considerado em andamento
  return 'STATUS_IN_PROGRESS';
};

export const apiSports = {
  /**
   * Busca TODOS os jogos com todos os status (SCHEDULED, IN_PROGRESS, FINAL)
   * Usado por GerenciarRodadaScreen para aplicar filtros inteligentes de exibição
   */
  async buscarTodosJogosComStatus(): Promise<Fixture[]> {
    try {
      console.log('🔄 Buscando TODOS os jogos da ESPN...');
      
      const response = await fetch(ESPN_COPA_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na ESPN API: ${response.status}`);
      }

      const data = await response.json();

      if (!data.events || data.events.length === 0) {
        console.warn('⚠️ Nenhum evento encontrado na ESPN');
        return [];
      }

      const allFixtures: Fixture[] = data.events.map((event: any) => {
        const competition = event.competitions?.[0];
        const homeTeam = competition?.competitors?.[0];
        const awayTeam = competition?.competitors?.[1];
        const dataKickoff = new Date(event.date).getTime();

        return {
          fixtureId: event.id,
          timeCasa: {
            id: homeTeam?.id || '',
            nome: homeTeam?.team?.name || 'Time Casa',
            logo: homeTeam?.team?.logo || '',
          },
          timeVisitante: {
            id: awayTeam?.id || '',
            nome: awayTeam?.team?.name || 'Time Visitante',
            logo: awayTeam?.team?.logo || '',
          },
          dataJogo: event.date,
          dataKickoff,
          status: mapearStatusESPN(event.status?.type?.name),
          golsCasa: homeTeam?.score ?? 0,
          golsVisitante: awayTeam?.score ?? 0,
        };
      });

      console.log(`✅ ${allFixtures.length} jogos carregados da ESPN`);
      return allFixtures;
    } catch (error) {
      console.error('❌ Erro ao buscar jogos:', error);
      return [];
    }
  },

  /**
   * Busca jogos futuros (SCHEDULED) com filtro de 30 min de antecedência
   * Legado - mantido para compatibilidade
   */
  async buscarJogosCopaESPN(): Promise<Fixture[]> {
    try {
      console.log('🔄 Buscando jogos agendados da Copa...');
      
      const response = await fetch(ESPN_COPA_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na ESPN API: ${response.status}`);
      }

      const data = await response.json();

      if (!data.events || data.events.length === 0) {
        console.warn('⚠️ Nenhum evento encontrado');
        return [];
      }

      const agora = Date.now();
      const TEMPO_ANTECEDENCIA_MS = 30 * 60 * 1000;

      const fixtures: Fixture[] = data.events
        .map((event: any) => {
          const competition = event.competitions?.[0];
          const homeTeam = competition?.competitors?.[0];
          const awayTeam = competition?.competitors?.[1];
          const dataKickoff = new Date(event.date).getTime();
          const status = mapearStatusESPN(event.status?.type?.name);

          return {
            fixtureId: event.id,
            timeCasa: {
              id: homeTeam?.id || '',
              nome: homeTeam?.team?.name || 'Time Casa',
              logo: homeTeam?.team?.logo || '',
            },
            timeVisitante: {
              id: awayTeam?.id || '',
              nome: awayTeam?.team?.name || 'Time Visitante',
              logo: awayTeam?.team?.logo || '',
            },
            dataJogo: event.date,
            dataKickoff,
            status,
            golsCasa: homeTeam?.score ?? 0,
            golsVisitante: awayTeam?.score ?? 0,
            tempoRestante: dataKickoff - agora,
          };
        })
        .filter(f => f.status === 'STATUS_SCHEDULED' && f.tempoRestante! > TEMPO_ANTECEDENCIA_MS)
        .sort((a, b) => a.dataKickoff - b.dataKickoff);

      console.log(`✅ ${fixtures.length} jogos com filtro`);
      return fixtures;
    } catch (error) {
      console.error('❌ Erro ao buscar jogos:', error);
      return [];
    }
  },

  async buscarPlacarAoVivo(fixtureId: string): Promise<Placar | null> {
    try {
      const response = await fetch(ESPN_COPA_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na ESPN API: ${response.status}`);
      }

      const data = await response.json();

      const evento = data.events?.find((e: any) => e.id === fixtureId);
      if (!evento) {
        console.warn(`⚠️ Evento ${fixtureId} não encontrado`);
        return null;
      }

      const competition = evento.competitions?.[0];
      const homeTeam = competition?.competitors?.[0];
      const awayTeam = competition?.competitors?.[1];
      const status = mapearStatusESPN(evento.status?.type?.name);

      const placar: Placar = {
        fixtureId: evento.id,
        status,
        golsCasa: homeTeam?.score ?? 0,
        golsVisitante: awayTeam?.score ?? 0,
        finalizado: status === 'STATUS_FINAL',
        timeCasa: homeTeam?.team?.name || 'Time Casa',
        timeVisitante: awayTeam?.team?.name || 'Time Visitante',
      };

      return placar;
    } catch (error) {
      console.warn('⚠️ Erro ao buscar placar:', error);
      return null;
    }
  },

  async buscarPlacaresFinalizado(): Promise<Placar[]> {
    try {
      const response = await fetch(ESPN_COPA_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na ESPN API: ${response.status}`);
      }

      const data = await response.json();

      if (!data.events) {
        return [];
      }

      const placares: Placar[] = data.events
        .filter((evento: any) => mapearStatusESPN(evento.status?.type?.name) === 'STATUS_FINAL')
        .map((evento: any) => {
          const competition = evento.competitions?.[0];
          const homeTeam = competition?.competitors?.[0];
          const awayTeam = competition?.competitors?.[1];

          return {
            fixtureId: evento.id,
            status: 'STATUS_FINAL',
            golsCasa: homeTeam?.score ?? 0,
            golsVisitante: awayTeam?.score ?? 0,
            finalizado: true,
            timeCasa: homeTeam?.team?.name || 'Time Casa',
            timeVisitante: awayTeam?.team?.name || 'Time Visitante',
          };
        });

      console.log(`✅ ${placares.length} placares finalizados`);
      return placares;
    } catch (error) {
      console.warn('⚠️ Erro ao buscar placares finalizados:', error);
      return [];
    }
  },
};
