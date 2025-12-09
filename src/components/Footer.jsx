import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Mail } from 'lucide-react';
import OncaLogo from '@/components/OncaLogo';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <OncaLogo className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold">FISCALIZA</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Plataforma independente de monitoramento legislativo. Dados oficiais da Câmara e Senado.
            </p>
          </div>
          {/* ... resto dos links (pode manter igual, só verifique se não tem texto antigo) ... */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;