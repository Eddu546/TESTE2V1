import React from 'react';

const AdBanner = ({ title = "Publicidade", className = "" }) => {
  return (
    <div className={`w-full bg-gray-100 border border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center text-center overflow-hidden ${className}`}>
      <span className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">
        {title}
      </span>
      {/* Aqui é onde o código do Google AdSense entraria no futuro */}
      <div className="w-full h-24 bg-gray-200/50 rounded flex items-center justify-center border-2 border-dashed border-gray-300">
        <p className="text-gray-400 text-sm font-medium">Espaço para Patrocinador</p>
      </div>
    </div>
  );
};

export default AdBanner;