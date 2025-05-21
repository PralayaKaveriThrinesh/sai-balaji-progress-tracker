
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, defaultLanguage, translations } from '@/lib/i18n/translations';

// Define language context types
interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  availableLanguages: { code: Language; name: string }[];
}

// Create the language context
const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

// Language provider component
export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize with stored language or default
  const [language, setLanguageState] = useState<Language>(() => {
    const storedLanguage = localStorage.getItem('language') as Language;
    return storedLanguage && Object.keys(translations).includes(storedLanguage) 
      ? storedLanguage 
      : defaultLanguage;
  });

  // Update language and store in localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // Translation function
  const t = (key: string): string => {
    const languageDict = translations[language];
    if (!languageDict) return key;
    
    return (languageDict as any)[key] || (translations[defaultLanguage] as any)[key] || key;
  };

  // Available languages
  const availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'te', name: 'తెలుగు' }, // Telugu
    { code: 'kn', name: 'ಕನ್ನಡ' },  // Kannada
  ];

  // Set html lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
