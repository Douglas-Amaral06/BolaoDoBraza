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

// URL base — data será injetada dinamicamente
const ESPN_BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';

/**
 * Monta a URL da ESPN para uma data específica (formato YYYYMMDD)
 */
const montarUrlParaData = (data: Date): string => {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ESPN_BASE_URL}?dates=${ano}${mes}${dia}`;
};

/**
 * Mapeia status da ESPN para status padronizados da aplicação.
 * A ESPN retorna type.name como 'STATUS_SCHEDULED', 'STATUS_IN_PROGRESS', 'STATUS_FINAL'
 * e type.state como 'pre', 'in', 'post' — cobrimos ambos para segurança.
 */
const mapearStatusESPN = (typeName: string, typeState?: string): string => {
  // Prioriza type.name (mais específico)
  if (typeName === 'STATUS_FINAL' || typeState === 'post') return 'STATUS_FINAL';
  if (typeName === 'STATUS_IN_PROGRESS' || typeState === 'in') return 'STATUS_IN_PROGRESS';
  if (typeName === 'STATUS_SCHEDULED' || typeState === 'pre') return 'STATUS_SCHEDULED';
  if (typeName === 'STATUS_POSTPONED' || typeName === 'postponed') return 'STATUS_POSTPONED';

  // Fallback seguro
  console.warn(`⚠️ Status ESPN desconhecido: name="${typeName}" state="${typeState}" → tratado como AGENDADO`);
  return 'STATUS_SCHEDULED';
};

/**
 * Busca jogos da ESPN para uma data específica e retorna fixtures mapeados
 */
const buscarFixturesPorData = async (data: Date): Promise<Fixture[]> => {
  const url = montarUrlParaData(data);
  console.log(`🔄 Buscando jogos ESPN: ${url}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`ESPN API HTTP ${response.status}`);
  }

  const json = await response.json();

  if (!json.events || json.events.length === 0) return [];

  return json.events.map((event: any) => {
    const competition = event.competitions?.[0];
    // ESPN retorna competitors[0]=home, competitors[1]=away (verificar homeAway)
    const home = competition?.competitors?.find((c: any) => c.homeAway === 'home')
      ?? competition?.competitors?.[0];
    const away = competition?.competitors?.find((c: any) => c.homeAway === 'away')
      ?? competition?.competitors?.[1];

    const typeName: string = event.status?.type?.name ?? '';
    const typeState: string = event.status?.type?.state ?? '';

    return {
      fixtureId: event.id,
      timeCasa: {
        id: home?.id ?? '',
        nome: home?.team?.displayName ?? home?.team?.name ?? 'Time Casa',
        logo: home?.team?.logo ?? '',
      },
      timeVisitante: {
        id: away?.id ?? '',
        nome: away?.team?.displayName ?? away?.team?.name ?? 'Time Visitante',
        logo: away?.team?.logo ?? '',
      },
      dataJogo: event.date,
      dataKickoff: new Date(event.date).getTime(),
      status: mapearStatusESPN(typeName, typeState),
      golsCasa: Number(home?.score ?? 0),
      golsVisitante: Number(away?.score ?? 0),
    };
  });
};

export const apiSports = {
  /**
   * Busca jogos dos próximos 2 dias + hoje.
   * Faz 3 requisições paralelas (ontem, hoje, amanhã, depois de amanhã)
   * para garantir cobertura da janela de 48h configurada na tela.
   */
  async buscarTodosJogosComStatus(): Promise<Fixture[]> {
    try {
      const hoje = new Date();
      const amanha = new Date(hoje);
      amanha.setDate(hoje.getDate() + 1);
      const depoisDeAmanha = new Date(hoje);
      depoisDeAmanha.setDate(hoje.getDate() + 2);

      console.log('🔄 Buscando jogos ESPN para hoje, amanhã e depois de amanhã...');

      // Requisições paralelas para não travar a UI
      const [jogosHoje, jogosAmanha, jogosDepois] = await Promise.all([
        buscarFixturesPorData(hoje).catch(() => [] as Fixture[]),
        buscarFixturesPorData(amanha).catch(() => [] as Fixture[]),
        buscarFixturesPorData(depoisDeAmanha).catch(() => [] as Fixture[]),
      ]);

      // Unir e deduplicar por fixtureId
      const todos = [...jogosHoje, ...jogosAmanha, ...jogosDepois];
      const vistos = new Set<string>();
      const unicos = todos.filter(f => {
        if (vistos.has(f.fixtureId)) return false;
        vistos.add(f.fixtureId);
        return true;
      });

      console.log(
        `✅ ${unicos.length} jogos únicos (hoje: ${jogosHoje.length}, amanhã: ${jogosAmanha.length}, depois: ${jogosDepois.length})`
      );
      return unicos;
    } catch (error) {
      console.error('❌ Erro ao buscar jogos:', error);
      return []; // NUNCA retorna mock
    }
  },

  /**
   * Busca placares de jogos finalizados (apenas do dia atual)
   */
  async buscarPlacaresFinalizado(): Promise<Placar[]> {
    try {
      const hoje = new Date();
      const fixtures = await buscarFixturesPorData(hoje);

      const placares: Placar[] = fixtures
        .filter(f => f.status === 'STATUS_FINAL')
        .map(f => ({
          fixtureId: f.fixtureId,
          status: 'STATUS_FINAL',
          golsCasa: f.golsCasa,
          golsVisitante: f.golsVisitante,
          finalizado: true,
          timeCasa: f.timeCasa.nome,
          timeVisitante: f.timeVisitante.nome,
        }));

      console.log(`✅ ${placares.length} placares finalizados`);
      return placares;
    } catch (error) {
      console.warn('⚠️ Erro ao buscar placares finalizados:', error);
      return [];
    }
  },

  /**
   * Busca placar ao vivo de um fixture específico
   */
  async buscarPlacarAoVivo(fixtureId: string): Promise<Placar | null> {
    try {
      const hoje = new Date();
      const fixtures = await buscarFixturesPorData(hoje);
      const fixture = fixtures.find(f => f.fixtureId === fixtureId);

      if (!fixture) {
        console.warn(`⚠️ Fixture ${fixtureId} não encontrado`);
        return null;
      }

      return {
        fixtureId: fixture.fixtureId,
        status: fixture.status,
        golsCasa: fixture.golsCasa,
        golsVisitante: fixture.golsVisitante,
        finalizado: fixture.status === 'STATUS_FINAL',
        timeCasa: fixture.timeCasa.nome,
        timeVisitante: fixture.timeVisitante.nome,
      };
    } catch (error) {
      console.warn('⚠️ Erro ao buscar placar ao vivo:', error);
      return null;
    }
  },

  // Mantido para compatibilidade com código legado
  async buscarJogosCopaESPN(): Promise<Fixture[]> {
    return this.buscarTodosJogosComStatus();
  },
};