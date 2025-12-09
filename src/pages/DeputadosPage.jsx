import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Users, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AdBanner from '@/components/AdBanner'; // Import do banner de anúncio

// Backup de emergência (Caso a API falhe totalmente)
const MOCK_DEPUTADOS = [
  { id: 204536, nome: 'Kim Kataguiri', siglaPartido: 'UNIÃO', siglaUf: 'SP', urlFoto: 'https://www.camara.leg.br/internet/deputado/bandep/204536.jpg', email: 'dep.kimkataguiri@camara.leg.br' },
  { id: 204534, nome: 'Tabata Amaral', siglaPartido: 'PSB', siglaUf: 'SP', urlFoto: 'https://www.camara.leg.br/internet/deputado/bandep/204534.jpg', email: 'dep.tabataamaral@camara.leg.br' },
  { id: 220593, nome: 'Nikolas Ferreira', siglaPartido: 'PL', siglaUf: 'MG', urlFoto: 'https://www.camara.leg.br/internet/deputado/bandep/220593.jpg', email: 'dep.nikolasferreira@camara.leg.br' },
  { id: 220586, nome: 'Guilherme Boulos', siglaPartido: 'PSOL', siglaUf: 'SP', urlFoto: 'https://www.camara.leg.br/internet/deputado/bandep/220586.jpg', email: 'dep.guilhermeboulos@camara.leg.br' },
  { id: 204358, nome: 'Eduardo Bolsonaro', siglaPartido: 'PL', siglaUf: 'SP', urlFoto: 'https://www.camara.leg.br/internet/deputado/bandep/92346.jpg', email: 'dep.eduardobolsonaro@camara.leg.br' },
  { id: 178866, nome: 'Gleisi Hoffmann', siglaPartido: 'PT', siglaUf: 'PR', urlFoto: 'https://www.camara.leg.br/internet/deputado/bandep/74439.jpg', email: 'dep.gleisihoffmann@camara.leg.br' },
];

const DeputadosPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedParty, setSelectedParty] = useState('');
  
  const [deputados, setDeputados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingBackup, setUsingBackup] = useState(false);

  useEffect(() => {
    const fetchDeputados = async () => {
      setLoading(true);
      try {
        // CORREÇÃO CRÍTICA:
        // Adicionei 'idLegislatura=57' para pegar TODOS da legislatura atual (2023-2027),
        // mesmo que estejam de licença médica ou particular.
        // Aumentei itens para 1000 para garantir que a paginação não corte ninguém.
        const response = await fetch('https://dadosabertos.camara.leg.br/api/v2/deputados?idLegislatura=57&ordem=ASC&ordenarPor=nome&itens=1000');
        
        if (!response.ok) throw new Error('Falha na resposta da API');
        
        const data = await response.json();
        
        if (data.dados && data.dados.length > 0) {
          // Remove duplicatas (caso a API retorne o mesmo deputado por causa de mudanças de status)
          const deputadosUnicos = data.dados.filter((v,i,a)=>a.findIndex(v2=>(v2.id===v.id))===i);
          setDeputados(deputadosUnicos);
        } else {
          throw new Error('Lista vazia recebida da API');
        }
      } catch (error) {
        console.error("Erro na API, usando backup:", error);
        setDeputados(MOCK_DEPUTADOS);
        setUsingBackup(true);
        toast({
          title: "Modo Offline",
          description: "API instável. Exibindo dados locais para demonstração.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDeputados();
  }, [toast]);

  const estados = ['SP', 'RJ', 'MG', 'BA', 'RS', 'PR', 'PE', 'CE', 'PA', 'MA', 'SC', 'GO', 'PB', 'ES', 'AM', 'RN', 'AL', 'PI', 'MT', 'DF', 'MS', 'SE', 'RO', 'TO', 'AC', 'AP', 'RR'];
  const partidos = ['PT', 'PL', 'PP', 'MDB', 'PSD', 'REPUBLICANOS', 'UNIÃO', 'PSB', 'PDT', 'PSDB', 'PCdoB', 'PSOL', 'PODE', 'AVANTE', 'PATRIOTA', 'SOLIDARIEDADE', 'NOVO', 'REDE', 'CIDADANIA', 'PV'];

  const filteredDeputados = deputados.filter(deputado => {
    const matchesSearch = deputado.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = selectedState === '' || deputado.siglaUf === selectedState;
    const matchesParty = selectedParty === '' || deputado.siglaPartido === selectedParty;
    return matchesSearch && matchesState && matchesParty;
  });

  const handleDeputadoClick = (deputado) => {
    navigate(`/politico/${deputado.id}`);
  };

  return (
    <>
      <Helmet>
        <title>Deputados Federais - FISCALIZA</title>
        <meta name="description" content="Lista de deputados federais." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Deputados Federais
              </h1>
              <p className="text-lg text-gray-600">
                Acompanhe quem são e o que fazem os 513 representantes na Câmara.
              </p>
              {usingBackup && (
                <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-yellow-50 text-yellow-800 text-sm font-medium">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Visualizando dados de demonstração (Backup)
                </div>
              )}
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="">Todos os Estados</option>
                {estados.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>

              <select
                value={selectedParty}
                onChange={(e) => setSelectedParty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="">Todos os Partidos</option>
                {partidos.map(partido => (
                  <option key={partido} value={partido}>{partido}</option>
                ))}
              </select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedState('');
                  setSelectedParty('');
                }}
                className="w-full text-gray-600 hover:text-blue-600"
              >
                <Filter className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>
        </div>

        {/* ÁREA DE ANÚNCIO - BANNER TOPO */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <AdBanner />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">
              Mostrando <strong>{filteredDeputados.length}</strong> parlamentares
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDeputados.map((deputado, index) => (
                <motion.div
                  key={deputado.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 overflow-hidden group"
                  onClick={() => handleDeputadoClick(deputado)}
                >
                  <div className="p-6 flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={deputado.urlFoto}
                        alt={deputado.nome}
                        className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 group-hover:border-blue-100 transition-colors"
                        loading="lazy"
                        onError={(e) => { e.target.src = 'https://www.camara.leg.br/tema/assets/images/foto-deputado-sem-foto.png'; }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {deputado.nome}
                      </h3>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {deputado.siglaPartido}
                        </span>
                        <span className="inline-flex items-center text-sm text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          {deputado.siglaUf}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2 truncate">
                        {deputado.email}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && filteredDeputados.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum deputado encontrado</h3>
              <p className="text-gray-500">Tente ajustar os filtros de busca.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DeputadosPage;