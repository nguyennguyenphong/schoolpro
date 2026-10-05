import type { SelectProps } from "@/components/ui/Select";

/**
 * Leader or vice leader brief representation.
 */
export interface DepartmentLeader {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string | null;
}

/**
 * Department entity model matching the Master Department API schema.
 */
export interface DepartmentItem {
  id: string;
  school_id: string;
  school_name?: string;
  code: string;
  name: string;
  department_type: "SUBJECT" | "ADMINISTRATION" | "BOARD" | "UNION" | "OTHER" | string;
  leader_teacher?: DepartmentLeader | null;
  vice_leader?: DepartmentLeader | null;
  is_active: boolean;
  teachers_count?: number;
  staff_count?: number;
  subjects_count?: number;
  total_members_count?: number;
  created_at?: string;
}

/**
 * Standard API response envelope for Department endpoints.
 */
export interface DepartmentApiResponse {
  success: boolean;
  code: number;
  message: string;
  data:
    | DepartmentItem[]
    | {
        count: number;
        next: string | null;
        previous: string | null;
        results: DepartmentItem[];
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
 * Query parameters for fetching departments.
 */
export interface DepartmentQueryParams {
  school_id?: string;
  department_type?: string;
  is_active?: boolean;
  search?: string;
  pageSize?: number;
}

/**
 * Props for SelectDepartment component extending standard SelectProps.
 */
export interface SelectDepartmentProps
  extends Omit<SelectProps, "options" | "loading"> {
  /**
   * Filter only active departments
   * @default true
   */
  filterActiveOnly?: boolean;

  /**
   * Filter by department category/type (e.g. SUBJECT, ADMINISTRATION)
   */
  departmentType?: string;

  /**
   * Filter departments belonging to a specific school
   */
  schoolId?: string;

  /**
   * Optional manual departments list to override remote fetch
   */
  customDepartments?: DepartmentItem[];

  /**
   * Show department code badge or subtitle in select options
   * @default false
   */
  showCodePrefix?: boolean;

  /**
   * Include "All departments" option (useful for filter bars)
   * @default false
   */
  includeAllOption?: boolean;

  /**
   * Label for the "All departments" option
   * @default "Tất cả đơn vị"
   */
  allOptionLabel?: string;

  /**
   * Value for the "All departments" option
   * @default "all"
   */
  allOptionValue?: string;
}
