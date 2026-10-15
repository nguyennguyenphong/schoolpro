import { describe, it, expect } from "vitest";
import {
  isAnswerFilled,
  formatExamTime,
  isScoreReleased,
} from "@/modules/students/features/exams/utils/examHelpers";

describe("examHelpers", () => {
  describe("isAnswerFilled", () => {
    it("returns false for null, undefined, and empty string/array", () => {
      expect(isAnswerFilled(null)).toBe(false);
      expect(isAnswerFilled(undefined)).toBe(false);
      expect(isAnswerFilled("")).toBe(false);
      expect(isAnswerFilled("   ")).toBe(false);
      expect(isAnswerFilled([])).toBe(false);
    });

    it("returns true for valid answers", () => {
      expect(isAnswerFilled("Stack")).toBe(true);
      expect(isAnswerFilled(["A", "B"])).toBe(true);
      expect(isAnswerFilled(5)).toBe(true);
      expect(isAnswerFilled(true)).toBe(true);
      expect(isAnswerFilled(false)).toBe(true);
    });
  });

  describe("formatExamTime", () => {
    it("formats seconds into mm:ss properly", () => {
      expect(formatExamTime(0)).toBe("00:00");
      expect(formatExamTime(59)).toBe("00:59");
      expect(formatExamTime(60)).toBe("01:00");
      expect(formatExamTime(2700)).toBe("45:00");
    });
  });

  describe("isScoreReleased", () => {
    it("returns true for immediate mode", () => {
      expect(isScoreReleased({ scoreReleaseMode: "immediate" })).toBe(true);
    });

    it("returns false for hidden mode", () => {
      expect(isScoreReleased({ scoreReleaseMode: "hidden" })).toBe(false);
    });

    it("handles scheduled mode correctly for past and future dates", () => {
      expect(
        isScoreReleased({
          scoreReleaseMode: "scheduled",
          scoreReleaseDate: "2099-01-01 08:00",
        })
      ).toBe(false);

      expect(
        isScoreReleased({
          scoreReleaseMode: "scheduled",
          scoreReleaseDate: "2020-01-01 08:00",
        })
      ).toBe(true);
    });
  });
});
