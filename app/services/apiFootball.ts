/**
 * Serviço de integração com a API-Football (RapidAPI)
 * Responsável por buscar jogos, placares e informações em tempo real
 */

import { CONFIG } from '../config';

// Tipos de dados
export interface Fixture {
  id: number;
  date: string;
  status: string;
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    periods: {
      first: number | null;
      second: number | null;
    };
    venue: {
      id: number;
      name: string;
      city: string;
    };
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
    round: string;
  };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
}

export interface JogoApiFootball {
  fixtureId: number;
  dataJogo: string;
  status: string;
  timeCasa: {
    nome: string;
    logo: string;
  };
  timeVisitante: {
    nome: string;
    logo: string;
  };
  golsCasa: number | null;
  golsVisitante: number | null;
  rodada: string;
}

const API_HOST = 'api-football-v1.p.rapidapi.com';
const API_KEY = CONFIG.API_FOOTBALL_KEY;

/**
 * Buscar todos os jogos de uma rodada específica
 * @param leagueId ID da liga (ex: 39 para Premier League)
 * @param season Temporada (ex: 2024)
 * @param round Rodada (ex: "Regular Season - 1")
 */
export const buscarJogosDaRodada = async (
  leagueId: number,
  season: number,
  round: string
): Promise<JogoApiFootball[]> => {
  if (!API_KEY) {
    console.error('❌ API_KEY não configurada em config.ts');
    return [];
  }

  try {
    console.log(`[API] Buscando jogos: Liga ${leagueId}, Temporada ${season}, Rodada ${round}`);

    const url = new URL(`https://${API_HOST}/fixtures`);
    url.searchParams.append('league', String(leagueId));
    url.searchParams.append('season', String(season));
    url.searchParams.append('round', round);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST,
      },
    });

    if (!response.ok) {
      console.error(`❌ Erro HTTP ${response.status} ao buscar jogos`);
      return [];
    }

    const data = await response.json();

    if (!data.response || !Array.isArray(data.response)) {
      console.warn('⚠️ Resposta inválida da API');
      return [];
    }

    // Mapear resposta para formato interno
    const jogos: JogoApiFootball[] = data.response.map((fixture: Fixture) => ({
      fixtureId: fixture.fixture.id,
      dataJogo: fixture.fixture.date,
      status: fixture.fixture.status.short,
      timeCasa: {
        nome: fixture.teams.home.name,
        logo: fixture.teams.home.logo,
      },
      timeVisitante: {
        nome: fixture.teams.away.name,
        logo: fixture.teams.away.logo,
      },
      golsCasa: fixture.goals.home,
      golsVisitante: fixture.goals.away,
      rodada: fixture.league.round,
    }));

    console.log(`✅ ${jogos.length} jogos encontrados`);
    return jogos;
  } catch (error) {
    console.error('❌ Erro ao buscar jogos da rodada:', error);
    return [];
  }
};

/**
 * Buscar placar em tempo real de um jogo específico
 * @param fixtureId ID do fixture
 */
export const buscarPlacarAoVivo = async (fixtureId: number): Promise<JogoApiFootball | null> => {
  if (!API_KEY) {
    console.error('❌ API_KEY não configurada em config.ts');
    return null;
  }

  try {
    console.log(`[API] Buscando placar ao vivo: Fixture ${fixtureId}`);

    const url = new URL(`https://${API_HOST}/fixtures`);
    url.searchParams.append('id', String(fixtureId));

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST,
      },
    });

    if (!response.ok) {
      console.error(`❌ Erro HTTP ${response.status} ao buscar placar`);
      return null;
    }

    const data = await response.json();

    if (!data.response || data.response.length === 0) {
      console.warn('⚠️ Jogo não encontrado');
      return null;
    }

    const fixture = data.response[0] as Fixture;

    const jogo: JogoApiFootball = {
      fixtureId: fixture.fixture.id,
      dataJogo: fixture.fixture.date,
      status: fixture.fixture.status.short,
      timeCasa: {
        nome: fixture.teams.home.name,
        logo: fixture.teams.home.logo,
      },
      timeVisitante: {
        nome: fixture.teams.away.name,
        logo: fixture.teams.away.logo,
      },
      golsCasa: fixture.goals.home,
      golsVisitante: fixture.goals.away,
      rodada: fixture.league.round,
    };

    console.log(`✅ Placar carregado: ${jogo.timeCasa.nome} ${jogo.golsCasa} x ${jogo.golsVisitante} ${jogo.timeVisitante.nome}`);
    return jogo;
  } catch (error) {
    console.error('❌ Erro ao buscar placar ao vivo:', error);
    return null;
  }
};

/**
 * Buscar status final de múltiplos fixtures
 * @param fixtureIds Array de IDs de fixtures
 */
export const buscarStatusFinalMultiplos = async (fixtureIds: number[]): Promise<JogoApiFootball[]> => {
  if (!API_KEY) {
    console.error('❌ API_KEY não configurada em config.ts');
    return [];
  }

  try {
    const jogos: JogoApiFootball[] = [];

    // Fazer requisições em paralelo (máx 5 por vez para não sobrecarregar)
    for (let i = 0; i < fixtureIds.length; i += 5) {
      const batch = fixtureIds.slice(i, i + 5);
      const promises = batch.map(id => buscarPlacarAoVivo(id));
      const resultados = await Promise.all(promises);
      
      resultados.forEach(jogo => {
        if (jogo) jogos.push(jogo);
      });

      // Aguardar 1 segundo entre batches para não exceder rate limit
      if (i + 5 < fixtureIds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`✅ ${jogos.length} jogos finalizados carregados`);
    return jogos;
  } catch (error) {
    console.error('❌ Erro ao buscar status final múltiplo:', error);
    return [];
  }
};

export default {
  buscarJogosDaRodada,
  buscarPlacarAoVivo,
  buscarStatusFinalMultiplos,
};
