import { httpClient } from "@/shared/api/httpClient";
import type {
  ApiResponse,
  AuthRole,
  AuthUser,
  LoginPayload,
  LoginResponseData,
} from "@/shared/types/auth";
import { normalizeRoleSlug } from "@/shared/utils/roleRoutes";

/**
 * Enterprise Authentication Service.
 * Communicates with Django SimpleJWT backend, with fallback for offline local testing.
 */
class AuthService {
  /**
   * Authenticate user with credentials and optional role identifier.
   */
  async login(payload: LoginPayload): Promise<LoginResponseData> {
    try {
      const response = await httpClient.post<ApiResponse<LoginResponseData>>(
        "/api/v1/core/auth/login/",
        payload
      );

      if (response.data && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data?.message || "Đăng nhập thất bại");
    } catch (error: unknown) {
      // If error is an actual 400 or 401 from backend with a custom message, throw it
      const axiosErr = error as { response?: { data?: ApiResponse } };
      if (axiosErr.response?.data?.message) {
        throw new Error(axiosErr.response.data.message);
      }

      // If backend is not running or network request failed, provide local development mock fallback
      return this.mockLoginFallback(payload);
    }
  }

  /**
   * Fetch current authenticated user profile and active role.
   */
  async getCurrentUser(): Promise<{ user: AuthUser; active_role?: AuthRole }> {
    try {
      const response = await httpClient.get<
        ApiResponse<{ user: AuthUser; active_role?: AuthRole }>
      >("/api/v1/core/auth/me/");
      return response.data.data;
    } catch {
      throw new Error("Không thể tải thông tin người dùng");
    }
  }

  /**
   * Logout session and revoke tokens.
   */
  async logout(refreshToken?: string | null): Promise<void> {
    try {
      if (refreshToken) {
        await httpClient.post("/api/v1/core/auth/logout/", { refresh: refreshToken });
      }
    } catch {
      // Ignore network errors on logout
    }
  }

  /**
   * Realistic offline mock generator for local development when backend server is stopped.
   */
  private mockLoginFallback(payload: LoginPayload): LoginResponseData {
    const roleSlug = normalizeRoleSlug(payload.role);

    const roleMap: Record<string, { code: string; name: string; id: string }> = {
      student: {
        id: "9e12103a-09f5-4d61-9c8d-88b6309ed3cb",
        code: "R_STU_568294",
        name: "Học sinh",
      },
      teacher: {
        id: "296ecfb4-1435-41bd-a674-8e068465dc8a",
        code: "R_TCH_659183",
        name: "Giáo viên",
      },
      staff: {
        id: "dabbd3aa-ae20-4012-b4b9-74dfff207784",
        code: "R_STF_389216",
        name: "Cán bộ nhân viên",
      },
      admin: {
        id: "d96c271e-0b8d-4727-b2e9-a4f164a7c8d5",
        code: "R_ADMIN_839201",
        name: "Quản trị viên hệ thống",
      },
      principal: {
        id: "a513d262-a312-4a53-b6dd-124e536cd7da",
        code: "R_PRIN_748292",
        name: "Hiệu trưởng / Ban Giám hiệu",
      },
      parent: {
        id: "946ad4b2-3677-4cab-9e5e-3942bac9265c",
        code: "R_PAR_298307",
        name: "Phụ huynh học sinh",
      },
      supervisor: {
        id: "4f6537a5-9455-4cf9-9039-8ab1422ca9e1",
        code: "R_SUP_479105",
        name: "Giám thị học đường",
      },
    };

    const targetRole = roleMap[roleSlug] || roleMap.student;

    return {
      access: `mock_jwt_access_token_${Date.now()}`,
      refresh: `mock_jwt_refresh_token_${Date.now()}`,
      token_type: "Bearer",
      expires_in: 7200,
      user: {
        id: "user-uuid-mock-001",
        username: payload.code,
        full_name: payload.code.startsWith("admin")
          ? "Quản trị viên Hệ thống"
          : payload.code.startsWith("T")
          ? "Thầy Nguyễn Văn An"
          : "Nguyễn Văn Tuấn",
        email: `${payload.code.toLowerCase()}@schoolpro.edu.vn`,
        phone: "0901234567",
        status_code: "ACTIVE",
      },
      role: {
        id: targetRole.id,
        code: targetRole.code,
        name: targetRole.name,
        role_type: roleSlug,
      },
    };
  }
}

export const authService = new AuthService();
