export interface RegistroHistorico {
  email: string;
  fixtureId: string;
  palpiteBrasil: number;
  palpiteEscocia: number;
  resultado: 'vitoria' | 'derrota';
  pontosGanhos: number;
  dataJogo: string;
}

export interface Aposta {
  id: string;
  fixtureId: string;
  email: string;
  golsCasa: number;
  golsVisitante: number;
  pago: boolean;
  criadoEm: number;
}

export interface Jogo {
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
  status: string;
  aberto: boolean;
  golsCasa?: number;
  golsVisitante?: number;
}

export interface PlacorOficial {
  fixtureId: string;
  golsBrasil: number | null;
  golsEscocia: number | null;
  dataAtualizacao: number;
}

export interface Usuario {
  id?: string;
  email: string;
  cpf: string;
  senha: string;
  isAdmin: boolean;
}

export interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'sucesso' | 'resultado' | 'sistema' | 'aviso';
  timestamp: number;
  lida: boolean;
}

export const dadosGlobais = {
  participantesCadastrados: new Set<string>(),
  listaFormatada: [] as Array<{
    id: string;
    nome: string;
    tempo: string;
  }>,
  apostas: [] as Aposta[],
  placoresOficiais: [] as PlacorOficial[],
  historicoJogos: [] as RegistroHistorico[],
  jogosAbertosParaAposta: [] as string[],
  jogosDisponiveis: [] as Jogo[],
  usuariosCadastrados: [
    {
      id: '1',
      email: 'adminpalpite10@gmail.com',
      cpf: '00000000000',
      senha: 'PalpiteDG@1533',
      isAdmin: true
    }
  ] as Usuario[],
  notificacoes: [] as Notificacao[]
};

// ==================== GERENCIAMENTO DE JOGOS ABERTOS ====================

export const abrirJogoParaAposta = (fixtureId: string): boolean => {
  // Verificar se já está aberto
  if (dadosGlobais.jogosAbertosParaAposta.includes(fixtureId)) {
    console.log(`⚠️ Fixture ${fixtureId} já está aberto para apostas`);
    return false;
  }

  dadosGlobais.jogosAbertosParaAposta.push(fixtureId);
  console.log(`✅ Jogo ${fixtureId} aberto para apostas`);
  return true;
};

export const fecharJogoParaAposta = (fixtureId: string): boolean => {
  const index = dadosGlobais.jogosAbertosParaAposta.indexOf(fixtureId);
  if (index === -1) {
    console.log(`⚠️ Fixture ${fixtureId} não está aberto`);
    return false;
  }

  dadosGlobais.jogosAbertosParaAposta.splice(index, 1);
  console.log(`✅ Jogo ${fixtureId} fechado para apostas`);
  return true;
};

export const obterJogosAbertos = (): string[] => {
  return [...dadosGlobais.jogosAbertosParaAposta];
};

export const adicionarApostaMultiplo = (
  email: string,
  fixtureId: string,
  golsCasa: number,
  golsVisitante: number
): boolean => {
  // Verificar se o jogo está aberto
  if (!dadosGlobais.jogosAbertosParaAposta.includes(fixtureId)) {
    console.log(`❌ Jogo ${fixtureId} não está aberto para apostas`);
    return false;
  }

  // Verificar se já tem aposta do mesmo usuário para este fixture
  const apostaExistente = dadosGlobais.apostas.find(
    a => a.email === email && a.fixtureId === fixtureId
  );

  if (apostaExistente) {
    console.log(`⚠️ Usuário ${email} já tem aposta para o jogo ${fixtureId}`);
    return false;
  }

  const novaAposta: Aposta = {
    id: String(Date.now()),
    fixtureId,
    email,
    golsCasa,
    golsVisitante,
    pago: false,
    criadoEm: Date.now(),
  };

  dadosGlobais.apostas.push(novaAposta);
  console.log(`✅ Aposta adicionada: ${email} -> Fixture ${fixtureId}`);
  return true;
};

export const obterApostasDoUsuario = (email: string): Aposta[] => {
  return dadosGlobais.apostas.filter(a => a.email === email);
};

export const obterApostasDoFixture = (fixtureId: string): Aposta[] => {
  return dadosGlobais.apostas.filter(a => a.fixtureId === fixtureId);
};

