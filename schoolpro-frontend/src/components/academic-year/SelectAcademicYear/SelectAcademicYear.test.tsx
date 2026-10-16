import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { SelectAcademicYear } from "@/components/academic-year/SelectAcademicYear";
import { academicYearApi } from "@/components/academic-year/SelectAcademicYear/services/academicYearApi";
import type { AcademicYearItem } from "@/components/academic-year/SelectAcademicYear/types";

const TEST_ACADEMIC_YEARS: AcademicYearItem[] = [
  {
    id: "a1b2c3d4-2026-4027-8001-000000002026",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    code: "AY_20262027",
    name: "Năm học 2026 - 2027",
    start_date: "2026-09-05",
    end_date: "2027-05-31",
    is_current: true,
    is_locked: false,
  },
  {
    id: "a1b2c3d4-2025-4026-8001-000000002025",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    code: "AY_20252026",
    name: "Năm học 2025 - 2026",
    start_date: "2025-09-05",
    end_date: "2026-05-31",
    is_current: false,
    is_locked: true,
  },
  {
    id: "a1b2c3d4-2024-4025-8001-000000002024",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    code: "AY_20242025",
    name: "Năm học 2024 - 2025",
    start_date: "2024-09-05",
    end_date: "2025-05-31",
    is_current: false,
    is_locked: true,
  },
];

describe("SelectAcademicYear Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders correctly with default placeholder", () => {
      render(<SelectAcademicYear customAcademicYears={TEST_ACADEMIC_YEARS} />);
      expect(screen.getByText("Chọn năm học")).toBeInTheDocument();
    });

    it("renders with custom placeholder", () => {
      render(
        <SelectAcademicYear
          placeholder="Vui lòng chọn năm học"
          customAcademicYears={TEST_ACADEMIC_YEARS}
        />,
      );
      expect(screen.getByText("Vui lòng chọn năm học")).toBeInTheDocument();
    });

    it("renders with disabled state", () => {
      const { container } = render(
        <SelectAcademicYear
          disabled
          customAcademicYears={TEST_ACADEMIC_YEARS}
        />,
      );
      const selectElement = container.querySelector(".ant-select-disabled");
      expect(selectElement).toBeInTheDocument();
    });

    it("renders with custom className", () => {
      const { container } = render(
        <SelectAcademicYear
          className="custom-academic-year-class"
          customAcademicYears={TEST_ACADEMIC_YEARS}
        />,
      );
      expect(
        container.querySelector(".custom-academic-year-class"),
      ).toBeInTheDocument();
    });

    it("renders options with code prefix when showCodePrefix is true", async () => {
      render(
        <SelectAcademicYear
          showCodePrefix
          customAcademicYears={TEST_ACADEMIC_YEARS}
        />,
      );

      const combobox = screen.getByRole("combobox");
      fireEvent.mouseDown(combobox);

      await waitFor(() => {
        expect(screen.getByTitle("Năm học 2026 - 2027")).toBeInTheDocument();
      });
    });
  });

  describe("Value & Code Resolution", () => {
    it("resolves value given by UUID", () => {
      render(
        <SelectAcademicYear
          value="a1b2c3d4-2026-4027-8001-000000002026"
          customAcademicYears={TEST_ACADEMIC_YEARS}
        />,
      );
      expect(screen.getByText("Năm học 2026 - 2027")).toBeInTheDocument();
    });

    it("resolves value given by code (AY_20262027)", () => {
      render(
        <SelectAcademicYear
          value="AY_20262027"
          customAcademicYears={TEST_ACADEMIC_YEARS}
        />,
      );
      expect(screen.getByText("Năm học 2026 - 2027")).toBeInTheDocument();
    });

    it("resolves value given by year span (2026-2027)", () => {
      render(
        <SelectAcademicYear
          value="2026-2027"
          customAcademicYears={TEST_ACADEMIC_YEARS}
        />,
      );
      expect(screen.getByText("Năm học 2026 - 2027")).toBeInTheDocument();
    });

    it("automatically triggers onChange with current academic year when defaultToCurrent is true", () => {
      const handleChange = vi.fn();
      render(
        <SelectAcademicYear
          defaultToCurrent
          customAcademicYears={TEST_ACADEMIC_YEARS}
          onChange={handleChange}
        />,
      );
      expect(handleChange).toHaveBeenCalledWith(
        "a1b2c3d4-2026-4027-8001-000000002026",
        expect.anything(),
      );
    });
  });

  describe("Selection & Change handling", () => {
    it("selects an academic year and triggers onChange", async () => {
      const handleChange = vi.fn();

      render(
        <SelectAcademicYear
          customAcademicYears={TEST_ACADEMIC_YEARS}
          onChange={handleChange}
        />,
      );

      const combobox = screen.getByRole("combobox");
      expect(combobox).toBeInTheDocument();
      fireEvent.mouseDown(combobox);

      await waitFor(() => {
        expect(screen.getByTitle("Năm học 2025 - 2026")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTitle("Năm học 2025 - 2026"));

      expect(handleChange).toHaveBeenCalledWith(
        "a1b2c3d4-2025-4026-8001-000000002025",
        expect.anything(),
      );
    });

    it("renders 'Tất cả năm học' option when includeAllOption is true", () => {
      render(
        <SelectAcademicYear
          customAcademicYears={TEST_ACADEMIC_YEARS}
          includeAllOption
          value="all"
        />,
      );

      expect(screen.getByText("Tất cả năm học")).toBeInTheDocument();
    });

    it("renders translated all option label when language changes", async () => {
      const { default: i18n } = await import("@/i18n/i18n");
      await act(async () => {
        await i18n.changeLanguage("en");
      });

      render(
        <SelectAcademicYear
          customAcademicYears={TEST_ACADEMIC_YEARS}
          includeAllOption
          value="all"
        />,
      );

      expect(screen.getByText("All academic years")).toBeInTheDocument();

      await act(async () => {
        await i18n.changeLanguage("vi");
      });
    });
  });

  describe("API integration", () => {
    it("fetches academic years from academicYearApi on mount when customAcademicYears is omitted", async () => {
      const spy = vi
        .spyOn(academicYearApi, "fetchAcademicYears")
        .mockResolvedValueOnce(TEST_ACADEMIC_YEARS);

      render(<SelectAcademicYear />);

      await waitFor(() => {
        expect(spy).toHaveBeenCalled();
      });

      const combobox = screen.getByRole("combobox");
      fireEvent.mouseDown(combobox);

      await waitFor(() => {
        expect(screen.getByTitle("Năm học 2026 - 2027")).toBeInTheDocument();
      });

      spy.mockRestore();
    });
  });
});
