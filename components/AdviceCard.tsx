import React from 'react';
import { HeartPulse, Check } from 'lucide-react';

interface AdviceCardProps {
  advice: string[];
}

const AdviceCard: React.FC<AdviceCardProps> = ({ advice }) => {
  if (!advice || advice.length === 0) return null;

  return (
    <div className="bg-medical-accent/50 rounded-2xl p-6 shadow-sm border border-medical-accent h-full">
      <h3 className="flex items-center gap-2 text-medical-secondary font-bold uppercase tracking-widest text-xs mb-6">
        <HeartPulse size={16} /> Conseils & Hygiène de vie
      </h3>
      <ul className="space-y-4">
        {advice.map((item, idx) => (
          <li key={idx} className="flex gap-4 items-start group">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white flex items-center justify-center text-medical-primary font-bold text-[10px] mt-0.5 shadow-sm border border-medical-accent">
              <Check size={12} strokeWidth={3} />
            </span>
            <span className="text-sm text-slate-700 leading-relaxed font-medium">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdviceCard;