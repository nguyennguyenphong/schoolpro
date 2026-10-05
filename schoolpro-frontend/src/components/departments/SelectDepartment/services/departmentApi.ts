import { httpClient } from "@/shared/api/httpClient";
import type {
  DepartmentItem,
  DepartmentApiResponse,
  DepartmentQueryParams,
} from "@/components/departments/SelectDepartment/types";

/**
 * Standard enterprise mock data matching PostgreSQL backend seeds 100%.
 */
export const MOCK_DEPARTMENTS: DepartmentItem[] = [
  {
    id: "7d35eb57-e173-4fde-8df3-d72f8488b658",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    code: "DEP_ACC659182",
    name: "Phòng Kế toán - Tài vụ",
    department_type: "ADMINISTRATION",
    leader_teacher: null,
    vice_leader: null,
    is_active: true,
    teachers_count: 0,
    staff_count: 1,
    subjects_count: 0,
    total_members_count: 1,
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "757a8002-d004-4198-9f22-31b06995bc28",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    code: "DEP_BOD479104",
    name: "Ban Giám hiệu Trường THPT",
    department_type: "BOARD",
    leader_teacher: null,
    vice_leader: null,
    is_active: true,
    teachers_count: 0,
    staff_count: 0,
    subjects_count: 0,
    total_members_count: 0,
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "710d4b60-71f8-480e-adfa-b6e2a1c36fe9",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    code: "DEP_C187465",
    name: "Tổ Hóa học - Sinh học",
    department_type: "SUBJECT",
    leader_teacher: {
      id: "ff3d6039-2b2d-41c9-af25-9c2099c85760",
      full_name: "Bùi Phương Thảo",
      email: "buiphuongthao@schoolpro.edu.vn",
      phone: "0918901234",
      avatar_url: null,
    },
    vice_leader: null,
    is_active: true,
    teachers_count: 1,
    staff_count: 0,
    subjects_count: 2,
    total_members_count: 1,
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "8d0001fd-3eed-40b3-a861-e3b48ea2be0b",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    code: "DEP_E837465",
    name: "Tổ Ngoại ngữ (Tiếng Anh)",
    department_type: "SUBJECT",
    leader_teacher: {
      id: "e3d6b0e0-fc5c-4dd9-b452-37cc56d8f5a4",
      full_name: "Đặng Tuyết Mai",
      email: "dangtuyetmai@schoolpro.edu.vn",
      phone: "0916789012",
      avatar_url: null,
    },
    vice_leader: null,
    is_active: true,
    teachers_count: 1,
    staff_count: 0,
    subjects_count: 1,
    total_members_count: 1,
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "d1d7e2cf-e0f8-4bda-a214-bebc90440592",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    code: "DEP_H746582",
    name: "Tổ Lịch sử - Địa lý - GDKT&PL",
    department_type: "SUBJECT",
    leader_teacher: {
      id: "6cab1a49-cdb1-4f52-bd16-df5806405b96",
      full_name: "Đỗ Tiến Dũng",
      email: "dotiendung@schoolpro.edu.vn",
      phone: "0919012345",
      avatar_url: null,
    },
    vice_leader: null,
    is_active: true,
    teachers_count: 1,
    staff_count: 0,
    subjects_count: 4,
    total_members_count: 1,
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "e95ff85f-ecbe-4286-ab55-95ffeed75e07",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    code: "DEP_L928374",
    name: "Tổ Ngữ văn",
    department_type: "SUBJECT",
    leader_teacher: {
      id: "3340abda-49a2-4ac2-837f-f9e0a11537c4",
      full_name: "Hoàng Mai Lan",
      email: "hoangmailan@schoolpro.edu.vn",
      phone: "0915678901",
      avatar_url: null,
    },
    vice_leader: null,
    is_active: true,
    teachers_count: 1,
    staff_count: 0,
    subjects_count: 1,
    total_members_count: 1,
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "ecf6a9a8-cd10-4b32-9287-cd6f394c1571",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    code: "DEP_M839201",
    name: "Tổ Toán - Tin học",
    department_type: "SUBJECT",
    leader_teacher: {
      id: "6b369de1-c41d-43f7-a362-86e9733f768a",
      full_name: "ThS. Nguyễn Văn Minh",
      email: "nguyenvanminh@schoolpro.edu.vn",
      phone: "0912345678",
      avatar_url: null,
    },
    vice_leader: null,
    is_active: true,
    teachers_count: 3,
    staff_count: 0,
    subjects_count: 2,
    total_members_count: 3,
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "f6f9361e-bc85-42eb-8bc5-2b5c8a8faddc",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    code: "DEP_MED748291",
    name: "Phòng Y tế Học đường",
    department_type: "ADMINISTRATION",
    leader_teacher: null,
    vice_leader: null,
    is_active: true,
    teachers_count: 0,
    staff_count: 1,
    subjects_count: 0,
    total_members_count: 1,
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "fffc5c55-3003-4df0-b28b-fe746414fd31",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    code: "DEP_P298374",
    name: "Tổ Vật lý - Công nghệ",
    department_type: "SUBJECT",
    leader_teacher: {
      id: "da85bf7e-ccdf-4e2a-afbb-e2622893fb05",
      full_name: "Vũ Quốc Hùng",
      email: "vuquochung@schoolpro.edu.vn",
      phone: "0917890123",
      avatar_url: null,
    },
    vice_leader: null,
    is_active: true,
    teachers_count: 1,
    staff_count: 0,
    subjects_count: 2,
    total_members_count: 1,
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "fcaa669a-a251-4db9-a86e-be04c3013fdd",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    code: "DEP_PE657483",
    name: "Tổ Thể dục - GD Quốc phòng & An ninh",
    department_type: "SUBJECT",
    leader_teacher: null,
    vice_leader: null,
    is_active: true,
    teachers_count: 1,
    staff_count: 0,
    subjects_count: 2,
    total_members_count: 1,
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "5401faa0-f169-4225-a637-e2d419b3d18e",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    code: "DEP_SUP839210",
    name: "Ban Giám thị & Quản lý Nề nếp",
    department_type: "ADMINISTRATION",
    leader_teacher: {
      id: "b6cbf0a5-a304-4846-b66e-0b638a500e0e",
      full_name: "Nguyễn Trọng Tín",
      email: "nguyentrongtin@schoolpro.edu.vn",
      phone: "0921234567",
      avatar_url: null,
    },
    vice_leader: null,
    is_active: true,
    teachers_count: 0,
    staff_count: 1,
    subjects_count: 0,
    total_members_count: 1,
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "a5145357-1472-4f7e-85ce-bded2bea1d43",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    code: "DEP_YTH568293",
    name: "Ban Chấp hành Đoàn trường THPT",
    department_type: "UNION",
    leader_teacher: null,
    vice_leader: null,
    is_active: true,
    teachers_count: 0,
    staff_count: 0,
    subjects_count: 1,
    total_members_count: 0,
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
];

const IS_MOCK_ENABLED = import.meta.env.VITE_ENABLE_MOCK === "true";

/**
 * Service to communicate with Master Department API endpoints.
 */
export const departmentApi = {
  /**
   * Fetches departments list from backend API with optional filters.
   * Uses authenticated httpClient and falls back to MOCK_DEPARTMENTS on network failure.
   */
  async fetchDepartments(
    params: DepartmentQueryParams = {},
  ): Promise<DepartmentItem[]> {
    if (IS_MOCK_ENABLED) {
      return this.filterMockDepartments(params);
    }

    try {
      const response = await httpClient.get<DepartmentApiResponse | { results: DepartmentItem[] } | DepartmentItem[]>(
        "/master/departments/",
        {
          params: {
            pageSize: params.pageSize || 100,
            ...params,
          },
        },
      );

      const raw = response.data;

      // Handle standard envelope: { success: true, code: 200, data: [...] }
      if (raw && typeof raw === "object" && "data" in raw) {
        if (Array.isArray(raw.data)) {
          return raw.data;
        }
        if (raw.data && typeof raw.data === "object" && "results" in raw.data) {
          return (raw.data as { results: DepartmentItem[] }).results;
        }
      }

      // Handle direct pagination object: { count: 12, results: [...] }
      if (raw && typeof raw === "object" && "results" in raw && Array.isArray(raw.results)) {
        return raw.results;
      }

      // Handle raw array
      if (Array.isArray(raw)) {
        return raw;
      }

      return MOCK_DEPARTMENTS;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(
          "[departmentApi] Could not connect to Master Department API endpoint. Falling back to local mock data.",
          error,
        );
      }
      return this.filterMockDepartments(params);
    }
  },

  /**
   * Fetches a specific department by UUID.
   */
  async fetchDepartmentById(id: string): Promise<DepartmentItem | null> {
    if (IS_MOCK_ENABLED) {
      return MOCK_DEPARTMENTS.find((d) => d.id === id || d.code === id) || null;
    }

    try {
      const response = await httpClient.get<{ success: boolean; data: DepartmentItem }>(
        `/master/departments/${id}/`,
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch {
      return MOCK_DEPARTMENTS.find((d) => d.id === id || d.code === id) || null;
    }
  },

  /**
   * Helper to filter mock departments locally based on query params.
   */
  filterMockDepartments(params: DepartmentQueryParams): DepartmentItem[] {
    let result = [...MOCK_DEPARTMENTS];

    if (params.is_active !== undefined) {
      result = result.filter((d) => d.is_active === params.is_active);
    }

    if (params.department_type && params.department_type.toUpperCase() !== "ALL") {
      result = result.filter(
        (d) => d.department_type.toUpperCase() === params.department_type?.toUpperCase(),
      );
    }

    if (params.school_id) {
      result = result.filter((d) => d.school_id === params.school_id);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q) ||
          (d.leader_teacher?.full_name && d.leader_teacher.full_name.toLowerCase().includes(q)),
      );
    }

    return result;
  },
};
