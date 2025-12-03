
import React, { useState } from 'react';
import { UserCog, MapPin, Stethoscope, Save, User } from 'lucide-react';
import { DoctorProfile } from '../types';

interface DoctorProfileModalProps {
  onSave: (profile: DoctorProfile) => void;
  initialProfile?: DoctorProfile | null;
}

const DoctorProfileModal: React.FC<DoctorProfileModalProps> = ({ onSave, initialProfile }) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [specialty, setSpecialty] = useState(initialProfile?.specialty || '');
  const [address, setAddress] = useState(initialProfile?.address || '');
  const [phone, setPhone] = useState(initialProfile?.phone || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && specialty && address) {
      onSave({ name, specialty, address, phone });
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-medical-surface rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-medical-secondary p-6 text-center shrink-0">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/20">
            <UserCog className="text-white h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1 font-serif">Configuration du Profil</h2>
          <p className="text-blue-100 text-sm opacity-90">Ces informations apparaîtront sur vos ordonnances.</p>
        </div>
        
        <div className="overflow-y-auto p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <User size={14} /> Nom Complet
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Dr. Mohamed Alami"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-medical-primary focus:ring-2 focus:ring-medical-accent outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Stethoscope size={14} /> Spécialité
                </label>
                <input
                  type="text"
                  required
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="Ex: Médecin Généraliste, Cardiologue..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-medical-primary focus:ring-2 focus:ring-medical-accent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <MapPin size={14} /> Localisation Professionnelle
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Casablanca, Maroc"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-medical-primary focus:ring-2 focus:ring-medical-accent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Téléphone (Optionnel)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+212 ..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-medical-primary focus:ring-2 focus:ring-medical-accent outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-medical-primary hover:bg-blue-600 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} /> Enregistrer le Profil
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileModal;
