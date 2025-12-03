
import React, { useState, useEffect, useRef } from 'react';
import { MedicalResponse, Medication, DoctorProfile } from '../types';
import { Calendar, Trash2, User, Printer, Save, Plus, Edit3, MapPin, ListPlus, Upload, X, Eye, ArrowLeft, Volume2, StopCircle, FileText, FlaskConical, CheckSquare, Square, Pill, Sparkles, Loader2, AlertTriangle, ShieldAlert, AlertCircle, Tag, CheckCircle2, ArrowDown01, ArrowUp10, Download, ChevronUp, ChevronDown, Baby } from 'lucide-react';
import { generateContent, generateSpeech } from '../services/geminiService';

interface PrescriptionPaperProps {
  data: MedicalResponse;
  language?: string;
  onSave?: (data: MedicalResponse, patientName: string) => void;
  doctorProfile?: DoctorProfile | null;
}

interface MedicationItemProps {
  med: Medication;
  index: number;
  onRemove: (index: number) => void;
  onUpdate: (index: number, updatedMed: Medication) => void;
  readOnly?: boolean;
  language?: string;
  t: any;
}

const translations = {
  Français: {
    adult: "Adulte",
    child: "Enfant",
    cancel: "Supprimer",
    print: "Imprimer",
    save: "Enregistrer",
    patientName: "Nom du patient",
    patientAge: "Age",
    patientWeight: "Poids",
    date: "Date",
    doctor: "Docteur",
    signature: "Signature & Cachet",
    addMed: "Ajouter un médicament",
    standardDosages: "Posologies standards...",
    kingdom: "", // Supprimé pour le PDF
    titleRx: "ORDONNANCE", // Remplacé pour être professionnel
    titleLab: "BILAN PARACLINIQUE",
    subtitleRx: "",
    subtitleLab: "",
    preview: "Aperçu",
    backRx: "Retour",
    patient: "Patient",
    patientPlaceholder: "Nom & Prénom du patient...",
    motif: "Motif",
    clinicalContext: "Contexte Clinique",
    prescriptionTitle: "Prescription",
    addMedManual: "Ajouter un médicament manuellement",
    aiAssistant: "Assistant Pharmacologique IA",
    add: "Ajouter",
    labTitle: "Examens Paracliniques",
    genLabRx: "Générer Ordonnance d'Analyses",
    checkLabNote: "* Cochez les examens à inclure dans l'ordonnance dédiée.",
    footerDisclaimer: "", // Vide pour le PDF, géré manuellement si besoin
    emergency: "Urgence : 15 / 190",
    stampSignature: "Cachet & Signature",
    importStamp: "Importer Cachet",
    modify: "Modifier",
    exportPDF: "Export PDF",
    previewTitle: "Aperçu",
    backEdit: "Retour",
    alternatives: "Alternatives (Maroc)",
    contraindications: "Contre-indications",
    sideEffects: "Effets Secondaires",
    showMore: "Voir Alternatives & Infos",
    showLess: "Masquer Alternatives & Infos",
    indication: "Indication",
    noLabs: "Aucun examen sélectionné.",
    labList: "Liste des examens demandés",
    medicationPlaceholder: "Saisissez un nom (ex: Augmentin...)"
  },
  English: {
    adult: "Adult",
    child: "Child",
    cancel: "Remove",
    print: "Print",
    save: "Save",
    patientName: "Patient Name",
    patientAge: "Age",
    patientWeight: "Weight",
    date: "Date",
    doctor: "Doctor",
    signature: "Signature & Stamp",
    addMed: "Add Medication",
    standardDosages: "Standard dosages...",
    kingdom: "",
    titleRx: "PRESCRIPTION",
    titleLab: "LABORATORY REQUEST",
    subtitleRx: "",
    subtitleLab: "",
    preview: "Preview",
    backRx: "Back",
    patient: "Patient",
    patientPlaceholder: "Patient Full Name...",
    motif: "Reason",
    clinicalContext: "Clinical Context",
    prescriptionTitle: "Prescription",
    addMedManual: "Add Medication Manually",
    aiAssistant: "AI Pharmacological Assistant",
    add: "Add",
    labTitle: "Paraclinical Exams",
    genLabRx: "Generate Lab Request",
    checkLabNote: "* Check exams to include in the dedicated request.",
    footerDisclaimer: "",
    emergency: "Emergency: 15 / 190",
    stampSignature: "Stamp & Signature",
    importStamp: "Import Stamp",
    modify: "Modify",
    exportPDF: "Export PDF",
    previewTitle: "Preview",
    backEdit: "Back",
    alternatives: "Alternatives",
    contraindications: "Contraindications",
    sideEffects: "Side Effects",
    showMore: "Show Alternatives & Info",
    showLess: "Hide Alternatives & Info",
    indication: "Indication",
    noLabs: "No exams selected.",
    labList: "Requested Exams List",
    medicationPlaceholder: "Enter name (e.g. Amoxil...)"
  },
  Arabe: {
    adult: "بالغ",
    child: "طفل",
    cancel: "حذف",
    print: "طباعة",
    save: "حفظ",
    patientName: "اسم المريض",
    patientAge: "السن",
    patientWeight: "الوزن",
    date: "التاريخ",
    doctor: "دكتور",
    signature: "التوقيع والختم",
    addMed: "إضافة دواء",
    standardDosages: "جرعات قياسية...",
    kingdom: "",
    titleRx: "وصفة طبية",
    titleLab: "طلب تحاليل طبية",
    subtitleRx: "",
    subtitleLab: "",
    preview: "معاينة",
    backRx: "عودة",
    patient: "المريض",
    patientPlaceholder: "اسم ونسب المريض...",
    motif: "السبب",
    clinicalContext: "السياق السريري",
    prescriptionTitle: "الوصفة الطبية",
    addMedManual: "إضافة دواء يدوياً",
    aiAssistant: "المساعد الدوائي الذكي",
    add: "إضافة",
    labTitle: "الفحوصات الطبية",
    genLabRx: "إنشاء وصفة تحاليل",
    checkLabNote: "* حدد الفحوصات لإدراجها في الوصفة المخصصة.",
    footerDisclaimer: "",
    emergency: "الطوارئ: 15 / 190",
    stampSignature: "الختم والتوقيع",
    importStamp: "استيراد الختم",
    modify: "تعديل",
    exportPDF: "تصدير PDF",
    previewTitle: "معاينة",
    backEdit: "عودة",
    alternatives: "البدائل (المغرب)",
    contraindications: "موانع الاستعمال",
    sideEffects: "الآثار الجانبية",
    showMore: "عرض البدائل والمعلومات",
    showLess: "إخفاء البدائل والمعلومات",
    indication: "دواعي الاستعمال",
    noLabs: "لم يتم تحديد أي فحوصات.",
    labList: "قائمة الفحوصات المطلوبة",
    medicationPlaceholder: "أدخل الاسم (مثال: أوجمنتين...)"
  }
};

