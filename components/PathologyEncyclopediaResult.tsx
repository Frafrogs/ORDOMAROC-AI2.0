import React, { useState, useRef } from 'react';
import { EncyclopediaResponse } from '../types';
import { Activity, AlertTriangle, BookOpen, Stethoscope, ClipboardList, Clock, ShieldAlert, Link as LinkIcon, Pill, Volume2, StopCircle } from 'lucide-react';
import { generateSpeech } from '../services/geminiService';

interface Props {
  data: EncyclopediaResponse;
}

const PathologyEncyclopediaResult: React.FC<Props> = ({ data }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayAudio = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      const text = `${data.name}. ${data.definition}. Symptômes principaux: ${data.symptoms.slice(0, 5).join(', ')}. Traitement: ${data.management}`;
      const url = await generateSpeech(text);
      const audio = new Audio(url);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      audioRef.current = audio;
      setIsPlaying(true);
    } catch (e) {
      console.error("Audio failed", e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      
      {/* Header Card */}
      <div className="bg-medical-surface rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-medical-primary to-medical-secondary"></div>
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-start gap-5">
            <div className="p-4 bg-medical-accent rounded-2xl text-medical-primary shadow-sm border border-blue-100 flex-shrink-0">
              <Activity size={32} />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full mb-3">
                  <span className="w-2 h-2 bg-medical-secondary rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Encyclopédie Médicale
                  </span>
                </div>
                <button
                  onClick={handlePlayAudio}
                  className={`p-2 rounded-full transition-all ${isPlaying ? 'bg-medical-primary text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-medical-accent hover:text-medical-primary'}`}
                  title="Écouter"
                >
                  {isPlaying ? <StopCircle size={20} /> : <Volume2 size={20} />}
                </button>
              </div>
              
              <h2 className="text-3xl font-serif font-bold text-medical-secondary capitalize mb-3">{data.name}</h2>
              <p className="text-slate-700 leading-relaxed text-lg font-light border-l-4 border-medical-accent pl-4">
                {data.definition}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Colonne Gauche */}
        <div className="space-y-6">
          
          {/* Signes & Symptômes */}
          <div className="bg-medical-surface rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="flex items-center gap-2 text-medical-primary font-bold uppercase tracking-widest text-xs mb-4">
              <ClipboardList size={16} /> Signes & Symptômes
            </h3>
            <ul className="space-y-2">
              {data.symptoms.map((symptom, idx) => (
                <li key={idx} className="flex gap-3 items-start">
                  <span className="w-1.5 h-1.5 bg-medical-secondary rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-slate-700 font-medium">{symptom}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Diagnostic */}
          <div className="bg-medical-surface rounded-2xl p-6 border border-slate-100 shadow-sm">
             <h3 className="flex items-center gap-2 text-medical-primary font-bold uppercase tracking-widest text-xs mb-4">
              <Stethoscope size={16} /> Diagnostic
            </h3>
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg">
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Critères Cliniques</span>
                <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                  {data.diagnosis.criteria.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
              {data.diagnosis.exams.length > 0 && (
                <div className="bg-slate-50 p-3 rounded-lg">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Examens Complémentaires</span>
                  <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                    {data.diagnosis.exams.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Durée & Evolution */}
          <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
             <h3 className="flex items-center gap-2 text-slate-600 font-bold uppercase tracking-widest text-xs mb-2">
              <Clock size={16} /> Évolution
            </h3>
            <p className="text-medical-secondary font-bold text-lg">{data.duration}</p>
          </div>

        </div>

        {/* Colonne Droite */}
        <div className="space-y-6">

          {/* Prise en Charge */}
          <div className="bg-medical-surface rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
               <BookOpen size={64} />
             </div>
             <h3 className="flex items-center gap-2 text-medical-secondary font-bold uppercase tracking-widest text-xs mb-4">
              <BookOpen size={16} /> Prise en charge & Traitement
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed mb-4 whitespace-pre-line">
              {data.management}
            </p>
            
            {data.medications.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase mb-2">
                   <Pill size={12} /> Molécules citées
                </span>
                <div className="flex flex-wrap gap-2">
                  {data.medications.map((med, idx) => (
                    <span key={idx} className="px-2 py-1 bg-medical-accent/50 text-medical-primary text-xs font-bold rounded-md">
                      {med}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Alertes & Urgences */}
          <div className="bg-red-50 rounded-2xl p-6 border border-red-100 shadow-sm">
             <h3 className="flex items-center gap-2 text-medical-danger font-bold uppercase tracking-widest text-xs mb-4">
              <AlertTriangle size={16} /> Quand consulter en urgence ?
            </h3>
            <ul className="space-y-2">
              {data.emergencySigns.map((sign, idx) => (
                <li key={idx} className="flex gap-3 items-start">
                  <ShieldAlert size={16} className="text-medical-danger shrink-0 mt-0.5" />
                  <span className="text-red-800 font-medium text-sm">{sign}</span>
                </li>
              ))}
            </ul>
             {data.contraindications.length > 0 && (
              <div className="mt-4 pt-4 border-t border-red-200/50">
                 <span className="block text-[10px] font-bold text-red-400 uppercase mb-1">Contre-indications majeures</span>
                 <p className="text-sm text-red-700">{data.contraindications.join(', ')}</p>
              </div>
            )}
          </div>

          {/* Références */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <h3 className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-widest text-xs mb-4">
              <LinkIcon size={16} /> Références & Sources
            </h3>
            {data.referencesMaroc && (
               <div className="mb-4">
                  <span className="text-[10px] font-bold text-medical-secondary bg-medical-accent/30 px-2 py-0.5 rounded uppercase">Maroc</span>
                  <p className="text-sm text-slate-600 mt-1">{data.referencesMaroc}</p>
               </div>
            )}
            <ul className="space-y-2">
               {data.scientificLinks.map((link, idx) => (
                 <li key={idx}>
                   <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-medical-primary hover:underline flex items-start gap-1">
                     <span className="mt-1">🔗</span> {link.title}
                   </a>
                 </li>
               ))}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PathologyEncyclopediaResult;