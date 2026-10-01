import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { SelectRole } from "@/components/roles/SelectRole";
import { roleApi } from "@/components/roles/SelectRole/services/roleApi";
import type { RoleItem } from "@/components/roles/SelectRole/types";

const TEST_ROLES: RoleItem[] = [
  {
    id: "role-1",
    code: "R_ADMIN_839201",
    name: "Quản trị viên hệ thống",
    description: "System Admin role",
    badge_color: "#DC2626",
    is_active: true,
    user_count: 3,
  },
  {
    id: "role-2",
    code: "R_TEACHER_729481",
    name: "Giáo viên bộ môn",
    description: "Teacher role",
    badge_color: "#2563EB",
    is_active: true,
    user_count: 20,
  },
  {
    id: "role-3",
    code: "R_STUDENT_382910",
    name: "Học sinh",
    description: "Student role",
    badge_color: "#059669",
    is_active: true,
    user_count: 500,
  },
];

describe("SelectRole Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders correctly with default placeholder", () => {
      render(<SelectRole customRoles={TEST_ROLES} />);
      expect(screen.getByText("Chọn vai trò")).toBeInTheDocument();
    });

    it("renders with custom placeholder", () => {
      render(
        <SelectRole
          placeholder="Vui lòng chọn chức vụ"
          customRoles={TEST_ROLES}
        />,
      );
      expect(screen.getByText("Vui lòng chọn chức vụ")).toBeInTheDocument();
    });

    it("renders with disabled state", () => {
      const { container } = render(
        <SelectRole disabled customRoles={TEST_ROLES} />,
      );
      const selectElement = container.querySelector(".ant-select-disabled");
      expect(selectElement).toBeInTheDocument();
    });

    it("renders with custom className", () => {
      const { container } = render(
        <SelectRole className="custom-test-class" customRoles={TEST_ROLES} />,
      );
      expect(
        container.querySelector(".custom-test-class"),
      ).toBeInTheDocument();
    });
  });

  describe("Single selection", () => {
    it("selects a role by ID and triggers callbacks", async () => {
      const handleChange = vi.fn();
      const handleRoleChange = vi.fn();

      render(
        <SelectRole
          customRoles={TEST_ROLES}
          onChange={handleChange}
          onRoleChange={handleRoleChange}
        />,
      );

      const combobox = screen.getByRole("combobox");
      expect(combobox).toBeInTheDocument();
      fireEvent.mouseDown(combobox);

      await waitFor(() => {
        expect(
          screen.getByTitle("Quản trị viên hệ thống (R_ADMIN_839201)"),
        ).toBeInTheDocument();
      });

      fireEvent.click(
        screen.getByTitle("Quản trị viên hệ thống (R_ADMIN_839201)"),
      );

      expect(handleChange).toHaveBeenCalledWith(
        "role-1",
        expect.anything(),
      );
      expect(handleRoleChange).toHaveBeenCalledWith(TEST_ROLES[0]);
    });

    it("selects a role by CODE when valueField is 'code'", async () => {
      const handleChange = vi.fn();
      const handleRoleChange = vi.fn();

      render(
        <SelectRole
          valueField="code"
          customRoles={TEST_ROLES}
          onChange={handleChange}
          onRoleChange={handleRoleChange}
        />,
      );

      const combobox = screen.getByRole("combobox");
      fireEvent.mouseDown(combobox);

      await waitFor(() => {
        expect(
          screen.getByTitle("Giáo viên bộ môn (R_TEACHER_729481)"),
        ).toBeInTheDocument();
      });

      fireEvent.click(
        screen.getByTitle("Giáo viên bộ môn (R_TEACHER_729481)"),
      );

      expect(handleChange).toHaveBeenCalledWith(
        "R_TEACHER_729481",
        expect.anything(),
      );
      expect(handleRoleChange).toHaveBeenCalledWith(TEST_ROLES[1]);
    });
  });

  describe("Multiple selection", () => {
    it("renders in multiple mode and allows selecting multiple roles", async () => {
      const handleChange = vi.fn();
      const handleRoleChange = vi.fn();

      render(
        <SelectRole
          mode="multiple"
          customRoles={TEST_ROLES}
          onChange={handleChange}
          onRoleChange={handleRoleChange}
        />,
      );

      const combobox = screen.getByRole("combobox");
      fireEvent.mouseDown(combobox);

      await waitFor(() => {
        expect(
          screen.getByTitle("Học sinh (R_STUDENT_382910)"),
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTitle("Học sinh (R_STUDENT_382910)"));

      expect(handleChange).toHaveBeenCalledWith(
        ["role-3"],
        expect.anything(),
      );
      expect(handleRoleChange).toHaveBeenCalledWith([TEST_ROLES[2]]);
    });
  });

  describe("API integration", () => {
    it("fetches roles from roleApi on mount when customRoles not provided", async () => {
      const spy = vi
        .spyOn(roleApi, "fetchRoles")
        .mockResolvedValueOnce(TEST_ROLES);

      render(<SelectRole />);

      await waitFor(() => {
        expect(spy).toHaveBeenCalled();
      });

      const combobox = screen.getByRole("combobox");
      fireEvent.mouseDown(combobox);

      await waitFor(() => {
        expect(
          screen.getByTitle("Quản trị viên hệ thống (R_ADMIN_839201)"),
        ).toBeInTheDocument();
      });

      spy.mockRestore();
    });

    it("falls back to MOCK_ROLES if roleApi throws an error", async () => {
      const spy = vi
        .spyOn(roleApi, "fetchRoles")
        .mockRejectedValueOnce(new Error("Network Error"));

      render(<SelectRole />);

      await waitFor(() => {
        expect(spy).toHaveBeenCalled();
      });

      expect(screen.getByText("Chọn vai trò")).toBeInTheDocument();
      spy.mockRestore();
    });
  });
});