export const removerApostasFixture = (fixtureId: string): void => {
  const apostasBefore = dadosGlobais.apostas.length;
  dadosGlobais.apostas = dadosGlobais.apostas.filter(a => a.fixtureId !== fixtureId);
  const apostasRemovidas = apostasBefore - dadosGlobais.apostas.length;
  console.log(`✅ ${apostasRemovidas} aposta(s) removida(s) para o fixture ${fixtureId}`);
};

// ==================== GERENCIAMENTO DE PLACARES ====================

export const definirPlacorOfficialMultiplo = (
  fixtureId: string,
  golsCasa: number,
  golsVisitante: number
): void => {
  // Remover placar anterior se existir
  const indexAntigo = dadosGlobais.placoresOficiais.findIndex(
    p => p.fixtureId === fixtureId
  );

  if (indexAntigo !== -1) {
    dadosGlobais.placoresOficiais.splice(indexAntigo, 1);
  }

  dadosGlobais.placoresOficiais.push({
    fixtureId,
    golsBrasil: golsCasa,
    golsEscocia: golsVisitante,
    dataAtualizacao: Date.now(),
  });

  console.log(`✅ Placar oficial definido: Fixture ${fixtureId} -> ${golsCasa}x${golsVisitante}`);
};

export const obterPlacorOfficialFixture = (fixtureId: string): PlacorOficial | null => {
  return dadosGlobais.placoresOficiais.find(p => p.fixtureId === fixtureId) || null;
};

// ==================== PROCESSAMENTO FIM DE RODADA ====================

export const processarFimDeRodada = async (
  fixturesFinalizados: Array<{ fixtureId: string; golsCasa: number; golsVisitante: number }>
): Promise<number> => {
  let vencedoresCount = 0;

  try {
    console.log(`[RODADA] Processando ${fixturesFinalizados.length} jogos finalizados`);

    // Para cada fixture finalizado
    fixturesFinalizados.forEach(finalizado => {
      const { fixtureId, golsCasa, golsVisitante } = finalizado;

      // Obter todas as apostas para este fixture
      const apostasFixture = obterApostasDoFixture(fixtureId);

      console.log(`[FIXTURE ${fixtureId}] Processando ${apostasFixture.length} aposta(s)`);

      // Processar cada aposta
      apostasFixture.forEach(aposta => {
        const acertouPlacaExato =
          aposta.golsCasa === golsCasa && aposta.golsVisitante === golsVisitante;

        const registro: RegistroHistorico = {
          email: aposta.email,
          fixtureId,
          palpiteBrasil: aposta.golsCasa,
          palpiteEscocia: aposta.golsVisitante,
          resultado: acertouPlacaExato ? 'vitoria' : 'derrota',
          pontosGanhos: acertouPlacaExato ? 50 : 0,
          dataJogo: new Date().toISOString(),
        };

        dadosGlobais.historicoJogos.push(registro);

        if (acertouPlacaExato) {
          vencedoresCount++;
          console.log(`✅ Vencedor: ${aposta.email} (${aposta.golsCasa}x${aposta.golsVisitante})`);
          adicionarNotificacao(
            'Vitória!',
            `Seu palpite de ${aposta.golsCasa}x${aposta.golsVisitante} foi correto! +50 pontos`,
            'resultado'
          );
        } else {
          console.log(`❌ Derrota: ${aposta.email} (palpitou ${aposta.golsCasa}x${aposta.golsVisitante}, resultado ${golsCasa}x${golsVisitante})`);
        }
      });

      // Remover fixture da lista de abertos
      fecharJogoParaAposta(fixtureId);

      // Remover apostas processadas para liberar memória
      removerApostasFixture(fixtureId);

      // Definir placar oficial
      definirPlacorOfficialMultiplo(fixtureId, golsCasa, golsVisitante);
    });

    console.log(`✅ Rodada processada. ${vencedoresCount} vencedor(es) encontrado(s)`);
    return vencedoresCount;
  } catch (error) {
    console.error('❌ Erro ao processar fim de rodada:', error);
    return 0;
  }
};

