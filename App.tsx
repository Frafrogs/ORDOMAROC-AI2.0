
import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Sparkles, WifiOff, FileText, Pill, Microscope, Activity, ChevronRight, History, Settings, RefreshCw, AlertTriangle, Mic, Camera, UserCog, Baby, Ambulance, GraduationCap, Stethoscope, Video, Image as ImageIcon, Download, LogOut, ArrowRight, PlayCircle } from 'lucide-react';
import Header from './components/Header';
import Disclaimer from './components/Disclaimer';
import PrescriptionPaper from './components/PrescriptionPaper';
import AdviceCard from './components/AdviceCard';
import DrugReferenceResult from './components/DrugReferenceResult';
import PathologyEncyclopediaResult from './components/PathologyEncyclopediaResult';
import SideMenu from './components/SideMenu'; 
import HistoryModal from './components/HistoryModal';
import DoctorProfileModal from './components/DoctorProfileModal';
import Login from './components/Login';
import IntroAnimation from './components/IntroAnimation';
import { AuthProvider, useAuth } from './AuthContext';
import { auth, signOut } from './firebase';
import { generateContent } from './services/geminiService';
import { MedicalResponse, ReferenceResponse, AppMode, AppError, UserPersona, EncyclopediaResponse, ImageGenerationResponse, VideoGenerationResponse, SavedPrescription, DoctorProfile } from './types';

// --- BASE DE DONNÉES D'AUTO-COMPLÉTION (MAROC) ---
const SUGGESTIONS_DB = {
  pathology: [
    "Rhinopharyngite aiguë", "Angine bactérienne", "Bronchite aiguë", "Grippe saisonnière",
    "Otite moyenne aiguë", "Sinusite aiguë", "Cystite aiguë simple", "Pyélonéphrite",
    "Gastro-entérite aiguë", "Gastrite", "Reflux gastro-œsophagien (RGO)", "Ulcère gastroduodénal",
    "Hypertension artérielle (HTA)", "Diabète de type 2", "Dyslipidémie",
    "Asthme", "BPCO exacerbation", "Pneumopathie",
    "Lombalgie commune", "Sciatique", "Arthrose du genou", "Goutte (crise)",
    "Eczéma de contact", "Psoriasis", "Acné sévère", "Mycose cutanée",
    "Migraine", "Céphalée de tension", "Vertige positionnel",
    "Conjonctivite bactérienne", "Conjonctivite allergique",
    "Anémie ferriprive", "Carence en vitamine D"
  ],
  molecule: [
    "Amoxicilline", "Amoxicilline + Acide Clavulanique", "Azithromycine", "Ciprofloxacine",
    "Paracétamol", "Ibuprofène", "Acide acétylsalicylique", "Tramadol",
    "Oméprazole", "Esoméprazole", "Lansoprazole", "Pantoprazole",
    "Metformine", "Gliclazide", "Insuline",
    "Amlodipine", "Bisoprolol", "Ramipril", "Valsartan", "Atorvastatine",
    "Cetirizine", "Desloratadine", "Loratadine",
    "Prednisolone", "Betamethasone", "Dexamethasone",
    "Phloroglucinol", "Dompéridone", "Mébévérine",
    "Diosmine", "Hespéridine", "Furosémide"
  ],
  class: [
    "Antibiotiques (Pénicillines)", "Antibiotiques (Macrolides)", "Antibiotiques (Quinolones)",
    "Anti-inflammatoires non stéroïdiens (AINS)", "Corticoïdes",
    "Antalgiques (Palier 1)", "Antalgiques (Palier 2)",
    "Inhibiteurs de la pompe à protons (IPP)", "Anti-H2",
    "Statines", "Fibrates", "Bêta-bloquants", "IEC (Inhibiteurs de l'enzyme de conversion)",
    "ARA II (Sartans)", "Diurétiques",
    "Antidiabétiques oraux", "Insulines",
    "Antihistaminiques", "Bronchodilatateurs",
    "Antifongiques", "Antiviraux"
  ],
  brands: [
    "Doliprane", "Efferalgan", "Augmentin", "Clamoxyl", "Amoxil", "Rhumix", "Febrex", "Antigrippine",
    "Smecta", "Imodium", "Spasfon", "Visceralgine", "Voltarene", "Cataflam", "Aerius", "Zyrtec",
    "Gaviscon", "Mopral", "Flagyl", "Ciproxine", "Zinnat", "Orelox", "Oflocet",
    "Solupred", "Celestene", "Tahor", "Crestor", "Plavix", "Kardegic", "Aspro",
    "Ventoline", "Seretide", "Symbicort", "Xanax", "Lexomil", "Deroxat"
  ],
  add_medication: [] 
};

