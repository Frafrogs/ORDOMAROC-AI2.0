
import React, { useEffect, useState } from 'react';
import { Stethoscope } from 'lucide-react';

interface Props {
  isReady: boolean;
  onComplete: () => void;
}

const IntroAnimation: React.FC<Props> = ({ isReady, onComplete }) => {
  const [stage, setStage] = useState(0); // 0: Tunnel, 1: Doors, 2: Logo, 3: Exit

  useEffect(() => {
    if (isReady) {
      // Sequence
      // 0s: Start Walking (Tunnel Zoom)
      // 1.5s: Doors Open
      // 2.5s: Flash / Logo Appear
      // 4.0s: Fade out / Exit
      
      const t1 = setTimeout(() => setStage(1), 1200);
      const t2 = setTimeout(() => setStage(2), 2200);
      const t3 = setTimeout(() => {
        setStage(3);
        setTimeout(onComplete, 1000); // Allow fade out
      }, 3500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [isReady, onComplete]);

  if (stage === 3) {
     // Fading out overlay to reveal app
     return (
       <div className="fixed inset-0 z-[100] bg-white pointer-events-none transition-opacity duration-1000 opacity-0 flex items-center justify-center">
          <div className="text-medical-secondary scale-75 transition-transform duration-1000 -translate-y-full opacity-0">
             <Stethoscope size={64} />
          </div>
       </div>
     );
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-slate-900 perspective-1000">
      
      {/* 3D Tunnel Effect */}
      <div 
        className={`absolute inset-0 w-full h-full transition-transform duration-[2500ms] ease-in-out ${stage >= 1 ? 'scale-[3] opacity-0' : 'scale-100 opacity-100'}`}
        style={{ transformOrigin: 'center center' }}
      >
         {/* Simulated Corridor with Radial Gradient */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_10%,_#0F5132_40%,_#000000_90%)]"></div>
         
         {/* Floor Grid Lines for perspective feel */}
         <div className="absolute bottom-0 w-full h-1/2 bg-[linear-gradient(to_top,transparent_0%,rgba(255,255,255,0.1)_100%)] opacity-30 transform perspective-[500px] rotate-x-60"></div>
         
         {/* Ceiling Lights simulation */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-full flex flex-col gap-20 pt-10 opacity-50">
            {[1,2,3,4].map(i => (
               <div key={i} className="w-full h-2 bg-white blur-md rounded-full shadow-[0_0_20px_white]"></div>
            ))}
         </div>
      </div>

      {/* Double Doors */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${stage >= 2 ? 'opacity-0' : 'opacity-100'}`}>
        <div 
          className={`w-1/2 h-full bg-medical-secondary border-r-4 border-slate-800/50 shadow-2xl relative flex items-center justify-end
            transition-transform duration-1000 ease-in-out delay-100
            ${stage >= 1 ? '-translate-x-[90%] rotate-y-12' : 'translate-x-0'}
          `}
        >
           <div className="w-4 h-32 bg-slate-300 rounded-md shadow-lg mr-4 border border-white/20"></div>
           <div className="absolute top-1/3 right-12 w-32 h-40 bg-blue-200/10 backdrop-blur-sm border border-white/10 rounded-lg"></div>
        </div>
        
        <div 
          className={`w-1/2 h-full bg-medical-secondary border-l-4 border-slate-800/50 shadow-2xl relative flex items-center justify-start
            transition-transform duration-1000 ease-in-out delay-100
            ${stage >= 1 ? 'translate-x-[90%] -rotate-y-12' : 'translate-x-0'}
          `}
        >
           <div className="w-4 h-32 bg-slate-300 rounded-md shadow-lg ml-4 border border-white/20"></div>
           <div className="absolute top-1/3 left-12 w-32 h-40 bg-blue-200/10 backdrop-blur-sm border border-white/10 rounded-lg"></div>
        </div>
      </div>

      {/* Flash White Overlay transition */}
      <div className={`absolute inset-0 bg-white transition-opacity duration-700 pointer-events-none ${stage === 2 ? 'opacity-100' : 'opacity-0'}`}></div>

      {/* Logo Reveal */}
      {stage === 2 && (
        <div className="absolute inset-0 flex items-center justify-center z-50 animate-fade-in-up">
           <div className="flex flex-col items-center gap-4">
              <div className="p-6 bg-medical-primary rounded-3xl shadow-2xl text-white transform scale-150">
                 <Stethoscope size={64} strokeWidth={2.5} />
              </div>
              <h1 className="text-3xl font-serif font-bold text-medical-secondary">OrdoMaroc AI</h1>
           </div>
        </div>
      )}

    </div>
  );
};

export default IntroAnimation;
