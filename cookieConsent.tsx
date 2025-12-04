import React, { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('phk_cookie_consent');
    if (!consent) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('phk_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-surface/95 backdrop-blur-md border-t border-slate-700 shadow-2xl transition-transform duration-500 transform translate-y-0">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-2 rounded-full">
            <Cookie className="w-6 h-6 text-primary" />
          </div>
          <div className="text-sm text-slate-300">
            <p className="font-semibold text-white mb-1">Valoramos tu privacidad</p>
            <p>Utilizamos cookies para mejorar tu experiencia de navegación y analizar nuestro tráfico. Al hacer clic en "Aceptar", consientes nuestro uso de cookies.</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsVisible(false)}
            className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            Rechazar
          </button>
          <button 
            onClick={handleAccept}
            className="flex-1 md:flex-none px-6 py-2 text-sm font-bold bg-gradient-to-r from-primary to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded shadow-lg shadow-blue-900/50 transition-all hover:scale-105"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;