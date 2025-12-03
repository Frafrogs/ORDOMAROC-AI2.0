import React, { useState } from 'react';
import { Key, Save, ExternalLink, ShieldCheck } from 'lucide-react';

interface ApiKeyModalProps {
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-medical-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="bg-medical-primary p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <Key className="text-white h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Configuration Requise</h2>
          <p className="text-blue-100 text-sm">OrdoMaroc AI nécessite une configuration serveur.</p>
        </div>
        
        <div className="p-8">
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            L'application nécessite une clé API configurée exclusivement via les variables d'environnement (<code>process.env.API_KEY</code>). 
            <br/><br/>
            Veuillez configurer votre environnement de déploiement pour inclure cette clé.
          </p>
          <div className="flex justify-center">
             <button onClick={onClose} className="px-6 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 font-bold transition-colors">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;