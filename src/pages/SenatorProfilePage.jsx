import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Mail, ExternalLink, Loader2, ScrollText, PenTool, Shield, 
  GraduationCap, Banknote, HeartPulse, X, Wallet, Scale, Eye, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import AdBanner from '@/components/AdBanner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  calculateSenatorRelatorScore, 
  checkStrategicCommissions, 
  calculateSabatinasScore,
  calculateEfficiencyIndex,
  normalizeText
} from '@/lib/legislative-logic';

const SimpleModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl sticky top-0 z-10">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2"><ScrollText className="w-5 h-5 text-blue-600" /> {title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500"/></button>
        </div>
        <div className="p-4 overflow-y-auto custom-scrollbar">{children}</div>
        <div className="p-3 border-t bg-gray-50 rounded-b-xl text-right"><Button onClick={onClose} variant="outline" size="sm">Fechar</Button></div>
      </div>
    </div>
  );
};

const ProjectList = ({ lista }) => (
  <div className="space-y-3">
    {lista && lista.slice(0, 3).map((proj, idx) => (
      <div key={`${proj.id}-${idx}`} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:border-blue-300 transition-all group">
          <div className="flex justify-between items-start gap-2 mb-2">
              <span className="text-[11px] uppercase font-bold px-2 py-1 rounded bg-slate-100 text-slate-700">{proj.siglaTipo} {proj.numero}/{proj.ano}</span>
              <a href={`https://www25.senado.leg.br/web/atividade/materias/-/materia/${proj.id}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-blue-600" /></a>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{proj.ementa}</p>
      </div>
    ))}
    {(!lista || lista.length === 0) && <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200"><p>Nenhuma matéria encontrada.</p></div>}
  </div>
);

const SenatorProfilePage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  
  const [anoSelecionado, setAnoSelecionado] = useState('Todos');
  const [senador, setSenador] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // KPIs
  const [kpiRelator, setKpiRelator] = useState({ score: 0, resumo: '-', destaques: [] });
  const [kpiComissoes, setKpiComissoes] = useState({ score: 0, papeis: [], label: '-' });
  const [kpiFiscalizacao, setKpiFiscalizacao] = useState({ count: 0, label: '-', description: '' });
  const [kpiEficiencia, setKpiEficiencia] = useState({ indice: '0.0', interpretacao: '-' });

  const [graficoData, setGraficoData] = useState([]);
  const [totalGastoPeriodo, setTotalGastoPeriodo] = useState(0);
  const [materiasTematicas, setMateriasTematicas] = useState({ pecs: [], economia: [], seguranca: [], educacao: [], saude: [], outros: [] });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState('outros');
  const anosDisponiveis = ['2023', '2024', '2025', 'Todos'];

  // Helper robusto para tratar XML->JSON do Senado
  const forceArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return [data];
  };
  
  const categorizarMateria = (materia) => {
    const ident = materia.IdentificacaoMateria || {};
    const tipo = ident.SiglaSubtipoMateria || '';
    const ementa = normalizeText(materia.EmentaMateria || '');
    
    if (tipo === 'PEC') return 'pecs';
    if (ementa.includes('CRIME') || ementa.includes('SEGURANCA') || ementa.includes('POLICIA')) return 'seguranca';
    if (ementa.includes('ECONOMIA') || ementa.includes('TRIBUT') || ementa.includes('ORCAMENTO')) return 'economia';
    if (ementa.includes('EDUCACAO') || ementa.includes('ENSINO') || ementa.includes('ESCOLA')) return 'educacao';
    if (ementa.includes('SAUDE') || ementa.includes('SUS') || ementa.includes('MEDICO')) return 'saude';
    return 'outros';
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Perfil
        const resPerfil = await fetch(`https://legis.senado.leg.br/dadosabertos/senador/${id}.json`);
        if (!resPerfil.ok) throw new Error("Falha ao carregar perfil");
        const jsonPerfil = await resPerfil.json();
        setSenador(jsonPerfil.DetalheParlamentar.Parlamentar);

        // Loop de anos para acumular dados
        const anos = anoSelecionado === 'Todos' ? ['2023', '2024', '2025'] : [anoSelecionado];
        
        let todasRelatorias = [];
        let todasVotacoes = [];
        let todosGastos = [];

        for (const ano of anos) {
            // Relatorias
            try {
                const resRel = await fetch(`https://legis.senado.leg.br/dadosabertos/senador/${id}/relatorias.json?ano=${ano}`);
                if (resRel.ok) {
                    const jsonRel = await resRel.json();
                    todasRelatorias = [...todasRelatorias, ...forceArray(jsonRel.MateriasRelatadas?.Materia)];
                }
            } catch (e) { console.warn(`Sem relatorias para ${ano}`); }

            // Votações
            try {
                const resVot = await fetch(`https://legis.senado.leg.br/dadosabertos/senador/${id}/votacoes.json?ano=${ano}`);
                if (resVot.ok) {
                    const jsonVot = await resVot.json();
                    todasVotacoes = [...todasVotacoes, ...forceArray(jsonVot.VotacoesParlamentar?.Parlamentar?.Votacoes?.Votacao)];
                }
            } catch (e) { console.warn(`Sem votações para ${ano}`); }

            // Gastos (CORREÇÃO DE ENDPOINT)
            try {
                const resGas = await fetch(`https://legis.senado.leg.br/dadosabertos/senador/${id}/indenizatorias/${ano}.json`);
                if (resGas.ok) {
                    const jsonGas = await resGas.json();
                    // Caminho correto para indenizações
                    const raw = jsonGas.IndenizacaoParlamentar?.Parlamentar?.Indenizacoes?.Indenizacao;
                    todosGastos = [...todosGastos, ...forceArray(raw)];
                }
            } catch (e) { console.warn(`Sem verbas para ${ano}`); }
        }

        // --- Processamento ---

        // Relatorias
        const relatorScore = calculateSenatorRelatorScore(todasRelatorias);
        setKpiRelator(relatorScore);

        // Categorização
        const tematicas = { pecs: [], economia: [], seguranca: [], educacao: [], saude: [], outros: [] };
        todasRelatorias.forEach(m => {
            const cat = categorizarMateria(m);
            const ident = m.IdentificacaoMateria || {};
            const proj = {
                id: ident.CodigoMateria,
                siglaTipo: ident.SiglaSubtipoMateria,
                numero: ident.NumeroMateria,
                ano: ident.AnoMateria,
                ementa: m.EmentaMateria
            };
            // Evita duplicatas de ID
            if(tematicas[cat] && !tematicas[cat].find(x => x.id === proj.id)) {
                tematicas[cat].push(proj);
            }
        });
        setMateriasTematicas(tematicas);

        // Comissões (Endpoint Geral)
        try {
            const resComissoes = await fetch(`https://legis.senado.leg.br/dadosabertos/senador/${id}/comissoes.json`);
            if (resComissoes.ok) {
                const jsonComissoes = await resComissoes.json();
                const raw = jsonComissoes.MembroComissaoParlamentar?.Parlamentar?.MembroComissao;
                const comissoesScore = checkStrategicCommissions(forceArray(raw));
                setKpiComissoes(comissoesScore);
            }
        } catch (e) { console.warn("Erro comissões"); }

        // Votações
        setKpiFiscalizacao(calculateSabatinasScore(todasVotacoes));

        // Gastos (Cotas)
        const totalGasto = todosGastos.reduce((acc, g) => acc + parseFloat(g.ValorReembolsado?.replace(',', '.') || 0), 0);
        setTotalGastoPeriodo(totalGasto);

        const gastosAgrupados = todosGastos.reduce((acc, g) => {
            const tipo = g.DescricaoDespesa;
            const valor = parseFloat(g.ValorReembolsado?.replace(',', '.') || 0);
            if (valor > 0) { 
                if (!acc[tipo]) acc[tipo] = 0; 
                acc[tipo] += valor; 
            }
            return acc;
        }, {});
        
        setGraficoData(Object.entries(gastosAgrupados)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6));

        // Eficiência (Soma de pontos de produtividade)
        const pontosAtividade = relatorScore.score + comissoesScore.score + (todasVotacoes.length > 0 ? 10 : 0);
        setKpiEficiencia(calculateEfficiencyIndex(totalGasto, pontosAtividade));

      } catch (error) {
        console.error("Erro crítico perfil senador:", error);
        toast({ title: "Erro de Conexão", description: "Falha ao comunicar com o Senado Federal.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, anoSelecionado, toast]);

  if (loading || !senador) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>;

  const info = senador.IdentificacaoParlamentar;
  const mandato = forceArray(senador.Mandatos?.Mandato)[0];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* HEADER */}
        <div className="bg-white border-b shadow-sm pt-6 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/senadores" className="text-gray-500 hover:text-blue-600 inline-flex items-center text-sm mb-6 font-medium"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Senadores</Link>
            <div className="flex flex-col md:flex-row gap-8">
                <img src={info.UrlFotoParlamentar} alt={info.NomeParlamentar} className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-xl bg-gray-200" />
                <div className="flex-1">
                    <h1 className="text-4xl font-extrabold text-gray-900">{info.NomeParlamentar}</h1>
                    <p className="text-lg text-gray-600 mt-2">{info.SiglaPartidoParlamentar} • {info.UfParlamentar}</p>
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
          {/* KPI CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-blue-50/50 border-blue-200"><CardContent className="p-4"><div className="text-xs font-bold text-blue-600 uppercase mb-1">Poder de Decisão</div><div className="text-3xl font-black text-gray-900">{kpiComissoes.score}</div><div className="text-[10px] text-gray-500">{kpiComissoes.label}</div></CardContent></Card>
                <Card className="bg-purple-50/50 border-purple-200"><CardContent className="p-4"><div className="text-xs font-bold text-purple-600 uppercase mb-1">Matérias Relatadas</div><div className="text-3xl font-black text-gray-900">{kpiRelator.score}</div><div className="text-[10px] text-gray-500">{kpiRelator.resumo}</div></CardContent></Card>
                <Card className="bg-amber-50/50 border-amber-200"><CardContent className="p-4"><div className="text-xs font-bold text-amber-600 uppercase mb-1">Sabatinas</div><div className="text-3xl font-black text-gray-900">{kpiFiscalizacao.count}</div><div className="text-[10px] text-gray-500">{kpiFiscalizacao.description}</div></CardContent></Card>
                <Card className="bg-green-50/50 border-green-200"><CardContent className="p-4"><div className="text-xs font-bold text-green-600 uppercase mb-1">Eficiência</div><div className="text-xl font-black text-gray-900">{kpiEficiencia.indice}</div><div className="text-[10px] text-gray-500">{kpiEficiencia.interpretacao}</div></CardContent></Card>
          </div>

          {/* DESTAQUES RELATORIAS */}
          {kpiRelator.destaques && kpiRelator.destaques.length > 0 && (
            <div className="mb-8">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-2 fill-yellow-500" /> Relatorias Recentes
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {kpiRelator.destaques.map((proj, i) => (
                        <Card key={i} className="border-yellow-200 bg-yellow-50/30">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                        {proj.Materia?.IdentificacaoMateria?.SiglaSubtipoMateria} {proj.Materia?.IdentificacaoMateria?.NumeroMateria}/{proj.Materia?.IdentificacaoMateria?.AnoMateria}
                                    </span>
                                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider text-[10px]">RELATOR</span>
                                </div>
                                <p className="text-sm font-medium text-gray-800 line-clamp-3">{proj.Materia?.EmentaMateria}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
          )}

          {/* TABS DE MATÉRIAS */}
          <div className="mb-12">
                <Tabs defaultValue="pecs" className="w-full">
                    <TabsList className="w-full justify-start h-auto p-1 bg-gray-100 flex-wrap gap-1 mb-6 rounded-xl">
                        <TabsTrigger value="pecs" className="gap-2 font-bold"><PenTool className="w-4 h-4" /> PECs ({materiasTematicas.pecs?.length || 0})</TabsTrigger>
                        <TabsTrigger value="economia" className="gap-2"><Banknote className="w-4 h-4" /> Economia ({materiasTematicas.economia?.length || 0})</TabsTrigger>
                        <TabsTrigger value="seguranca" className="gap-2"><Shield className="w-4 h-4" /> Segurança ({materiasTematicas.seguranca?.length || 0})</TabsTrigger>
                        <TabsTrigger value="educacao" className="gap-2"><GraduationCap className="w-4 h-4" /> Educação ({materiasTematicas.educacao?.length || 0})</TabsTrigger>
                        <TabsTrigger value="saude" className="gap-2"><HeartPulse className="w-4 h-4" /> Saúde ({materiasTematicas.saude?.length || 0})</TabsTrigger>
                    </TabsList>

                    {['pecs', 'economia', 'seguranca', 'educacao', 'saude'].map((key) => (
                        <TabsContent key={key} value={key} className="space-y-4 focus:outline-none">
                            <ProjectList lista={materiasTematicas[key]} />
                            {materiasTematicas[key]?.length > 3 && (
                                <Button variant="outline" className="w-full py-6 text-blue-600 border-blue-200 hover:bg-blue-50 font-semibold" onClick={() => openModal(key)}>
                                    Ver todas
                                </Button>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
          </div>

          {/* GRÁFICOS E COMISSÕES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
             <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Wallet className="w-7 h-7 mr-3 text-blue-600" /> Gastos Indenizatórios (Cota)
                    </h2>
                </div>

                <Card className="border-gray-200 shadow-sm mb-6">
                    <CardContent className="h-[300px] pt-6">
                        {graficoData.length > 0 ? (
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={graficoData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={150} tick={{fontSize: 11}} interval={0}/>
                                    <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} cursor={{fill: 'transparent'}} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {graficoData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#60a5fa'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">Sem dados de gastos para este ano.</div>
                        )}
                    </CardContent>
                    <div className="bg-gray-50 p-4 border-t text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">Total Acumulado ({anoSelecionado})</p>
                        <p className="text-2xl font-black text-gray-900">R$ {totalGastoPeriodo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                </Card>
             </div>

             <div className="space-y-6">
                <AdBanner title="Apoio Institucional" />
                
                <Card>
                    <div className="p-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center"><Scale className="w-5 h-5 mr-2 text-gray-500"/> Comissões Chave</h3>
                        {kpiComissoes.papeis.length > 0 ? (
                            <ul className="space-y-2">
                                {kpiComissoes.papeis.map((papel, i) => (
                                    <li key={i} className="text-sm bg-gray-50 p-2 rounded border border-gray-100 flex items-center">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                        {papel}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">Sem participação titular na CCJ, CAE ou CRE.</p>
                        )}
                        
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h3 className="font-bold text-lg mb-4 flex items-center"><Eye className="w-5 h-5 mr-2 text-gray-500"/> Mandato</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>Início:</strong> {mandato?.QuintaLegislaturaInicio}</p>
                                <p><strong>Fim:</strong> {mandato?.QuintaLegislaturaFinal}</p>
                            </div>
                        </div>
                    </div>
                </Card>
             </div>
          </div>

        </div>
      </div>
  );
};

export default SenatorProfilePage;