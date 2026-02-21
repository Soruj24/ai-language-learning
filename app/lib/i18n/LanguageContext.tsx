'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { translations, Language } from './translations';

interface LanguageContextType {
  interfaceLanguage: Language;
  learningLanguage: Language;
  setInterfaceLanguage: (lang: Language) => Promise<void>;
  setLearningLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { data: session, update } = useSession();
  const [interfaceLanguage, setInterfaceLanguageState] = useState<Language>('English');
  const [learningLanguage, setLearningLanguageState] = useState<Language>('Spanish');

  useEffect(() => {
    // Load from local storage first for immediate feedback
    const storedInterface = localStorage.getItem('interfaceLanguage') as Language;
    const storedLearning = localStorage.getItem('learningLanguage') as Language;

    if (storedInterface) setInterfaceLanguageState(storedInterface);
    if (storedLearning) setLearningLanguageState(storedLearning);

    // Sync with session if available
    if (session?.user) {
      const userInterface = (session.user as any).interfaceLanguage as Language;
      const userLearning = (session.user as any).languageLearning as Language;

      if (userInterface) {
        setInterfaceLanguageState(userInterface);
        localStorage.setItem('interfaceLanguage', userInterface);
      }
      if (userLearning) {
        setLearningLanguageState(userLearning);
        localStorage.setItem('learningLanguage', userLearning);
      }
    }
  }, [session]);

  const setInterfaceLanguage = async (lang: Language) => {
    setInterfaceLanguageState(lang);
    localStorage.setItem('interfaceLanguage', lang);
    
    if (session?.user) {
      try {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interfaceLanguage: lang }),
        });
        await update({ interfaceLanguage: lang });
      } catch (error) {
        console.error('Failed to sync interface language', error);
      }
    }
  };

  const setLearningLanguage = async (lang: Language) => {
    setLearningLanguageState(lang);
    localStorage.setItem('learningLanguage', lang);

    if (session?.user) {
      try {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ languageLearning: lang }),
        });
        await update({ languageLearning: lang });
      } catch (error) {
        console.error('Failed to sync learning language', error);
      }
    }
  };

  const t = (key: string): string => {
    const lang = translations[interfaceLanguage];
    if (!lang) return translations['English'][key] || key;
    return lang[key] || translations['English'][key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        interfaceLanguage,
        learningLanguage,
        setInterfaceLanguage,
        setLearningLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
