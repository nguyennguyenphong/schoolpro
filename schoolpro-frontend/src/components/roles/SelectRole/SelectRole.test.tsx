import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { SelectRole } from "@/components/roles/SelectRole";
import { roleApi } from "@/components/roles/SelectRole/services/roleApi";
import type { RoleItem } from "@/components/roles/SelectRole/types";

const TEST_ROLES: RoleItem[] = [
  {
    id: "d96c271e-0b8d-4727-b2e9-a4f164a7c8d5",
    code: "R_ADMIN_839201",
    name: "Quản trị viên hệ thống",
    description: "System Admin role",
    badge_color: "#1E293B",
    is_active: true,
    user_count: 1,
  },
  {
    id: "296ecfb4-1435-41bd-a674-8e068465dc8a",
    code: "R_TCH_659183",
    name: "Giáo viên",
    description: "Teacher role",
    badge_color: "#2563EB",
    is_active: true,
    user_count: 9,
  },
  {
    id: "9e12103a-09f5-4d61-9c8d-88b6309ed3cb",
    code: "R_STU_568294",
    name: "Học sinh",
    description: "Student role",
    badge_color: "#059669",
    is_active: true,
    user_count: 6,
  },
];

describe("SelectRole Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders correctly with default placeholder when defaultToStudent is false", () => {
      render(
        <SelectRole
          customRoles={TEST_ROLES}
          defaultToStudent={false}
        />,
      );
      expect(screen.getByText("Chọn vai trò")).toBeInTheDocument();
    });

    it("renders with custom placeholder", () => {
      render(
        <SelectRole
          placeholder="Vui lòng chọn chức vụ"
          customRoles={TEST_ROLES}
          defaultToStudent={false}
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

  describe("Default Student Role & Slug Resolution", () => {
    it("defaults to 'Học sinh' role by default", () => {
      render(<SelectRole customRoles={TEST_ROLES} />);
      expect(screen.getByText("Học sinh")).toBeInTheDocument();
    });

    it("resolves slug 'student' to 'Học sinh' role label", () => {
      render(<SelectRole value="student" customRoles={TEST_ROLES} />);
      expect(screen.getByText("Học sinh")).toBeInTheDocument();
    });

    it("distinguishes between 'Phụ huynh học sinh' and 'Học sinh' and selects 'Học sinh'", async () => {
      // In MOCK_ROLES, 'Phụ huynh học sinh' appears at index 1, before 'Học sinh' at index 4
      render(<SelectRole />);
      await waitFor(() => {
        expect(screen.getByText("Học sinh")).toBeInTheDocument();
      });
      expect(screen.queryByText("Phụ huynh học sinh")).not.toBeInTheDocument();
    });
  });

  describe("Selection", () => {
    it("selects a role and triggers onChange", async () => {
      const handleChange = vi.fn();

      render(
        <SelectRole
          customRoles={TEST_ROLES}
          defaultToStudent={false}
          onChange={handleChange}
        />,
      );

      const combobox = screen.getByRole("combobox");
      expect(combobox).toBeInTheDocument();
      fireEvent.mouseDown(combobox);

      await waitFor(() => {
        expect(
          screen.getByTitle("Quản trị viên hệ thống"),
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTitle("Quản trị viên hệ thống"));

      expect(handleChange).toHaveBeenCalledWith(
        "d96c271e-0b8d-4727-b2e9-a4f164a7c8d5",
        expect.anything(),
      );
    });

    it("renders in multiple mode and allows selecting multiple roles", async () => {
      const handleChange = vi.fn();

      render(
        <SelectRole
          mode="multiple"
          customRoles={TEST_ROLES}
          defaultToStudent={false}
          onChange={handleChange}
        />,
      );

      const combobox = screen.getByRole("combobox");
      fireEvent.mouseDown(combobox);

      await waitFor(() => {
        expect(screen.getByTitle("Học sinh")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTitle("Học sinh"));

      expect(handleChange).toHaveBeenCalledWith(
        ["9e12103a-09f5-4d61-9c8d-88b6309ed3cb"],
        expect.anything(),
      );
    });
  });

  describe("API integration", () => {
    it("fetches roles from roleApi on mount when customRoles not provided", async () => {
      const spy = vi
        .spyOn(roleApi, "fetchRoles")
        .mockResolvedValueOnce(TEST_ROLES);

      render(<SelectRole defaultToStudent={false} />);

      await waitFor(() => {
        expect(spy).toHaveBeenCalled();
      });

      const combobox = screen.getByRole("combobox");
      fireEvent.mouseDown(combobox);

      await waitFor(() => {
        expect(
          screen.getByTitle("Quản trị viên hệ thống"),
        ).toBeInTheDocument();
      });

      spy.mockRestore();
    });

    it("falls back to MOCK_ROLES if roleApi throws an error", async () => {
      const spy = vi
        .spyOn(roleApi, "fetchRoles")
        .mockRejectedValueOnce(new Error("Network Error"));

      render(<SelectRole defaultToStudent={false} />);

      await waitFor(() => {
        expect(spy).toHaveBeenCalled();
      });

      expect(screen.getByText("Chọn vai trò")).toBeInTheDocument();
      spy.mockRestore();
    });
  });
});