export const removerParticipante = (email: string) => {
  dadosGlobais.participantesCadastrados.delete(email);
  
  // Remove também da lista formatada
  const parteAntesDoAt = email.split('@')[0];
  const nomeTratado = parteAntesDoAt
    .split('.')
    .map(pala => pala.charAt(0).toUpperCase() + pala.slice(1))
    .join('.');
  
  dadosGlobais.listaFormatada = dadosGlobais.listaFormatada.filter(
    item => item.nome !== nomeTratado
  );

  // Remove também do array de apostas
  dadosGlobais.apostas = dadosGlobais.apostas.filter(a => a.email !== email);
  
  console.log('✅ Participante removido:', email);
};

export const adicionarParticipante = (email: string, palpiteBrasil: number, palpiteEscocia: number, fixtureId: string) => {
  const parteAntesDoAt = email.split('@')[0];
  const nomeTratado = parteAntesDoAt
    .split('.')
    .map(pala => pala.charAt(0).toUpperCase() + pala.slice(1))
    .join('.');

  dadosGlobais.participantesCadastrados.add(email);
  dadosGlobais.listaFormatada.unshift({
    id: String(Date.now()),
    nome: nomeTratado,
    tempo: 'Agora há pouco'
  });

  // Adicionar aposta com múltiplos jogos
  const novaAposta: Aposta = {
    id: String(Date.now()),
    fixtureId,
    email,
    golsCasa: palpiteBrasil,
    golsVisitante: palpiteEscocia,
    pago: true,
    criadoEm: Date.now(),
  };

  dadosGlobais.apostas.push(novaAposta);

  console.log('✅ Participante adicionado:', email, { palpiteBrasil, palpiteEscocia, fixtureId });
};

export const obterTotalParticipantes = (): number => {
  return dadosGlobais.participantesCadastrados.size;
};

export const obterListaParticipantes = () => {
  return dadosGlobais.listaFormatada;
};

export const obterApostaAtual = (email: string): Aposta | null => {
  return dadosGlobais.apostas.find(a => a.email === email) || null;
};

export const obterTodasApostas = (): Aposta[] => {
  return dadosGlobais.apostas;
};

export const obterPlacorOficial = (): PlacorOficial | null => {
  return dadosGlobais.placoresOficiais.length > 0 ? dadosGlobais.placoresOficiais[0] : null;
};

export const definirPlacorOficial = (golsBrasil: number, golsEscocia: number, fixtureId?: string) => {
  const fixture = fixtureId || '0';
  const index = dadosGlobais.placoresOficiais.findIndex(p => p.fixtureId === fixture);

  if (index !== -1) {
    dadosGlobais.placoresOficiais[index].golsBrasil = golsBrasil;
    dadosGlobais.placoresOficiais[index].golsEscocia = golsEscocia;
  } else {
    dadosGlobais.placoresOficiais.push({
      fixtureId: fixture,
      golsBrasil,
      golsEscocia,
      dataAtualizacao: Date.now(),
    });
  }
  console.log('✅ Placar oficial definido:', { golsBrasil, golsEscocia, fixtureId });
};

export const obterHistoricoUsuario = (email: string): RegistroHistorico[] => {
  return dadosGlobais.historicoJogos.filter(registro => registro.email === email);
};

export const obterUltimoRegistroUsuario = (email: string): RegistroHistorico | null => {
  const historico = obterHistoricoUsuario(email);
  return historico.length > 0 ? historico[historico.length - 1] : null;
};

export const contarVitoriasUsuario = (email: string): number => {
  return obterHistoricoUsuario(email).filter(r => r.resultado === 'vitoria').length;
};

export const calcularPontosUsuario = (email: string): number => {
  return obterHistoricoUsuario(email).reduce((total, r) => total + r.pontosGanhos, 0);
};

export const tornarAdmin = (email: string): boolean => {
  const usuario = dadosGlobais.usuariosCadastrados.find(u => u.email === email);
  if (usuario) {
    usuario.isAdmin = true;
    console.log('✅ Usuário promovido a admin:', email);
    return true;
  }
  console.log('❌ Usuário não encontrado:', email);
  return false;
};

// ==================== FUNÇÕES DE RANKING ====================

export interface RankingItem {
  id: string;
  nome: string;
  email: string;
  pontos: number;
  posicao: number;
}

