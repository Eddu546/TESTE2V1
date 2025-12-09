import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Map, CheckCircle, Rocket, Wrench } from 'lucide-react';

const RoadmapPage = () => {
  const roadmapItems = [
    {
      status: 'concluido',
      title: 'Lançamento da Plataforma',
      description: 'Cobertura de 100% dos dados federais (Câmara e Senado), incluindo perfis, despesas e votações.',
      icon: CheckCircle,
      color: 'green'
    },
    {
      status: 'ativo',
      title: 'Painel de Desempenho (KPIs)',
      description: 'Implementação dos indicadores de Eficácia Legislativa, Responsabilidade Fiscal, Lealdade e Presença.',
      icon: Rocket,
      color: 'yellow'
    },
    {
      status: 'ativo',
      title: 'Meu DNA Político',
      description: 'Desenvolvimento do quiz de afinidade para comparar as opiniões do usuário com as votações dos parlamentares.',
      icon: Rocket,
      color: 'yellow'
    },
    {
      status: 'planejado',
      title: 'Integração de Dados Estaduais',
      description: 'Próximo objetivo: Integrar dados da Assembleia Legislativa de São Paulo (ALESP).',
      icon: Wrench,
      color: 'blue'
    },
    {
      status: 'planejado',
      title: 'Detecção de Anomalias com IA',
      description: 'Uso de inteligência artificial para identificar padrões suspeitos em despesas e atividades parlamentares.',
      icon: Wrench,
      color: 'blue'
    },
    {
      status: 'planejado',
      title: 'Aplicativo Móvel',
      description: 'Desenvolvimento de aplicativos nativos para iOS e Android para facilitar a fiscalização.',
      icon: Wrench,
      color: 'blue'
    }
  ];

  const statusConfig = {
    concluido: { text: 'Concluído', icon: CheckCircle, color: 'green', bg: 'bg-green-100', text_color: 'text-green-700', border_color: 'border-green-200' },
    ativo: { text: 'Em Desenvolvimento', icon: Rocket, color: 'yellow', bg: 'bg-yellow-100', text_color: 'text-yellow-700', border_color: 'border-yellow-200' },
    planejado: { text: 'Planejado', icon: Wrench, color: 'blue', bg: 'bg-blue-100', text_color: 'text-blue-700', border_color: 'border-blue-200' }
  };

  return (
    <>
      <Helmet>
        <title>Roteiro de Expansão - Fiscaliza, MBL!</title>
        <meta name="description" content="Veja o que já foi feito e quais são os próximos passos da plataforma de fiscalização do MBL." />
      </Helmet>

      <div className="bg-white text-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Map className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Roteiro de Expansão</h1>
            <p className="text-lg text-gray-600">
              Nosso compromisso com a fiscalização não para. Veja o que estamos construindo.
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 md:left-1/2 top-0 h-full w-1 bg-gray-200 -translate-x-1/2"></div>

            {roadmapItems.map((item, index) => {
              const config = statusConfig[item.status];
              const Icon = config.icon;
              const isLeft = index % 2 === 0;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="mb-12 flex items-center w-full"
                >
                  <div className={`hidden md:block w-1/2 ${isLeft ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    {isLeft && (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text_color}`}>
                        <Icon className="w-4 h-4 mr-2" />
                        {config.text}
                      </span>
                    )}
                  </div>
                  
                  <div className="absolute left-6 md:left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-gray-200 ring-4 ring-white`}>
                      <div className={`w-3 h-3 rounded-full bg-${config.color}-500`}></div>
                    </div>
                  </div>

                  <div className={`w-full md:w-1/2 ${isLeft ? 'md:pl-8' : 'md:pr-8'} pl-14 md:pl-0`}>
                    <div className={`bg-white p-6 rounded-lg shadow-md border ${config.border_color}`}>
                      <div className="md:hidden mb-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text_color}`}>
                          <Icon className="w-4 h-4 mr-2" />
                          {config.text}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>

                   <div className={`hidden md:block w-1/2 ${isLeft ? 'pl-8 text-left' : 'pr-8 text-right'}`}>
                    {!isLeft && (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text_color}`}>
                        <Icon className="w-4 h-4 mr-2" />
                        {config.text}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default RoadmapPage;