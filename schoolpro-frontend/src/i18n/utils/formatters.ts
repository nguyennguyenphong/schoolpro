import { normalizeLanguageCode, type SupportedLanguage } from "../config";

const LOCALE_BCP47: Record<SupportedLanguage, string> = {
  vi: "vi-VN",
  en: "en-US",
  ja: "ja-JP",
  ko: "ko-KR",
  zh: "zh-CN",
};

/**
 * Returns the BCP 47 language tag for a supported language.
 */
export function getBcp47Locale(lang?: string): string {
  const normalized = normalizeLanguageCode(lang);
  return LOCALE_BCP47[normalized] || "vi-VN";
}

/**
 * Formats a currency value according to the specified language/currency code.
 * Defaults to VND for 'vi', USD for 'en', JPY for 'ja', KRW for 'ko', CNY for 'zh'.
 */
export function formatCurrency(
  amount: number,
  currency?: string,
  lang?: string
): string {
  const normalized = normalizeLanguageCode(lang);
  const locale = getBcp47Locale(normalized);

  const defaultCurrencyMap: Record<SupportedLanguage, string> = {
    vi: "VND",
    en: "USD",
    ja: "JPY",
    ko: "KRW",
    zh: "CNY",
  };

  const curr = currency || defaultCurrencyMap[normalized] || "VND";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: curr,
      maximumFractionDigits: ["VND", "JPY", "KRW"].includes(curr) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount} ${curr}`;
  }
}

/**
 * Formats a number with locale-appropriate thousand separators and decimals.
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  lang?: string
): string {
  const locale = getBcp47Locale(lang);
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Formats a date using Intl.DateTimeFormat
 */
export function formatDate(
  date: Date | number | string,
  options?: Intl.DateTimeFormatOptions,
  lang?: string
): string {
  const locale = getBcp47Locale(lang);
  const d = date instanceof Date ? date : new Date(date);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...options,
  };
  return new Intl.DateTimeFormat(locale, defaultOptions).format(d);
}

/**
 * Formats date and time
 */
export function formatDateTime(
  date: Date | number | string,
  options?: Intl.DateTimeFormatOptions,
  lang?: string
): string {
  return formatDate(
    date,
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      ...options,
    },
    lang
  );
}