export const calcularRanking = (): RankingItem[] => {
  try {
    // Mapear cada usuário com sua pontuação total
    const usuariosComPontos = dadosGlobais.usuariosCadastrados.map((usuario) => {
      // Somar todos os pontos do histórico para este usuário
      const pontosTotais = dadosGlobais.historicoJogos
        .filter(jogo => jogo.email === usuario.email)
        .reduce((total, jogo) => total + jogo.pontosGanhos, 0);

      // Formatar nome: douglas.gabriel@gmail.com -> Douglas.Gabriel
      const parteEmail = usuario.email.split('@')[0];
      const nomeTratado = parteEmail
        .split('.')
        .map(parte => parte.charAt(0).toUpperCase() + parte.slice(1))
        .join('.');

      return {
        id: usuario.email,
        nome: nomeTratado,
        email: usuario.email,
        pontos: pontosTotais,
        posicao: 0 // será atualizado após ordenação
      };
    });

    // Ordenar por pontos (decrescente) e filtrar top 10
    const rankingOrdenado = usuariosComPontos
      .sort((a, b) => b.pontos - a.pontos)
      .slice(0, 10)
      .map((usuario, index) => ({
        ...usuario,
        posicao: index + 1
      }));

    console.log('✅ Ranking calculado:', rankingOrdenado.length, 'usuários');
    return rankingOrdenado;
  } catch (error) {
    console.error('❌ Erro ao calcular ranking:', error);
    return [];
  }
};

export const liquidarJogo = () => {
  const placorOficial = obterPlacorOficial();
  
  if (!placorOficial || placorOficial.golsBrasil === null || placorOficial.golsEscocia === null) {
    console.log('❌ Placar oficial não foi definido');
    return 0;
  }

  let vencedoresCount = 0;

  // Varrer todas as apostas
  dadosGlobais.apostas.forEach((aposta) => {
    // Verificar se o palpite bate exatamente com o placar oficial
    const acertou = aposta.golsCasa === placorOficial.golsBrasil && aposta.golsVisitante === placorOficial.golsEscocia;
    
    const registroHistorico: RegistroHistorico = {
      email: aposta.email,
      fixtureId: aposta.fixtureId,
      palpiteBrasil: aposta.golsCasa,
      palpiteEscocia: aposta.golsVisitante,
      resultado: acertou ? 'vitoria' : 'derrota',
      pontosGanhos: acertou ? 50 : 0,
      dataJogo: new Date().toISOString(),
    };
    
    dadosGlobais.historicoJogos.push(registroHistorico);
    
    if (acertou) {
      vencedoresCount += 1;
      console.log(`✅ Vencedor encontrado: ${aposta.email}`);
    } else {
      console.log(`❌ Derrota: ${aposta.email}`);
    }
  });

  // Limpar dados da rodada atual
  limparRodataAtual();

  console.log(`✅ Jogo liquidado. ${vencedoresCount} vencedor(es) encontrado(s)`);
  return vencedoresCount;
};

export const limparRodataAtual = () => {
  dadosGlobais.participantesCadastrados.clear();
  dadosGlobais.listaFormatada = [];
  dadosGlobais.apostas = [];
  dadosGlobais.jogosAbertosParaAposta = [];
  dadosGlobais.placoresOficiais = [];
  
  console.log('✅ Rodada atual limpa. Próxima rodada iniciada.');
};

export const limparTodosDados = () => {
  dadosGlobais.participantesCadastrados.clear();
  dadosGlobais.listaFormatada = [];
  dadosGlobais.apostas = [];
  dadosGlobais.jogosAbertosParaAposta = [];
  dadosGlobais.jogosDisponiveis = [];
  dadosGlobais.placoresOficiais = [];
  
  console.log('✅ Todos os dados temporários foram limpos.');
};

// ==================== FUNÇÕES DE AUTENTICAÇÃO ====================

