import "@testing-library/jest-dom";
import "@testing-library/jest-dom/vitest";
import { beforeEach } from "vitest";
import i18n from "@/i18n/i18n";

// Ensure tests default to Vietnamese locale
i18n.changeLanguage("vi");

beforeEach(() => {
  if (i18n.language !== "vi") {
    i18n.changeLanguage("vi");
  }
});

// Polyfill ResizeObserver for Ant Design components in JSDOM
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = window.ResizeObserver || ResizeObserverMock;

// Polyfill matchMedia for Ant Design responsive features in JSDOM
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
