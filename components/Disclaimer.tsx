import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DisclaimerProps {
  language?: string;
}

const translations = {
  Français: {
    title: "AVERTISSEMENT IMPORTANT",
    text: "Cette application est un outil de démonstration généré par IA. Elle ne remplace en aucun cas un avis médical professionnel. Les médicaments suggérés doivent être validés par un médecin diplômé.",
    emergency: "En cas d'urgence, appelez le 15 ou le 190."
  },
  English: {
    title: "IMPORTANT WARNING",
    text: "This application is an AI-generated demonstration tool. It does not replace professional medical advice. Suggested medications must be validated by a licensed physician.",
    emergency: "In case of emergency, call 15 or 190."
  },
  Arabe: {
    title: "تحذير هام",
    text: "هذا التطبيق هو أداة توضيحية تم إنشاؤها بواسطة الذكاء الاصطناعي. لا يحل بأي حال من الأحوال محل المشورة الطبية المهنية. يجب التحقق من الأدوية المقترحة من قبل طبيب مختص.",
    emergency: "في حالة الطوارئ، اتصل بـ 15 أو 190."
  }
};

const Disclaimer: React.FC<DisclaimerProps> = ({ language = 'Français' }) => {
  const t = translations[language as keyof typeof translations] || translations.Français;
  const isRTL = language === 'Arabe';

  return (
    <div className="bg-red-50 border-l-4 border-r-4 border-medical-danger p-4 mb-6 rounded-lg shadow-sm" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <AlertTriangle className="h-5 w-5 text-medical-danger" aria-hidden="true" />
        </div>
        <div className={`mx-3 ${isRTL ? 'text-right' : 'text-left'}`}>
          <p className="text-sm text-red-800 font-medium uppercase tracking-wide">
            {t.title}
          </p>
          <p className="text-sm text-red-700 mt-1 leading-relaxed">
            {t.text}
            <span className="font-bold block mt-1"> {t.emergency}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;