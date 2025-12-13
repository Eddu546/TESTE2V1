import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Info, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import AdBanner from '@/components/AdBanner';
import { getSenadorDetalhes } from '@/services/senado';

const SenatorProfilePage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [senador, setSenador] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const dados = await getSenadorDetalhes(id);
        if (!dados) throw new Error("Senador não encontrado");
        setSenador(dados);
      } catch (error) {
        console.warn("Erro ao carregar senador:", error);
        toast({ title: "Erro", description: "Perfil indisponível no momento.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, toast]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">Carregando perfil...</div>;
  if (!senador) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Senador não encontrado.</div>;

  const info = senador.IdentificacaoParlamentar;
  const mandatoRaw = senador.Mandatos?.Mandato;
  // Pega o mandato mais recente com segurança
  const mandato = Array.isArray(mandatoRaw) ? mandatoRaw[0] : (mandatoRaw || {});

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Helmet><title>{info.NomeParlamentar} - Senado</title></Helmet>

      {/* Header Visual */}
      <div className="bg-white border-b shadow-sm pt-8 pb-10">
        <div className="max-w-5xl mx-auto px-4">
          <Link to="/senadores" className="text-gray-500 hover:text-blue-600 inline-flex items-center text-sm mb-8 font-medium transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista
          </Link>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-100 rounded-full transform rotate-6 scale-105"></div>
              <img 
                src={info.UrlFotoParlamentar} 
                alt={info.NomeParlamentar} 
                className="relative w-40 h-40 rounded-full object-cover border-4 border-white shadow-xl bg-gray-200"
                onError={(e) => e.target.src='https://www.senado.leg.br/senadores/img/fotos-oficiais/senador_sem_foto.jpg'}
              />
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">{info.NomeParlamentar}</h1>
              <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-3 py-1 rounded-full text-sm font-bold bg-blue-50 text-blue-700 border border-blue-100">
                  {info.SiglaPartidoParlamentar}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-700 border border-gray-200">
                  {info.UfParlamentar}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-100 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Em Exercício
                </span>
              </div>
            </div>
            
            <a href={info.UrlPaginaParlamentar} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
                Página Oficial <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Conteúdo Informativo */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200 shadow-sm">
              <CardContent className="p-8 text-center md:text-left flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 bg-slate-100 rounded-full text-slate-600">
                  <Building2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Análise em Desenvolvimento</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Estamos adaptando nossos algoritmos para a estrutura única do Senado Federal. 
                    Em breve, você terá acesso a métricas detalhadas de relatoria e fiscalização aqui.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2 text-gray-400" /> Dados do Mandato
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="block text-gray-500 text-xs uppercase font-bold">Início</span>
                  <span className="font-medium text-gray-900">{mandato.PrimeiraLegislaturaDoMandato?.DataInicio || '-'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="block text-gray-500 text-xs uppercase font-bold">Fim Previsto</span>
                  <span className="font-medium text-gray-900">{mandato.SegundaLegislaturaDoMandato?.DataFim || '-'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg sm:col-span-2">
                  <span className="block text-gray-500 text-xs uppercase font-bold">Contato</span>
                  <span className="font-medium text-blue-600 break-all">{info.EmailParlamentar || 'Não informado'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <AdBanner />
            <Card>
              <CardContent className="p-6">
                <h4 className="font-bold text-gray-900 mb-2">Transparência Ativa</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Acesse os dados de verbas indenizatórias e cota parlamentar diretamente na fonte oficial.
                </p>
                <a href="https://www6g.senado.leg.br/transparencia/sen/" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Portal da Transparência
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SenatorProfilePage;