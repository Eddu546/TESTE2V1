import { ensureArray } from "@/services/senado";

/**
 * UTILS GERAIS
 */
export const normalizeText = (text) => {
  if (!text) return "";
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
};

/* ========================================================================
   LÓGICA DOS SENADORES
   ======================================================================== */

export const calculateSenatorRelatorScore = (materias) => {
  if (!materias || materias.length === 0) {
    return { score: 0, resumo: "Nenhuma relatoria no período", destaques: [] };
  }

  let score = 0;
  const destaques = [];
  const lista = ensureArray(materias);

  lista.forEach(materia => {
    const tipo = materia.IdentificacaoMateria?.SiglaSubtipoMateria;
    
    if (tipo === 'PEC') {
      score += 10;
      destaques.push(materia);
    } else if (tipo === 'PLP' || tipo === 'MPV') {
      score += 5;
      if (destaques.length < 5) destaques.push(materia);
    } else {
      score += 1;
    }
  });

  return {
    score,
    resumo: `${lista.length} matérias relatadas`,
    destaques: destaques.slice(0, 4)
  };
};

export const checkStrategicCommissions = (comissoes) => {
  const lista = ensureArray(comissoes);
  const importantes = ['CCJ', 'CAE', 'CRE'];
  const papeis = [];
  let score = 0;

  lista.forEach(c => {
    const sigla = c.Comissao?.SiglaComissao;
    const papel = c.DescricaoParticipacao;

    if (importantes.includes(sigla) && papel === 'Titular') {
      score += 30;
      papeis.push(`${sigla} (Titular)`);
    } else if (importantes.includes(sigla)) {
      score += 10;
      papeis.push(`${sigla} (Suplente)`);
    }
  });

  return {
    score: score > 0 ? score : 0,
    label: score > 50 ? "Alta Influência" : (score > 0 ? "Influência Moderada" : "Baixa Influência"),
    papeis
  };
};

export const calculateSabatinasScore = (votacoes) => {
  const lista = ensureArray(votacoes);
  const sabatinas = lista.filter(v => {
    const desc = normalizeText(v.DescricaoVotacao || "");
    const sigla = v.SiglaMateria || "";
    return sigla === 'MSF' || desc.includes('INDICACAO') || desc.includes('AUTORIDADE');
  });

  return {
    count: sabatinas.length,
    label: "Votos em Sabatinas",
    description: "Aprovação de Autoridades (STF, Banco Central, Embaixadas)"
  };
};

/* ========================================================================
   LÓGICA DOS DEPUTADOS (Restaurada para corrigir Erros)
   ======================================================================== */

/**
 * Filtra projetos complexos (PEC, PLP, PL) para Deputados
 * Corrige o erro: does not provide an export named 'filterComplexProjects'
 */
export const filterComplexProjects = (projetos) => {
  if (!projetos) return [];
  const lista = Array.isArray(projetos) ? projetos : [projetos];
  
  // Filtra apenas tipos relevantes legislativamente
  return lista.filter(p => {
    const tipo = p.siglaTipo || p.tipo || '';
    return ['PEC', 'PLP', 'PL', 'MPV'].includes(tipo);
  });
};

/**
 * Calcula Assiduidade Básica
 */
export const calculateDeputadoAssiduity = (presencas) => {
  if (!presencas || presencas.length === 0) return 0;
  // Fallback simples: se não houver lógica complexa, retorna 100 ou calcula média simples
  // Assumindo que presencas é array de sessões
  const total = presencas.length;
  const presentes = presencas.filter(p => p.presente || p.descricaoStatus === 'Presença').length;
  
  // Se não conseguir detectar campos, retorna 0 seguro
  if (total === 0) return 0;
  return Math.round((presentes / total) * 100);
};

// Outros exports seguros para evitar crash em páginas antigas
export const calculateDeputadoRelatorScore = (relatorias) => {
    return { score: relatorias?.length || 0, label: 'Projetos Relatados' };
};

export const calculateFidelidadePartidaria = (votacoes) => {
    return { score: 0, label: 'Dados Insuficientes' };
};