const STANDARD_DOSAGES = [
  "1 cp par jour (matin)",
  "1 cp x 2 / jour (matin et soir)",
  "1 cp x 3 / jour (matin, midi, soir)",
  "1 cp le soir au coucher",
  "2 cp en une prise unique",
  "1 sachet x 2 / jour",
  "1 sachet x 3 / jour",
  "1 c.à.s x 3 / jour",
  "1 c.à.c x 3 / jour",
  "1 application locale matin et soir",
  "1 injection IM par jour"
];

// Helper to auto-resize textarea
const autoResizeTextarea = (e: React.FormEvent<HTMLTextAreaElement>) => {
  const target = e.target as HTMLTextAreaElement;
  target.style.height = 'auto';
  target.style.height = `${target.scrollHeight}px`;
};

const MedicationItem: React.FC<MedicationItemProps> = ({ med, index, onRemove, onUpdate, readOnly = false, language = 'Français', t }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [sortType, setSortType] = useState<'price_asc' | 'price_desc' | 'alpha'>('price_asc');

  const dosageMode = med.selectedDosage || 'adult';
  
  const toggleDosageMode = (mode: 'adult' | 'child') => {
    onUpdate(index, { ...med, selectedDosage: mode });
  };

  const handleBrandSelect = (originalIndex: number) => {
    if (readOnly) return;
    const newIndex = med.selectedBrandIndex === originalIndex ? undefined : originalIndex;
    onUpdate(index, { ...med, selectedBrandIndex: newIndex });
  };

  const displayName = med.selectedBrandIndex !== undefined 
    ? med.brands[med.selectedBrandIndex].name
    : med.dci;
  
  const displaySubText = med.selectedBrandIndex !== undefined ? `(${med.dci})` : "";
  const isRTL = language === 'Arabe';

  const getSortedIndices = () => {
    const indices = med.brands.map((_, i) => i);
    return indices.sort((a, b) => {
      const brandA = med.brands[a];
      const brandB = med.brands[b];
      if (sortType === 'alpha') return brandA.name.localeCompare(brandB.name);
      const priceA = parseFloat(brandA.price.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
      const priceB = parseFloat(brandB.price.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
      return sortType === 'price_asc' ? priceA - priceB : priceB - priceA;
    });
  };

  const sortedIndices = getSortedIndices();

  if (readOnly) {
    return (
      <li className="mb-4 break-inside-avoid group p-2 rounded-lg transition-colors border border-transparent hover:border-slate-100/50">
        <div className="flex justify-between items-baseline mb-1">
          <div className="flex-grow group/input">
             {/* Edit DCI in preview mode */}
             <input 
               type="text" 
               value={displayName}
               onChange={(e) => onUpdate(index, { ...med, dci: e.target.value, selectedBrandIndex: undefined })} 
               className="font-bold text-lg text-slate-900 bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-medical-primary rounded px-1 w-full focus-within:ring-2 focus-within:ring-medical-primary/20 hover:border-medical-primary/30 border-b border-transparent hover:bg-white/50"
               placeholder="Nom du médicament"
             />
             {med.selectedBrandIndex !== undefined && <span className="text-xs text-slate-500 ml-2">{med.dci}</span>}
          </div>
           {/* Edit Duration in preview mode */}
           <div className="flex items-center ml-4 shrink-0">
              <input 
                 value={med.duration}
                 onChange={(e) => onUpdate(index, { ...med, duration: e.target.value })}
                 className="font-bold text-slate-900 bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-medical-primary rounded px-1 text-right w-24 focus-within:ring-2 focus-within:ring-medical-primary/20 hover:border-medical-primary/30 border-b border-transparent hover:bg-white/50"
                 placeholder="Durée"
              />
           </div>
        </div>
        
        {/* Edit Instructions in preview mode */}
        <textarea
          value={med.instructions}
          onChange={(e) => onUpdate(index, { ...med, instructions: e.target.value })}
          className="text-sm text-slate-800 italic mb-1 w-full bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-medical-primary rounded px-1 resize-none overflow-hidden focus-within:ring-2 focus-within:ring-medical-primary/20 hover:border-medical-primary/30 border-b border-transparent hover:bg-white/50"
          rows={1}
          style={{ height: 'auto', minHeight: '1.5em' }}
          onInput={autoResizeTextarea}
          placeholder="Instructions..."
        />
        
        {/* Edit Dosage in preview mode */}
        <div className="flex items-center text-sm font-medium text-slate-700">
          <span className="mr-1 whitespace-nowrap font-bold text-xs uppercase text-slate-500">{dosageMode === 'adult' ? t.adult : t.child}:</span>
          <input 
            value={dosageMode === 'adult' ? med.dosageAdult : med.dosageChild}
            onChange={(e) => onUpdate(index, { ...med, [dosageMode === 'adult' ? 'dosageAdult' : 'dosageChild']: e.target.value })}
            className="flex-grow bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-medical-primary rounded px-1 focus-within:ring-2 focus-within:ring-medical-primary/20 hover:border-medical-primary/30 border-b border-transparent hover:bg-white/50"
            placeholder="Détails de la posologie"
          />
        </div>
      </li>
    );
  }

  // MODE ÉDITION (Classique)
  return (
    <li className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm mb-4 transition-all hover:shadow-md">
      {/* ... (Code du mode édition inchangé) ... */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-3">
        <div className="flex-grow">
            <div className="flex items-center gap-2 mb-1">
                 <span className="text-[10px] font-bold tracking-wider text-medical-primary uppercase bg-blue-50 px-2 py-0.5 rounded-md">
                   {med.type}
                 </span>
            </div>
            <div className="group/input relative">
              <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => onUpdate(index, { ...med, dci: e.target.value, selectedBrandIndex: undefined })} 
                  className="font-bold text-lg text-slate-800 w-full bg-transparent focus:outline-none border-b border-transparent focus:border-medical-primary focus-within:ring-2 focus-within:ring-medical-primary/20 rounded px-1 transition-all py-1"
                  placeholder="Nom du médicament"
              />
              <Edit3 size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 opacity-0 group-hover/input:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <div className="text-xs text-slate-400 pl-1">{displaySubText}</div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center bg-slate-50 px-3 py-2 sm:py-1 rounded border border-slate-200 focus-within:ring-2 focus-within:ring-medical-primary/20">
                <Calendar size={14} className="text-slate-400 mr-2" />
                <input 
                  value={med.duration}
                  onChange={(e) => onUpdate(index, { ...med, duration: e.target.value })}
                  className="bg-transparent w-20 text-sm font-semibold text-slate-700 focus:outline-none text-right"
                  placeholder="Durée"
                />
            </div>
            <button onClick={() => onRemove(index)} className="p-3 sm:p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                <Trash2 size={18} />
            </button>
        </div>
      </div>
      
      <div className="relative group/input mb-3">
        <textarea 
          value={med.instructions}
          onChange={(e) => onUpdate(index, { ...med, instructions: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 focus:outline-none focus:border-medical-primary focus-within:ring-2 focus-within:ring-medical-primary/20 resize-none transition-all"
          rows={2}
          onInput={autoResizeTextarea}
          placeholder="Instructions..."
        />
        <Edit3 size={14} className="absolute right-2 top-2 text-slate-300 opacity-0 group-hover/input:opacity-100 transition-opacity pointer-events-none" />
      </div>

        <>
          <div className="mt-4 p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                 <button
                   onClick={() => toggleDosageMode('adult')}
                   className={`flex items-center gap-2 px-4 py-2.5 sm:px-3 sm:py-2 rounded-full text-xs font-bold transition-all border ${dosageMode === 'adult' ? 'bg-white text-medical-primary border-medical-primary shadow-sm' : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-100'}`}
                 >
                   <User size={14} /> {t.adult}
                 </button>
                 <button
                    onClick={() => toggleDosageMode('child')}
                    className={`flex items-center gap-2 px-4 py-2.5 sm:px-3 sm:py-2 rounded-full text-xs font-bold transition-all border ${dosageMode === 'child' ? 'bg-white text-medical-primary border-medical-primary shadow-sm' : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-100'}`}
                 >
                   <Baby size={14} /> {t.child}
                 </button>
              </div>

              <div className="relative group/input flex gap-2">
                <textarea
                  value={dosageMode === 'adult' ? med.dosageAdult : med.dosageChild}
                  onChange={(e) => onUpdate(index, { 
                      ...med, 
                      [dosageMode === 'adult' ? 'dosageAdult' : 'dosageChild']: e.target.value 
                  })}
                  className="w-full bg-white border-2 border-dashed border-slate-300 rounded-lg p-3 text-sm font-medium text-slate-800 focus:border-medical-primary focus:bg-blue-50/50 focus:outline-none transition-all resize-none focus-within:ring-2 focus-within:ring-medical-primary/20"
                  rows={2}
                  onInput={autoResizeTextarea}
                  placeholder={dosageMode === 'adult' ? `${t.adult}...` : `${t.child}...`}
                />
                
                <div className="relative group/picker shrink-0">
                    <button className="h-full px-4 sm:px-3 bg-white hover:bg-medical-accent text-slate-400 hover:text-medical-primary rounded-lg border-2 border-dashed border-slate-300 hover:border-medical-primary transition-colors flex items-center justify-center" title={t.standardDosages}>
                      <ListPlus size={20} />
                    </button>
                    <select 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.value) {
                          onUpdate(index, { ...med, [dosageMode === 'adult' ? 'dosageAdult' : 'dosageChild']: e.target.value });
                          e.target.value = ""; 
                        }
                      }}
                    >
                      <option value="">{t.standardDosages}</option>
                      {STANDARD_DOSAGES.map((dosage, i) => (
                        <option key={i} value={dosage}>{dosage}</option>
                      ))}
                    </select>
                </div>
              </div>
          </div>

        <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 mb-4 mt-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Tag size={10} /> {t.alternatives}
              </p>
              <div className="flex gap-1">
                <button onClick={() => setSortType('price_asc')} className={`p-1 rounded ${sortType === 'price_asc' ? 'bg-medical-accent text-medical-primary' : 'text-slate-400 hover:bg-slate-200'}`}><ArrowDown01 size={12} /></button>
                <button onClick={() => setSortType('price_desc')} className={`p-1 rounded ${sortType === 'price_desc' ? 'bg-medical-accent text-medical-primary' : 'text-slate-400 hover:bg-slate-200'}`}><ArrowUp10 size={12} /></button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {sortedIndices.map((originalIndex) => {
                const brand = med.brands[originalIndex];
                const isSelected = med.selectedBrandIndex === originalIndex;
                return (
                  <button
                    key={originalIndex}
                    onClick={() => handleBrandSelect(originalIndex)}
                    className={`relative flex flex-col items-start px-4 py-2.5 rounded-lg border transition-all duration-200 text-left w-full sm:w-auto ${isRTL ? 'pl-10' : 'pr-10'}
                      ${isSelected 
                        ? 'bg-medical-accent/30 border-medical-primary ring-1 ring-medical-primary shadow-sm z-10' 
                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}
                      transform hover:scale-105 hover:shadow-lg
                    `}
                  >
                    <span className={`font-bold text-sm ${isSelected ? 'text-medical-primary' : 'text-slate-700'}`}>
                      {brand.name}
                    </span>
                    <span className="text-xs font-bold text-medical-secondary mt-1 flex items-center gap-1">
                      {brand.price}
                    </span>
                    {isSelected && <CheckCircle2 size={16} className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} text-medical-primary`} />}
                  </button>
                );
              })}
            </div>
        </div>

       <button 
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-medical-primary hover:text-white hover:bg-medical-primary py-3 sm:py-2 rounded-lg transition-all opacity-80 hover:opacity-100 border border-dashed border-medical-primary/30"
        >
          {showDetails ? (
            <>{t.showLess} <ChevronUp size={14} /></>
          ) : (
            <>{t.showMore} <ChevronDown size={14} /></>
          )}
        </button>

        <div className={`${showDetails ? 'block' : 'hidden'} space-y-5 mt-4 animate-fade-in-up`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 bg-red-50 p-3 rounded-lg border border-red-100">
              <h5 className="text-[10px] font-bold text-medical-danger uppercase tracking-widest flex items-center gap-1">
                <ShieldAlert size={12} /> {t.contraindications}
              </h5>
              <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside marker:text-medical-danger">
                {med.contraindications.map((ci, i) => <li key={i}>{ci}</li>)}
              </ul>
            </div>
            <div className="space-y-2 bg-orange-50 p-3 rounded-lg border border-orange-100">
              <h5 className="text-[10px] font-bold text-orange-600 uppercase tracking-widest flex items-center gap-1">
                <AlertCircle size={12} /> {t.sideEffects}
              </h5>
              <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside marker:text-orange-400">
                {med.sideEffects.map((se, i) => <li key={i}>{se}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </>
    </li>
  );
};

interface PaperHeaderProps {
  title: string;
  subtitle: string;
  isPreview?: boolean;
  patientName: string;
  setPatientName: (name: string) => void;
  viewMode: 'prescription' | 'lab';
  setViewMode: (mode: 'prescription' | 'lab') => void;
  handlePrint: () => void;
  handleSave?: () => void;
  dateStr: string;
  onPlayAudio?: () => void;
  isPlayingAudio?: boolean;
  t: any;
  language?: string;
}

const PaperHeader: React.FC<PaperHeaderProps> = ({ 
  title, 
  subtitle, 
  isPreview = false, 
  patientName, 
  setPatientName,
  viewMode,
  setViewMode, 
  handlePrint,
  handleSave,
  dateStr,
  onPlayAudio,
  isPlayingAudio,
  t,
  language
}) => {
  const isRTL = language === 'Arabe';
  
  // PREVIEW HEADER (PRINT MODE)
  if (isPreview) {
    return (
      <div className="mb-4">
        {/* Note: Doctor Header is now rendered in the main parent to ensure flow */}
        
        <div className="flex justify-between items-end border-b-2 border-slate-900 pb-4 mb-6 mt-4">
           <div>
             <h2 className="text-3xl font-serif font-bold tracking-widest text-slate-900 uppercase">{title}</h2>
           </div>
           <div className="text-right">
             <div className="text-xs font-bold uppercase text-slate-500 mb-1">{t.date}</div>
             <div className="text-lg font-bold text-slate-900">{dateStr}</div>
           </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
           <div className="flex items-baseline gap-4">
              <span className="text-sm font-bold uppercase text-slate-500 w-24 shrink-0">{t.patient} :</span>
              <input 
                type="text" 
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="font-bold text-xl uppercase text-slate-900 bg-transparent w-full focus:outline-none focus:bg-white/50 focus:ring-1 focus:ring-slate-200 rounded px-1"
                placeholder={t.patientPlaceholder}
              />
           </div>
        </div>
      </div>
    );
  }

  // STANDARD HEADER (EDITOR MODE)
  return (
  <div className={`p-4 sm:p-8 bg-medical-secondary text-white`}>
    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
      <div>
        <div className={`text-[10px] font-serif font-bold uppercase tracking-[0.2em] mb-2 opacity-70`}>
          {t.kingdom}
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">{title}</h2>
        <p className={`text-xs sm:text-sm mt-1 font-light opacity-90`}>{subtitle}</p>
      </div>
      
      <div className={`flex flex-col sm:flex-row gap-3 sm:gap-2 print:hidden w-full sm:w-auto ${isRTL ? 'flex-row-reverse' : ''}`}>
          {onPlayAudio && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onPlayAudio(); }}
              className={`flex-1 sm:flex-initial justify-center px-4 py-3 sm:px-3 sm:py-2 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2 text-sm border border-white/20
                ${isPlayingAudio ? 'bg-medical-accent text-medical-primary animate-pulse' : 'bg-white/10 text-white hover:bg-white/20'}`}
              title="Lire l'ordonnance"
            >
              {isPlayingAudio ? <StopCircle size={18} /> : <Volume2 size={18} />}
            </button>
          )}
          {viewMode === 'lab' && (
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); setViewMode('prescription'); }}
              className="flex-1 sm:flex-initial justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-3 sm:py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium border border-white/10"
            >
              <ArrowLeft size={16} /> <span className="sm:hidden md:inline">{t.backRx}</span>
            </button>
          )}
          {handleSave && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); handleSave(); }}
              className="flex-1 sm:flex-initial justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-3 sm:px-3 sm:py-2 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2 text-sm border border-white/10"
              title={t.save}
            >
               <Save size={18} />
            </button>
          )}
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); handlePrint(); }}
            className="flex-1 sm:flex-initial justify-center bg-white text-medical-secondary px-4 py-3 sm:py-2 rounded-lg font-bold shadow-lg hover:bg-medical-accent transition-all flex items-center gap-2 text-sm"
          >
            <Eye size={16} /> <span className="sm:hidden md:inline">{t.preview}</span>
          </button>
        </div>
    </div>
    
    <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className={`rounded-lg p-3 border bg-white/10 backdrop-blur-md border-white/10`}>
         <span className="block text-[10px] uppercase tracking-wider opacity-70 mb-1">{t.patient}</span>
         <input 
             type="text" 
             placeholder={t.patientPlaceholder}
             value={patientName}
             onChange={(e) => setPatientName(e.target.value)}
             className="w-full bg-transparent border-b border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white font-semibold text-lg py-1"
           />
      </div>
      <div className={`rounded-lg p-3 border bg-white/10 backdrop-blur-md border-white/10`}>
         <span className="block text-[10px] uppercase tracking-wider opacity-70 mb-1">{t.date}</span>
         <span className="font-semibold text-lg block">{dateStr}</span>
      </div>
    </div>
  </div>
  );
};

const PrescriptionPaper: React.FC<PrescriptionPaperProps> = ({ data, language = 'Français', onSave, doctorProfile }) => {
  const [medications, setMedications] = useState<Medication[]>(data.medications);
  const [patientName, setPatientName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newMedQuery, setNewMedQuery] = useState("");
  const [isGeneratingMed, setIsGeneratingMed] = useState(false);
  const [viewMode, setViewMode] = useState<'prescription' | 'lab'>('prescription');
  const [selectedAnalyses, setSelectedAnalyses] = useState<number[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [dateStr] = useState(new Date().toLocaleDateString(language === 'English' ? 'en-US' : (language === 'Arabe' ? 'ar-MA' : 'fr-FR')));
  const [signature, setSignature] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMedications(data.medications);
    if (data.analyses) {
      setSelectedAnalyses(data.analyses.map((_, i) => i));
    }
  }, [data]);

  const t = translations[language as keyof typeof translations] || translations.Français;
  const isRTL = language === 'Arabe';

  const handleUpdate = (index: number, updated: Medication) => {
    const newMeds = [...medications];
    newMeds[index] = updated;
    setMedications(newMeds);
  };

  const handleRemove = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handlePrintPreview = () => {
    setIsPreviewMode(true);
  };

  const handleSavePrescription = () => {
    if (onSave) {
        const updatedData = { ...data, medications };
        onSave(updatedData, patientName);
    }
  };
  
  const handleFinalPrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    const element = pdfRef.current;
    if (!element) return;

    const opt = {
      margin: 0, 
      filename: `Ordonnance_${patientName.replace(/\s+/g, '_') || 'Patient'}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (typeof (window as any).html2pdf !== 'undefined') {
       (window as any).html2pdf().set(opt).from(element).save();
    } else {
       console.error("html2pdf library not loaded");
       alert("Erreur: La librairie d'export PDF n'est pas disponible.");
    }
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedQuery.trim()) return;
    setIsGeneratingMed(true);
    try {
      const newMed = await generateContent(newMedQuery, 'add_medication', 'doctor', undefined, undefined, language);
      if (newMed && 'dci' in newMed) {
        setMedications([...medications, newMed as Medication]);
        setNewMedQuery("");
        setIsAdding(false);
      }
    } catch (error) {
      console.error("Failed to add medication", error);
      alert("Erreur lors de l'ajout. Vérifiez votre connexion.");
    } finally {
      setIsGeneratingMed(false);
    }
  };

  const toggleAnalysis = (index: number) => {
    setSelectedAnalyses(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSignature(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlayAudio = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    try {
      let textToRead = `Ordonnance pour ${patientName || 'le patient'}. Motif: ${data.pathology}. `;
      medications.forEach((med, idx) => {
        textToRead += `Médicament ${idx + 1}: ${med.dci}, ${med.dosageAdult}. `;
      });
      textToRead += `Conseils: ${data.advice.join('. ')}.`;

      const url = await generateSpeech(textToRead, language);
      setAudioUrl(url);
      
      const audio = new Audio(url);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      audioRef.current = audio;
      setIsPlaying(true);
    } catch (e) {
      console.error("Audio generation failed", e);
      alert("Impossible de générer l'audio.");
    }
  };

  const PaperFooter = () => (
    <div className="mt-auto pt-12 flex flex-col items-center sm:items-end break-inside-avoid gap-4">
      {/* PROFESSIONAL SIGNATURE BOX */}
      <div className="group relative">
         <div className="w-64 h-32 border-2 border-slate-800 rounded-md flex items-center justify-center relative overflow-hidden bg-white print:border-black">
             {signature ? (
               <img src={signature} alt="Signature" className="max-h-full max-w-full object-contain" />
             ) : (
               <div className="text-center">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 print:text-black/50 mb-1">{t.signature}</div>
                  <div className="w-32 h-0.5 bg-slate-200 mx-auto mt-8"></div>
               </div>
             )}
         </div>

         {/* Upload Overlay (Hidden when printing) */}
         <label className={`absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-slate-50/90 backdrop-blur-sm border-2 border-dashed border-medical-primary rounded-lg transition-all duration-200 print:hidden 
            ${signature ? 'opacity-0 group-hover:opacity-100' : 'opacity-100 hover:bg-white'}`}>
            <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
            <Upload size={20} className="text-medical-primary mb-1" />
            <span className="text-[10px] font-bold text-medical-primary uppercase tracking-wider">
              {signature ? t.modify : t.importStamp}
            </span>
         </label>

         {/* Delete Action */}
         {signature && (
            <button 
              type="button"
              onClick={() => setSignature(null)} 
              className="absolute -top-2 -right-2 p-1 bg-red-100 text-medical-danger rounded-full hover:bg-red-200 print:hidden shadow-sm z-20" 
              title={t.cancel}
            >
              <X size={12} />
            </button>
         )}
      </div>
      
      <div className={`text-[10px] text-slate-400 max-w-xs text-center sm:text-right leading-relaxed print:text-black/70`}>
        {t.footerDisclaimer && t.footerDisclaimer.split('\n').map((line: string, i: number) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}
        <span className="font-bold text-medical-danger print:text-black">{t.emergency}</span>
      </div>
    </div>
  );

  // --- FULL SCREEN PREVIEW MODE ---
  if (isPreviewMode) {
     return (
       <div className="fixed inset-0 z-[100] bg-slate-200 flex flex-col h-screen w-screen overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
         {/* Toolbar */}
         <div className="bg-medical-secondary text-white px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row justify-between items-center shadow-lg shrink-0 print:hidden gap-3">
            <h3 className="font-bold text-lg flex items-center gap-2"><Printer size={20}/> {t.previewTitle}</h3>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button 
                type="button"
                onClick={handleExportPDF} 
                className="flex-grow sm:flex-grow-0 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Download size={16} /> {t.exportPDF}
              </button>
              <button 
                type="button"
                onClick={() => setIsPreviewMode(false)} 
                className="flex-grow sm:flex-grow-0 px-4 py-2 rounded-lg hover:bg-white/10 text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} /> {t.backEdit}
              </button>
              <button 
                type="button"
                onClick={handleFinalPrint} 
                className="flex-grow sm:flex-grow-0 px-6 py-2 bg-medical-primary hover:bg-blue-600 text-white rounded-lg font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Printer size={16} /> {t.print}
              </button>
            </div>
         </div>

         {/* Scrollable Document Area */}
         <div className="flex-grow overflow-y-auto p-4 sm:p-8 print:p-0 flex justify-center bg-slate-200/50 print:bg-white">
            <div ref={pdfRef} className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl p-0 print:shadow-none print:w-full print:max-w-none print:min-h-0 print:m-0 flex flex-col box-border relative">
               
               {/* --- A4 PDF STRUCTURE (LINEAR FLOW) --- */}
               
               {/* 1. Doctor Profile Header */}
               <div className="p-10 pb-0 w-full bg-white print:bg-white">
                 <div className="border-b-2 border-slate-900 pb-4">
                    <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">{doctorProfile?.name || "Dr. Medecin"}</h1>
                    <p className="text-sm font-semibold text-slate-600 uppercase">{doctorProfile?.specialty || "Médecine Générale"}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                        <MapPin size={12} /> {doctorProfile?.address || "Casablanca, Maroc"}
                    </div>
                    {doctorProfile?.phone && <div className="text-xs text-slate-500">Tél: {doctorProfile.phone}</div>}
                 </div>
               </div>

               {/* 2. Main Content Container */}
               <div className="flex-grow flex flex-col p-10 pt-4">
                  
                  {viewMode === 'lab' ? (
                    <>
                        <PaperHeader 
                          title={t.titleLab} 
                          subtitle={t.subtitleLab} 
                          isPreview={true} 
                          patientName={patientName}
                          setPatientName={setPatientName}
                          viewMode={viewMode}
                          setViewMode={setViewMode}
                          handlePrint={handlePrintPreview}
                          handleSave={handleSavePrescription}
                          dateStr={dateStr}
                          t={t}
                          language={language}
                        />
                        <div className="mt-8 space-y-6 flex-grow">
                          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                              <AlertTriangle size={20} className="text-slate-900" />
                              <div>
                                <p className="text-xs uppercase tracking-bold text-slate-500 font-bold">{t.clinicalContext}</p>
                                <p className="text-lg font-bold text-slate-900">{data.pathology}</p>
                              </div>
                          </div>
                          <ul className="space-y-4">
                            {selectedAnalyses.map((idx) => {
                              const analysis = data.analyses[idx];
                              return (
                                <li key={idx} className="flex items-start gap-4 p-2 last:border-0">
                                  <div className="mt-1 text-black"><CheckSquare size={18} /></div>
                                  <div>
                                    <p className="font-bold text-lg text-black">{analysis.name}</p>
                                    <p className="text-sm text-slate-600 italic mt-1">{analysis.reason && `${t.indication} : ${analysis.reason}`}</p>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                    </>
                  ) : (
                    <>
                        <PaperHeader 
                          title={t.titleRx} 
                          subtitle={t.subtitleRx} 
                          isPreview={true} 
                          patientName={patientName}
                          setPatientName={setPatientName}
                          viewMode={viewMode}
                          setViewMode={setViewMode}
                          handlePrint={handlePrintPreview}
                          handleSave={handleSavePrescription}
                          dateStr={dateStr}
                          t={t}
                          language={language}
                        />
                        <div className="mt-8 space-y-6 flex-grow">
                          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                              <AlertTriangle size={20} className="text-slate-900" />
                              <div>
                                <p className="text-xs uppercase tracking-bold text-slate-500 font-bold">{t.motif}</p>
                                <p className="text-lg font-bold text-slate-900">{data.pathology}</p>
                              </div>
                          </div>
                          <ul className="space-y-2">
                            {medications.map((med, index) => (
                              <MedicationItem 
                                key={index} 
                                index={index}
                                med={med} 
                                onRemove={() => {}} 
                                onUpdate={handleUpdate} // Allow update even in preview
                                readOnly={true}
                                language={language}
                                t={t}
                              />
                            ))}
                          </ul>
                        </div>
                    </>
                  )}

                  <PaperFooter />
               </div>
            </div>
         </div>
       </div>
     );
  }

  // --- EDITOR MODE (Standard Prescription) ---
  return (
    <div className="bg-medical-surface rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 flex flex-col h-full relative print:shadow-none print:border-none" dir={isRTL ? 'rtl' : 'ltr'}>
      
      <PaperHeader 
        title={t.titleRx} 
        subtitle={t.subtitleRx}
        patientName={patientName}
        setPatientName={setPatientName}
        viewMode={viewMode}
        setViewMode={setViewMode}
        handlePrint={handlePrintPreview}
        handleSave={handleSavePrescription}
        dateStr={dateStr}
        onPlayAudio={handlePlayAudio}
        isPlayingAudio={isPlaying}
        t={t}
        language={language}
      />

      <div className="p-4 sm:p-8 flex-grow space-y-6 sm:space-y-10">
        
        {/* Pathology Context */}
        <div className="flex items-center gap-3 text-slate-700 pb-6 border-b border-slate-100">
          <div className="p-2 bg-medical-accent rounded-lg">
            <AlertTriangle size={20} className="text-medical-secondary" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-bold text-slate-400 font-bold">{t.motif}</p>
            <p className="text-lg font-bold">{data.pathology}</p>
          </div>
        </div>

        {/* Medications Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
             <h3 className="flex items-center gap-2 text-medical-secondary font-bold uppercase tracking-widest text-xs">
                <Pill size={16} /> {t.prescriptionTitle}
             </h3>
          </div>
          
          <ul className="space-y-6">
            {medications.map((med, index) => (
              <MedicationItem 
                key={index} 
                index={index}
                med={med} 
                onRemove={handleRemove}
                onUpdate={handleUpdate}
                readOnly={false}
                language={language}
                t={t}
              />
            ))}
          </ul>

          {/* ADD MEDICATION SECTION */}
          <div className="mt-8">
            {!isAdding ? (
              <button 
                type="button"
                onClick={() => setIsAdding(true)}
                className="group w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-medium flex items-center justify-center gap-2 hover:border-medical-primary hover:text-medical-primary hover:bg-medical-accent transition-all duration-300"
              >
                <div className="bg-slate-50 rounded-full p-1 group-hover:bg-white transition-colors">
                  <Plus size={18} />
                </div>
                {t.addMedManual}
              </button>
            ) : (
              <div className="bg-white p-5 rounded-2xl shadow-lg border border-medical-primary/20 animate-fade-in-up">
                <h4 className="text-sm font-bold text-medical-secondary mb-4 flex items-center gap-2">
                  <Sparkles size={16} className="text-medical-primary" /> {t.aiAssistant}
                </h4>
                <form onSubmit={handleAddMedication} className="flex gap-3">
                  <input 
                    type="text" 
                    value={newMedQuery}
                    onChange={(e) => setNewMedQuery(e.target.value)}
                    placeholder={t.medicationPlaceholder}
                    className="flex-grow px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary text-slate-900 transition-all"
                    autoFocus
                  />
                  <button 
                    type="submit" 
                    disabled={isGeneratingMed || !newMedQuery.trim()}
                    className="bg-medical-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-md"
                  >
                    {isGeneratingMed ? <Loader2 className="animate-spin" size={20} /> : t.add}
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setIsAdding(false); setNewMedQuery(""); }}
                    className="text-slate-400 hover:text-slate-600 px-3 font-medium transition-colors"
                  >
                    {t.cancel}
                  </button>
                </form>
                <div className="mt-3 flex items-start gap-2 text-xs text-slate-400 bg-slate-50 p-2 rounded-lg">
                  <CheckCircle2 size={12} className="mt-0.5 text-medical-primary" />
                   L'assistant identifiera automatiquement la DCI, les alternatives commerciales marocaines et les posologies.
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Analyses Section with Selection Mode */}
        {data.analyses.length > 0 && (
          <section className="pt-6 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
               <h3 className="flex items-center gap-2 text-slate-800 font-bold uppercase tracking-widest text-xs">
                <FileText size={16} /> {t.labTitle}
               </h3>
               
               <button 
                 type="button"
                 onClick={() => setViewMode('lab')}
                 className="flex items-center gap-2 px-3 py-1.5 bg-medical-accent text-medical-primary rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors w-full sm:w-auto justify-center"
                 title="Générer une ordonnance séparée pour ces examens"
               >
                 <FlaskConical size={14} /> {t.genLabRx}
               </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {data.analyses.map((analysis, idx) => {
                const isSelected = selectedAnalyses.includes(idx);
                return (
                  <div key={idx} 
                       onClick={() => toggleAnalysis(idx)}
                       className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 group
                         ${isSelected ? 'bg-medical-accent/30 border-medical-primary' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                  >
                    <div className={`mt-0.5 ${isSelected ? 'text-medical-primary' : 'text-slate-300 group-hover:text-slate-400'}`}>
                       {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                    </div>
                    <div>
                      <p className={`font-bold ${isSelected ? 'text-medical-secondary' : 'text-slate-400'}`}>{analysis.name}</p>
                      <p className="text-xs text-slate-500 mt-1 italic">{analysis.reason}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 italic">
              {t.checkLabNote}
            </p>
          </section>
        )}
      </div>
    </div>
  );
};

export default PrescriptionPaper;
