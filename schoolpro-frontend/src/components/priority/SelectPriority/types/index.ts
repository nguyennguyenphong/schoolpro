import type { SelectProps } from "@/components/ui/Select";

/**
 * Standard priority levels used across the system.
 */
export type PriorityLevel =
  | "all"
  | "urgent"
  | "high"
  | "normal"
  | "low"
  | (string & {});

/**
 * Priority item domain entity.
 */
export interface PriorityItem {
  id: string;
  code: string;
  name: string;
  level: number;
  color?: string;
  badgeColor?: string;
}

/**
 * Props for SelectPriority component.
 */
export interface SelectPriorityProps<T extends string = PriorityLevel>
  extends Omit<SelectProps, "options" | "value" | "onChange"> {
  /**
   * Currently selected priority value.
   */
  value?: T | null;

  /**
   * Callback fired when selection changes.
   */
  onChange?: (value: T, option?: unknown) => void;

  /**
   * Whether to prepend an "All" option (e.g. for filter bars).
   * @default true
   */
  includeAllOption?: boolean;

  /**
   * Label for the "All" option.
   * @default "Tất cả mức độ"
   */
  allOptionLabel?: string;

  /**
   * Value for the "All" option.
   * @default "all"
   */
  allOptionValue?: T;

  /**
   * Override default priorities with custom items.
   */
  customPriorities?: PriorityItem[];

  /**
   * Whether to display color badge dot in the select options.
   * @default false
   */
  showBadgeDot?: boolean;
}
