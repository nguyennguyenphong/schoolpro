import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  LANGUAGE_OPTIONS,
  SUPPORTED_LANGUAGES,
  normalizeLanguageCode,
  type SupportedLanguage,
  type LanguageMetadata,
} from "@/i18n/config";

export function useLanguage() {
  const { i18n, t } = useTranslation();

  const currentLanguage: SupportedLanguage = useMemo(
    () => normalizeLanguageCode(i18n.resolvedLanguage || i18n.language),
    [i18n.resolvedLanguage, i18n.language]
  );

  const currentMetadata: LanguageMetadata = useMemo(
    () => SUPPORTED_LANGUAGES[currentLanguage],
    [currentLanguage]
  );

  const changeLanguage = useCallback(
    async (lang: string | SupportedLanguage) => {
      const validLang = normalizeLanguageCode(lang);
      if (validLang !== currentLanguage) {
        await i18n.changeLanguage(validLang);
      }
    },
    [currentLanguage, i18n]
  );

  return {
    t,
    i18n,
    currentLanguage,
    currentMetadata,
    languages: LANGUAGE_OPTIONS,
    antdLocale: currentMetadata.antdLocale,
    dir: currentMetadata.dir,
    changeLanguage,
    isVietnamese: currentLanguage === "vi",
    isEnglish: currentLanguage === "en",
  };
}
