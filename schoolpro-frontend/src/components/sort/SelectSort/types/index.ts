import type { SelectProps } from "@/components/ui/Select";

/**
 * Standard sort order.
 */
export type SortOrder = "asc" | "desc";

/**
 * Single sort option item.
 */
export interface SortOptionItem {
  value: string;
  label: string;
  field?: string;
  order?: SortOrder;
  icon?: string;
}

/**
 * Props for SelectSort component.
 */
export interface SelectSortProps<T extends string = string>
  extends Omit<SelectProps, "options" | "value" | "onChange"> {
  /**
   * Currently selected sort option value.
   */
  value?: T | null;

  /**
   * Callback fired when sort option changes.
   */
  onChange?: (value: T, option?: unknown) => void;

  /**
   * Custom sort options list. If omitted, standard default options will be used.
   */
  options?: SortOptionItem[];

  /**
   * Predefined sort options preset if options is not explicitly provided.
   * @default "announcements"
   */
  preset?: "announcements" | "general" | "alphabetical";

  /**
   * Placeholder text when nothing is selected.
   * @default "Sắp xếp"
   */
  placeholder?: string;
}
