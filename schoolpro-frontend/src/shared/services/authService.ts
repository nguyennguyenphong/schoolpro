import type { AxiosError } from "axios";
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
 * Validates credentials against Django backend and enforces strict error reporting.
 */
class AuthService {
  /**
   * Authenticate user with credentials and optional role identifier.
   */
  async login(payload: LoginPayload): Promise<LoginResponseData> {
    try {
      const response = await httpClient.post<ApiResponse<LoginResponseData>>(
        "/core/auth/login/",
        payload
      );

      if (response.data && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data?.message || "Đăng nhập thất bại");
    } catch (error: unknown) {
      const axiosErr = error as AxiosError<{
        message?: string;
        errors?: Record<string, string | string[]> | string[] | string;
        error_code?: string;
        detail?: string;
      }>;

      // 1. If backend responded with 400, 401, 403, 500: extract exact server error message
      if (axiosErr.response?.data) {
        const data = axiosErr.response.data;

        // Check if errors object has detail (e.g. {"errors": {"detail": "Tài khoản hoặc mã định danh..."}})
        if (data.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
          const errObj = data.errors as Record<string, unknown>;
          if (typeof errObj.detail === "string" && errObj.detail) {
            throw new Error(errObj.detail);
          }
          if (typeof errObj.password === "string" && errObj.password) {
            throw new Error(errObj.password);
          }
          if (typeof errObj.code === "string" && errObj.code) {
            throw new Error(errObj.code);
          }
        }

        // Check DRF top-level detail
        if (typeof data.detail === "string" && data.detail) {
          throw new Error(data.detail);
        }

        // Check field errors array or string
        if (data.errors) {
          if (typeof data.errors === "string" && data.errors) {
            throw new Error(data.errors);
          }
          if (Array.isArray(data.errors) && data.errors.length > 0) {
            throw new Error(String(data.errors[0]));
          }
          if (typeof data.errors === "object" && !Array.isArray(data.errors)) {
            const errObj = data.errors as Record<string, unknown>;
            const firstKey = Object.keys(errObj)[0];
            if (firstKey) {
              const firstVal = errObj[firstKey];
              if (Array.isArray(firstVal) && firstVal.length > 0) {
                throw new Error(String(firstVal[0]));
              }
              if (typeof firstVal === "string" && firstVal) {
                throw new Error(firstVal);
              }
            }
          }
        }

        // Check explicit non-generic message from APIResponse
        const genericMessages = [
          "An error occurred",
          "Invalid request",
          "Authentication credentials were not provided or have expired.",
          "Validation error: payload contains invalid or missing required fields.",
        ];
        if (data.message && !genericMessages.includes(data.message)) {
          throw new Error(data.message);
        }

        if (data.message) {
          throw new Error(data.message);
        }
      }

      // 2. If network error / backend is offline
      if (
        axiosErr.code === "ERR_NETWORK" ||
        axiosErr.message === "Network Error" ||
        !axiosErr.response
      ) {
        // Only run mock login if explicit mock environment variable is set
        if (import.meta.env.VITE_ENABLE_MOCK === "true") {
          return this.mockLoginStrict(payload);
        }

        throw new Error(
          "Không thể kết nối đến máy chủ backend (Cổng 8000). Vui lòng kiểm tra lại dịch vụ máy chủ."
        );
      }

      throw new Error(
        axiosErr.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản và mật khẩu."
      );
    }
  }

  /**
   * Fetch current authenticated user profile and active role.
   */
  async getCurrentUser(): Promise<{ user: AuthUser; active_role?: AuthRole }> {
    try {
      const response = await httpClient.get<
        ApiResponse<{ user: AuthUser; active_role?: AuthRole }>
      >("/core/auth/me/");
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
        await httpClient.post("/core/auth/logout/", { refresh: refreshToken });
      }
    } catch {
      // Ignore network errors on logout
    }
  }

  /**
   * Strict offline mock validator when VITE_ENABLE_MOCK=true is explicitly configured.
   * Enforces credentials check so incorrect passwords will NOT log in.
   */
  private mockLoginStrict(payload: LoginPayload): LoginResponseData {
    const validDemoPasswords = ["123456", "password123", "admin123", "schoolpro123"];

    if (!payload.password || !validDemoPasswords.includes(payload.password)) {
      throw new Error("Mật khẩu không chính xác. Vui lòng kiểm tra lại.");
    }

    if (!payload.code || payload.code.trim().length < 3) {
      throw new Error("Mã định danh không hợp lệ. Vui lòng nhập tối thiểu 3 ký tự.");
    }

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
