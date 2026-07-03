import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import es from './locales/es/translation.json';

export const supportedLanguages = ['en', 'es'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

const STORAGE_KEY = 'avatir.language';

export const isLanguageToggleEnabled = import.meta.env.VITE_ENABLE_LANGUAGE_TOGGLE === 'true';

function syncDocumentLanguage(language: string) {
  document.documentElement.lang = language;
  document.title = i18n.t('meta.title');
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute('content', i18n.t('meta.description'));
  }
}

const DEFAULT_LANGUAGE: SupportedLanguage = 'es';

const savedLanguage = isLanguageToggleEnabled ? localStorage.getItem(STORAGE_KEY) : null;
const initialLanguage =
  savedLanguage && supportedLanguages.includes(savedLanguage as SupportedLanguage)
    ? savedLanguage
    : DEFAULT_LANGUAGE;

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
  if (isLanguageToggleEnabled) {
    localStorage.setItem(STORAGE_KEY, language);
  }
  syncDocumentLanguage(language);
});

syncDocumentLanguage(initialLanguage);

export default i18n;
