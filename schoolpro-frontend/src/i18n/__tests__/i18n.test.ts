import { describe, it, expect, beforeEach } from "vitest";
import i18n from "../i18n";
import {
  normalizeLanguageCode,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
} from "../config";
import { formatCurrency, formatNumber, formatDate } from "../utils/formatters";
import dayjs from "dayjs";

describe("i18n Configuration & Normalization", () => {
  it("should normalize valid codes correctly", () => {
    expect(normalizeLanguageCode("vi")).toBe("vi");
    expect(normalizeLanguageCode("en")).toBe("en");
    expect(normalizeLanguageCode("ja")).toBe("ja");
    expect(normalizeLanguageCode("ko")).toBe("ko");
    expect(normalizeLanguageCode("zh")).toBe("zh");
  });

  it("should normalize aliases and regional locales", () => {
    expect(normalizeLanguageCode("kr")).toBe("ko");
    expect(normalizeLanguageCode("cn")).toBe("zh");
    expect(normalizeLanguageCode("vi-VN")).toBe("vi");
    expect(normalizeLanguageCode("en-US")).toBe("en");
    expect(normalizeLanguageCode("ja-JP")).toBe("ja");
    expect(normalizeLanguageCode("ko-KR")).toBe("ko");
    expect(normalizeLanguageCode("zh-CN")).toBe("zh");
  });

  it("should fallback on unknown or empty codes", () => {
    expect(normalizeLanguageCode(null)).toBe(DEFAULT_LANGUAGE);
    expect(normalizeLanguageCode(undefined)).toBe(DEFAULT_LANGUAGE);
    expect(normalizeLanguageCode("fr")).toBe(DEFAULT_LANGUAGE);
    expect(normalizeLanguageCode("de")).toBe(DEFAULT_LANGUAGE);
  });

  it("should define all 5 enterprise supported languages with valid metadata", () => {
    const langs = ["vi", "en", "ja", "ko", "zh"] as const;
    langs.forEach((code) => {
      const meta = SUPPORTED_LANGUAGES[code];
      expect(meta).toBeDefined();
      expect(meta.code).toBe(code);
      expect(meta.name).toBeTruthy();
      expect(meta.nativeName).toBeTruthy();
      expect(meta.flag).toBeTruthy();
      expect(meta.antdLocale).toBeDefined();
      expect(meta.dayjsLocale).toBeTruthy();
      expect(meta.dir).toBe("ltr");
    });
  });
});

describe("i18next Translation Execution", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("vi");
  });

  it("should translate Vietnamese texts accurately", async () => {
    await i18n.changeLanguage("vi");
    expect(i18n.t("auth:login.title")).toBe("Đăng nhập hệ thống");
    expect(i18n.t("auth:roles.admin")).toBe("Quản trị viên");
    expect(i18n.t("actions.submit")).toBe("Gửi");
    expect(i18n.t("validation:required")).toBe("Trường này là bắt buộc!");
  });

  it("should translate English texts accurately", async () => {
    await i18n.changeLanguage("en");
    expect(i18n.t("auth:login.title")).toBe("Sign In to System");
    expect(i18n.t("auth:roles.admin")).toBe("Administrator");
    expect(i18n.t("actions.submit")).toBe("Submit");
    expect(i18n.t("validation:required")).toBe("This field is required!");
  });

  it("should translate Japanese texts accurately", async () => {
    await i18n.changeLanguage("ja");
    expect(i18n.t("auth:login.title")).toBe("システムログイン");
    expect(i18n.t("auth:roles.admin")).toBe("管理者");
    expect(i18n.t("actions.submit")).toBe("送信");
  });

  it("should translate Korean texts accurately", async () => {
    await i18n.changeLanguage("ko");
    expect(i18n.t("auth:login.title")).toBe("시스템 로그인");
    expect(i18n.t("auth:roles.admin")).toBe("관리자");
    expect(i18n.t("actions.submit")).toBe("제출");
  });

  it("should translate Chinese texts accurately", async () => {
    await i18n.changeLanguage("zh");
    expect(i18n.t("auth:login.title")).toBe("系统登录");
    expect(i18n.t("auth:roles.admin")).toBe("管理员");
    expect(i18n.t("actions.submit")).toBe("提交");
  });

  it("should support parameter interpolation", async () => {
    await i18n.changeLanguage("vi");
    expect(
      i18n.t("auth:login.successMessage", { role: "ADMIN" })
    ).toBe("Đăng nhập thành công với tư cách [ADMIN]! Đang chuyển hướng...");

    await i18n.changeLanguage("en");
    expect(
      i18n.t("auth:login.successMessage", { role: "TEACHER" })
    ).toBe("Signed in successfully as [TEACHER]! Redirecting...");
  });

  it("should sync dayjs locale when switching language", async () => {
    await i18n.changeLanguage("ja");
    expect(dayjs.locale()).toBe("ja");

    await i18n.changeLanguage("en");
    expect(dayjs.locale()).toBe("en");
  });
});

describe("Intl Formatters", () => {
  it("should format currency according to language", () => {
    const amount = 100000;
    const viFormatted = formatCurrency(amount, "VND", "vi");
    expect(viFormatted).toMatch(/100\.000/);

    const usFormatted = formatCurrency(100, "USD", "en");
    expect(usFormatted).toMatch(/100/);
  });

  it("should format numbers with locale separators", () => {
    const formattedVi = formatNumber(1234567.89, undefined, "vi");
    expect(formattedVi).toMatch(/1\.234\.567/);

    const formattedEn = formatNumber(1234567.89, undefined, "en");
    expect(formattedEn).toMatch(/1,234,567/);
  });

  it("should format dates properly", () => {
    const testDate = new Date("2026-09-25T00:00:00Z");
    const formatted = formatDate(testDate, undefined, "en");
    expect(formatted).toBeTruthy();
  });
});
