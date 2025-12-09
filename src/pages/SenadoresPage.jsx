import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Building2, MapPin, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AdBanner from '@/components/AdBanner'; // <--- Import do Banner

// Backup de emergência (MVP)
const MOCK_SENADORES = [
  { id: 5953, nome: 'Rodrigo Pacheco', partido: 'PSD', uf: 'MG', foto: 'https://www.senado.leg.br/senadores/img/fotos-oficiais/senador5953.jpg' },
  { id: 5008, nome: 'Romário', partido: 'PL', uf: 'RJ', foto: 'https://www.senado.leg.br/senadores/img/fotos-oficiais/senador5008.jpg' },
  { id: 5529, nome: 'Marcos Pontes', partido: 'PL', uf: 'SP', foto: 'https://www.senado.leg.br/senadores/img/fotos-oficiais/senador5529.jpg' },
  { id: 5988, nome: 'Damares Alves', partido: 'REPUBLICANOS', uf: 'DF', foto: 'https://www.senado.leg.br/senadores/img/fotos-oficiais/senador5988.jpg' },
  { id: 5322, nome: 'Renan Calheiros', partido: 'MDB', uf: 'AL', foto: 'https://www.senado.leg.br/senadores/img/fotos-oficiais/senador5322.jpg' },
  { id: 5976, nome: 'Sergio Moro', partido: 'UNIÃO', uf: 'PR', foto: 'https://www.senado.leg.br/senadores/img/fotos-oficiais/senador5976.jpg' },
  { id: 5557, nome: 'Flávio Bolsonaro', partido: 'PL', uf: 'RJ', foto: 'https://www.senado.leg.br/senadores/img/fotos-oficiais/senador5557.jpg' },
  { id: 6000, nome: 'Teresa Leitão', partido: 'PT', uf: 'PE', foto: 'https://www.senado.leg.br/senadores/img/fotos-oficiais/senador6000.jpg' },
];

const SenadoresPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedParty, setSelectedParty] = useState('');

  const [senadores, setSenadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingBackup, setUsingBackup] = useState(false);

  useEffect(() => {
    const fetchSenadores = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://legis.senado.leg.br/dadosabertos/senador/lista/atual.json');
        
        if (!response.ok) throw new Error('Falha na resposta da API');
        
        const data = await response.json();
        const listaRaw = data.ListaParlamentarEmExercicio.Parlamentares.Parlamentar;
        
        const formatados = listaRaw.map(s => ({
          id: s.IdentificacaoParlamentar.CodigoParlamentar,
          nome: s.IdentificacaoParlamentar.NomeParlamentar,
          partido: s.IdentificacaoParlamentar.SiglaPartidoParlamentar,
          uf: s.IdentificacaoParlamentar.UfParlamentar,
          foto: s.IdentificacaoParlamentar.UrlFotoParlamentar,
          email: s.IdentificacaoParlamentar.EmailParlamentar
        }));

        setSenadores(formatados);

      } catch (error) {
        console.error("Erro na API Senado, usando backup:", error);
        setSenadores(MOCK_SENADORES);
        setUsingBackup(true);
        toast({
          title: "Modo Offline",
          description: "API do Senado instável. Exibindo dados locais.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSenadores();
  }, [toast]);

  const estados = ['SP', 'RJ', 'MG', 'BA', 'RS', 'PR', 'PE', 'CE', 'PA', 'MA', 'SC', 'GO', 'PB', 'ES', 'AM', 'RN', 'AL', 'PI', 'MT', 'DF', 'MS', 'SE', 'RO', 'TO', 'AC', 'AP', 'RR'];
  const partidos = ['MDB', 'PL', 'PSD', 'PT', 'PP', 'REPUBLICANOS', 'UNIÃO', 'PODEMOS', 'PSB', 'PDT', 'PSDB', 'REDE', 'NOVO', 'CIDADANIA'];

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
        <meta name="description" content="Lista atualizada dos senadores em exercício." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Senadores da República
              </h1>
              <p className="text-lg text-gray-600">
                Conheça os 81 representantes dos estados no Senado Federal.
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
              Mostrando <strong>{filteredSenadores.length}</strong> senadores
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSenadores.map((senador, index) => (
                <motion.div
                  key={senador.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 overflow-hidden group"
                  onClick={() => handleSenadorClick(senador)}
                >
                  <div className="p-6 flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={senador.foto}
                        alt={senador.nome}
                        className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 group-hover:border-blue-100 transition-colors bg-gray-100"
                        loading="lazy"
                        onError={(e) => { e.target.src = 'https://www.camara.leg.br/tema/assets/images/foto-deputado-sem-foto.png'; }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {senador.nome}
                      </h3>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                          {senador.partido}
                        </span>
                        <span className="inline-flex items-center text-sm text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          {senador.uf}
                        </span>
                      </div>
                      
                      <div className="mt-3 flex items-center text-xs text-blue-600 group-hover:underline">
                        Ver perfil <ExternalLink className="ml-1 w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && filteredSenadores.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum senador encontrado</h3>
              <p className="text-gray-500">Tente ajustar os filtros de busca.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SenadoresPage;