/* FILE: src/pages/PoliticianProfilePage.jsx */
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Mail, ExternalLink, Loader2, ScrollText, 
  PenTool, CheckCircle2, Shield, GraduationCap, Banknote, 
  HeartPulse, X, Award, Users, Building, PiggyBank, Car, Wallet, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import AdBanner from '@/components/AdBanner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { calculateDeputadoAssiduity, filterComplexProjects, normalizeText } from '@/lib/legislative-logic';

const SimpleModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl sticky top-0 z-10">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-blue-600" /> {title}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500"/>
          </button>
        </div>
        <div className="p-4 overflow-y-auto custom-scrollbar">
          {children}
        </div>
        <div className="p-3 border-t bg-gray-50 rounded-b-xl text-right">
          <Button onClick={onClose} variant="outline" size="sm">Fechar</Button>
        </div>
      </div>
    </div>
  );
};

const ProjectList = ({ lista }) => (
  <div className="space-y-3">
    {lista.slice(0, 3).map((proj) => (
      <div key={proj.id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:border-blue-300 transition-all group">
          <div className="flex justify-between items-start gap-2 mb-2">
              <span className="text-[11px] uppercase font-bold px-2 py-1 rounded bg-slate-100 text-slate-700">
                  {proj.siglaTipo} {proj.numero}/{proj.ano}
              </span>
              <a href={`https://www.camara.leg.br/propostas-legislativas/${proj.id}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-600" />
              </a>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{proj.ementa}</p>
      </div>
    ))}
    {lista.length === 0 && (
        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p>Nenhuma proposta encontrada nesta categoria.</p>
        </div>
    )}
  </div>
);

const PoliticianProfilePage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  
  const [anoSelecionado, setAnoSelecionado] = useState('Todos'); // Default Todos para ter dados
  const [mesSelecionado, setMesSelecionado] = useState('Todos');
  const [politico, setPolitico] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [projetosTematicos, setProjetosTematicos] = useState({ seguranca: [], economia: [], educacao: [], saude: [], pecs: [], outros: [] });
  const [projetosComplexos, setProjetosComplexos] = useState([]);
  const [todasDespesas, setTodasDespesas] = useState([]); 
  const [despesasFiltradas, setDespesasFiltradas] = useState([]); 
  const [graficoData, setGraficoData] = useState([]);
  const [totalGastoPeriodo, setTotalGastoPeriodo] = useState(0);
  const [kpis, setKpis] = useState({ totalPL: 0, totalPEC: 0 });
  const [presenca, setPresenca] = useState({ score: 0, label: '-', description: '' });
  const [analiseGastos, setAnaliseGastos] = useState({ usaCarro: false, usaDivulgacao: false });
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState('outros');

  const anosDisponiveis = ['2023', '2024', '2025', 'Todos'];
  const mesesDisponiveis = [
    { val: 'Todos', label: 'Todos os Meses' },
    { val: 1, label: 'Janeiro' }, { val: 2, label: 'Fevereiro' }, { val: 3, label: 'Março' },
    { val: 4, label: 'Abril' }, { val: 5, label: 'Maio' }, { val: 6, label: 'Junho' },
    { val: 7, label: 'Julho' }, { val: 8, label: 'Agosto' }, { val: 9, label: 'Setembro' },
    { val: 10, label: 'Outubro' }, { val: 11, label: 'Novembro' }, { val: 12, label: 'Dezembro' }
  ];

  const categorizarProjeto = (projeto) => {
    if (projeto.siglaTipo === 'PEC') return 'pecs';
    const texto = normalizeText(projeto.ementa);
    if (texto.match(/CRIME|PENA|POLICIA|SEGURANCA|ARMAS/)) return 'seguranca';
    if (texto.match(/IMPOSTO|TRIBUT|ECONOMIA|ORCAMENTO|FINAN/)) return 'economia';
    if (texto.match(/EDUCA|ESCOLA|ENSINO|PROFESSOR/)) return 'educacao';
    if (texto.match(/SAUDE|HOSPITAL|MEDICO|SUS/)) return 'saude';
    return 'outros';
  };

  const fetchAllPages = async (urlBase) => {
    let allData = [];
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      try {
        const separator = urlBase.includes('?') ? '&' : '?';
        const res = await fetch(`${urlBase}${separator}pagina=${page}&itens=100`, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error('API Error');
        const json = await res.json();
        if (json.dados && json.dados.length > 0) {
          allData = [...allData, ...json.dados];
          page++;
          if (json.dados.length < 100 || page > 5) hasMore = false; // Limit to 5 pages for speed
        } else {
          hasMore = false;
        }
      } catch (e) {
        hasMore = false;
      }
    }
    return allData;
  };

  const fetchProjetosPorAno = async (ano, tipo) => {
    try {
      const res = await fetch(`https://dadosabertos.camara.leg.br/api/v2/proposicoes?idDeputadoAutor=${id}&siglaTipo=${tipo}&ano=${ano}&itens=100&ordem=DESC&ordenarPor=id`, { headers: { 'Accept': 'application/json' } });
      const json = await res.json();
      return json.dados || [];
    } catch (e) { return []; }
  };

  useEffect(() => {
    const fetchPerfil = async () => {
      if (!id) return;
      try {
        const respInfo = await fetch(`https://dadosabertos.camara.leg.br/api/v2/deputados/${id}`, { headers: { 'Accept': 'application/json' } });
        const dataInfo = await respInfo.json();
        setPolitico(dataInfo.dados);
      } catch (error) { console.error("Erro perfil:", error); }
    };
    fetchPerfil();
  }, [id]);

  useEffect(() => {
    const fetchDadosDinamicos = async () => {
      if (!id) return;
      setLoading(true);

      try {
        let listaPL = [];
        let listaPEC = [];
        let listaDespesas = [];
        let listaEventos = [];

        // Força buscar histórico recente se 'Todos' estiver selecionado, ou apenas o ano específico
        const anosParaBuscar = anoSelecionado === 'Todos' ? [2023, 2024, 2025] : [parseInt(anoSelecionado)];

        for (const ano of anosParaBuscar) {
            const [pl, pec] = await Promise.all([
                fetchProjetosPorAno(ano, 'PL'),
                fetchProjetosPorAno(ano, 'PEC')
            ]);
            listaPL = [...listaPL, ...pl];
            listaPEC = [...listaPEC, ...pec];
            
            const despesasUrl = `https://dadosabertos.camara.leg.br/api/v2/deputados/${id}/despesas?ano=${ano}&ordem=DESC&ordenarPor=dataDocumento`;
            const despesasAno = await fetchAllPages(despesasUrl);
            listaDespesas = [...listaDespesas, ...despesasAno];

            // Busca EVENTOS (Sessões) que é mais leve que Votações
            const eventosUrl = `https://dadosabertos.camara.leg.br/api/v2/deputados/${id}/eventos?dataInicio=${ano}-01-01&dataFim=${ano}-12-31&ordem=ASC&ordenarPor=dataHoraInicio`;
            const eventosAno = await fetchAllPages(eventosUrl);
            listaEventos = [...listaEventos, ...eventosAno];
        }

        setPresenca(calculateDeputadoAssiduity(listaEventos));
        
        const todosProjetos = [...listaPL, ...listaPEC];
        setProjetosComplexos(filterComplexProjects(todosProjetos));

        const tematicos = { seguranca: [], economia: [], educacao: [], saude: [], pecs: [], outros: [] };
        todosProjetos.forEach(proj => {
            const cat = categorizarProjeto(proj);
            if (tematicos[cat]) tematicos[cat].push(proj);
        });
        setProjetosTematicos(tematicos);
        setKpis({ totalPL: listaPL.length, totalPEC: listaPEC.length });
        setTodasDespesas(listaDespesas);

        let usaCarro = false;
        let usaDivulgacao = false;
        listaDespesas.forEach(d => {
            const tipo = normalizeText(d.tipoDespesa);
            if (tipo.includes("VEICULO") || tipo.includes("COMBUSTIVEL")) usaCarro = true;
            if (tipo.includes("DIVULGACAO")) usaDivulgacao = true;
        });
        setAnaliseGastos({ usaCarro, usaDivulgacao });

      } catch (error) {
        console.error("Erro dados:", error);
      } finally {
        setLoading(false);
      }
    };

    if (politico) fetchDadosDinamicos();
  }, [id, anoSelecionado, politico]);

  useEffect(() => {
    if (todasDespesas.length === 0) {
        setDespesasFiltradas([]); setGraficoData([]); setTotalGastoPeriodo(0); return;
    }
    const filtradas = todasDespesas.filter(d => mesSelecionado === 'Todos' || d.mes === parseInt(mesSelecionado));
    setDespesasFiltradas(filtradas);
    
    const total = filtradas.reduce((acc, d) => acc + d.valorLiquido, 0);
    setTotalGastoPeriodo(total);

    const agrupado = filtradas.reduce((acc, curr) => {
        const tipo = curr.tipoDespesa;
        const valor = curr.valorLiquido;
        if (valor > 0) { if (!acc[tipo]) acc[tipo] = 0; acc[tipo] += valor; }
        return acc;
    }, {});

    setGraficoData(Object.entries(agrupado).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6));
  }, [todasDespesas, mesSelecionado]);

  if (loading || !politico) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>;
  }

  const info = politico.ultimoStatus || politico;

  const openModal = (category) => {
    setModalCategory(category);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
        {/* Simple Modal */}
        {modalOpen && (
            <SimpleModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Projetos: ${modalCategory.toUpperCase()}`}>
                <div className="space-y-4">
                    {projetosTematicos[modalCategory]?.map((proj) => (
                        <div key={proj.id} className="pb-4 border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{proj.siglaTipo} {proj.numero}/{proj.ano}</span>
                            </div>
                            <p className="text-sm text-gray-800">{proj.ementa}</p>
                        </div>
                    ))}
                </div>
            </SimpleModal>
        )}

        <div className="bg-white border-b shadow-sm pt-6 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/deputados" className="text-gray-500 hover:text-blue-600 inline-flex items-center text-sm mb-6 font-medium"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Link>
            <div className="flex flex-col md:flex-row gap-8">
                <img src={info.urlFoto} alt={info.nomeEleitoral} className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-xl bg-gray-200" />
                <div className="flex-1">
                    <h1 className="text-4xl font-extrabold text-gray-900">{info.nomeEleitoral}</h1>
                    <p className="text-lg text-gray-600 mt-2">{info.siglaPartido} • {info.siglaUf}</p>
                    <div className="mt-4 flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs border ${!analiseGastos.usaCarro ? 'bg-green-100 border-green-200 text-green-800' : 'bg-gray-100 border-gray-200'}`}>{!analiseGastos.usaCarro ? 'Sem aluguel de carro' : 'Usa verba transporte'}</span>
                        <span className={`px-2 py-1 rounded text-xs border ${!analiseGastos.usaDivulgacao ? 'bg-green-100 border-green-200 text-green-800' : 'bg-gray-100 border-gray-200'}`}>{!analiseGastos.usaDivulgacao ? 'Zero autopromoção' : 'Gasta com divulgação'}</span>
                    </div>
                    <div className="mt-6 flex gap-2">
                        {anosDisponiveis.map(ano => (
                            <button key={ano} onClick={() => setAnoSelecionado(ano)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${anoSelecionado === ano ? 'bg-blue-600 text-white' : 'bg-white border hover:bg-gray-100'}`}>{ano}</button>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-blue-50/50 border-blue-200"><CardContent className="p-4"><div className="text-xs font-bold text-blue-600 uppercase mb-1">Atividade Parlamentar</div><div className="text-3xl font-black text-gray-900">{presenca.score}</div><div className="text-[10px] text-gray-500">{presenca.description}</div></CardContent></Card>
                <Card className="bg-purple-50/50 border-purple-200"><CardContent className="p-4"><div className="text-xs font-bold text-purple-600 uppercase mb-1">Propostas de Lei</div><div className="text-3xl font-black text-gray-900">{kpis.totalPL}</div></CardContent></Card>
                <Card className="bg-amber-50/50 border-amber-200"><CardContent className="p-4"><div className="text-xs font-bold text-amber-600 uppercase mb-1">PECs / PLPs</div><div className="text-3xl font-black text-gray-900">{kpis.totalPEC}</div></CardContent></Card>
                <Card className="bg-green-50/50 border-green-200"><CardContent className="p-4"><div className="text-xs font-bold text-green-600 uppercase mb-1">Custo Mensal Médio</div><div className="text-xl font-black text-gray-900">R$ {totalGastoPeriodo > 0 ? (totalGastoPeriodo / 12).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '0'}</div></CardContent></Card>
          </div>

          {projetosComplexos.length > 0 && (
            <div className="mb-8">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center"><Star className="w-5 h-5 text-yellow-500 mr-2 fill-yellow-500" /> Últimos Movimentos Complexos</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {projetosComplexos.map((proj) => (
                        <Card key={proj.id} className="border-yellow-200 bg-yellow-50/30">
                            <CardContent className="p-4">
                                <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded mb-2 inline-block">{proj.siglaTipo} {proj.numero}/{proj.ano}</span>
                                <p className="text-sm font-medium text-gray-800 line-clamp-3">{proj.ementa}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2">
                <Tabs defaultValue="seguranca" className="w-full mb-8">
                    <TabsList className="w-full justify-start h-auto p-1 bg-gray-100 flex-wrap gap-1 mb-6 rounded-xl">
                        <TabsTrigger value="seguranca">Segurança ({projetosTematicos.seguranca.length})</TabsTrigger>
                        <TabsTrigger value="economia">Economia ({projetosTematicos.economia.length})</TabsTrigger>
                        <TabsTrigger value="educacao">Educação ({projetosTematicos.educacao.length})</TabsTrigger>
                        <TabsTrigger value="saude">Saúde ({projetosTematicos.saude.length})</TabsTrigger>
                        <TabsTrigger value="pecs">PECs ({projetosTematicos.pecs.length})</TabsTrigger>
                    </TabsList>
                    {['seguranca', 'economia', 'educacao', 'saude', 'pecs'].map((key) => (
                        <TabsContent key={key} value={key} className="space-y-4">
                            <ProjectList lista={projetosTematicos[key]} />
                            {projetosTematicos[key].length > 3 && <Button variant="outline" className="w-full" onClick={() => openModal(key)}>Ver todos</Button>}
                        </TabsContent>
                    ))}
                </Tabs>

                <Card className="border-gray-200 shadow-sm mb-6">
                    <CardContent className="h-[300px] pt-6">
                        {graficoData.length > 0 ? (
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={graficoData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 11}} interval={0}/>
                                    <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {graficoData.map((entry, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#60a5fa'} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <div className="h-full flex items-center justify-center text-gray-400">Sem dados.</div>}
                    </CardContent>
                </Card>
             </div>
             
             <div className="space-y-6">
                <AdBanner />
                <div className="bg-slate-900 text-white rounded-xl p-6 shadow-lg">
                    <h3 className="font-bold text-lg mb-2 flex items-center"><Users className="mr-2"/> Frentes Parlamentares</h3>
                    <div className="text-4xl font-extrabold text-blue-400">{politico.totalFrentes || '...'}</div>
                </div>
             </div>
          </div>
        </div>
    </div>
  );
};

export default PoliticianProfilePage;