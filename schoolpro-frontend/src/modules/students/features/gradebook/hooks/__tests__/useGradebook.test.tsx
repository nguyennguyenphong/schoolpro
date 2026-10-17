import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import { useGradebook } from "@/modules/students/features/gradebook/hooks/useGradebook";

vi.mock("@/modules/students/features/gradebook/services", () => ({
  gradebookService: {
    getGradeSummary: vi.fn().mockResolvedValue({
      gpa: 8.5,
      academicRank: "Học sinh Giỏi",
      conductRank: "Tốt",
      classPosition: 1,
      totalClassStudents: 40,
      excellentSubjectsCount: 8,
      totalSubjectsCount: 12,
      passSubjectsCount: 2,
      totalCreditsOrPeriods: 28,
      homeroomTeacher: "Cô Trần Thị Văn",
      homeroomComment: "Chăm ngoan",
      titleAwarded: "Học sinh Giỏi",
      attendanceRate: 98,
      academicYear: "Năm học 2026 - 2027",
      semester: "Học kỳ 1",
      className: "Lớp 10A1",
    }),
    getSubjectGrades: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
    }),
    getTranscript: vi.fn().mockResolvedValue({}),
    exportTranscriptPdf: vi.fn().mockResolvedValue({ downloadUrl: "http://example.com/file.pdf" }),
  },
}));

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe("useGradebook hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("synchronizes academic year and semester when academic year becomes 'all'", async () => {
    const { result } = renderHook(() => useGradebook(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setAcademicYear("all");
    });

    expect(result.current.filter.academicYear).toBe("all");
    expect(result.current.filter.semester).toBe("all");

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("handles academic year change to specific year cleanly", async () => {
    const { result } = renderHook(() => useGradebook(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setAcademicYear("ay-2026-2027");
    });

    expect(result.current.filter.academicYear).toBe("ay-2026-2027");
    expect(result.current.filter.semester).toBe("");

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("resets filters back to clean defaults upon resetFilters()", async () => {
    const { result } = renderHook(() => useGradebook(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setSearchQuery("Toán học");
      result.current.setClassification("excellent");
      result.current.setSortBy("gpa_asc");
    });

    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filter.searchQuery).toBe("");
    expect(result.current.filter.classification).toBe("all");
    expect(result.current.filter.sortBy).toBe("gpa_desc");
    expect(result.current.hasActiveFilters).toBe(false);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});
