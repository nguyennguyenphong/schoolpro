import type { SelectProps } from "@/components/ui/Select";

/**
 * Academic Year entity model matching the Master AcademicYear API schema.
 */
export interface AcademicYearItem {
  id: string;
  school_id: string;
  school_name?: string;
  code: string;
  name: string;
  start_date: string;
  end_date: string;
  enrollment_target?: number | null;
  is_current: boolean;
  is_locked?: boolean;
  locked_at?: string | null;
  locked_by?: string | null;
  settings?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

/**
 * Standard API response envelope for AcademicYear endpoints.
 */
export interface AcademicYearApiResponse {
  success: boolean;
  code: number;
  message: string;
  data:
    | AcademicYearItem[]
    | {
        count: number;
        next: string | null;
        previous: string | null;
        results: AcademicYearItem[];
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
 * Query parameters for fetching academic years.
 */
export interface AcademicYearQueryParams {
  school_id?: string;
  is_current?: boolean;
  is_locked?: boolean;
  search?: string;
  pageSize?: number;
}

/**
 * Props for SelectAcademicYear component extending standard SelectProps.
 */
export interface SelectAcademicYearProps
  extends Omit<SelectProps, "options" | "loading"> {
  /**
   * Filter only the current active academic year
   * @default false
   */
  filterCurrentOnly?: boolean;

  /**
   * Exclude locked academic years
   * @default false
   */
  excludeLocked?: boolean;

  /**
   * Filter academic years belonging to a specific school
   */
  schoolId?: string;

  /**
   * Optional manual academic years list to override remote fetch
   */
  customAcademicYears?: AcademicYearItem[];

  /**
   * Show academic year code prefix in select options
   * @default false
   */
  showCodePrefix?: boolean;

  /**
   * Include "All academic years" option (useful for filter bars)
   * @default false
   */
  includeAllOption?: boolean;

  /**
   * Label for the "All academic years" option
   * @default "Tất cả năm học"
   */
  allOptionLabel?: string;

  /**
   * Value for the "All academic years" option
   * @default "all"
   */
  allOptionValue?: string;

  /**
   * If true and value is undefined, automatically select the current active academic year once loaded
   * @default false
   */
  defaultToCurrent?: boolean;
}
