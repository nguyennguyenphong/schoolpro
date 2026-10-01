import axios from "axios";
import type {
  RoleItem,
  RoleApiResponse,
  RoleQueryParams,
} from "@/components/roles/SelectRole/types";

/**
 * Standard enterprise mock data matching PostgreSQL backend seeds.
 * Used for testing, offline development, or fallback.
 */
export const MOCK_ROLES: RoleItem[] = [
  {
    id: "e8a937dc-faee-4613-bb18-498c366ff401",
    code: "R_ADMIN_839201",
    name: "Quản trị viên hệ thống",
    description: "Toàn quyền quản trị hệ thống và cấu hình SchoolPro",
    badge_color: "#DC2626",
    icon: "shield-alert",
    is_system: true,
    is_active: true,
    user_count: 1,
    permission_count: 26,
  },
  {
    id: "b1f29402-9a3d-4c81-8172-10f849204812",
    code: "R_TEACHER_729481",
    name: "Giáo viên bộ môn",
    description: "Quản lý lớp học, chấm điểm, theo dõi tiến độ học sinh",
    badge_color: "#2563EB",
    icon: "book-open",
    is_system: false,
    is_active: true,
    user_count: 15,
    permission_count: 14,
  },
  {
    id: "c4d83920-561b-419a-9e12-783920184712",
    code: "R_HOMEROOM_910382",
    name: "Giáo viên chủ nhiệm",
    description: "Chủ nhiệm lớp, quản lý chuyên cần và liên lạc phụ huynh",
    badge_color: "#7C3AED",
    icon: "award",
    is_system: false,
    is_active: true,
    user_count: 8,
    permission_count: 18,
  },
  {
    id: "f5a02847-1940-4281-9bce-928471920481",
    code: "R_STUDENT_382910",
    name: "Học sinh",
    description: "Xem thời khóa biểu, nộp bài tập và xem kết quả học tập",
    badge_color: "#059669",
    icon: "graduation-cap",
    is_system: false,
    is_active: true,
    user_count: 320,
    permission_count: 8,
  },
  {
    id: "d9e84719-2048-4719-a1b2-c3d4e5f60718",
    code: "R_PARENT_582910",
    name: "Phụ huynh",
    description: "Theo dõi học tập, chuyên cần và học phí của học sinh",
    badge_color: "#D97706",
    icon: "users",
    is_system: false,
    is_active: true,
    user_count: 290,
    permission_count: 6,
  },
  {
    id: "a3b2c1d0-e4f5-4678-9012-3456789abcde",
    code: "R_STAFF_192837",
    name: "Cán bộ quản trị / Nhân viên",
    description: "Vận hành nghiệp vụ học vụ, cơ sở vật chất và tài chính",
    badge_color: "#4B5563",
    icon: "briefcase",
    is_system: false,
    is_active: true,
    user_count: 12,
    permission_count: 12,
  },
];

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const IS_MOCK_ENABLED = import.meta.env.VITE_ENABLE_MOCK === "true";
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

/**
 * Service to communicate with the Core Role API endpoints.
 */
export const roleApi = {
  /**
   * Fetches roles list from backend API with optional filters.
   * Gracefully falls back to mock data if backend is unavailable.
   */
  async fetchRoles(params: RoleQueryParams = {}): Promise<RoleItem[]> {
    if (IS_MOCK_ENABLED) {
      return this.filterMockRoles(params);
    }

    try {
      const response = await axios.get<RoleApiResponse | RoleItem[]>(
        `${API_BASE_URL}/core/roles/`,
        {
          params: {
            paginate: false,
            ...params,
          },
          timeout: API_TIMEOUT,
        },
      );

      const raw = response.data;

      // Handle standard envelope: { success: true, code: 200, data: [...] }
      if (raw && typeof raw === "object" && "data" in raw) {
        if (Array.isArray(raw.data)) {
          return raw.data;
        }
        if (raw.data && typeof raw.data === "object" && "results" in raw.data) {
          return (raw.data as { results: RoleItem[] }).results;
        }
      }

      // Handle raw array response
      if (Array.isArray(raw)) {
        return raw;
      }

      return MOCK_ROLES;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(
          "[roleApi] Could not connect to Core Role API endpoint. Falling back to local mock data.",
          error,
        );
      }
      return this.filterMockRoles(params);
    }
  },

  /**
   * Fetches a specific role by UUID or code.
   */
  async fetchRoleById(idOrCode: string): Promise<RoleItem | null> {
    if (IS_MOCK_ENABLED) {
      return (
        MOCK_ROLES.find((r) => r.id === idOrCode || r.code === idOrCode) || null
      );
    }

    try {
      const response = await axios.get<{ success: boolean; data: RoleItem }>(
        `${API_BASE_URL}/core/roles/${idOrCode}/`,
        { timeout: API_TIMEOUT },
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch {
      return (
        MOCK_ROLES.find((r) => r.id === idOrCode || r.code === idOrCode) || null
      );
    }
  },

  /**
   * Helper to filter mock roles locally based on query params.
   */
  filterMockRoles(params: RoleQueryParams): RoleItem[] {
    let result = [...MOCK_ROLES];

    if (params.is_active !== undefined) {
      result = result.filter((r) => r.is_active === params.is_active);
    }

    if (params.is_system !== undefined) {
      result = result.filter((r) => r.is_system === params.is_system);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q)),
      );
    }

    return result;
  },
};
