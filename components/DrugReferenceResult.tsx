import React from 'react';
import { ReferenceResponse } from '../types';
import { Pill, Info, Tags, Coins, BookOpen } from 'lucide-react';

interface Props {
  data: ReferenceResponse;
}

const DrugReferenceResult: React.FC<Props> = ({ data }) => {
  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Card */}
      <div className="bg-medical-surface rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-medical-accent rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative flex flex-col md:flex-row md:items-start gap-6">
          <div className="p-4 bg-medical-accent rounded-2xl text-medical-primary shadow-sm border border-blue-100">
            <BookOpen size={32} />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full mb-3">
              <span className="w-2 h-2 bg-medical-primary rounded-full"></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {data.category === 'Molecule' ? 'Monographie (DCI)' : 'Classe Pharmacologique'}
              </span>
            </div>
            <h2 className="text-3xl font-serif font-bold text-medical-secondary capitalize mb-4 leading-tight">{data.query}</h2>
            <p className="text-slate-600 leading-relaxed text-lg font-light">{data.description}</p>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.results.map((item, idx) => (
          <div key={idx} className="group bg-medical-surface rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg hover:border-medical-accent transition-all duration-300">
            
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center group-hover:bg-medical-accent/30 transition-colors">
              <h3 className="font-bold text-slate-800 text-lg group-hover:text-medical-primary transition-colors">{item.dci}</h3>
              {item.priceRange && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-medical-secondary bg-white border border-medical-accent px-3 py-1 rounded-full shadow-sm">
                  <Coins size={12} /> {item.priceRange}
                </div>
              )}
            </div>
            
            <div className="p-6 space-y-5">
              
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  <Tags size={12} /> Spécialités Marocaines
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.brandNames.map((brand, bIdx) => (
                    <span key={bIdx} className="px-3 py-1.5 bg-white text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 shadow-sm">
                      {brand}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-50">
                <div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Formes Galéniques</div>
                   <div className="text-sm text-slate-700 font-medium">
                     {item.forms.join(', ')}
                   </div>
                </div>
                <div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Indications Thérapeutiques</div>
                   <div className="text-sm text-slate-600 leading-snug">
                     {item.indications}
                   </div>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DrugReferenceResult;