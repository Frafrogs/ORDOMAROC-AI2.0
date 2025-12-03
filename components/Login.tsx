
import React, { useState, useEffect, useRef } from 'react';
import { auth, googleProvider, signInWithPopup, isFirebaseConfigured } from '../firebase';
import { useAuth } from '../AuthContext';
import { Stethoscope, ArrowRight, AlertCircle, ShieldCheck, TestTube2, Volume2, VolumeX } from 'lucide-react';

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { loginAsDemo } = useAuth();
  const [isMuted, setIsMuted] = useState(false); // Default to unmuted if browser allows, otherwise browser policy forces mute
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Attempt to play audio on mount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.4; // Ambient volume
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Auto-play was prevented.
          setIsMuted(true);
        });
      }
    }
  }, []);

  const handleGoogleLogin = async () => {
    if (!isFirebaseConfigured || !auth) {
      setError("Firebase n'est pas configuré. Veuillez utiliser le mode démo ou configurer firebase.ts");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/api-key-not-valid') {
        setError("Clé API Firebase invalide. Vérifiez firebase.ts");
      } else {
        setError("Échec de l'authentification. Veuillez réessayer.");
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch(e => console.log(e));
      } else {
        audioRef.current.pause();
      }
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
      
      {/* --- BACKGROUND VIDEO --- */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover"
        >
          {/* Abstract Medical/Tech Background Video */}
          <source src="https://cdn.coverr.co/videos/coverr-medical-laboratories-2633/1080p.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Dark Overlay for readability */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
      </div>

      {/* --- AUDIO AMBIENCE --- */}
      <audio 
        ref={audioRef} 
        loop 
        src="https://cdn.pixabay.com/download/audio/2022/03/24/audio_c8c8a73467.mp3?filename=hospital-corridor-16327.mp3" 
      />

      {/* Mute Control */}
      <button 
        onClick={toggleMute}
        className="absolute top-6 right-6 z-20 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-md border border-white/10 shadow-lg"
        title={isMuted ? "Activer le son" : "Couper le son"}
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>

      {/* --- LOGIN CARD --- */}
      <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-white/20 animate-fade-in-up">
        {/* Header */}
        <div className="bg-medical-secondary/90 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md shadow-inner border border-white/20 animate-float-slow">
             <Stethoscope className="text-white h-10 w-10" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2 tracking-tight">OrdoMaroc AI</h1>
          <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-90">Assistant Médical Intelligent</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Authentification Requise</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Veuillez vous connecter avec votre compte professionnel pour accéder à l'interface.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 text-sm border border-red-100">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!isFirebaseConfigured ? (
            <div className="space-y-4">
               <div className="bg-orange-50 text-orange-800 p-4 rounded-xl text-sm border border-orange-100 mb-4 flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <strong>Configuration requise :</strong> Clés Firebase manquantes.
                  </div>
               </div>
               <button
                onClick={loginAsDemo}
                className="w-full py-4 bg-medical-accent/50 text-medical-primary border border-medical-primary/20 hover:bg-blue-50/80 rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-3 group"
              >
                <TestTube2 size={20} />
                <span>Accéder au Mode Démo</span>
                <ArrowRight size={18} className="text-medical-primary group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="w-full py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 group"
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google" 
                className="w-6 h-6"
              />
              <span>Continuer avec Google</span>
              <ArrowRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          )}

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={14} />
            <span>Accès sécurisé & confidentiel</span>
          </div>
        </div>
      </div>
      
      <p className="mt-8 text-white/70 text-xs text-center z-10 drop-shadow-md">
        © {new Date().getFullYear()} OrdoMaroc AI • Usage Professionnel Uniquement
      </p>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float-slow {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;
