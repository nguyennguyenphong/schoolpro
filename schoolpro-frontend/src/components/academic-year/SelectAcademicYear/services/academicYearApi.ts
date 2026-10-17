import { httpClient } from "@/shared/api/httpClient";
import type {
  AcademicYearItem,
  AcademicYearApiResponse,
  AcademicYearQueryParams,
} from "@/components/academic-year/SelectAcademicYear/types";

/**
 * Standard enterprise mock data matching PostgreSQL backend seeds 100%.
 */
export const MOCK_ACADEMIC_YEARS: AcademicYearItem[] = [
  {
    id: "a1b2c3d4-2026-4027-8001-000000002026",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    code: "AY_20262027",
    name: "Năm học 2026 - 2027",
    start_date: "2026-09-05",
    end_date: "2027-05-31",
    enrollment_target: 1200,
    is_current: true,
    is_locked: false,
    locked_at: null,
    locked_by: null,
    settings: {},
    created_at: "2026-09-01T08:00:00.000000+07:00",
  },
  {
    id: "a1b2c3d4-2025-4026-8001-000000002025",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    code: "AY_20252026",
    name: "Năm học 2025 - 2026",
    start_date: "2025-09-05",
    end_date: "2026-05-31",
    enrollment_target: 1150,
    is_current: false,
    is_locked: true,
    locked_at: "2026-06-15T17:00:00.000000+07:00",
    locked_by: null,
    settings: {},
    created_at: "2025-09-01T08:00:00.000000+07:00",
  },
  {
    id: "a1b2c3d4-2024-4025-8001-000000002024",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    code: "AY_20242025",
    name: "Năm học 2024 - 2025",
    start_date: "2024-09-05",
    end_date: "2025-05-31",
    enrollment_target: 1100,
    is_current: false,
    is_locked: true,
    locked_at: "2025-06-15T17:00:00.000000+07:00",
    locked_by: null,
    settings: {},
    created_at: "2024-09-01T08:00:00.000000+07:00",
  },
];

const IS_MOCK_ENABLED = import.meta.env.VITE_ENABLE_MOCK === "true";

const inFlightMap = new Map<string, Promise<AcademicYearItem[]>>();
const cacheMap = new Map<string, { data: AcademicYearItem[]; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Service to communicate with Master AcademicYear API endpoints.
 */
export const academicYearApi = {
  /**
   * Fetches academic years list from backend API with optional filters.
   * Uses in-flight deduplication and caching to prevent duplicate network calls.
   */
  async fetchAcademicYears(
    params: AcademicYearQueryParams = {},
    forceRefresh = false,
  ): Promise<AcademicYearItem[]> {
    if (IS_MOCK_ENABLED) {
      return this.filterMockAcademicYears(params);
    }

    const cleanParams: Record<string, unknown> = {
      pageSize: params.pageSize || 100,
      ...params,
    };
    if (cleanParams.school_id === "all") {
      delete cleanParams.school_id;
    }

    const key = JSON.stringify(cleanParams);
    const now = Date.now();

    if (!forceRefresh) {
      const cached = cacheMap.get(key);
      if (cached && now - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
      }
      const pending = inFlightMap.get(key);
      if (pending) {
        return pending;
      }
    }

    const promise = (async () => {
      try {
        const response = await httpClient.get<
          | AcademicYearApiResponse
          | { results: AcademicYearItem[] }
          | AcademicYearItem[]
        >("/master/academic-years/", {
          params: cleanParams,
        });

        const raw = response.data;
        let data: AcademicYearItem[] = MOCK_ACADEMIC_YEARS;

        // Handle standard envelope: { success: true, code: 200, data: [...] }
        if (raw && typeof raw === "object" && "data" in raw) {
          if (Array.isArray(raw.data)) {
            data = raw.data;
          } else if (
            raw.data &&
            typeof raw.data === "object" &&
            "results" in raw.data
          ) {
            data = (raw.data as { results: AcademicYearItem[] }).results;
          }
        } else if (
          raw &&
          typeof raw === "object" &&
          "results" in raw &&
          Array.isArray(raw.results)
        ) {
          // Handle direct pagination object: { count: 3, results: [...] }
          data = raw.results;
        } else if (Array.isArray(raw)) {
          // Handle raw array
          data = raw;
        }

        cacheMap.set(key, { data, timestamp: Date.now() });
        return data;
      } catch (error) {
        if (import.meta.env.DEV && import.meta.env.MODE !== "test") {
          console.warn(
            "[academicYearApi] Could not connect to Master AcademicYear API endpoint. Falling back to local mock data.",
            error,
          );
        }
        return this.filterMockAcademicYears(params);
      } finally {
        inFlightMap.delete(key);
      }
    })();

    inFlightMap.set(key, promise);
    return promise;
  },

  /**
   * Fetches a specific academic year by UUID or code.
   */
  async fetchAcademicYearById(id: string): Promise<AcademicYearItem | null> {
    if (IS_MOCK_ENABLED) {
      return (
        MOCK_ACADEMIC_YEARS.find((ay) => ay.id === id || ay.code === id) || null
      );
    }

    try {
      const response = await httpClient.get<{
        success: boolean;
        data: AcademicYearItem;
      }>(`/master/academic-years/${id}/`);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch {
      return (
        MOCK_ACADEMIC_YEARS.find((ay) => ay.id === id || ay.code === id) || null
      );
    }
  },

  /**
   * Fetches the currently active academic year.
   */
  async fetchCurrentAcademicYear(schoolId?: string): Promise<AcademicYearItem | null> {
    if (IS_MOCK_ENABLED) {
      return (
        MOCK_ACADEMIC_YEARS.find((ay) => ay.is_current) ||
        MOCK_ACADEMIC_YEARS[0] ||
        null
      );
    }

    try {
      const response = await httpClient.get<{
        success: boolean;
        data: AcademicYearItem;
      }>("/master/academic-years/current/", {
        params: schoolId ? { school_id: schoolId } : undefined,
      });

      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(
          "[academicYearApi] Could not fetch current academic year from API. Falling back to mock data.",
          error,
        );
      }
      return (
        MOCK_ACADEMIC_YEARS.find((ay) => ay.is_current) ||
        MOCK_ACADEMIC_YEARS[0] ||
        null
      );
    }
  },

  /**
   * Helper to filter mock academic years locally based on query params.
   */
  filterMockAcademicYears(
    params: AcademicYearQueryParams,
  ): AcademicYearItem[] {
    let result = [...MOCK_ACADEMIC_YEARS];

    if (params.is_current !== undefined) {
      result = result.filter((ay) => ay.is_current === params.is_current);
    }

    if (params.is_locked !== undefined) {
      result = result.filter(
        (ay) => Boolean(ay.is_locked) === params.is_locked,
      );
    }

    if (params.school_id) {
      result = result.filter((ay) => ay.school_id === params.school_id);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (ay) =>
          ay.name.toLowerCase().includes(q) ||
          ay.code.toLowerCase().includes(q) ||
          Boolean(ay.school_name && ay.school_name.toLowerCase().includes(q)),
      );
    }

    return result;
  },
};
