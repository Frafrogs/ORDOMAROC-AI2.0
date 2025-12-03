import React, { useState } from 'react';
import { Moon, Sun, Globe, Check, History, Menu, LogOut } from 'lucide-react';

interface SideMenuProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  onOpenHistory: () => void;
  onLogout: () => void;
}

const languages = [
  { code: 'Français', label: 'Français', flag: '🇫🇷' },
  { code: 'English', label: 'English', flag: '🇬🇧' },
  { code: 'Arabe', label: 'العربية', flag: '🇲🇦' },
];

const SideMenu: React.FC<SideMenuProps> = ({ darkMode, toggleDarkMode, language, setLanguage, onOpenHistory, onLogout }) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Trigger Button (Floating Action Button style) */}
      <button 
        className={`fixed bottom-6 right-6 z-[60] p-4 bg-medical-primary text-white rounded-full shadow-xl hover:bg-blue-600 transition-transform active:scale-95 sm:hidden flex items-center justify-center`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu size={24} />
      </button>

      {/* Desktop/Tablet Hover Menu & Mobile Overlay Menu */}
      <div 
        className={`fixed z-[60] flex items-center transition-all duration-500 ease-out group
          ${/* Desktop: Right side, slide in */ ''}
          sm:right-0 sm:top-1/2 sm:-translate-y-1/2 
          ${isOpen ? 'translate-x-0' : 'sm:translate-x-[calc(100%-20px)]'}
          
          ${/* Mobile: Bottom Right, slide up/fade */ ''}
          bottom-24 right-6 sm:bottom-auto 
          ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none sm:opacity-100 sm:pointer-events-auto sm:translate-y-0'}
        `}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => { setIsOpen(false); setShowLangMenu(false); }}
      >
        {/* Visual Handle / Tab (Desktop Only) */}
        <div className={`hidden sm:flex w-10 h-24 bg-medical-surface dark:bg-slate-800 rounded-l-full shadow-lg border-y border-l border-slate-200 dark:border-slate-700 items-center justify-start pl-1.5 cursor-pointer absolute -left-5 top-1/2 -translate-y-1/2 transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}>
           <div className="w-1 h-8 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
        </div>

        {/* Main Menu Container */}
        <div className={`
          bg-medical-surface/95 dark:bg-slate-900/95 backdrop-blur-md p-3 
          rounded-2xl sm:rounded-r-none sm:rounded-l-2xl 
          border border-slate-200 dark:border-slate-700 shadow-2xl 
          flex flex-col-reverse sm:flex-col items-center gap-3 w-16 transition-all duration-300
        `}>
          
          {/* BOUTON HISTORY */}
          <button
            onClick={onOpenHistory}
            className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-medical-accent hover:text-medical-primary dark:hover:bg-medical-primary dark:hover:text-white transition-all shadow-sm"
            title="Historique des ordonnances"
          >
            <History size={20} />
          </button>

          {/* SEPARATEUR */}
          <div className="w-6 h-[1px] bg-slate-200 dark:bg-slate-700"></div>

          {/* BOUTON LANGUE */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-medical-accent hover:text-medical-primary dark:hover:bg-medical-primary dark:hover:text-white transition-all shadow-sm"
              title="Changer la langue"
            >
              <Globe size={20} />
            </button>

            {/* Dropdown Langue (Apparaît à gauche sur desktop, au dessus sur mobile) */}
            {showLangMenu && (
              <div className="absolute right-full bottom-0 sm:bottom-auto sm:top-0 mr-4 w-40 bg-medical-surface dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-[70] animate-fade-in-up">
                   <div className="p-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                     Langue / Language
                   </div>
                   <ul>
                     {languages.map((lang) => (
                       <li key={lang.code}>
                         <button
                           onClick={(e) => {
                             e.stopPropagation();
                             setLanguage(lang.code);
                             setShowLangMenu(false);
                           }}
                           className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors
                             ${language === lang.code ? 'text-medical-primary dark:text-medical-primary bg-medical-accent dark:bg-slate-700' : 'text-slate-700 dark:text-slate-300'}
                           `}
                         >
                           <span className="flex items-center gap-2">
                             <span>{lang.flag}</span> {lang.label}
                           </span>
                           {language === lang.code && <Check size={14} />}
                         </button>
                       </li>
                     ))}
                   </ul>
              </div>
            )}
          </div>

          {/* SEPARATEUR */}
          <div className="w-6 h-[1px] bg-slate-200 dark:bg-slate-700"></div>

          {/* BOUTON DARK MODE */}
          <button
            onClick={toggleDarkMode}
            className={`p-3 rounded-xl transition-all shadow-sm duration-300 relative overflow-hidden
              ${darkMode 
                ? 'bg-indigo-900/50 text-yellow-300 hover:bg-indigo-800' 
                : 'bg-amber-100 text-orange-500 hover:bg-amber-200'}
            `}
            title={darkMode ? "Mode Clair" : "Mode Sombre"}
          >
            <div className="relative z-10">
              {darkMode ? <Moon size={20} fill="currentColor" /> : <Sun size={20} fill="currentColor" />}
            </div>
          </button>

          {/* SEPARATEUR */}
          <div className="w-6 h-[1px] bg-slate-200 dark:bg-slate-700"></div>

          {/* BOUTON DECONNEXION */}
          <button
            onClick={onLogout}
            className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/40 transition-all shadow-sm"
            title="Déconnexion"
          >
            <LogOut size={20} />
          </button>

        </div>
      </div>
      
      {/* Mobile Overlay Background */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-[50] sm:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
      )}
    </>
  );
};

export default SideMenu;