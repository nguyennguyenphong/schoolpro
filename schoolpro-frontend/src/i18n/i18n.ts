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
import viCommon from "@/i18n/locales/vi/common.json";
import viAuth from "@/i18n/locales/vi/auth.json";
import viValidation from "@/i18n/locales/vi/validation.json";
import viButton from "@/i18n/locales/vi/button.json";
import viInput from "@/i18n/locales/vi/input.json";
import viMessage from "@/i18n/locales/vi/message.json";
import viCard from "@/i18n/locales/vi/card.json";
import viModal from "@/i18n/locales/vi/modal.json";
import viNavigation from "@/i18n/locales/vi/navigation.json";

import enCommon from "@/i18n/locales/en/common.json";
import enAuth from "@/i18n/locales/en/auth.json";
import enValidation from "@/i18n/locales/en/validation.json";
import enButton from "@/i18n/locales/en/button.json";
import enInput from "@/i18n/locales/en/input.json";
import enMessage from "@/i18n/locales/en/message.json";
import enCard from "@/i18n/locales/en/card.json";
import enModal from "@/i18n/locales/en/modal.json";
import enNavigation from "@/i18n/locales/en/navigation.json";

import jaCommon from "@/i18n/locales/ja/common.json";
import jaAuth from "@/i18n/locales/ja/auth.json";
import jaValidation from "@/i18n/locales/ja/validation.json";
import jaButton from "@/i18n/locales/ja/button.json";
import jaInput from "@/i18n/locales/ja/input.json";
import jaMessage from "@/i18n/locales/ja/message.json";
import jaCard from "@/i18n/locales/ja/card.json";
import jaModal from "@/i18n/locales/ja/modal.json";
import jaNavigation from "@/i18n/locales/ja/navigation.json";

import koCommon from "@/i18n/locales/ko/common.json";
import koAuth from "@/i18n/locales/ko/auth.json";
import koValidation from "@/i18n/locales/ko/validation.json";
import koButton from "@/i18n/locales/ko/button.json";
import koInput from "@/i18n/locales/ko/input.json";
import koMessage from "@/i18n/locales/ko/message.json";
import koCard from "@/i18n/locales/ko/card.json";
import koModal from "@/i18n/locales/ko/modal.json";
import koNavigation from "@/i18n/locales/ko/navigation.json";

import zhCommon from "@/i18n/locales/zh/common.json";
import zhAuth from "@/i18n/locales/zh/auth.json";
import zhValidation from "@/i18n/locales/zh/validation.json";
import zhButton from "@/i18n/locales/zh/button.json";
import zhInput from "@/i18n/locales/zh/input.json";
import zhMessage from "@/i18n/locales/zh/message.json";
import zhCard from "@/i18n/locales/zh/card.json";
import zhModal from "@/i18n/locales/zh/modal.json";
import zhNavigation from "@/i18n/locales/zh/navigation.json";

import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  normalizeLanguageCode,
  type SupportedLanguage,
} from "@/i18n/config";
import { syncDocumentAttributes } from "@/i18n/utils/syncDocument";

export const resources = {
  vi: {
    common: viCommon,
    auth: viAuth,
    validation: viValidation,
    button: viButton,
    input: viInput,
    message: viMessage,
    card: viCard,
    modal: viModal,
    navigation: viNavigation,
  },
  en: {
    common: enCommon,
    auth: enAuth,
    validation: enValidation,
    button: enButton,
    input: enInput,
    message: enMessage,
    card: enCard,
    modal: enModal,
    navigation: enNavigation,
  },
  ja: {
    common: jaCommon,
    auth: jaAuth,
    validation: jaValidation,
    button: jaButton,
    input: jaInput,
    message: jaMessage,
    card: jaCard,
    modal: jaModal,
    navigation: jaNavigation,
  },
  ko: {
    common: koCommon,
    auth: koAuth,
    validation: koValidation,
    button: koButton,
    input: koInput,
    message: koMessage,
    card: koCard,
    modal: koModal,
    navigation: koNavigation,
  },
  zh: {
    common: zhCommon,
    auth: zhAuth,
    validation: zhValidation,
    button: zhButton,
    input: zhInput,
    message: zhMessage,
    card: zhCard,
    modal: zhModal,
    navigation: zhNavigation,
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
    ns: [
      "common",
      "auth",
      "validation",
      "button",
      "input",
      "message",
      "card",
      "modal",
      "navigation",
    ],
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
