import { useLanguage } from "@/i18n";

/**
 * Legacy hook kept for backward compatibility.
 * Prefer using `useLanguage` from `@/i18n`.
 */
export const useLocale = () => {
  const { currentLanguage, changeLanguage, antdLocale, dir, languages } = useLanguage();

  return {
    currentLanguage,
    changeLanguage,
    antdLocale,
    dir,
    languages,
  };
};
