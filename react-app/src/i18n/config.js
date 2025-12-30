import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translations } from './translations';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      it: { translation: translations.it },
      en: { translation: translations.en }
    },
    lng: 'it', // default language
    fallbackLng: 'it',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
