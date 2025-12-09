/**
 * LEGISLATIVE LOGIC ENGINE (v4.0 - Production Grade)
 * Lógica tolerante a falhas estruturais das APIs governamentais.
 */

const SENATOR_WEIGHTS = {
  RELATORIA_PEC: 10,
  RELATORIA_PL: 5,
  RELATORIA_OUTROS: 1,
  COMISSAO_TITULAR: 100,
  COMISSAO_SUPLENTE: 50,
  COMISSAO_PRESIDENTE_BONUS: 50
};

// Siglas exatas para busca (CCJ, CAE, etc)
const STRATEGIC_COMMISSIONS_SIGLAS = ['CCJ', 'CAE', 'CRE', 'CJ']; 

// Helper de Texto Seguro
export const normalizeText = (text) => {
  if (typeof text !== 'string') return "";
  return text.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// --- MÓDULO DEPUTADOS ---

export const calculateDeputadoAssiduity = (eventos) => {
  if (!eventos || !Array.isArray(eventos) || eventos.length === 0) {
    return { score: 0, label: 'Sem registros', description: 'Nenhuma atividade oficial detectada.' };
  }

  // A API de Eventos do Deputado lista onde ele teve interação.
  // Filtramos apenas para garantir que não são eventos cancelados.
  const atividadesValidas = eventos.filter(e => {
    const situacao = normalizeText(e.situacao || e.descricaoSituacao || '');
    const descricao = normalizeText(e.descricaoTipo || '');
    
    // Ignora eventos cancelados
    if (situacao.includes('CANCELAD') || situacao.includes('ENCERRADA (SEM')) return false;
    
    // Conta Sessões, Reuniões e Comissões
    return descricao.includes('SESSAO') || descricao.includes('REUNIAO') || descricao.includes('AUDIENCIA') || descricao.includes('COMISSAO');
  });

  const count = atividadesValidas.length;
  
  let label = 'Baixa';
  if (count > 200) label = 'Muito Alta';
  else if (count > 100) label = 'Alta';
  else if (count > 50) label = 'Média';

  return {
    score: count,
    label,
    description: count === 1 ? '1 atividade registrada' : `${count} atividades registradas`
  };
};

export const filterComplexProjects = (proposicoes) => {
  if (!proposicoes || !Array.isArray(proposicoes)) return [];
  
  const KEYWORDS = /(CODIGO|REFORMA|DIRETRIZES|ESTATUTO|MARCO|PEC|PLP|COMPLEMENTAR|SISTEMA|POLITICA|LEI)/i;
  
  return proposicoes.filter(p => {
    const ementa = normalizeText(p.ementa);
    const tipo = normalizeText(p.siglaTipo);
    
    // PECs e PLPs sempre entram
    if (tipo === 'PEC' || tipo === 'PLP') return true;
    
    // Filtra irrelevantes
    if (ementa.includes('DENOMINA') || ementa.includes('DIA NACIONAL') || ementa.includes('TITULO DE CIDADAO')) return false;

    return KEYWORDS.test(ementa);
  }).sort((a, b) => b.ano - a.ano).slice(0, 5);
};

// --- MÓDULO SENADORES ---

export const calculateSenatorRelatorScore = (relatorias) => {
  // O Array já deve vir tratado pelo "forceArray" na página
  if (!relatorias || relatorias.length === 0) {
    return { score: 0, resumo: 'Nenhuma relatoria', destaques: [] };
  }

  let score = 0;
  let qtdPEC = 0;
  let qtdPL = 0;
  let destaques = [];

  relatorias.forEach(r => {
    // Navegação segura profunda no objeto do Senado
    const materia = r.Materia || {};
    const ident = materia.IdentificacaoMateria || {};
    
    const sigla = normalizeText(ident.SiglaSubtipoMateria);
    const ementa = materia.EmentaMateria || 'Sem descrição';

    // Pontuação
    if (sigla === 'PEC') {
      score += SENATOR_WEIGHTS.RELATORIA_PEC;
      qtdPEC++;
      destaques.push(r);
    } else if (['PL', 'PLS', 'PLC', 'PLP'].includes(sigla)) {
      score += SENATOR_WEIGHTS.RELATORIA_PL;
      qtdPL++;
      destaques.push(r);
    } else {
      // Outros tipos (Requerimentos, etc) pontuam pouco, mas não entram nos destaques
      score += SENATOR_WEIGHTS.RELATORIA_OUTROS;
    }
  });

  return {
    score,
    resumo: `${qtdPEC} PECs, ${qtdPL} Leis`,
    destaques: destaques.slice(0, 3) // Top 3
  };
};

export const checkStrategicCommissions = (comissoes) => {
  if (!comissoes || comissoes.length === 0) {
    return { score: 0, papeis: [], label: 'Nenhuma' };
  }

  let score = 0;
  const papeis = [];

  comissoes.forEach(c => {
    const ident = c.IdentificacaoComissao || {};
    const sigla = normalizeText(ident.SiglaComissao);
    const nome = normalizeText(ident.NomeComissao);
    const cargo = normalizeText(c.DescricaoParticipacao); // Titular, Suplente

    // Verifica se é estratégica (pela sigla ou nome)
    const isStrategic = STRATEGIC_COMMISSIONS_SIGLAS.some(s => sigla === s || nome.includes(s));

    if (isStrategic) {
      let pts = 0;
      if (cargo.includes('TITULAR')) pts = SENATOR_WEIGHTS.COMISSAO_TITULAR;
      else if (cargo.includes('SUPLENTE')) pts = SENATOR_WEIGHTS.COMISSAO_SUPLENTE;
      
      if (cargo.includes('PRESIDENTE')) pts += SENATOR_WEIGHTS.COMISSAO_PRESIDENTE_BONUS;

      if (pts > 0) {
        score += pts;
        papeis.push(`${ident.SiglaComissao || 'Comissão'} (${c.DescricaoParticipacao})`);
      }
    }
  });

  // Remove duplicatas de papéis
  const papeisUnicos = [...new Set(papeis)];

  let label = 'Baixa';
  if (score >= 200) label = 'Alta Influência';
  else if (score >= 100) label = 'Influente';
  else if (score > 0) label = 'Participante';

  return { score, papeis: papeisUnicos, label };
};

export const calculateSabatinasScore = (votacoes) => {
  if (!votacoes || votacoes.length === 0) return { count: 0, label: 'Nenhuma', description: 'Sem registros' };

  const sabatinas = votacoes.filter(v => {
    const ident = v.Materia?.IdentificacaoMateria || {};
    const sigla = normalizeText(ident.SiglaSubtipoMateria);
    return sigla === 'MSF'; // Mensagem Senado Federal (Indicações de Autoridades)
  });

  const count = sabatinas.length;
  let label = 'Baixa';
  if (count > 5) label = 'Média';
  if (count > 10) label = 'Alta';

  return { count, label, description: 'Autoridades avaliadas' };
};

export const calculateEfficiencyIndex = (gastoTotal, produtividadeScore) => {
  if (!gastoTotal || gastoTotal === 0) return { indice: 'N/A', interpretacao: 'Sem dados de gasto' };
  
  // Normaliza gasto para base 100k
  const custoNormalizado = gastoTotal / 100000;
  
  // Evita divisão por zero
  if (custoNormalizado < 0.1) return { indice: 'Máx', interpretacao: 'Altíssima' };

  const indice = (produtividadeScore / custoNormalizado).toFixed(1);
  
  let interpretacao = 'Regular';
  if (indice > 10) interpretacao = 'Alta';
  if (indice < 2) interpretacao = 'Baixa';

  return { indice, interpretacao };
};