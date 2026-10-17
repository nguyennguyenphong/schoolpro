import { httpClient } from "@/shared/api/httpClient";
import type {
  SubjectItem,
  SubjectApiResponse,
  SubjectQueryParams,
} from "@/components/subjects/SelectSubject/types";

/**
 * Standard enterprise mock data matching PostgreSQL backend seeds 100% (Chương trình Giáo dục phổ thông 2018).
 */
export const MOCK_SUBJECTS: SubjectItem[] = [
  {
    id: "1a4d7b21-8c92-4e11-9a10-2b3c4d5e6f01",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    department_id: "ecf6a9a8-cd10-4b32-9287-cd6f394c1571",
    department_name: "Tổ Toán - Tin học",
    code: "SUB_MATH101",
    name: "Toán",
    short_name: "Toán",
    grade_level: null,
    evaluation_type: "SCORE",
    periods_per_year: 105,
    is_compulsory: true,
    color_code: "#2563EB",
    icon: "calculator",
    order_no: 1,
    is_active: true,
    metadata: {
      curriculum_type: "COMPULSORY",
      subject_group: "MATHEMATICS",
    },
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "2b5e8c32-9d03-4f22-ab21-3c4d5e6f7a02",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    department_id: "e95ff85f-ecbe-4286-ab55-95ffeed75e07",
    department_name: "Tổ Ngữ văn",
    code: "SUB_LIT102",
    name: "Ngữ văn",
    short_name: "Văn",
    grade_level: null,
    evaluation_type: "SCORE",
    periods_per_year: 105,
    is_compulsory: true,
    color_code: "#DC2626",
    icon: "book-open",
    order_no: 2,
    is_active: true,
    metadata: {
      curriculum_type: "COMPULSORY",
      subject_group: "LANGUAGE",
    },
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "3c6f9d43-ae14-4033-bc32-4d5e6f7a8b03",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    department_id: "8d0001fd-3eed-40b3-a861-e3b48ea2be0b",
    department_name: "Tổ Ngoại ngữ (Tiếng Anh)",
    code: "SUB_ENG103",
    name: "Ngoại ngữ 1",
    short_name: "NN1",
    grade_level: null,
    evaluation_type: "SCORE",
    periods_per_year: 105,
    is_compulsory: true,
    color_code: "#059669",
    icon: "globe",
    order_no: 3,
    is_active: true,
    metadata: {
      curriculum_type: "COMPULSORY",
      subject_group: "FOREIGN_LANGUAGE",
      language_code: "EN",
      language_name: "Tiếng Anh",
    },
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "4d70ae54-bf25-4144-cd43-5e6f7a8b9c04",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    department_id: "d1d7e2cf-e0f8-4bda-a214-bebc90440592",
    department_name: "Tổ Lịch sử - Địa lý - GDKT&PL",
    code: "SUB_HIST104",
    name: "Lịch sử",
    short_name: "Sử",
    grade_level: null,
    evaluation_type: "SCORE",
    periods_per_year: 52,
    is_compulsory: true,
    color_code: "#CA8A04",
    icon: "landmark",
    order_no: 4,
    is_active: true,
    metadata: {
      curriculum_type: "COMPULSORY",
      subject_group: "SOCIAL_SCIENCES",
    },
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "5e81bf65-c036-4255-de54-6f7a8b9c0d05",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    department_id: "fcaa669a-a251-4db9-a86e-be04c3013fdd",
    department_name: "Tổ Thể dục - GD Quốc phòng & An ninh",
    code: "SUB_PE105",
    name: "Giáo dục thể chất",
    short_name: "GDTC",
    grade_level: null,
    evaluation_type: "COMMENT",
    periods_per_year: 70,
    is_compulsory: true,
    color_code: "#E11D48",
    icon: "activity",
    order_no: 5,
    is_active: true,
    metadata: {
      curriculum_type: "COMPULSORY",
      subject_group: "PHYSICAL_EDUCATION",
    },
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "6f92c076-d147-4366-ef65-7a8b9c0d1e06",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    department_id: "fcaa669a-a251-4db9-a86e-be04c3013fdd",
    department_name: "Tổ Thể dục - GD Quốc phòng & An ninh",
    code: "SUB_DEF106",
    name: "Giáo dục quốc phòng và an ninh",
    short_name: "GDQP-AN",
    grade_level: null,
    evaluation_type: "COMMENT",
    periods_per_year: 35,
    is_compulsory: true,
    color_code: "#15803D",
    icon: "shield",
    order_no: 6,
    is_active: true,
    metadata: {
      curriculum_type: "COMPULSORY",
      subject_group: "NATIONAL_DEFENSE",
    },
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "7a03d187-e258-4477-f076-8b9c0d1e2f07",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    department_id: "a5145357-1472-4f7e-85ce-bded2bea1d43",
    department_name: "Ban Chấp hành Đoàn trường Trung học phổ thông",
    code: "SUB_EXP107",
    name: "Hoạt động trải nghiệm, hướng nghiệp",
    short_name: "HĐTN-HN",
    grade_level: null,
    evaluation_type: "COMMENT",
    periods_per_year: 105,
    is_compulsory: true,
    color_code: "#9333EA",
    icon: "compass",
    order_no: 7,
    is_active: true,
    metadata: {
      curriculum_type: "EDUCATIONAL_ACTIVITY",
      subject_group: "EXPERIENCE_CAREER",
    },
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "8b14e298-f369-4588-a187-9c0d1e2f3a08",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    department_id: "d1d7e2cf-e0f8-4bda-a214-bebc90440592",
    department_name: "Tổ Lịch sử - Địa lý - GDKT&PL",
    code: "SUB_GEO108",
    name: "Địa lí",
    short_name: "Địa",
    grade_level: null,
    evaluation_type: "SCORE",
    periods_per_year: 70,
    is_compulsory: false,
    color_code: "#0284C7",
    icon: "map",
    order_no: 8,
    is_active: true,
    metadata: {
      curriculum_type: "ELECTIVE",
      subject_group: "SOCIAL_SCIENCES",
    },
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "9c25f309-047a-4699-b298-0d1e2f3a4b09",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    department_id: "d1d7e2cf-e0f8-4bda-a214-bebc90440592",
    department_name: "Tổ Lịch sử - Địa lý - GDKT&PL",
    code: "SUB_ECON109",
    name: "Giáo dục kinh tế và pháp luật",
    short_name: "GDKT&PL",
    grade_level: null,
    evaluation_type: "SCORE",
    periods_per_year: 70,
    is_compulsory: false,
    color_code: "#4F46E5",
    icon: "scale",
    order_no: 9,
    is_active: true,
    metadata: {
      curriculum_type: "ELECTIVE",
      subject_group: "ECONOMICS_LAW",
    },
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "0d36041a-158b-47aa-c309-1e2f3a4b5c10",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    department_id: "fffc5c55-3003-4df0-b28b-fe746414fd31",
    department_name: "Tổ Vật lý - Công nghệ",
    code: "SUB_PHYS110",
    name: "Vật lí",
    short_name: "Lý",
    grade_level: null,
    evaluation_type: "SCORE",
    periods_per_year: 70,
    is_compulsory: false,
    color_code: "#7C3AED",
    icon: "atom",
    order_no: 10,
    is_active: true,
    metadata: {
      curriculum_type: "ELECTIVE",
      subject_group: "NATURAL_SCIENCES",
    },
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "1e47152b-269c-48bb-d41a-2f3a4b5c6d11",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    department_id: "710d4b60-71f8-480e-adfa-b6e2a1c36fe9",
    department_name: "Tổ Hóa học - Sinh học",
    code: "SUB_CHEM111",
    name: "Hóa học",
    short_name: "Hóa",
    grade_level: null,
    evaluation_type: "SCORE",
    periods_per_year: 70,
    is_compulsory: false,
    color_code: "#EA580C",
    icon: "flask",
    order_no: 11,
    is_active: true,
    metadata: {
      curriculum_type: "ELECTIVE",
      subject_group: "NATURAL_SCIENCES",
    },
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "2f58263c-37ad-49cc-e52b-3a4b5c6d7e12",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    department_id: "710d4b60-71f8-480e-adfa-b6e2a1c36fe9",
    department_name: "Tổ Hóa học - Sinh học",
    code: "SUB_BIO112",
    name: "Sinh học",
    short_name: "Sinh",
    grade_level: null,
    evaluation_type: "SCORE",
    periods_per_year: 70,
    is_compulsory: false,
    color_code: "#16A34A",
    icon: "dna",
    order_no: 12,
    is_active: true,
    metadata: {
      curriculum_type: "ELECTIVE",
      subject_group: "NATURAL_SCIENCES",
    },
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "3a69374d-48be-4add-f63c-4b5c6d7e8f13",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    department_id: "fffc5c55-3003-4df0-b28b-fe746414fd31",
    department_name: "Tổ Vật lý - Công nghệ",
    code: "SUB_TECH113",
    name: "Công nghệ",
    short_name: "CN",
    grade_level: null,
    evaluation_type: "SCORE",
    periods_per_year: 70,
    is_compulsory: false,
    color_code: "#F97316",
    icon: "settings",
    order_no: 13,
    is_active: true,
    metadata: {
      curriculum_type: "ELECTIVE",
      subject_group: "TECHNOLOGY",
    },
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "4b7a485e-59cf-4bee-a74d-5c6d7e8f9a14",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    department_id: "ecf6a9a8-cd10-4b32-9287-cd6f394c1571",
    department_name: "Tổ Toán - Tin học",
    code: "SUB_INFO114",
    name: "Tin học",
    short_name: "Tin",
    grade_level: null,
    evaluation_type: "SCORE",
    periods_per_year: 70,
    is_compulsory: false,
    color_code: "#0891B2",
    icon: "cpu",
    order_no: 14,
    is_active: true,
    metadata: {
      curriculum_type: "ELECTIVE",
      subject_group: "INFORMATICS",
    },
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "5c8b596f-6ad0-4cff-b85e-6d7e8f9a0b15",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    department_id: null,
    department_name: "Tổ Nghệ thuật",
    code: "SUB_MUS115",
    name: "Âm nhạc",
    short_name: "Âm nhạc",
    grade_level: null,
    evaluation_type: "COMMENT",
    periods_per_year: 70,
    is_compulsory: false,
    color_code: "#DB2777",
    icon: "music",
    order_no: 15,
    is_active: true,
    metadata: {
      curriculum_type: "ELECTIVE",
      subject_group: "ARTS",
    },
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
  {
    id: "6d9c6070-7be1-4d00-c96f-7e8f9a0b1c16",
    school_id: "b5ebbdb9-a332-4fef-a64a-149c474159e6",
    school_name: "Trường Trung học Phổ thông Lê Quý Đôn",
    department_id: null,
    department_name: "Tổ Nghệ thuật",
    code: "SUB_ART116",
    name: "Mĩ thuật",
    short_name: "Mĩ thuật",
    grade_level: null,
    evaluation_type: "COMMENT",
    periods_per_year: 70,
    is_compulsory: false,
    color_code: "#C026D3",
    icon: "palette",
    order_no: 16,
    is_active: true,
    metadata: {
      curriculum_type: "ELECTIVE",
      subject_group: "ARTS",
    },
    created_at: "2026-10-03T17:52:48.979255+07:00",
  },
];

const IS_MOCK_ENABLED = import.meta.env.VITE_ENABLE_MOCK === "true";

/**
 * Service to communicate with Master Subject API endpoints.
 */
export const subjectApi = {
  /**
   * Fetches subjects list from backend API with optional filters.
   * Uses authenticated httpClient and falls back to MOCK_SUBJECTS on network failure.
   */
  async fetchSubjects(
    params: SubjectQueryParams = {},
  ): Promise<SubjectItem[]> {
    if (IS_MOCK_ENABLED) {
      return this.filterMockSubjects(params);
    }

    try {
      const response = await httpClient.get<
        SubjectApiResponse | { results: SubjectItem[] } | SubjectItem[]
      >("/master/subjects/", {
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
          return (raw.data as { results: SubjectItem[] }).results;
        }
      }

      // Handle direct pagination object: { count: 16, results: [...] }
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

      return MOCK_SUBJECTS;
    } catch (error) {
      if (import.meta.env.DEV && import.meta.env.MODE !== "test") {
        console.warn(
          "[subjectApi] Could not connect to Master Subject API endpoint. Falling back to local mock data.",
          error,
        );
      }
      return this.filterMockSubjects(params);
    }
  },

  /**
   * Fetches a specific subject by UUID or code.
   */
  async fetchSubjectById(id: string): Promise<SubjectItem | null> {
    if (IS_MOCK_ENABLED) {
      return MOCK_SUBJECTS.find((s) => s.id === id || s.code === id) || null;
    }

    try {
      const response = await httpClient.get<{
        success: boolean;
        data: SubjectItem;
      }>(`/master/subjects/${id}/`);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch {
      return MOCK_SUBJECTS.find((s) => s.id === id || s.code === id) || null;
    }
  },

  /**
   * Helper to filter mock subjects locally based on query params.
   */
  filterMockSubjects(params: SubjectQueryParams): SubjectItem[] {
    let result = [...MOCK_SUBJECTS];

    if (params.is_active !== undefined) {
      result = result.filter((s) => s.is_active === params.is_active);
    }

    if (params.department_id) {
      result = result.filter((s) => s.department_id === params.department_id);
    }

    if (params.grade_level !== undefined) {
      result = result.filter(
        (s) => s.grade_level === null || s.grade_level === params.grade_level,
      );
    }

    if (
      params.evaluation_type &&
      params.evaluation_type.toUpperCase() !== "ALL"
    ) {
      result = result.filter(
        (s) =>
          s.evaluation_type.toUpperCase() ===
          params.evaluation_type?.toUpperCase(),
      );
    }

    if (params.is_compulsory !== undefined) {
      result = result.filter((s) => s.is_compulsory === params.is_compulsory);
    }

    if (params.school_id) {
      result = result.filter((s) => s.school_id === params.school_id);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          Boolean(s.short_name && s.short_name.toLowerCase().includes(q)) ||
          Boolean(
            s.department_name && s.department_name.toLowerCase().includes(q),
          ),
      );
    }

    return result;
  },
};