// Translations
const UI_TRANSLATIONS = {
  Français: {
    landingTitle: "Assistant Clinique Intelligent",
    landingSubtitle: "Génération d'ordonnances, Illustrations & Encyclopédie médicale",
    personas: {
      doctor: "Médecin",
      student: "Étudiant",
      emergency: "Urgence",
      pediatric: "Pédiatrie",
      specialist: "Spécialiste"
    },
    tabs: {
      pathology: "Ordonnance",
      molecule: "Molécule / Marque",
      class: "Classe Thérapeutique",
      encyclopedia: "Pathologies",
      image_generation: "Illustration",
      video_generation: "Vidéo (Veo)"
    },
    placeholders: {
      pathology: "Décrivez une pathologie (ex: Angine, Grippe...)",
      molecule: "Entrez une DCI ou Nom Commercial (ex: Amoxil...)",
      class: "Entrez une classe (ex: Macrolides, Statines...)",
      encyclopedia: "Rechercher une pathologie (ex: Diabète, Asthme...)",
      image_generation: "Décrivez l'illustration médicale à générer (ex: Anatomie du coeur...)",
      video_generation: "Décrivez la vidéo médicale (ex: Battement cardiaque, Flux sanguin...)",
      default: "Recherche...",
      listening: "Écoute en cours..."
    },
    go: "GO",
    quickSuggestions: "Suggestions Rapides",
    format: "Format",
    ratios: {
      square: "Carré (1:1)",
      standard: "Standard (4:3)",
      portrait: "Portrait (3:4)",
      landscape: "Paysage (16:9)",
      story: "Story (9:16)"
    }
  },
  English: {
    landingTitle: "Intelligent Clinical Assistant",
    landingSubtitle: "Prescription generation, Illustrations & Medical Encyclopedia",
    personas: {
      doctor: "Doctor",
      student: "Student",
      emergency: "Emergency",
      pediatric: "Pediatric",
      specialist: "Specialist"
    },
    tabs: {
      pathology: "Prescription",
      molecule: "Molecule / Brand",
      class: "Therapeutic Class",
      encyclopedia: "Pathologies",
      image_generation: "Illustration",
      video_generation: "Video (Veo)"
    },
    placeholders: {
      pathology: "Describe a condition (e.g., Angina, Flu...)",
      molecule: "Enter INN or Brand Name (e.g., Amoxil...)",
      class: "Enter a class (e.g., Macrolides...)",
      encyclopedia: "Search for a pathology (e.g., Diabetes...)",
      image_generation: "Describe medical illustration (e.g., Heart anatomy...)",
      video_generation: "Describe medical video (e.g., Heart beat, Blood flow...)",
      default: "Search...",
      listening: "Listening..."
    },
    go: "GO",
    quickSuggestions: "Quick Suggestions",
    format: "Format",
    ratios: {
      square: "Square (1:1)",
      standard: "Standard (4:3)",
      portrait: "Portrait (3:4)",
      landscape: "Landscape (16:9)",
      story: "Story (9:16)"
    }
  },
  Arabe: {
    landingTitle: "المساعد الطبي الذكي",
    landingSubtitle: "توليد الوصفات الطبية، الرسوم التوضيحية والموسوعة الطبية",
    personas: {
      doctor: "طبيب",
      student: "طالب",
      emergency: "طوارئ",
      pediatric: "طب الأطفال",
      specialist: "أخصائي"
    },
    tabs: {
      pathology: "وصفة طبية",
      molecule: "دواء / علامة تجارية",
      class: "فئة علاجية",
      encyclopedia: "أمراض",
      image_generation: "توضيح",
      video_generation: "فيديو (Veo)"
    },
    placeholders: {
      pathology: "أدخل الأعراض أو المرض...",
      molecule: "أدخل اسم الدواء...",
      class: "أدخل الفئة العلاجية...",
      encyclopedia: "ابحث عن مرض...",
      image_generation: "صف الرسم الطبي (مثال: تشريح القلب...)",
      video_generation: "صف الفيديو الطبي (مثال: نبض القلب...)",
      default: "أدخل الأعراض، الدواء أو المرض...",
      listening: "جاري الاستماع..."
    },
    go: "إبدأ",
    quickSuggestions: "اقتراحات سريعة",
    format: "تنسيق",
    ratios: {
      square: "مربع (1:1)",
      standard: "قياسي (4:3)",
      portrait: "طولي (3:4)",
      landscape: "عرضي (16:9)",
      story: "قصة (9:16)"
    }
  }
};

