import type { SelectProps } from "@/components/ui/Select";

/**
 * Semester entity model matching the Master Semester API schema.
 */
export interface SemesterItem {
  id: string;
  academic_year_id: string;
  academic_year_name?: string;
  school_id?: string;
  school_name?: string;
  code: string;
  name: string;
  order_no: number;
  weeks_count?: number;
  start_date: string;
  end_date: string;
  gradebook_lock_date?: string | null;
  is_current: boolean;
  is_locked?: boolean;
  locked_at?: string | null;
  locked_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Standard API response envelope for Semester endpoints.
 */
export interface SemesterApiResponse {
  success: boolean;
  code: number;
  message: string;
  data:
    | SemesterItem[]
    | {
        count: number;
        next: string | null;
        previous: string | null;
        results: SemesterItem[];
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
 * Query parameters for fetching semesters.
 */
export interface SemesterQueryParams {
  academic_year_id?: string;
  school_id?: string;
  order_no?: number;
  is_current?: boolean;
  is_locked?: boolean;
  search?: string;
  pageSize?: number;
}

/**
 * Props for SelectSemester component extending standard SelectProps.
 */
export interface SelectSemesterProps
  extends Omit<SelectProps, "options" | "loading"> {
  /**
   * Filter semesters by academic year UUID
   */
  academicYearId?: string;

  /**
   * Filter semesters belonging to a specific school
   */
  schoolId?: string;

  /**
   * Filter only the current active semester
   * @default false
   */
  filterCurrentOnly?: boolean;

  /**
   * Exclude locked semesters
   * @default false
   */
  excludeLocked?: boolean;

  /**
   * Optional manual semesters list to override remote fetch
   */
  customSemesters?: SemesterItem[];

  /**
   * Show semester code prefix in select options
   * @default false
   */
  showCodePrefix?: boolean;

  /**
   * Include "All semesters" option (useful for filter bars)
   * @default false
   */
  includeAllOption?: boolean;

  /**
   * Label for the "All semesters" option
   * @default "Tất cả học kỳ"
   */
  allOptionLabel?: string;

  /**
   * Value for the "All semesters" option
   * @default "all"
   */
  allOptionValue?: string;

  /**
   * If true and value is undefined, automatically select the current active semester once loaded
   * @default false
   */
  defaultToCurrent?: boolean;
}
