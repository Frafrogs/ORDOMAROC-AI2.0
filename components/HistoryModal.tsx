
import React, { useState, useMemo } from 'react';
import { SavedPrescription } from '../types';
import { X, Search, Calendar, User, FileText, Trash2, ArrowRight, History } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: SavedPrescription[];
  onLoad: (prescription: SavedPrescription) => void;
  onDelete: (id: string) => void;
  language?: string;
}

const translations = {
  Français: {
    title: "Historique des Ordonnances",
    searchPlaceholder: "Rechercher par patient ou date...",
    empty: "Aucune ordonnance sauvegardée.",
    load: "Ouvrir",
    delete: "Supprimer",
    patient: "Patient",
    date: "Date",
    pathology: "Motif"
  },
  English: {
    title: "Prescription History",
    searchPlaceholder: "Search by patient or date...",
    empty: "No saved prescriptions.",
    load: "Open",
    delete: "Delete",
    patient: "Patient",
    date: "Date",
    pathology: "Reason"
  },
  Arabe: {
    title: "سجل الوصفات الطبية",
    searchPlaceholder: "البحث عن طريق المريض أو التاريخ...",
    empty: "لا توجد وصفات طبية محفوظة.",
    load: "فتح",
    delete: "حذف",
    patient: "المريض",
    date: "التاريخ",
    pathology: "السبب"
  }
};

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, history, onLoad, onDelete, language = 'Français' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const t = translations[language as keyof typeof translations] || translations.Français;
  const isRTL = language === 'Arabe';

  const filteredHistory = useMemo(() => {
    if (!searchTerm) return history;
    const lowerTerm = searchTerm.toLowerCase();
    return history.filter(item => 
      item.patientName.toLowerCase().includes(lowerTerm) || 
      item.dateStr.toLowerCase().includes(lowerTerm) ||
      item.data.pathology.toLowerCase().includes(lowerTerm)
    );
  }, [history, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-medical-surface w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh] sm:h-auto sm:max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-medical-primary p-6 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
               <History size={24} />
            </div>
            <h2 className="text-xl font-bold font-serif">{t.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="relative">
            <Search className={`absolute top-1/2 transform -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} size={18} />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-medical-primary focus:ring-1 focus:ring-medical-primary transition-all text-sm ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
              // Removed autoFocus to prevent keyboard from popping up on mobile immediately covering the list
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-slate-100/50">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <History size={48} className="mb-3 opacity-20" />
              <p>{t.empty}</p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 hover:border-medical-accent hover:shadow-md transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                       <Calendar size={10} /> {item.dateStr}
                    </span>
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                       {item.patientName || <span className="italic text-slate-400">Inconnu</span>}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-medical-secondary font-medium">
                    <FileText size={14} /> {item.data.pathology}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button 
                    onClick={() => {
                        onLoad(item);
                        onClose();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-medical-accent text-medical-primary rounded-lg font-bold text-xs hover:bg-medical-primary hover:text-white transition-colors"
                  >
                    {t.load} {isRTL ? <ArrowRight size={14} className="rotate-180" /> : <ArrowRight size={14} />}
                  </button>
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-slate-300 hover:text-medical-danger hover:bg-red-50 rounded-lg transition-colors"
                    title={t.delete}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100 text-center text-xs text-slate-400 shrink-0">
           {filteredHistory.length} ordonnance(s)
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
