import React from 'react';
import { ScanEye } from 'lucide-react';

const OncaLogo = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <ScanEye className="w-full h-full" />
    </div>
  );
};

export default OncaLogo;