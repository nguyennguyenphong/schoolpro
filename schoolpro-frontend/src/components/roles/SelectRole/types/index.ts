import type { SelectProps } from "@/components/ui/Select";

/**
 * Role entity model matching the backend Core Role API schema.
 */
export interface RoleItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  badge_color?: string;
  icon?: string;
  is_system?: boolean;
  is_active?: boolean;
  user_count?: number;
  permission_count?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Standard API response wrapper for Role endpoints.
 */
export interface RoleApiResponse {
  success: boolean;
  code: number;
  message: string;
  data:
    | RoleItem[]
    | {
        count: number;
        next: string | null;
        previous: string | null;
        results: RoleItem[];
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
 * Query parameters for fetching roles.
 */
export interface RoleQueryParams {
  is_active?: boolean;
  is_system?: boolean;
  search?: string;
  paginate?: boolean;
}

/**
 * Props for SelectRole component extending standard SelectProps.
 */
export interface SelectRoleProps
  extends Omit<SelectProps, "options" | "loading"> {
  /**
   * Filter only active roles
   * @default true
   */
  filterActiveOnly?: boolean;

  /**
   * Optional manual roles list to override remote fetch
   */
  customRoles?: RoleItem[];

  /**
   * Automatically default to student role if no value or slug 'student' is passed
   * @default true
   */
  defaultToStudent?: boolean;
}
