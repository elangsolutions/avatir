import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import es from './locales/es/translation.json';

export const supportedLanguages = ['en', 'es'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

const STORAGE_KEY = 'avatir.language';

function syncDocumentLanguage(language: string) {
  document.documentElement.lang = language;
  document.title = i18n.t('meta.title');
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute('content', i18n.t('meta.description'));
  }
}

const savedLanguage = localStorage.getItem(STORAGE_KEY);
const initialLanguage =
  savedLanguage && supportedLanguages.includes(savedLanguage as SupportedLanguage)
    ? savedLanguage
    : 'en';

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (language) => {
  localStorage.setItem(STORAGE_KEY, language);
  syncDocumentLanguage(language);
});

syncDocumentLanguage(initialLanguage);

export default i18n;
