import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AdBanner from '@/components/AdBanner';

const DeputadosPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedParty, setSelectedParty] = useState('');
  const [deputados, setDeputados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeputados = async () => {
      setLoading(true);
      try {
        // BUSCA PARALELA: Dispara 6 requisições simultâneas (muito mais rápido que o loop anterior)
        // Isso cobre aprox 600 deputados (513 titulares + suplentes ativos)
        const pages = [1, 2, 3, 4, 5, 6];
        const promises = pages.map(page => 
          fetch(`/api/camara/api/v2/deputados?idLegislatura=57&ordem=ASC&ordenarPor=nome&pagina=${page}&itens=100`, {
             headers: { 'Accept': 'application/json' }
          }).then(res => res.ok ? res.json() : { dados: [] }).catch(() => ({ dados: [] }))
        );

        const results = await Promise.all(promises);
        
        // Junta todos os resultados
        const allDeputados = results.flatMap(r => r.dados || []);
        
        // Remove duplicatas por ID
        const unique = Array.from(new Map(allDeputados.map(item => [item.id, item])).values());
        
        if (unique.length === 0) throw new Error("Lista vazia retornada pela API");
        
        setDeputados(unique);
      } catch (error) {
        console.error("Erro lista deputados:", error);
        toast({
          title: "Erro de Conexão",
          description: "Não foi possível carregar a lista. Tente recarregar.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDeputados();
  }, [toast]);

  const estados = ['SP', 'RJ', 'MG', 'BA', 'RS', 'PR', 'PE', 'CE', 'PA', 'MA', 'SC', 'GO', 'PB', 'ES', 'AM', 'RN', 'AL', 'PI', 'MT', 'DF', 'MS', 'SE', 'RO', 'TO', 'AC', 'AP', 'RR'];
  const partidos = [...new Set(deputados.map(d => d.siglaPartido))].sort().filter(Boolean);

  const filteredDeputados = deputados.filter(deputado => {
    const matchesSearch = deputado.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = selectedState === '' || deputado.siglaUf === selectedState;
    const matchesParty = selectedParty === '' || deputado.siglaPartido === selectedParty;
    return matchesSearch && matchesState && matchesParty;
  });

  const handleClick = (id) => {
    navigate(`/politico/${id}`);
  };

  return (
    <>
      <Helmet>
        <title>Deputados - FISCALIZA</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Deputados Federais
              </h1>
              <p className="text-lg text-gray-600">
                Lista de parlamentares da 57ª Legislatura (2023-2027).
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none bg-white">
                <option value="">Todos os Estados</option>
                {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>

              <select value={selectedParty} onChange={(e) => setSelectedParty(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none bg-white">
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
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">Mostrando <strong>{filteredDeputados.length}</strong> parlamentares</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500">Carregando lista...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDeputados.map((deputado) => (
                <motion.div 
                    key={deputado.id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all" 
                    onClick={() => handleClick(deputado.id)}
                >
                  <div className="p-6 flex items-center space-x-4">
                    <div className="relative">
                        <img src={deputado.urlFoto} alt={deputado.nome} className="w-20 h-20 rounded-full object-cover border-4 border-gray-50 group-hover:border-blue-50 bg-gray-200" onError={(e) => e.target.src='https://www.camara.leg.br/tema/assets/images/foto-deputado-sem-foto.png'}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600">{deputado.nome}</h3>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">{deputado.siglaPartido}</span>
                        <span className="text-sm text-gray-500 flex items-center"><MapPin className="w-3 h-3 mr-1" />{deputado.siglaUf}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {!loading && filteredDeputados.length === 0 && (
             <div className="text-center py-20 text-gray-500">Nenhum deputado encontrado.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default DeputadosPage;