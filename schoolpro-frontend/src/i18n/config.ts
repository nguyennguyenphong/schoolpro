import type { Locale } from "antd/es/locale";
import viVN from "antd/locale/vi_VN";
import enUS from "antd/locale/en_US";
import jaJP from "antd/locale/ja_JP";
import koKR from "antd/locale/ko_KR";
import zhCN from "antd/locale/zh_CN";

import viSvg from "@/assets/svg/vn.svg";
import ukSvg from "@/assets/svg/uk.svg";
import jpSvg from "@/assets/svg/jp.svg";
import krSvg from "@/assets/svg/kr.svg";
import cnSvg from "@/assets/svg/cn.svg";

export type SupportedLanguage = "vi" | "en" | "ja" | "ko" | "zh";

export interface LanguageMetadata {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  antdLocale: Locale;
  dayjsLocale: string;
  dir: "ltr" | "rtl";
}

export const DEFAULT_LANGUAGE: SupportedLanguage = "vi";

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageMetadata> = {
  vi: {
    code: "vi",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    flag: viSvg,
    antdLocale: viVN,
    dayjsLocale: "vi",
    dir: "ltr",
  },
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: ukSvg,
    antdLocale: enUS,
    dayjsLocale: "en",
    dir: "ltr",
  },
  ja: {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    flag: jpSvg,
    antdLocale: jaJP,
    dayjsLocale: "ja",
    dir: "ltr",
  },
  ko: {
    code: "ko",
    name: "Korean",
    nativeName: "한국어",
    flag: krSvg,
    antdLocale: koKR,
    dayjsLocale: "ko",
    dir: "ltr",
  },
  zh: {
    code: "zh",
    name: "Chinese",
    nativeName: "简体中文",
    flag: cnSvg,
    antdLocale: zhCN,
    dayjsLocale: "zh-cn",
    dir: "ltr",
  },
};

export const LANGUAGE_OPTIONS = Object.values(SUPPORTED_LANGUAGES);

/**
 * Normalizes legacy or regional codes (e.g., 'kr' -> 'ko', 'cn' -> 'zh', 'vi-VN' -> 'vi')
 */
export function normalizeLanguageCode(code?: string | null): SupportedLanguage {
  if (!code) return DEFAULT_LANGUAGE;
  const lower = code.toLowerCase().trim();

  // Direct match
  if (lower in SUPPORTED_LANGUAGES) {
    return lower as SupportedLanguage;
  }

  // Aliases & locales mapping
  if (lower.startsWith("vi")) return "vi";
  if (lower.startsWith("en")) return "en";
  if (lower.startsWith("ja")) return "ja";
  if (lower.startsWith("ko") || lower.startsWith("kr")) return "ko";
  if (lower.startsWith("zh") || lower.startsWith("cn")) return "zh";

  return DEFAULT_LANGUAGE;
}
