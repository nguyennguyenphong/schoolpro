import { SUPPORTED_LANGUAGES, normalizeLanguageCode } from "../config";

/**
 * Synchronizes HTML document attributes (lang, dir) for accessibility and styling.
 */
export function syncDocumentAttributes(languageCode: string): void {
  if (typeof document === "undefined") return;

  const validLang = normalizeLanguageCode(languageCode);
  const metadata = SUPPORTED_LANGUAGES[validLang];

  document.documentElement.lang = validLang;
  document.documentElement.dir = metadata.dir;
}
