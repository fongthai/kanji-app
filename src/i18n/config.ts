import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend) // Lazy load translations
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next)
  .init({
    fallbackLng: 'vi', // Default: Vietnamese
    supportedLngs: ['vi', 'en'],
    defaultNS: 'common',
    ns: ['common', 'sheet', 'board', 'controls', 'messages', 'export', 'categories'],
    
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lang', // Read from ?lang=vi
      caches: ['localStorage'], // Persist to localStorage
    },
    
    backend: {
      loadPath: '/kanji-app/locales/{{lng}}/{{ns}}.json',
    },
    
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    react: {
      useSuspense: false, // Don't suspend - render immediately even if translations aren't loaded
    },
  })
  .catch((error) => {
    console.error('i18n initialization error:', error);
  });

export default i18n;
