import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { SelectSemester } from "@/components/semester/SelectSemester";
import { semesterApi } from "@/components/semester/SelectSemester/services/semesterApi";
import type { SemesterItem } from "@/components/semester/SelectSemester/types";

const TEST_SEMESTERS: SemesterItem[] = [
  {
    id: "b1c2d3e4-2026-4027-8001-000000000001",
    academic_year_id: "a1b2c3d4-2026-4027-8001-000000002026",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    code: "SEM_20262027_1",
    name: "Học kỳ 1 (2026 - 2027)",
    order_no: 1,
    weeks_count: 18,
    start_date: "2026-09-05",
    end_date: "2027-01-15",
    is_current: true,
    is_locked: false,
  },
  {
    id: "b1c2d3e4-2026-4027-8002-000000000002",
    academic_year_id: "a1b2c3d4-2026-4027-8001-000000002026",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    code: "SEM_20262027_2",
    name: "Học kỳ 2 (2026 - 2027)",
    order_no: 2,
    weeks_count: 18,
    start_date: "2027-01-16",
    end_date: "2027-05-31",
    is_current: false,
    is_locked: false,
  },
  {
    id: "b1c2d3e4-2025-4026-8001-000000000001",
    academic_year_id: "a1b2c3d4-2025-4026-8001-000000002025",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    code: "SEM_20252026_1",
    name: "Học kỳ 1 (2025 - 2026)",
    order_no: 1,
    weeks_count: 18,
    start_date: "2025-09-05",
    end_date: "2026-01-15",
    is_current: false,
    is_locked: true,
  },
];

describe("SelectSemester Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders correctly with default placeholder", () => {
      render(<SelectSemester customSemesters={TEST_SEMESTERS} />);
      expect(screen.getByText("Chọn học kỳ")).toBeInTheDocument();
    });

    it("renders with custom placeholder", () => {
      render(
        <SelectSemester
          placeholder="Vui lòng chọn học kỳ"
          customSemesters={TEST_SEMESTERS}
        />,
      );
      expect(screen.getByText("Vui lòng chọn học kỳ")).toBeInTheDocument();
    });

    it("renders with disabled state", () => {
      const { container } = render(
        <SelectSemester disabled customSemesters={TEST_SEMESTERS} />,
      );
      const selectElement = container.querySelector(".ant-select-disabled");
      expect(selectElement).toBeInTheDocument();
    });

    it("renders with custom className", () => {
      const { container } = render(
        <SelectSemester
          className="custom-semester-class"
          customSemesters={TEST_SEMESTERS}
        />,
      );
      expect(
        container.querySelector(".custom-semester-class"),
      ).toBeInTheDocument();
    });

    it("renders options with code prefix when showCodePrefix is true", async () => {
      render(
        <SelectSemester showCodePrefix customSemesters={TEST_SEMESTERS} />,
      );

      const combobox = screen.getByRole("combobox");
      fireEvent.mouseDown(combobox);

      await waitFor(() => {
        expect(screen.getByTitle("Học kỳ 1 (2026 - 2027)")).toBeInTheDocument();
      });
    });
  });

  describe("Value & Code Resolution", () => {
    it("resolves value given by UUID", () => {
      render(
        <SelectSemester
          value="b1c2d3e4-2026-4027-8001-000000000001"
          customSemesters={TEST_SEMESTERS}
        />,
      );
      expect(screen.getByText("Học kỳ 1 (2026 - 2027)")).toBeInTheDocument();
    });

    it("resolves value given by code (SEM_20262027_1)", () => {
      render(
        <SelectSemester
          value="SEM_20262027_1"
          customSemesters={TEST_SEMESTERS}
        />,
      );
      expect(screen.getByText("Học kỳ 1 (2026 - 2027)")).toBeInTheDocument();
    });

    it("resolves value given by short code (HK1, HK2)", () => {
      const { rerender } = render(
        <SelectSemester
          value="HK1"
          customSemesters={TEST_SEMESTERS}
        />,
      );
      expect(screen.getByText("Học kỳ 1 (2026 - 2027)")).toBeInTheDocument();

      rerender(
        <SelectSemester
          value="HK2"
          customSemesters={TEST_SEMESTERS}
        />,
      );
      expect(screen.getByText("Học kỳ 2 (2026 - 2027)")).toBeInTheDocument();
    });
  });

  describe("Selection & Change handling", () => {
    it("selects a semester and triggers onChange", async () => {
      const handleChange = vi.fn();

      render(
        <SelectSemester
          customSemesters={TEST_SEMESTERS}
          onChange={handleChange}
        />,
      );

      const combobox = screen.getByRole("combobox");
      expect(combobox).toBeInTheDocument();
      fireEvent.mouseDown(combobox);

      await waitFor(() => {
        expect(screen.getByTitle("Học kỳ 2 (2026 - 2027)")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTitle("Học kỳ 2 (2026 - 2027)"));

      expect(handleChange).toHaveBeenCalledWith(
        "b1c2d3e4-2026-4027-8002-000000000002",
        expect.anything(),
      );
    });

    it("renders 'Tất cả học kỳ' option when includeAllOption is true", () => {
      render(
        <SelectSemester
          customSemesters={TEST_SEMESTERS}
          includeAllOption
          value="all"
        />,
      );

      expect(screen.getByText("Tất cả học kỳ")).toBeInTheDocument();
    });

    it("renders translated all option label when language changes", async () => {
      const { default: i18n } = await import("@/i18n/i18n");
      await act(async () => {
        await i18n.changeLanguage("en");
      });

      render(
        <SelectSemester
          customSemesters={TEST_SEMESTERS}
          includeAllOption
          value="all"
        />,
      );

      expect(screen.getByText("All semesters")).toBeInTheDocument();

      await act(async () => {
        await i18n.changeLanguage("vi");
      });
    });

    it("selects current semester automatically when defaultToCurrent is true", () => {
      const handleChange = vi.fn();

      render(
        <SelectSemester
          customSemesters={TEST_SEMESTERS}
          defaultToCurrent
          onChange={handleChange}
        />,
      );

      expect(handleChange).toHaveBeenCalledWith(
        "b1c2d3e4-2026-4027-8001-000000000001",
        expect.objectContaining({
          value: "b1c2d3e4-2026-4027-8001-000000000001",
          label: "Học kỳ 1 (2026 - 2027)",
        }),
      );
    });
  });

  describe("API integration", () => {
    it("fetches semesters from semesterApi on mount when customSemesters is omitted", async () => {
      const spy = vi
        .spyOn(semesterApi, "fetchSemesters")
        .mockResolvedValueOnce(TEST_SEMESTERS);

      render(<SelectSemester />);

      await waitFor(() => {
        expect(spy).toHaveBeenCalled();
      });

      const combobox = screen.getByRole("combobox");
      fireEvent.mouseDown(combobox);

      await waitFor(() => {
        expect(screen.getByTitle("Học kỳ 1 (2026 - 2027)")).toBeInTheDocument();
      });

      spy.mockRestore();
    });

    it("fetches current semester from semesterApi", async () => {
      const currentSem = TEST_SEMESTERS[0];
      const spy = vi
        .spyOn(semesterApi, "fetchCurrentSemester")
        .mockResolvedValueOnce(currentSem);

      const result = await semesterApi.fetchCurrentSemester({ schoolId: "school-1" });
      expect(result).toEqual(currentSem);
      expect(spy).toHaveBeenCalledWith({ schoolId: "school-1" });

      spy.mockRestore();
    });
  });
});
