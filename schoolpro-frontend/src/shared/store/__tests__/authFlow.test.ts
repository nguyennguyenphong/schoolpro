import { describe, it, expect, beforeEach } from "vitest";
import {
  getRoleHomeRoute,
  normalizeRoleSlug,
  isRoleAuthorized,
} from "@/shared/utils/roleRoutes";
import { useAuthStore } from "@/shared/store/useAuthStore";

describe("Role Route Utilities", () => {
  it("normalizes various student representations to 'student'", () => {
    expect(normalizeRoleSlug("student")).toBe("student");
    expect(normalizeRoleSlug("R_STU_568294")).toBe("student");
    expect(normalizeRoleSlug("Học sinh")).toBe("student");
  });

  it("normalizes various teacher representations to 'teacher'", () => {
    expect(normalizeRoleSlug("teacher")).toBe("teacher");
    expect(normalizeRoleSlug("R_TCH_659183")).toBe("teacher");
    expect(normalizeRoleSlug("Giáo viên")).toBe("teacher");
  });

  it("normalizes staff representations to 'staff'", () => {
    expect(normalizeRoleSlug("staff")).toBe("staff");
    expect(normalizeRoleSlug("R_STF_389216")).toBe("staff");
  });

  it("normalizes admin representations to 'admin'", () => {
    expect(normalizeRoleSlug("admin")).toBe("admin");
    expect(normalizeRoleSlug("R_ADMIN_839201")).toBe("admin");
  });

  it("normalizes parent representations to 'parent'", () => {
    expect(normalizeRoleSlug("parent")).toBe("parent");
    expect(normalizeRoleSlug("R_PAR_298307")).toBe("parent");
    expect(normalizeRoleSlug("Phụ huynh học sinh")).toBe("parent");
  });

  it("maps roles to correct home route", () => {
    expect(getRoleHomeRoute("student")).toBe("/student/home");
    expect(getRoleHomeRoute("R_STU_568294")).toBe("/student/home");
    expect(getRoleHomeRoute("teacher")).toBe("/teacher/home");
    expect(getRoleHomeRoute("R_TCH_659183")).toBe("/teacher/home");
    expect(getRoleHomeRoute("staff")).toBe("/staff/home");
    expect(getRoleHomeRoute("R_STF_389216")).toBe("/staff/home");
    expect(getRoleHomeRoute("admin")).toBe("/admin/dashboard");
    expect(getRoleHomeRoute("R_ADMIN_839201")).toBe("/admin/dashboard");
    expect(getRoleHomeRoute("principal")).toBe("/admin/dashboard");
    expect(getRoleHomeRoute("parent")).toBe("/parent/home");
    expect(getRoleHomeRoute("supervisor")).toBe("/supervisor/home");
  });

  it("validates role permissions correctly", () => {
    expect(isRoleAuthorized("R_STU_568294", ["student"])).toBe(true);
    expect(isRoleAuthorized("student", ["student"])).toBe(true);
    expect(isRoleAuthorized("R_TCH_659183", ["teacher"])).toBe(true);
    expect(isRoleAuthorized("R_STU_568294", ["teacher"])).toBe(false);
  });
});

describe("Auth Store Session Management", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  it("starts in unauthenticated state after logout", () => {
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("sets authentication and updates state with user and active role", () => {
    useAuthStore.getState().setAuth({
      access: "mock_jwt_access",
      refresh: "mock_jwt_refresh",
      user: {
        id: "u-123",
        username: "student01",
        full_name: "Nguyễn Văn Tuấn",
      },
      role: {
        id: "r-stu",
        code: "R_STU_568294",
        name: "Học sinh",
        role_type: "student",
      },
      remember: true,
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe("mock_jwt_access");
    expect(state.user?.name).toBe("Nguyễn Văn Tuấn");
    expect(state.role).toBe("R_STU_568294");
  });

  it("clears state on logout", () => {
    useAuthStore.getState().setAuth({
      access: "mock_jwt_access",
      refresh: "mock_jwt_refresh",
      user: {
        id: "u-123",
        username: "student01",
        full_name: "Nguyễn Văn Tuấn",
      },
      remember: true,
    });

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
