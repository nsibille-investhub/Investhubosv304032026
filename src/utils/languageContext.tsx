import React, { createContext, useContext, useEffect, useState } from 'react';
import fr from '../locales/fr.json';
import en from '../locales/en.json';

export type Language = 'fr' | 'en';

type Translations = Record<string, unknown>;

const dictionaries: Record<Language, Translations> = {
  fr: fr as Translations,
  en: en as Translations,
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function resolve(dict: Translations, key: string): string | undefined {
  const value = key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict);
  return typeof value === 'string' ? value : undefined;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, name) =>
    vars[name] !== undefined ? String(vars[name]) : `{{${name}}}`,
  );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('investhub-language') as Language | null;
    return saved === 'fr' || saved === 'en' ? saved : 'fr';
  });

  useEffect(() => {
    localStorage.setItem('investhub-language', lang);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const setLang = (next: Language) => setLangState(next);

  const t = (key: string, vars?: Record<string, string | number>): string => {
    const translated = resolve(dictionaries[lang], key) ?? resolve(dictionaries.fr, key);
    return interpolate(translated ?? key, vars);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
