import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import dayjs from "dayjs";

// Import Dayjs locales
import "dayjs/locale/vi";
import "dayjs/locale/en";
import "dayjs/locale/ja";
import "dayjs/locale/ko";
import "dayjs/locale/zh-cn";

// Import translation resources
import viCommon from "./locales/vi/common.json";
import viAuth from "./locales/vi/auth.json";
import viValidation from "./locales/vi/validation.json";
import viStudent from "./locales/vi/student.json";

import enCommon from "./locales/en/common.json";
import enAuth from "./locales/en/auth.json";
import enValidation from "./locales/en/validation.json";
import enStudent from "./locales/en/student.json";

import jaCommon from "./locales/ja/common.json";
import jaAuth from "./locales/ja/auth.json";
import jaValidation from "./locales/ja/validation.json";
import jaStudent from "./locales/ja/student.json";

import koCommon from "./locales/ko/common.json";
import koAuth from "./locales/ko/auth.json";
import koValidation from "./locales/ko/validation.json";
import koStudent from "./locales/ko/student.json";

import zhCommon from "./locales/zh/common.json";
import zhAuth from "./locales/zh/auth.json";
import zhValidation from "./locales/zh/validation.json";
import zhStudent from "./locales/zh/student.json";

import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  normalizeLanguageCode,
  type SupportedLanguage,
} from "./config";
import { syncDocumentAttributes } from "./utils/syncDocument";

export const resources = {
  vi: {
    common: viCommon,
    auth: viAuth,
    validation: viValidation,
    student: viStudent,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    validation: enValidation,
    student: enStudent,
  },
  ja: {
    common: jaCommon,
    auth: jaAuth,
    validation: jaValidation,
    student: jaStudent,
  },
  ko: {
    common: koCommon,
    auth: koAuth,
    validation: koValidation,
    student: koStudent,
  },
  zh: {
    common: zhCommon,
    auth: zhAuth,
    validation: zhValidation,
    student: zhStudent,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: ["vi", "en", "ja", "ko", "zh"],
    defaultNS: "common",
    ns: ["common", "auth", "validation", "student"],
    debug: false,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
    },
  });

// Synchronize Dayjs & HTML document when language changes
i18n.on("languageChanged", (lng: string) => {
  const normalizedLang: SupportedLanguage = normalizeLanguageCode(lng);
  const metadata = SUPPORTED_LANGUAGES[normalizedLang];
  if (metadata) {
    dayjs.locale(metadata.dayjsLocale);
    syncDocumentAttributes(normalizedLang);
  }
});

// Initial synchronization
const initialLang = normalizeLanguageCode(i18n.language || DEFAULT_LANGUAGE);
dayjs.locale(SUPPORTED_LANGUAGES[initialLang].dayjsLocale);
syncDocumentAttributes(initialLang);

export default i18n;
