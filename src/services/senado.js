// Camada Anticorrupção (ACL) - API Senado V3 (Final)
// Adiciona sufixo .json para garantir resposta correta e logs de debug.

const BASE_URL = '/api/senado';

/**
 * Utilitário: Garante que o dado seja sempre um Array.
 */
export const ensureArray = (data) => {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
};

/**
 * Fetcher genérico com Logs de Debug
 */
const fetchSenado = async (endpoint) => {
  // Garante que o endpoint tenha .json antes dos query params
  // Ex: /relatorias?ano=2024 vira /relatorias.json?ano=2024
  let finalUrl = endpoint;
  if (!endpoint.includes('.json')) {
      const [path, query] = endpoint.split('?');
      finalUrl = `${path}.json${query ? `?${query}` : ''}`;
  }

  const urlCompleta = `${BASE_URL}${finalUrl}`;
  // console.log(`[SENADO API] Request: ${urlCompleta}`); // Descomente para debug

  try {
    const response = await fetch(urlCompleta, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
        console.warn(`[SENADO API] Erro HTTP ${response.status} em ${urlCompleta}`);
        // Tenta ler o erro se for JSON
        try { console.warn(await response.json()); } catch(e) {} 
        throw new Error(`Status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[SENADO API] Falha Crítica em ${finalUrl}:`, error);
    return null;
  }
};

// --- MÉTODOS PÚBLICOS ---

export const getSenadoresAtuais = async () => {
  const raw = await fetchSenado('/senador/lista/atual');
  const lista = raw?.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar;
  
  return ensureArray(lista).map(senador => ({
    id: senador.IdentificacaoParlamentar.CodigoParlamentar,
    nome: senador.IdentificacaoParlamentar.NomeParlamentar,
    partido: senador.IdentificacaoParlamentar.SiglaPartidoParlamentar,
    uf: senador.IdentificacaoParlamentar.UfParlamentar,
    foto: senador.IdentificacaoParlamentar.UrlFotoParlamentar,
    email: senador.IdentificacaoParlamentar.EmailParlamentar,
    mandatos: ensureArray(senador.Mandatos?.Mandato)
  }));
};

export const getSenadorDetalhes = async (id) => {
  if (!id) return null;
  const raw = await fetchSenado(`/senador/${id}`);
  return raw?.DetalheParlamentar?.Parlamentar;
};

// Busca matérias onde o senador é Relator
export const getSenadorRelatorias = async (id, ano) => {
  if (!id) return [];
  // Endpoint: /senador/{id}/relatorias.json?ano={ano}
  const raw = await fetchSenado(`/senador/${id}/relatorias?ano=${ano}`);
  
  // A estrutura pode variar. Tentamos as duas mais comuns:
  // 1. MateriasRelatadas.Materia (Padrão)
  // 2. Relatorias.Materia (Variação antiga)
  const lista = raw?.MateriasRelatadas?.Materia || raw?.Relatorias?.Materia;
  return ensureArray(lista);
};

// Busca histórico de votações
export const getSenadorVotacoes = async (id, ano) => {
  if (!id) return [];
  const raw = await fetchSenado(`/senador/${id}/votacoes?ano=${ano}`);
  return ensureArray(raw?.VotacoesParlamentar?.Parlamentar?.Votacoes?.Votacao);
};

// Busca comissões (Titular ou Suplente)
export const getSenadorComissoes = async (id) => {
  if (!id) return [];
  // Este endpoint geralmente não precisa de ano, traz as atuais
  const raw = await fetchSenado(`/senador/${id}/comissoes`);
  
  // Caminho profundo padrão do Senado
  const lista = raw?.MembroComissaoParlamentar?.Parlamentar?.MembroComissao;
  return ensureArray(lista);
};