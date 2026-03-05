import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import fa from './locales/fa.json';

const saved = localStorage.getItem('hzshop_lang') || 'en';

function applyDir(lang) {
  const dir = lang === 'fa' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', dir);
}

applyDir(saved);

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fa: { translation: fa }
    },
    lng: saved,
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('hzshop_lang', lng);
  applyDir(lng);
});

export default i18n;
