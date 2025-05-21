
import React, { createContext, useContext, useState, useEffect } from 'react';

// Import language files
import en from '@/locales/en.json';
import te from '@/locales/te.json';
import kn from '@/locales/kn.json';

type Language = 'en' | 'te' | 'kn';

export interface LanguageOption {
  id: Language;
  name: string;
  nativeName: string;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  languageOptions: LanguageOption[];
}

const languageOptions: LanguageOption[] = [
  { id: 'en', name: 'English', nativeName: 'English' },
  { id: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { id: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' }
];

const translations = {
  en,
  te,
  kn
};

const LANGUAGE_KEY = 'app_language';

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: () => '',
  languageOptions: languageOptions
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
    return (savedLanguage as Language) || 'en';
  });

  // Function to get nested values using dot notation
  const getNestedTranslation = (obj: any, path: string): string => {
    const keys = path.split('.');
    return keys.reduce((acc, key) => {
      if (acc && acc[key] !== undefined) {
        return acc[key];
      }
      return path; // Return the key path if translation not found
    }, obj);
  };

  const translate = (key: string): string => {
    const currentTranslations = translations[language];
    const translated = getNestedTranslation(currentTranslations, key);
    
    if (typeof translated === 'string') {
      return translated;
    }
    
    // If translation not found in current language, try English as fallback
    if (language !== 'en') {
      const englishTranslated = getNestedTranslation(translations['en'], key);
      if (typeof englishTranslated === 'string') {
        return englishTranslated;
      }
    }
    
    return key; // Return the key as last resort
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem(LANGUAGE_KEY, newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translate, languageOptions }}>
      {children}
    </LanguageContext.Provider>
  );
};
