import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEn from './locales/en/translation.json';
import translationSi from './locales/si/translation.json';

const resources = {
    en: {
        translation: translationEn,
    },
    si: {
        translation: translationSi,
    },
};

i18next
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en',
        fallbackLng: 'en',
        supportedLngs: ['en', 'si'],
        interpolation: {
            escapeValue: false,
        },
        cleanCode: true,
        ns: ['translation'],
        defaultNS: 'translation',
        compatibilityJSON: 'v4',
    })
    .then();

export default i18next;