import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Dna, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import OncaLogo from '@/components/OncaLogo';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const features = [
    {
      icon: Search,
      title: 'Fiscalize seu Político',
      description: 'Acesse o perfil completo, despesas, votações e atividade legislativa de qualquer deputado ou senador.',
      link: '/deputados',
      cta: 'Começar a Fiscalizar'
    },
    {
      icon: Dna,
      title: 'Meu DNA Político',
      description: 'Responda a um quiz rápido e descubra quais parlamentares votam como você no Congresso.',
      link: '/meu-dna',
      cta: 'Descobrir meu DNA'
    },
    {
      icon: Target,
      title: 'Painel de Desempenho',
      description: 'Compare políticos através de indicadores-chave de desempenho (KPIs) e veja quem realmente trabalha.',
      link: '/analytics',
      cta: 'Analisar Desempenho'
    },
  ];

  return (
    <>
      <Helmet>
        <title>FISCALIZA - Transparência Política</title>
        <meta name="description" content="Fiscalize deputados e senadores com a plataforma de transparência Fiscaliza. Análise de desempenho, gastos e votações." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-20 md:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="inline-block mb-6 text-blue-400 w-24 h-24"
            >
              <OncaLogo />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight"
            >
              Fiscalização Cidadã.
              <br />
              <span className="text-blue-400">Transparência Total.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-gray-300"
            >
              Monitore gastos, votações e o desempenho real dos políticos brasileiros em uma única plataforma independente.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <form onSubmit={handleSearch} className="max-w-xl mx-auto relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Busque por deputado ou senador..."
                  className="w-full bg-white text-gray-900 border-0 rounded-full py-4 pl-8 pr-36 text-lg shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/50"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="absolute right-2 top-2 bottom-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-6"
                >
                  Buscar
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-gray-100 transition-all flex flex-col hover:-translate-y-1"
                >
                  <div className="flex-grow">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-xl mb-6">
                      <Icon className="w-7 h-7 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                  </div>
                  <Link to={feature.link}>
                    <Button variant="ghost" className="w-full justify-between group text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      {feature.cta}
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;