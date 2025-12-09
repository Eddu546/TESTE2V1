import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Search, Loader2, AlertCircle } from 'lucide-react';

const SearchResultsPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      setError(false);
      setResults([]);

      try {
        // 1. Busca Deputados (API Câmara)
        // A API V2 permite busca textual direta pelo parâmetro 'nome'
        const deputadosReq = fetch(`https://dadosabertos.camara.leg.br/api/v2/deputados?nome=${query}&ordem=ASC&ordenarPor=nome&itens=20`)
          .then(res => res.json())
          .then(data => data.dados.map(d => ({
            id: d.id,
            nome: d.nome,
            partido: d.siglaPartido,
            uf: d.siglaUf,
            foto: d.urlFoto,
            cargo: 'Deputado Federal',
            link: `/politico/${d.id}`,
            origem: 'camara'
          })))
          .catch(err => {
            console.warn('Erro ao buscar deputados:', err);
            return [];
          });

        // 2. Busca Senadores (API Senado)
        // A API do Senado não tem filtro de nome na listagem, então baixamos a lista atual e filtramos no front
        const senadoresReq = fetch('https://legis.senado.leg.br/dadosabertos/senador/lista/atual.json')
          .then(res => res.json())
          .then(data => {
            const lista = data.ListaParlamentarEmExercicio.Parlamentares.Parlamentar;
            // Garante que é array (API do Senado às vezes retorna objeto único se só houver 1 resultado, mas na lista geral é array)
            const arrayLista = Array.isArray(lista) ? lista : [lista];
            
            return arrayLista
              .filter(s => s.IdentificacaoParlamentar.NomeParlamentar.toLowerCase().includes(query.toLowerCase()))
              .map(s => ({
                id: s.IdentificacaoParlamentar.CodigoParlamentar,
                nome: s.IdentificacaoParlamentar.NomeParlamentar,
                partido: s.IdentificacaoParlamentar.SiglaPartidoParlamentar,
                uf: s.IdentificacaoParlamentar.UfParlamentar,
                foto: s.IdentificacaoParlamentar.UrlFotoParlamentar,
                cargo: 'Senador',
                link: `/senador/${s.IdentificacaoParlamentar.CodigoParlamentar}`,
                origem: 'senado'
              }));
          })
          .catch(err => {
            console.warn('Erro ao buscar senadores:', err);
            return [];
          });

        // Executa em paralelo para ser mais rápido
        const [deputados, senadores] = await Promise.all([deputadosReq, senadoresReq]);
        
        // Combina as listas
        setResults([...senadores, ...deputados]);

      } catch (err) {
        console.error("Erro crítico na busca:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <>
      <Helmet>
        <title>Resultados para "{query}" - FISCALIZA</title>
        <meta name="description" content={`Resultados da busca pública por políticos com o nome ${query}.`} />
      </Helmet>

      <div className="bg-gray-50 text-gray-900 min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-extrabold mb-2">Resultados da Busca</h1>
            <p className="text-lg text-gray-600">
              Termo pesquisado: <span className="text-blue-600 font-bold">"{query}"</span>
            </p>
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-500">Consultando bases de dados oficiais...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-3 border border-red-100">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold">Erro ao buscar dados</p>
                <p className="text-sm">Não foi possível conectar com os serviços públicos no momento. Tente novamente.</p>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((politico, index) => (
                <motion.div
                  key={`${politico.origem}-${politico.id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col sm:flex-row items-center gap-6 group">
                    <img 
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 group-hover:border-blue-50 transition-colors bg-gray-200" 
                      src={politico.foto} 
                      alt={politico.nome}
                      loading="lazy"
                      onError={(e) => { e.target.src = 'https://www.camara.leg.br/tema/assets/images/foto-deputado-sem-foto.png'; }}
                    />
                    
                    <div className="flex-grow text-center sm:text-left">
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{politico.nome}</h2>
                      <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${politico.origem === 'senado' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {politico.cargo}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">
                          {politico.partido} • {politico.uf}
                        </span>
                      </div>
                    </div>

                    <Link to={politico.link} className="w-full sm:w-auto">
                      <Button className="w-full bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm font-semibold">
                        Ver Perfil
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
              <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">Nenhum resultado encontrado</h3>
              <p className="text-gray-500 mt-1 max-w-md mx-auto">Verifique a ortografia ou tente buscar apenas pelo nome principal (ex: "Arthur" em vez de "Arthur Lira").</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchResultsPage;