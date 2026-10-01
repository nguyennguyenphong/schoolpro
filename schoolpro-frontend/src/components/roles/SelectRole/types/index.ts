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
 * Props for SelectRole component.
 */
export interface SelectRoleProps
  extends Omit<SelectProps<any>, "options" | "loading"> {
  /**
   * Field to use as value in onChange/value: "id" or "code"
   * @default "id"
   */
  valueField?: "id" | "code";

  /**
   * Filter only active roles
   * @default true
   */
  filterActiveOnly?: boolean;

  /**
   * Whether to display color badge or tag dot
   * @default true
   */
  showBadge?: boolean;

  /**
   * Whether to display role description in option subtitle
   * @default false
   */
  showDescription?: boolean;

  /**
   * Whether to display user count tag
   * @default false
   */
  showUserCount?: boolean;

  /**
   * Optional manual roles list to override remote fetch
   */
  customRoles?: RoleItem[];

  /**
   * Callback when selection changes, providing full role object(s)
   */
  onRoleChange?: (selected: RoleItem | RoleItem[] | null) => void;
}
