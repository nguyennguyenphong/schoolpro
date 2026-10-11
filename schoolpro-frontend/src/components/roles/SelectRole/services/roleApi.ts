import axios from "axios";
import type {
  RoleItem,
  RoleApiResponse,
  RoleQueryParams,
} from "@/components/roles/SelectRole/types";

/**
 * Standard enterprise mock data matching PostgreSQL backend seeds 100%.
 */
export const MOCK_ROLES: RoleItem[] = [
  {
    id: "d96c271e-0b8d-4727-b2e9-a4f164a7c8d5",
    code: "R_ADMIN_839201",
    name: "Quản trị viên hệ thống",
    description: "Toàn quyền cấu hình, vận hành và quản trị kỹ thuật",
    badge_color: "#1E293B",
    icon: "shield-check",
    is_system: true,
    is_active: true,
    user_count: 1,
    permission_count: 1,
    created_at: "2026-10-01T17:35:00.561777+07:00",
    updated_at: "2026-10-01T17:35:00.561777+07:00",
  },
  {
    id: "946ad4b2-3677-4cab-9e5e-3942bac9265c",
    code: "R_PAR_298307",
    name: "Phụ huynh học sinh",
    description: "Cha mẹ hoặc người giám hộ theo dõi tiến độ học tập",
    badge_color: "#EA580C",
    icon: "heart-handshake",
    is_system: false,
    is_active: true,
    user_count: 3,
    permission_count: 1,
    created_at: "2026-10-01T17:35:00.561777+07:00",
    updated_at: "2026-10-01T17:35:00.561777+07:00",
  },
  {
    id: "a513d262-a312-4a53-b6dd-124e536cd7da",
    code: "R_PRIN_748292",
    name: "Hiệu trưởng / Ban Giám hiệu",
    description: "Ban giám hiệu chỉ đạo toàn diện hoạt động dạy và học",
    badge_color: "#4F46E5",
    icon: "crown",
    is_system: true,
    is_active: true,
    user_count: 2,
    permission_count: 1,
    created_at: "2026-10-01T17:35:00.561777+07:00",
    updated_at: "2026-10-01T17:35:00.561777+07:00",
  },
  {
    id: "dabbd3aa-ae20-4012-b4b9-74dfff207784",
    code: "R_STF_389216",
    name: "Cán bộ nhân viên",
    description: "Y tế, Thư viện, Kế toán - Tài vụ, Thiết bị Cơ sở vật chất",
    badge_color: "#0D9488",
    icon: "briefcase",
    is_system: true,
    is_active: true,
    user_count: 2,
    permission_count: 1,
    created_at: "2026-10-01T17:35:00.561777+07:00",
    updated_at: "2026-10-01T17:35:00.561777+07:00",
  },
  {
    id: "9e12103a-09f5-4d61-9c8d-88b6309ed3cb",
    code: "R_STU_568294",
    name: "Học sinh",
    description: "Học sinh trường Trung học phổ thông truy cập thời khóa biểu, điểm số",
    badge_color: "#059669",
    icon: "user-graduate",
    is_system: true,
    is_active: true,
    user_count: 6,
    permission_count: 1,
    created_at: "2026-10-01T17:35:00.561777+07:00",
    updated_at: "2026-10-01T17:35:00.561777+07:00",
  },
  {
    id: "4f6537a5-9455-4cf9-9039-8ab1422ca9e1",
    code: "R_SUP_479105",
    name: "Giám thị học đường",
    description: "Ban giám hiệu theo dõi nề nếp thi đua và kỷ luật",
    badge_color: "#D97706",
    icon: "clipboard-check",
    is_system: true,
    is_active: true,
    user_count: 1,
    permission_count: 1,
    created_at: "2026-10-01T17:35:00.561777+07:00",
    updated_at: "2026-10-01T17:35:00.561777+07:00",
  },
  {
    id: "296ecfb4-1435-41bd-a674-8e068465dc8a",
    code: "R_TCH_659183",
    name: "Giáo viên",
    description: "Giáo viên bộ môn, chủ nhiệm và tổ chuyên môn",
    badge_color: "#2563EB",
    icon: "chalkboard",
    is_system: true,
    is_active: true,
    user_count: 9,
    permission_count: 1,
    created_at: "2026-10-01T17:35:00.561777+07:00",
    updated_at: "2026-10-01T17:35:00.561777+07:00",
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
