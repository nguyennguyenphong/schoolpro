import { describe, it, expect, beforeEach } from "vitest";
import i18n from "@/i18n/i18n";
import {
  normalizeLanguageCode,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
} from "@/i18n/config";
import { formatCurrency, formatNumber, formatDate } from "@/i18n/utils/formatters";
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
      i18n.t("auth:verifyOtp.subtitle", { identifier: "test@example.com" })
    ).toBe("Nhập mã OTP gồm 6 chữ số vừa được gửi đến test@example.com.");

    await i18n.changeLanguage("en");
    expect(
      i18n.t("message:downloading", { name: "test.pdf" })
    ).toBe("Downloading file: test.pdf");
  });

  it("should translate separated button, input, message, card, modal, and navigation namespaces", async () => {
    await i18n.changeLanguage("vi");
    expect(i18n.t("button:print")).toBe("In văn bản");
    expect(i18n.t("button:reset")).toBe("Đặt lại");
    expect(i18n.t("input:filter.allDepartments")).toBe("Tất cả đơn vị");
    expect(i18n.t("message:printing")).toBe("Đang chuẩn bị in...");
    expect(i18n.t("card:summary.total")).toBe("Tổng số thông báo");
    expect(i18n.t("navigation:breadcrumb.announcements")).toBe("Bảng tin & Thông báo");
    expect(i18n.t("modal:officialNumber")).toBe("Số hiệu văn bản:");

    await i18n.changeLanguage("en");
    expect(i18n.t("button:print")).toBe("Print Document");
    expect(i18n.t("input:filter.allDepartments")).toBe("All departments");
    expect(i18n.t("message:printing")).toBe("Preparing to print...");
    expect(i18n.t("card:summary.total")).toBe("Total announcements");
    expect(i18n.t("navigation:breadcrumb.announcements")).toBe("News & Announcements");
    expect(i18n.t("modal:officialNumber")).toBe("Document No.:");
  });

  it("should translate priority, sort options and logout confirmation modal across languages", async () => {
    await i18n.changeLanguage("vi");
    expect(i18n.t("card:priority.urgent")).toBe("Khẩn cấp");
    expect(i18n.t("input:filter.allPriorities")).toBe("Tất cả mức độ");
    expect(i18n.t("input:sortOptions.newest")).toBe("Mới nhất trước");
    expect(i18n.t("modal:logoutConfirmTitle")).toBe("Xác nhận đăng xuất");
    expect(i18n.t("message:logoutSuccess")).toBe("Đã đăng xuất thành công!");

    await i18n.changeLanguage("en");
    expect(i18n.t("card:priority.urgent")).toBe("Urgent");
    expect(i18n.t("input:filter.allPriorities")).toBe("All priorities");
    expect(i18n.t("input:sortOptions.newest")).toBe("Newest first");
    expect(i18n.t("modal:logoutConfirmTitle")).toBe("Confirm Logout");
    expect(i18n.t("message:logoutSuccess")).toBe("Logged out successfully!");
  });

  it("should sync dayjs locale when switching language", async () => {
    await i18n.changeLanguage("ja");
    expect(dayjs.locale()).toBe("ja");

    await i18n.changeLanguage("en");
    expect(dayjs.locale()).toBe("en");
  });

  it("should translate leaveRequests keys across all 5 languages (vi, en, ja, ko, zh)", async () => {
    await i18n.changeLanguage("vi");
    expect(i18n.t("navigation:breadcrumb.leaveRequests")).toBe("Xin nghỉ phép");
    expect(i18n.t("button:createLeaveRequest")).toBe("Tạo đơn xin nghỉ phép");
    expect(i18n.t("card:leaveRequests.statuses.pending")).toBe("Chờ duyệt");

    await i18n.changeLanguage("en");
    expect(i18n.t("navigation:breadcrumb.leaveRequests")).toBe("Leave Requests");
    expect(i18n.t("button:createLeaveRequest")).toBe("Create Leave Request");
    expect(i18n.t("card:leaveRequests.statuses.pending")).toBe("Pending Approval");

    await i18n.changeLanguage("ja");
    expect(i18n.t("navigation:breadcrumb.leaveRequests")).toBe("欠席届・休暇申請");
    expect(i18n.t("button:createLeaveRequest")).toBe("欠席届を作成");

    await i18n.changeLanguage("ko");
    expect(i18n.t("navigation:breadcrumb.leaveRequests")).toBe("결석계 신청");
    expect(i18n.t("button:createLeaveRequest")).toBe("결석계 작성");

    await i18n.changeLanguage("zh");
    expect(i18n.t("navigation:breadcrumb.leaveRequests")).toBe("请假申请");
    expect(i18n.t("button:createLeaveRequest")).toBe("创建请假申请");
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
