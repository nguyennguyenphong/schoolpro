import { httpClient } from "@/shared/api/httpClient";
import type {
  SemesterItem,
  SemesterApiResponse,
  SemesterQueryParams,
} from "@/components/semester/SelectSemester/types";

/**
 * Standard enterprise mock data matching PostgreSQL backend seeds 100%.
 */
export const MOCK_SEMESTERS: SemesterItem[] = [
  {
    id: "b1c2d3e4-2026-4027-8001-000000000001",
    academic_year_id: "a1b2c3d4-2026-4027-8001-000000002026",
    academic_year_name: "Năm học 2026 - 2027",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    code: "SEM_20262027_1",
    name: "Học kỳ 1 (2026 - 2027)",
    order_no: 1,
    weeks_count: 18,
    start_date: "2026-09-05",
    end_date: "2027-01-15",
    gradebook_lock_date: "2027-01-20",
    is_current: true,
    is_locked: false,
    locked_at: null,
    locked_by: null,
    created_at: "2026-09-01T08:00:00.000000+07:00",
  },
  {
    id: "b1c2d3e4-2026-4027-8002-000000000002",
    academic_year_id: "a1b2c3d4-2026-4027-8001-000000002026",
    academic_year_name: "Năm học 2026 - 2027",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    code: "SEM_20262027_2",
    name: "Học kỳ 2 (2026 - 2027)",
    order_no: 2,
    weeks_count: 18,
    start_date: "2027-01-16",
    end_date: "2027-05-31",
    gradebook_lock_date: "2027-06-05",
    is_current: false,
    is_locked: false,
    locked_at: null,
    locked_by: null,
    created_at: "2026-09-01T08:00:00.000000+07:00",
  },
  {
    id: "b1c2d3e4-2025-4026-8001-000000000001",
    academic_year_id: "a1b2c3d4-2025-4026-8001-000000002025",
    academic_year_name: "Năm học 2025 - 2026",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    code: "SEM_20252026_1",
    name: "Học kỳ 1 (2025 - 2026)",
    order_no: 1,
    weeks_count: 18,
    start_date: "2025-09-05",
    end_date: "2026-01-15",
    gradebook_lock_date: "2026-01-20",
    is_current: false,
    is_locked: true,
    locked_at: "2026-01-20T17:00:00.000000+07:00",
    locked_by: null,
    created_at: "2025-09-01T08:00:00.000000+07:00",
  },
  {
    id: "b1c2d3e4-2025-4026-8002-000000000002",
    academic_year_id: "a1b2c3d4-2025-4026-8001-000000002025",
    academic_year_name: "Năm học 2025 - 2026",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    code: "SEM_20252026_2",
    name: "Học kỳ 2 (2025 - 2026)",
    order_no: 2,
    weeks_count: 18,
    start_date: "2026-01-16",
    end_date: "2026-05-31",
    gradebook_lock_date: "2026-06-05",
    is_current: false,
    is_locked: true,
    locked_at: "2026-06-05T17:00:00.000000+07:00",
    locked_by: null,
    created_at: "2025-09-01T08:00:00.000000+07:00",
  },
];

const IS_MOCK_ENABLED = import.meta.env.VITE_ENABLE_MOCK === "true";

/**
 * Service to communicate with Master Semester API endpoints.
 */
export const semesterApi = {
  /**
   * Fetches semesters list from backend API with optional filters.
   * Uses authenticated httpClient and falls back to MOCK_SEMESTERS on network failure.
   */
  async fetchSemesters(
    params: SemesterQueryParams = {},
  ): Promise<SemesterItem[]> {
    if (IS_MOCK_ENABLED) {
      return this.filterMockSemesters(params);
    }

    try {
      const response = await httpClient.get<
        SemesterApiResponse | { results: SemesterItem[] } | SemesterItem[]
      >("/master/semesters/", {
        params: {
          pageSize: params.pageSize || 100,
          ...params,
        },
      });

      const raw = response.data;

      // Handle standard envelope: { success: true, code: 200, data: [...] }
      if (raw && typeof raw === "object" && "data" in raw) {
        if (Array.isArray(raw.data)) {
          return raw.data;
        }
        if (
          raw.data &&
          typeof raw.data === "object" &&
          "results" in raw.data
        ) {
          return (raw.data as { results: SemesterItem[] }).results;
        }
      }

      // Handle direct pagination object: { count: 4, results: [...] }
      if (
        raw &&
        typeof raw === "object" &&
        "results" in raw &&
        Array.isArray(raw.results)
      ) {
        return raw.results;
      }

      // Handle raw array
      if (Array.isArray(raw)) {
        return raw;
      }

      return MOCK_SEMESTERS;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(
          "[semesterApi] Could not connect to Master Semester API endpoint. Falling back to local mock data.",
          error,
        );
      }
      return this.filterMockSemesters(params);
    }
  },

  /**
   * Fetches a specific semester by UUID or code.
   */
  async fetchSemesterById(id: string): Promise<SemesterItem | null> {
    if (IS_MOCK_ENABLED) {
      return (
        MOCK_SEMESTERS.find((sem) => sem.id === id || sem.code === id) || null
      );
    }

    try {
      const response = await httpClient.get<{
        success: boolean;
        data: SemesterItem;
      }>(`/master/semesters/${id}/`);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch {
      return (
        MOCK_SEMESTERS.find((sem) => sem.id === id || sem.code === id) || null
      );
    }
  },

  /**
   * Helper to filter mock semesters locally based on query params.
   */
  filterMockSemesters(params: SemesterQueryParams): SemesterItem[] {
    let result = [...MOCK_SEMESTERS];

    if (params.academic_year_id) {
      result = result.filter(
        (sem) => sem.academic_year_id === params.academic_year_id,
      );
    }

    if (params.school_id) {
      result = result.filter((sem) => sem.school_id === params.school_id);
    }

    if (params.order_no !== undefined) {
      result = result.filter((sem) => sem.order_no === params.order_no);
    }

    if (params.is_current !== undefined) {
      result = result.filter((sem) => sem.is_current === params.is_current);
    }

    if (params.is_locked !== undefined) {
      result = result.filter(
        (sem) => Boolean(sem.is_locked) === params.is_locked,
      );
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (sem) =>
          sem.name.toLowerCase().includes(q) ||
          sem.code.toLowerCase().includes(q) ||
          Boolean(
            sem.academic_year_name &&
              sem.academic_year_name.toLowerCase().includes(q),
          ),
      );
    }

    return result;
  },
};