export const cadastrarUsuario = (email: string, cpf: string, senha: string): boolean => {
  // Verificar se email já existe
  const emailExiste = dadosGlobais.usuariosCadastrados.find(u => u.email === email);
  if (emailExiste) {
    console.log('❌ Email já cadastrado:', email);
    return false;
  }

  // Verificar se CPF já existe
  const cpfExiste = dadosGlobais.usuariosCadastrados.find(u => u.cpf === cpf);
  if (cpfExiste) {
    console.log('❌ CPF já cadastrado:', cpf);
    return false;
  }

  // Adicionar novo usuário
  const novoUsuario: Usuario = {
    email,
    cpf,
    senha,
    isAdmin: false
  };

  dadosGlobais.usuariosCadastrados.push(novoUsuario);
  console.log('✅ Usuário cadastrado:', email);
  return true;
};

export const validarLogin = (email: string, senha: string): { sucesso: boolean; isAdmin: boolean } => {
  // Regra especial para admin
  if (email === 'adminpalpite10@gmail.com' && senha === 'PalpiteDG@1533') {
    console.log('✅ Login admin bem-sucedido');
    return { sucesso: true, isAdmin: true };
  }

  // Procurar usuário comum
  const usuario = dadosGlobais.usuariosCadastrados.find(
    u => u.email === email && u.senha === senha
  );

  if (usuario) {
    console.log('✅ Login bem-sucedido:', email);
    return { sucesso: true, isAdmin: usuario.isAdmin };
  }

  console.log('❌ Credenciais inválidas:', email);
  return { sucesso: false, isAdmin: false };
};

// ==================== FUNÇÕES DE NOTIFICAÇÕES ====================

export const adicionarNotificacao = (titulo: string, mensagem: string, tipo: 'sucesso' | 'resultado' | 'sistema' | 'aviso') => {
  const notificacao: Notificacao = {
    id: String(Date.now()),
    titulo,
    mensagem,
    tipo,
    timestamp: Date.now(),
    lida: false
  };

  dadosGlobais.notificacoes.unshift(notificacao);
  console.log('✅ Notificação adicionada:', titulo);
};

export const obterNotificacoes = (): Notificacao[] => {
  return dadosGlobais.notificacoes;
};

export const marcarNotificacaoComoLida = (id: string) => {
  const notificacao = dadosGlobais.notificacoes.find(n => n.id === id);
  if (notificacao) {
    notificacao.lida = true;
  }
};

export const limparNotificacoes = () => {
  dadosGlobais.notificacoes = [];
  console.log('✅ Notificações limpas');
};

// ==================== GERENCIAMENTO DE JOGOS DISPONÍVEIS ====================

export const carregarJogosDisponiveis = (jogos: Jogo[]): void => {
  dadosGlobais.jogosDisponiveis = jogos;
  console.log(`✅ ${jogos.length} jogos carregados`);
};

export const obterJogosDisponiveis = (): Jogo[] => {
  return dadosGlobais.jogosDisponiveis;
};

export const obterJogosPorFixture = (fixtureId: string): Jogo | undefined => {
  return dadosGlobais.jogosDisponiveis.find(j => j.fixtureId === fixtureId);
};

export const marcarJogoAberto = (fixtureId: string): boolean => {
  const jogo = dadosGlobais.jogosDisponiveis.find(j => j.fixtureId === fixtureId);
  if (!jogo) {
    console.log(`⚠️ Jogo ${fixtureId} não encontrado`);
    return false;
  }

  jogo.aberto = true;
  if (!dadosGlobais.jogosAbertosParaAposta.includes(fixtureId)) {
    dadosGlobais.jogosAbertosParaAposta.push(fixtureId);
  }
  console.log(`✅ Jogo ${fixtureId} aberto para apostas`);
  return true;
};

export const marcarJogoFechado = (fixtureId: string): boolean => {
  const jogo = dadosGlobais.jogosDisponiveis.find(j => j.fixtureId === fixtureId);
  if (!jogo) {
    console.log(`⚠️ Jogo ${fixtureId} não encontrado`);
    return false;
  }

  jogo.aberto = false;
  const index = dadosGlobais.jogosAbertosParaAposta.indexOf(fixtureId);
  if (index !== -1) {
    dadosGlobais.jogosAbertosParaAposta.splice(index, 1);
  }
  console.log(`✅ Jogo ${fixtureId} fechado para apostas`);
  return true;
};

export const obterJogosAbertosFormatados = (): Jogo[] => {
  return dadosGlobais.jogosDisponiveis.filter(j => j.aberto);
};
