import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Building2, MapPin, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AdBanner from '@/components/AdBanner';

const SenadoresPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedParty, setSelectedParty] = useState('');

  const [senadores, setSenadores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper para garantir array (API do Senado retorna objeto se for 1 item)
  const forceArray = (data) => {
    if (!data) return [];
    return Array.isArray(data) ? data : [data];
  };

  useEffect(() => {
    const fetchSenadores = async () => {
      setLoading(true);
      try {
        console.log("Buscando lista via Proxy (/api-senado)...");
        
        // Rota relativa -> Vite Proxy -> Senado
        const response = await fetch('/api-senado/senador/lista/atual.json', {
            headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) throw new Error(`Erro API: ${response.status}`);
        
        const data = await response.json();
        const listaRaw = data.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar;
        
        if (!listaRaw) throw new Error("Estrutura de dados inválida");

        const formatados = forceArray(listaRaw).map(s => ({
          id: s.IdentificacaoParlamentar.CodigoParlamentar,
          nome: s.IdentificacaoParlamentar.NomeParlamentar,
          partido: s.IdentificacaoParlamentar.SiglaPartidoParlamentar,
          uf: s.IdentificacaoParlamentar.UfParlamentar,
          foto: s.IdentificacaoParlamentar.UrlFotoParlamentar,
          email: s.IdentificacaoParlamentar.EmailParlamentar
        }));

        setSenadores(formatados);

      } catch (error) {
        console.error("Erro lista senadores:", error);
        toast({
          title: "Erro de Conexão",
          description: "Não foi possível carregar a lista oficial.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSenadores();
  }, [toast]);

  const estados = ['SP', 'RJ', 'MG', 'BA', 'RS', 'PR', 'PE', 'CE', 'PA', 'MA', 'SC', 'GO', 'PB', 'ES', 'AM', 'RN', 'AL', 'PI', 'MT', 'DF', 'MS', 'SE', 'RO', 'TO', 'AC', 'AP', 'RR'];
  const partidos = [...new Set(senadores.map(s => s.partido))].sort().filter(Boolean);

  const filteredSenadores = senadores.filter(senador => {
    const matchesSearch = senador.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = selectedState === '' || senador.uf === selectedState;
    const matchesParty = selectedParty === '' || senador.partido === selectedParty;
    return matchesSearch && matchesState && matchesParty;
  });

  const handleSenadorClick = (senador) => {
    navigate(`/senador/${senador.id}`);
  };

  return (
    <>
      <Helmet>
        <title>Senadores - FISCALIZA</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Senadores da República
              </h1>
              <p className="text-lg text-gray-600">
                Acompanhe o trabalho dos representantes no Senado Federal.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border-b sticky top-20 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">Todos os Estados</option>
                {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>

              <select value={selectedParty} onChange={(e) => setSelectedParty(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option value="">Todos os Partidos</option>
                {partidos.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              <Button variant="outline" onClick={() => { setSearchTerm(''); setSelectedState(''); setSelectedParty(''); }}>
                <Filter className="w-4 h-4 mr-2" /> Limpar
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6"><AdBanner /></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6"><p className="text-gray-600">Mostrando <strong>{filteredSenadores.length}</strong> senadores</p></div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSenadores.map((senador) => (
                <motion.div key={senador.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-md transition-all" onClick={() => handleSenadorClick(senador)}>
                  <div className="p-6 flex items-center space-x-4">
                    <div className="relative">
                        <img src={senador.foto} alt={senador.nome} className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 group-hover:border-blue-100 bg-gray-200" onError={(e) => e.target.src='https://www.senado.leg.br/senadores/img/fotos-oficiais/senador_sem_foto.jpg'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600">{senador.nome}</h3>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">{senador.partido}</span>
                        <span className="text-sm text-gray-500 flex items-center"><MapPin className="w-3 h-3 mr-1" />{senador.uf}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {!loading && filteredSenadores.length === 0 && (
             <div className="text-center py-20 text-gray-500">Nenhum senador encontrado.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default SenadoresPage;