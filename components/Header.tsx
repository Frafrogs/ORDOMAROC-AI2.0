
import React from 'react';
import { Stethoscope, Settings, Database } from 'lucide-react';

interface HeaderProps {
  onOpenSettings?: () => void;
  language?: string;
}

const translations = {
  Français: {
    title: "OrdoMaroc AI",
    subtitle: "Evidence-Based Medicine",
    dbBadge: "Base Pharmaceutique Maroc 2025"
  },
  English: {
    title: "OrdoMaroc AI",
    subtitle: "Evidence-Based Medicine",
    dbBadge: "Moroccan Pharma Database 2025"
  },
  Arabe: {
    title: "المساعد الطبي الذكي",
    subtitle: "الطب المبني على البراهين",
    dbBadge: "قاعدة البيانات الدوائية 2025"
  }
};

const Header: React.FC<HeaderProps> = ({ onOpenSettings, language = 'Français' }) => {
  const t = translations[language as keyof typeof translations] || translations.Français;
  const isRTL = language === 'Arabe';

  return (
    <header className="bg-medical-surface/90 backdrop-blur-md border-b border-medical-accent sticky top-0 z-50 transition-all duration-300 shadow-sm" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-medical-primary rounded-xl shadow-lg shadow-medical-primary/20 text-white shrink-0">
            <Stethoscope size={22} strokeWidth={2.5} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold leading-none tracking-tight font-serif text-medical-secondary">
              {t.title}
            </h1>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-medical-primary font-semibold mt-1">
              {t.subtitle}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Badge Database - Responsive */}
          <div className="flex items-center gap-2 px-2 py-1 sm:px-3 bg-medical-accent rounded-full border border-blue-100">
             <div className="w-2 h-2 rounded-full bg-medical-secondary animate-pulse shrink-0"></div>
             <p className="hidden sm:block text-xs font-semibold text-medical-secondary whitespace-nowrap">{t.dbBadge}</p>
             <Database size={14} className="sm:hidden text-medical-secondary" />
          </div>

          {onOpenSettings && (
            <button 
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-medical-primary hover:bg-medical-accent rounded-full transition-colors"
              title="Configurer la Clé API"
            >
              <Settings size={20} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
