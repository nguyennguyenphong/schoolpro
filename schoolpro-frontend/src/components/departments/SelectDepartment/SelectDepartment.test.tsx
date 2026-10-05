import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { SelectDepartment } from "@/components/departments/SelectDepartment";
import { departmentApi } from "@/components/departments/SelectDepartment/services/departmentApi";
import type { DepartmentItem } from "@/components/departments/SelectDepartment/types";

const TEST_DEPARTMENTS: DepartmentItem[] = [
  {
    id: "7d35eb57-e173-4fde-8df3-d72f8488b658",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    code: "DEP_ACC659182",
    name: "Phòng Kế toán - Tài vụ",
    department_type: "ADMINISTRATION",
    is_active: true,
  },
  {
    id: "710d4b60-71f8-480e-adfa-b6e2a1c36fe9",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    code: "DEP_C187465",
    name: "Tổ Hóa học - Sinh học",
    department_type: "SUBJECT",
    is_active: true,
  },
  {
    id: "ecf6a9a8-cd10-4b32-9287-cd6f394c1571",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    code: "DEP_M839201",
    name: "Tổ Toán - Tin học",
    department_type: "SUBJECT",
    is_active: true,
  },
];

describe("SelectDepartment Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders correctly with default placeholder", () => {
      render(<SelectDepartment customDepartments={TEST_DEPARTMENTS} />);
      expect(screen.getByText("Chọn phòng / tổ chuyên môn")).toBeInTheDocument();
    });

    it("renders with custom placeholder", () => {
      render(
        <SelectDepartment
          placeholder="Vui lòng chọn tổ bộ môn"
          customDepartments={TEST_DEPARTMENTS}
        />,
      );
      expect(screen.getByText("Vui lòng chọn tổ bộ môn")).toBeInTheDocument();
    });

    it("renders with disabled state", () => {
      const { container } = render(
        <SelectDepartment disabled customDepartments={TEST_DEPARTMENTS} />,
      );
      const selectElement = container.querySelector(".ant-select-disabled");
      expect(selectElement).toBeInTheDocument();
    });

    it("renders with custom className", () => {
      const { container } = render(
        <SelectDepartment
          className="custom-department-class"
          customDepartments={TEST_DEPARTMENTS}
        />,
      );
      expect(
        container.querySelector(".custom-department-class"),
      ).toBeInTheDocument();
    });

    it("renders options with code prefix when showCodePrefix is true", async () => {
      render(
        <SelectDepartment
          showCodePrefix
          customDepartments={TEST_DEPARTMENTS}
        />,
      );

      const combobox = screen.getByRole("combobox");
      fireEvent.mouseDown(combobox);

      await waitFor(() => {
        expect(
          screen.getByTitle("Tổ Toán - Tin học"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Value & Code Resolution", () => {
    it("resolves value given by UUID", () => {
      render(
        <SelectDepartment
          value="ecf6a9a8-cd10-4b32-9287-cd6f394c1571"
          customDepartments={TEST_DEPARTMENTS}
        />,
      );
      expect(screen.getByText("Tổ Toán - Tin học")).toBeInTheDocument();
    });

    it("resolves value given by code (DEP_M839201)", () => {
      render(
        <SelectDepartment
          value="DEP_M839201"
          customDepartments={TEST_DEPARTMENTS}
        />,
      );
      expect(screen.getByText("Tổ Toán - Tin học")).toBeInTheDocument();
    });
  });

  describe("Selection & Change handling", () => {
    it("selects a department and triggers onChange", async () => {
      const handleChange = vi.fn();

      render(
        <SelectDepartment
          customDepartments={TEST_DEPARTMENTS}
          onChange={handleChange}
        />,
      );

      const combobox = screen.getByRole("combobox");
      expect(combobox).toBeInTheDocument();
      fireEvent.mouseDown(combobox);

      await waitFor(() => {
        expect(
          screen.getByTitle("Tổ Hóa học - Sinh học"),
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTitle("Tổ Hóa học - Sinh học"));

      expect(handleChange).toHaveBeenCalledWith(
        "710d4b60-71f8-480e-adfa-b6e2a1c36fe9",
        expect.anything(),
      );
    });
  });

  describe("API integration", () => {
    it("fetches departments from departmentApi on mount when customDepartments is omitted", async () => {
      const spy = vi
        .spyOn(departmentApi, "fetchDepartments")
        .mockResolvedValueOnce(TEST_DEPARTMENTS);

      render(<SelectDepartment />);

      await waitFor(() => {
        expect(spy).toHaveBeenCalled();
      });

      const combobox = screen.getByRole("combobox");
      fireEvent.mouseDown(combobox);

      await waitFor(() => {
        expect(
          screen.getByTitle("Phòng Kế toán - Tài vụ"),
        ).toBeInTheDocument();
      });

      spy.mockRestore();
    });
  });
});
