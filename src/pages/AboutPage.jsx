import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>Sobre o Projeto - FISCALIZA</title>
        <meta name="description" content="Conheça a missão do FISCALIZA, a plataforma independente de transparência política." />
      </Helmet>

      <div className="bg-white text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Sobre o <span className="text-blue-600">FISCALIZA</span>
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-600">
              Promovendo a transparência e o engajamento cívico através da fiscalização do poder.
            </p>
          </motion.div>
        </div>

        <div className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">Nossa Missão</h2>
                </div>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Nossa missão é simples: democratizar o acesso aos dados públicos. O FISCALIZA transforma planilhas complexas do governo em informações claras e visuais, permitindo que qualquer cidadão atue como um fiscal do uso do dinheiro público. Somos uma iniciativa independente e sem vínculos partidários.
                </p>
              </motion.div>
              {/* Placeholder para imagem genérica de tecnologia/cidadania */}
              <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                 Imagem Institucional
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;