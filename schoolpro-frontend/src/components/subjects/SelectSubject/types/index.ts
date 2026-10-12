import type { SelectProps } from "@/components/ui/Select";

/**
 * Subject entity model matching the Master Subject API schema (Giáo dục phổ thông 2018).
 */
export interface SubjectItem {
  id: string;
  school_id: string;
  school_name?: string;
  department_id?: string | null;
  department_name?: string | null;
  code: string;
  name: string;
  short_name?: string | null;
  grade_level?: number | null;
  evaluation_type: "SCORE" | "COMMENT" | "BOTH" | string;
  periods_per_year?: number | null;
  is_compulsory: boolean;
  color_code?: string | null;
  icon?: string | null;
  order_no?: number;
  is_active: boolean;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

/**
 * Standard API response envelope for Subject endpoints.
 */
export interface SubjectApiResponse {
  success: boolean;
  code: number;
  message: string;
  data:
    | SubjectItem[]
    | {
        count: number;
        next: string | null;
        previous: string | null;
        results: SubjectItem[];
      };
  meta?: {
    pagination?: {
      page: number;
      page_size: number;
      total_items: number;
      total_pages: number;
      has_next: boolean;
      has_previous: boolean;
    };
  };
}

/**
 * Query parameters for fetching subjects.
 */
export interface SubjectQueryParams {
  school_id?: string;
  department_id?: string;
  grade_level?: number;
  evaluation_type?: string;
  is_compulsory?: boolean;
  is_active?: boolean;
  search?: string;
  pageSize?: number;
}

/**
 * Props for SelectSubject component extending standard SelectProps.
 */
export interface SelectSubjectProps
  extends Omit<SelectProps, "options" | "loading"> {
  /**
   * Filter only active subjects
   * @default true
   */
  filterActiveOnly?: boolean;

  /**
   * Filter by department UUID
   */
  departmentId?: string;

  /**
   * Filter by grade level (e.g. 10, 11, 12)
   */
  gradeLevel?: number;

  /**
   * Filter by evaluation type (e.g. SCORE, COMMENT)
   */
  evaluationType?: string;

  /**
   * Filter by compulsory status
   */
  isCompulsory?: boolean;

  /**
   * Filter subjects belonging to a specific school
   */
  schoolId?: string;

  /**
   * Optional manual subjects list to override remote fetch
   */
  customSubjects?: SubjectItem[];

  /**
   * Show subject code badge or prefix in select options
   * @default false
   */
  showCodePrefix?: boolean;

  /**
   * Include "All subjects" option (useful for filter bars)
   * @default false
   */
  includeAllOption?: boolean;

  /**
   * Label for the "All subjects" option
   * @default "Tất cả môn học"
   */
  allOptionLabel?: string;

  /**
   * Value for the "All subjects" option
   * @default "all"
   */
  allOptionValue?: string;
}
