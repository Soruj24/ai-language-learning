'use client';

import { useLanguage } from '@/app/lib/i18n/LanguageContext';
import { languages, Language } from '@/app/lib/i18n/translations';

interface LanguageSelectorProps {
  type: 'interface' | 'learning';
  showLabel?: boolean;
}

export function LanguageSelector({ type, showLabel = true }: LanguageSelectorProps) {
  const { 
    interfaceLanguage, 
    learningLanguage, 
    setInterfaceLanguage, 
    setLearningLanguage,
    t 
  } = useLanguage();

  const currentLanguage = type === 'interface' ? interfaceLanguage : learningLanguage;
  const setLanguage = type === 'interface' ? setInterfaceLanguage : setLearningLanguage;
  const label = type === 'interface' ? t('interfaceLanguage') : t('switchLanguage');

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {showLabel && <label className="text-xs font-medium text-muted-foreground">{label}</label>}
      <select 
        value={currentLanguage} 
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </div>
  );
}
