import type common from "./locales/vi/common.json";
import type auth from "./locales/vi/auth.json";
import type validation from "./locales/vi/validation.json";
import type student from "./locales/vi/student.json";

export interface AppResources {
  common: typeof common;
  auth: typeof auth;
  validation: typeof validation;
  student: typeof student;
}

export type AppNamespace = keyof AppResources;

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: AppResources;
  }
}

export type { SupportedLanguage, LanguageMetadata } from "./config";
