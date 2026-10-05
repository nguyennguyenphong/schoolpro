import type common from "@/i18n/locales/vi/common.json";
import type auth from "@/i18n/locales/vi/auth.json";
import type validation from "@/i18n/locales/vi/validation.json";
import type button from "@/i18n/locales/vi/button.json";
import type input from "@/i18n/locales/vi/input.json";
import type message from "@/i18n/locales/vi/message.json";
import type card from "@/i18n/locales/vi/card.json";
import type modal from "@/i18n/locales/vi/modal.json";
import type navigation from "@/i18n/locales/vi/navigation.json";

export interface AppResources {
  common: typeof common;
  auth: typeof auth;
  validation: typeof validation;
  button: typeof button;
  input: typeof input;
  message: typeof message;
  card: typeof card;
  modal: typeof modal;
  navigation: typeof navigation;
}

export type AppNamespace = keyof AppResources;

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: AppResources;
  }
}

export type { SupportedLanguage, LanguageMetadata } from "@/i18n/config";
