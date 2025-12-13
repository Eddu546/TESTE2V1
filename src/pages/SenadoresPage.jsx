import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import AdBanner from '@/components/AdBanner';
// IMPORTANTE: Aqui importamos o serviço que criamos para blindar a API
import { getSenadoresAtuais } from '@/services/senado';

const SenadoresPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Estados de filtro e dados
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedParty, setSelectedParty] = useState('');
  const [senadores, setSenadores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lista de estados estática para o filtro
  const estados = ['SP', 'RJ', 'MG', 'BA', 'RS', 'PR', 'PE', 'CE', 'PA', 'MA', 'SC', 'GO', 'PB', 'ES', 'AM', 'RN', 'AL', 'PI', 'MT', 'DF', 'MS', 'SE', 'RO', 'TO', 'AC', 'AP', 'RR'];

  // Efeito para carregar dados ao montar o componente
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Agora chamamos a função limpa, sem fetch manual nem tratamentos complexos aqui
        const data = await getSenadoresAtuais();
        setSenadores(data);
      } catch (error) {
        console.error("Erro ao carregar senadores:", error);
        toast({
          title: "Indisponibilidade Temporária",
          description: "Não foi possível conectar à base de dados do Senado. Tente novamente em instantes.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Extrai partidos únicos da lista carregada para o dropdown
  const partidos = [...new Set(senadores.map(s => s.partido))].sort().filter(Boolean);

  // Lógica de filtragem local (Client-side filtering)
  const filteredSenadores = senadores.filter(senador => {
    const matchesSearch = senador.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = selectedState === '' || senador.uf === selectedState;
    const matchesParty = selectedParty === '' || senador.partido === selectedParty;
    return matchesSearch && matchesState && matchesParty;
  });

  const handleSenadorClick = (senador) => {
    // Navega para a página de perfil (que ajustaremos a seguir)
    navigate(`/senador/${senador.id}`);
  };

  return (
    <>
      <Helmet>
        <title>Senadores - FISCALIZA</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header da Seção */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Senadores da República
              </h1>
              <p className="text-lg text-gray-600">
                Acompanhe o trabalho dos representantes no Senado Federal (Mandato de 8 anos).
              </p>
            </div>
          </div>
        </div>

        {/* Barra de Filtros Sticky */}
        <div className="bg-white border-b sticky top-20 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Busca por Nome */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                />
              </div>

              {/* Filtro de Estado */}
              <select 
                value={selectedState} 
                onChange={(e) => setSelectedState(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white transition-all"
              >
                <option value="">Todos os Estados</option>
                {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>

              {/* Filtro de Partido */}
              <select 
                value={selectedParty} 
                onChange={(e) => setSelectedParty(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white transition-all"
              >
                <option value="">Todos os Partidos</option>
                {partidos.map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              {/* Botão Limpar */}
              <Button 
                variant="outline" 
                onClick={() => { setSearchTerm(''); setSelectedState(''); setSelectedParty(''); }}
                className="hover:bg-gray-100"
              >
                <Filter className="w-4 h-4 mr-2" /> Limpar
              </Button>
            </div>
          </div>
        </div>

        {/* Banner de Publicidade */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <AdBanner />
        </div>

        {/* Grid de Resultados */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600">
              Mostrando <strong>{filteredSenadores.length}</strong> senadores em exercício
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSenadores.map((senador) => (
                <motion.div 
                  key={senador.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all duration-300" 
                  onClick={() => handleSenadorClick(senador)}
                >
                  <div className="p-6 flex items-center space-x-4">
                    <div className="relative flex-shrink-0">
                        <img 
                          src={senador.foto} 
                          alt={senador.nome} 
                          className="w-20 h-20 rounded-full object-cover border-4 border-gray-50 group-hover:border-blue-50 transition-colors" 
                          onError={(e) => e.target.src='https://www.senado.leg.br/senadores/img/fotos-oficiais/senador_sem_foto.jpg'} 
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {senador.nome}
                      </h3>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {senador.partido}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-gray-400" />{senador.uf}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {!loading && filteredSenadores.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                <Filter className="w-10 h-10 mb-4 text-gray-300" />
                <p className="text-lg font-medium">Nenhum senador encontrado</p>
                <p className="text-sm">Tente ajustar seus filtros de busca.</p>
             </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SenadoresPage;