// Web Speech API Definition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const AppContent: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  
  const [mode, setMode] = useState<AppMode>('pathology');
  const [persona, setPersona] = useState<UserPersona>('doctor');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MedicalResponse | ReferenceResponse | EncyclopediaResponse | ImageGenerationResponse | VideoGenerationResponse | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Settings & Theme
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('Français');

  // Image/Video Gen Settings
  const [aspectRatio, setAspectRatio] = useState("1:1"); // Used for Image
  const [videoAspectRatio, setVideoAspectRatio] = useState("16:9"); // Used for Video

  // Media Inputs
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Autocomplete
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // History State
  const [history, setHistory] = useState<SavedPrescription[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Doctor Profile State
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Intro Animation State
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Theme Management
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Load History
    const savedHistory = localStorage.getItem('ordomaroc_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    // Load Doctor Profile
    const savedProfile = localStorage.getItem('doctor_profile');
    if (savedProfile) {
      try {
        setDoctorProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Failed to parse profile", e);
        setShowProfileModal(true);
      }
    } else if (currentUser) {
      // If user is logged in but no profile is saved, show modal
      setShowProfileModal(true);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [darkMode, currentUser]);

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    setResult(null);
    setError(null);
    setInput('');
    setSuggestions([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    if (value.length > 1 && mode !== 'image_generation' && mode !== 'video_generation') {
      const currentList = (mode === 'pathology' || mode === 'encyclopedia') ? SUGGESTIONS_DB.pathology 
                        : mode === 'molecule' ? [...SUGGESTIONS_DB.molecule, ...SUGGESTIONS_DB.brands]
                        : mode === 'class' ? SUGGESTIONS_DB.class
                        : [...SUGGESTIONS_DB.pathology, ...SUGGESTIONS_DB.molecule, ...SUGGESTIONS_DB.brands];

      const filtered = currentList.filter(item => 
        item.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5); 
      
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'Arabe' ? 'ar-MA' : (language === 'English' ? 'en-US' : 'fr-FR');
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error("Speech error", event.error);
      setIsListening(false);
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("L'image est trop volumineuse (max 5MB).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      // If in video generation mode, image is used as input for video
      if (mode === 'video_generation') {
        // Just store logic here or directly generate if prompt is ready? 
        // For simplicity, we just trigger generation with existing prompt if available, or wait
        // But better: Just pass base64 to generate function
        handleGenerate(undefined, base64String);
      } else {
        // Switch to pathology analysis for image
        if (mode === 'image_generation') setMode('pathology');
        handleGenerate(undefined, base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert("La vidéo est trop volumineuse (max 20MB pour cette démo).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      if (mode === 'image_generation' || mode === 'video_generation') setMode('pathology');
      handleGenerate(undefined, undefined, base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (e?: React.FormEvent, imageBase64?: string, videoBase64?: string) => {
    if (e) e.preventDefault();
    if (!input.trim() && !imageBase64 && !videoBase64) return;
    setShowSuggestions(false);

    if (!isOnline) {
      setError({
        code: 'NETWORK_ERROR',
        title: 'Pas de connexion',
        message: 'Vous êtes hors ligne. Une connexion internet est requise.',
        hint: 'Vérifiez votre Wi-Fi ou vos données mobiles.'
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Determine effective mode
      let effectiveMode = mode;
      
      // Pass aspect ratio based on mode
      let ratio = aspectRatio;
      if (mode === 'video_generation') {
        ratio = videoAspectRatio;
      }

      if ((imageBase64 || videoBase64) && mode === 'image_generation') {
        effectiveMode = 'pathology';
      } else if (imageBase64 && mode !== 'encyclopedia' && mode !== 'video_generation') {
        effectiveMode = 'molecule'; 
      }

      const data = await generateContent(input, effectiveMode, persona, imageBase64, videoBase64, language, ratio);
      setResult(data as any);
    } catch (err: any) {
      const appError: AppError = err.code ? err : {
        code: 'UNKNOWN_ERROR',
        title: 'Erreur inattendue',
        message: 'Une erreur non identifiée est survenue.',
        hint: 'Veuillez réessayer.'
      };
      
      setError(appError);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  // --- HISTORY MANAGEMENT ---
  const handleSavePrescription = (dataToSave: MedicalResponse, patientName: string) => {
    const newPrescription: SavedPrescription = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString(language === 'English' ? 'en-US' : (language === 'Arabe' ? 'ar-MA' : 'fr-FR')),
      patientName: patientName || (language === 'Arabe' ? 'مريض غير معروف' : 'Unknown Patient'),
      data: dataToSave
    };

    const updatedHistory = [newPrescription, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('ordomaroc_history', JSON.stringify(updatedHistory));
    alert(language === 'Arabe' ? "تم حفظ الوصفة بنجاح" : "Ordonnance enregistrée dans l'historique.");
  };

  const handleLoadPrescription = (saved: SavedPrescription) => {
    setResult(saved.data);
    setMode('pathology');
  };

  const handleDeletePrescription = (id: string) => {
    if (confirm(language === 'Arabe' ? "هل أنت متأكد؟" : "Confirmer la suppression ?")) {
      const updatedHistory = history.filter(h => h.id !== id);
      setHistory(updatedHistory);
      localStorage.setItem('ordomaroc_history', JSON.stringify(updatedHistory));
    }
  };

  // --- DOCTOR PROFILE MANAGEMENT ---
  const handleSaveProfile = (profile: DoctorProfile) => {
    setDoctorProfile(profile);
    localStorage.setItem('doctor_profile', JSON.stringify(profile));
    setShowProfileModal(false);
  };

  const handleLogout = () => {
    if (auth) {
      signOut(auth);
    }
  };

  // Get current translations
  const t = UI_TRANSLATIONS[language as keyof typeof UI_TRANSLATIONS] || UI_TRANSLATIONS.Français;

  const getPlaceholder = () => {
    if (isListening) return t.placeholders.listening;
    
    switch (mode) {
      case 'pathology': return t.placeholders.pathology;
      case 'molecule': return t.placeholders.molecule;
      case 'class': return t.placeholders.class;
      case 'encyclopedia': return t.placeholders.encyclopedia;
      case 'image_generation': return t.placeholders.image_generation;
      case 'video_generation': return t.placeholders.video_generation;
      default: return t.placeholders.default;
    }
  };

  const personaOptions: { id: UserPersona, label: string, icon: any }[] = [
    { id: 'doctor', label: t.personas.doctor, icon: Stethoscope },
    { id: 'student', label: t.personas.student, icon: GraduationCap },
    { id: 'emergency', label: t.personas.emergency, icon: Ambulance },
    { id: 'pediatric', label: t.personas.pediatric, icon: Baby },
    { id: 'specialist', label: t.personas.specialist, icon: UserCog },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-medical-background flex items-center justify-center">
        <Loader2 className="animate-spin text-medical-primary h-12 w-12" />
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div 
      className={`min-h-screen bg-medical-background dark:bg-slate-900 flex flex-col font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300`}
      dir={language === 'Arabe' ? 'rtl' : 'ltr'}
    >
      <Header language={language} />

      <SideMenu 
        darkMode={darkMode} 
        toggleDarkMode={() => setDarkMode(!darkMode)}
        language={language}
        setLanguage={setLanguage}
        onOpenHistory={() => setShowHistoryModal(true)}
        onLogout={handleLogout}
      />
      
      {showProfileModal && (
        <DoctorProfileModal 
          onSave={handleSaveProfile} 
          initialProfile={doctorProfile} 
        />
      )}

      <HistoryModal 
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        history={history}
        onLoad={handleLoadPrescription}
        onDelete={handleDeletePrescription}
        language={language}
      />
      
      {!isOnline && (
        <div className="bg-medical-danger text-white text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2 animate-pulse">
          <WifiOff size={16} />
          Connexion perdue. Mode hors ligne activé.
        </div>
      )}

      <main className="flex-grow max-w-6xl mx-auto w-full px-3 py-6 sm:px-4 sm:py-10 relative z-10">
        
        {/* Input Section */}
        <div className="max-w-4xl mx-auto mb-8 sm:mb-12 text-center">
          <div className="mb-8">
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-medical-secondary dark:text-white mb-2 sm:mb-4 tracking-tight leading-tight drop-shadow-sm">
              {t.landingTitle}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-xl font-light">
               {t.landingSubtitle}
            </p>
          </div>

          {/* Persona Selector */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-full shadow-lg border border-white/50 dark:border-slate-700 p-1.5 gap-1 overflow-x-auto max-w-full scrollbar-hide snap-x">
              {personaOptions.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPersona(p.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 sm:py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap snap-center shrink-0 ${
                    persona === p.id 
                      ? `bg-medical-secondary text-white shadow-md transform scale-105` 
                      : 'text-slate-500 dark:text-slate-400 hover:bg-white/80 hover:text-medical-primary dark:hover:bg-slate-700'
                  }`}
                >
                  <p.icon size={16} className={persona === p.id ? 'text-white' : 'text-medical-secondary/70 dark:text-slate-400'} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex flex-wrap justify-center gap-2 p-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/50 dark:border-slate-700 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none mb-8 mx-auto max-w-4xl">
            {[
              { id: 'encyclopedia', icon: Activity, label: t.tabs.encyclopedia },
              { id: 'class', icon: Microscope, label: t.tabs.class },
              { id: 'molecule', icon: Pill, label: t.tabs.molecule },
              { id: 'pathology', icon: FileText, label: t.tabs.pathology },
              { id: 'image_generation', icon: ImageIcon, label: t.tabs.image_generation },
              { id: 'video_generation', icon: Video, label: t.tabs.video_generation },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleModeChange(tab.id as AppMode)}
                className={`relative flex items-center gap-2 px-5 py-3.5 sm:px-4 sm:py-3 rounded-2xl text-sm font-bold transition-all duration-300 ease-out flex-grow sm:flex-grow-0 justify-center border ${
                  mode === tab.id 
                    ? 'bg-gradient-to-r from-medical-primary to-blue-600 text-white shadow-lg shadow-blue-200/50 dark:shadow-blue-900/50 border-transparent transform scale-[1.02]' 
                    : 'bg-transparent text-slate-500 dark:text-slate-400 border-transparent hover:bg-white/50 dark:hover:bg-slate-700/50 hover:border-slate-200/50'
                }`}
              >
                <tab.icon size={18} className={mode === tab.id ? 'animate-pulse' : 'opacity-70'} /> 
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </div>
          
          {/* Image Gen Controls */}
          {mode === 'image_generation' && (
            <div className="flex justify-center mb-6 animate-fade-in-up">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.format}</span>
                <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>
                <select 
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="bg-transparent font-bold text-medical-primary focus:outline-none text-sm cursor-pointer"
                >
                  <option value="1:1">{t.ratios.square}</option>
                  <option value="4:3">{t.ratios.standard}</option>
                  <option value="3:4">{t.ratios.portrait}</option>
                  <option value="16:9">{t.ratios.landscape}</option>
                  <option value="9:16">{t.ratios.story}</option>
                </select>
              </div>
            </div>
          )}

          {/* Video Gen Controls */}
          {mode === 'video_generation' && (
            <div className="flex justify-center mb-6 animate-fade-in-up">
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.format}</span>
                <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>
                <select 
                  value={videoAspectRatio}
                  onChange={(e) => setVideoAspectRatio(e.target.value)}
                  className="bg-transparent font-bold text-medical-primary focus:outline-none text-sm cursor-pointer"
                >
                  <option value="16:9">{t.ratios.landscape}</option>
                  <option value="9:16">{t.ratios.story}</option>
                </select>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <form onSubmit={(e) => handleGenerate(e)} className="relative max-w-3xl mx-auto group perspective-1000" ref={searchContainerRef}>
            <div className="absolute -inset-1 bg-gradient-to-r from-medical-primary to-blue-400 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative z-20 flex flex-col sm:flex-row items-stretch sm:items-center bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-blue-900/10 dark:shadow-none border border-slate-200 dark:border-slate-700 transition-all focus-within:ring-4 focus-within:ring-medical-primary/10 focus-within:border-medical-primary transform hover:scale-[1.01] duration-300">
              
              <div className="hidden sm:flex items-center justify-center w-16 text-medical-primary/80">
                <Search className="h-6 w-6" strokeWidth={2.5} />
              </div>
              
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                onFocus={() => input.length > 1 && setSuggestions(suggestions) && setShowSuggestions(true)}
                placeholder={getPlaceholder()}
                className="w-full px-5 py-4 sm:py-6 text-lg text-slate-900 dark:text-white placeholder-slate-400/80 bg-transparent focus:outline-none rounded-3xl"
                disabled={loading || !isOnline}
                autoComplete="off"
              />

              <div className="flex items-center justify-end gap-2 px-3 pb-3 sm:pb-0 sm:pr-3 border-t border-slate-100 dark:border-slate-700 sm:border-t-0 sm:border-l sm:pl-3 pt-2 sm:pt-0">
                <button
                  type="button"
                  onClick={startListening}
                  className={`p-3 rounded-2xl transition-all duration-200 ${isListening ? 'bg-red-50 text-red-500 shadow-inner' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-medical-primary'}`}
                  title="Dictée vocale"
                >
                  <Mic size={22} />
                </button>
                
                {/* Media Inputs available for Image/Video generation mode */}
                {(mode === 'image_generation' || mode === 'video_generation' || mode === 'pathology') && (
                  <>
                    <label className="p-3 rounded-2xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-medical-primary cursor-pointer transition-all duration-200 relative" title="Analyser une image">
                       <input 
                         type="file" 
                         accept="image/*" 
                         capture="environment" 
                         className="hidden" 
                         onChange={handleImageUpload}
                         ref={fileInputRef}
                       />
                       <Camera size={22} />
                    </label>

                    {/* Only show video upload for analysis, not for generation input (unless later feature) */}
                    {mode !== 'video_generation' && (
                        <label className="p-3 rounded-2xl text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-medical-primary cursor-pointer transition-all duration-200 relative" title="Analyser une vidéo">
                        <input 
                            type="file" 
                            accept="video/*"
                            className="hidden" 
                            onChange={handleVideoUpload}
                            ref={videoInputRef}
                        />
                        <Video size={22} />
                        </label>
                    )}
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading || (!input.trim() && !loading) || !isOnline}
                  className="bg-gradient-to-br from-medical-primary to-blue-600 text-white px-6 py-3.5 sm:px-8 sm:py-3.5 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/30 flex items-center gap-2 transform active:scale-95 ml-2 hover:-translate-y-0.5"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      <span className="tracking-wide">{t.go}</span>
                      <ArrowRight size={18} className="opacity-80" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-30 animate-fade-in-up text-left transform origin-top">
                <div className="px-5 py-3 bg-slate-50/50 dark:bg-slate-900/50 text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
                  <Sparkles size={12} className="text-medical-primary" /> {t.quickSuggestions}
                </div>
                <ul>
                  {suggestions.map((suggestion, index) => (
                    <li 
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-6 py-4 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 cursor-pointer flex items-center justify-between text-slate-700 dark:text-slate-300 hover:text-medical-primary dark:hover:text-blue-400 transition-colors border-b border-slate-50 dark:border-slate-700 last:border-0"
                    >
                      <span className="font-medium text-base">{suggestion}</span>
                      <ChevronRight size={16} className="text-slate-300" />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>
        </div>

        {/* Structured Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 animate-fade-in-up">
            <div className="bg-medical-surface dark:bg-slate-800 rounded-xl border border-red-100 dark:border-red-900 shadow-sm p-6 flex flex-col sm:flex-row gap-5 items-start">
              <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-full shrink-0">
                <AlertTriangle className="text-medical-danger w-6 h-6" />
              </div>
              <div className="flex-grow">
                 <h3 className="text-red-800 dark:text-red-400 font-bold text-lg mb-1">{error.title}</h3>
                 <p className="text-slate-600 dark:text-slate-300 text-sm mb-3 leading-relaxed">{error.message}</p>
                 <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg inline-block">
                    {error.hint}
                 </div>
              </div>
              <div className="shrink-0 pt-2">
                 {(error.code === 'INVALID_API_KEY' || error.code === 'API_KEY_MISSING') ? (
                    <div className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-lg text-sm font-bold">
                       Configuration Requise
                    </div>
                 ) : (
                    <button 
                      onClick={() => handleGenerate()}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-bold transition-colors"
                    >
                      <RefreshCw size={16} /> Réessayer
                    </button>
                 )}
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="animate-fade-in-up pb-12">
            
            {/* Image Generation Result */}
            {mode === 'image_generation' && 'type' in result && result.type === 'image_generation' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-medical-surface dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                  <div className="p-8 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-2xl font-serif font-bold text-medical-secondary dark:text-white mb-2">Illustration Médicale</h2>
                    <p className="text-slate-600 dark:text-slate-400 italic">"{result.prompt}"</p>
                  </div>
                  <div className="flex justify-center p-8 bg-slate-50 dark:bg-slate-900">
                    <img 
                      src={result.imageUrl} 
                      alt={result.prompt} 
                      className="max-w-full rounded-lg shadow-lg" 
                    />
                  </div>
                  <div className="p-6 bg-medical-surface dark:bg-slate-800 flex justify-end">
                    <a 
                      href={result.imageUrl} 
                      download={`illustration-${Date.now()}.png`}
                      className="flex items-center gap-2 px-4 py-2 bg-medical-primary text-white rounded-lg font-bold hover:bg-blue-600 transition-colors"
                    >
                      <Download size={18} /> Télécharger
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Video Generation Result */}
            {mode === 'video_generation' && 'type' in result && result.type === 'video_generation' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-medical-surface dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                  <div className="p-8 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                       <Video className="text-medical-primary" size={24} />
                       <h2 className="text-2xl font-serif font-bold text-medical-secondary dark:text-white">Vidéo Médicale (Veo)</h2>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 italic">"{result.prompt}"</p>
                  </div>
                  <div className="flex justify-center p-8 bg-black">
                    <video 
                      src={result.videoUrl} 
                      controls 
                      autoPlay 
                      className="max-w-full max-h-[600px] rounded-lg shadow-lg" 
                    />
                  </div>
                  <div className="p-6 bg-medical-surface dark:bg-slate-800 flex justify-end">
                    <a 
                      href={result.videoUrl} 
                      download={`video-veo-${Date.now()}.mp4`}
                      className="flex items-center gap-2 px-4 py-2 bg-medical-primary text-white rounded-lg font-bold hover:bg-blue-600 transition-colors"
                    >
                      <Download size={18} /> Télécharger MP4
                    </a>
                  </div>
                </div>
              </div>
            )}

            {mode === 'pathology' && 'pathology' in result && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8">
                  <PrescriptionPaper 
                    data={result as MedicalResponse} 
                    language={language}
                    onSave={handleSavePrescription}
                    doctorProfile={doctorProfile}
                  />
                </div>
                <div className="xl:col-span-4 space-y-6">
                  {/* Summary Card */}
                  <div className="bg-medical-surface dark:bg-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                      Synthèse Clinique ({persona.toUpperCase()})
                    </h3>
                    
                    {/* Student/Specialist Mode Reasoning Display */}
                    {(result as MedicalResponse).clinicalReasoning && (
                      <div className="mb-4 p-4 bg-medical-accent/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                        <h4 className="flex items-center gap-2 text-medical-primary dark:text-blue-400 font-bold text-xs uppercase mb-2">
                           <GraduationCap size={14} /> Raisonnement Clinique
                        </h4>
                        <p className="text-sm text-slate-700 dark:text-blue-200 italic">
                          {(result as MedicalResponse).clinicalReasoning}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl mb-4">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Niveau de Sévérité</span>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                        (result as MedicalResponse).severity === 'High' ? 'bg-red-50 text-medical-danger border-red-100 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900' :
                        (result as MedicalResponse).severity === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-900' :
                        'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900'
                      }`}>
                        {(result as MedicalResponse).severity === 'High' ? 'Élevée' : 
                         (result as MedicalResponse).severity === 'Medium' ? 'Modérée' : 'Bénigne'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      Ce protocole thérapeutique est basé sur les dernières recommandations. Il inclut <strong>{(result as MedicalResponse).medications.length} lignes de traitement</strong> et nécessite une surveillance adaptée.
                    </p>
                  </div>

                  <AdviceCard advice={(result as MedicalResponse).advice} />
                </div>
              </div>
            )}

            {mode === 'encyclopedia' && 'type' in result && result.type === 'encyclopedia' && (
              <div className="max-w-5xl mx-auto">
                <PathologyEncyclopediaResult data={result as EncyclopediaResponse} />
              </div>
            )}

            {mode !== 'pathology' && mode !== 'encyclopedia' && mode !== 'image_generation' && mode !== 'video_generation' && 'type' in result && result.type === 'reference' && (
              <div className="max-w-4xl mx-auto">
                <DrugReferenceResult data={result as ReferenceResponse} />
              </div>
            )}
          </div>
        )}

      </main>

      <footer className="mt-auto py-8 text-center text-slate-400 text-sm print:hidden">
        <p className="font-serif italic opacity-70">"La médecine est une science d'incertitude et un art de probabilité."</p>
        <p className="mt-2 text-xs">© {new Date().getFullYear()} OrdoMaroc AI • Données à titre indicatif • Vérifiez toujours le RCP</p>
      </footer>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
