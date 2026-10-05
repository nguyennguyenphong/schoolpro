import { Select } from "@/components/ui/Select";
import type {
  PriorityLevel,
  SelectPriorityProps,
} from "@/components/priority/SelectPriority/types";
import { usePriority } from "@/components/priority/SelectPriority/hooks/usePriority";

/**
 * Standard SelectPriority component for filtering and choosing priority levels.
 * Built with full enterprise standards and accessible design.
 */
export const SelectPriority = <T extends string = PriorityLevel>({
  value,
  onChange,
  includeAllOption = true,
  allOptionLabel = "Tất cả mức độ",
  allOptionValue = "all" as T,
  customPriorities,
  showBadgeDot: _showBadgeDot = false,
  placeholder = "Chọn mức độ",
  allowClear = false,
  disabled = false,
  className,
  ...props
}: SelectPriorityProps<T>) => {
  const { options, isLoading } = usePriority({
    initialPriorities: customPriorities,
    includeAllOption,
    allOptionLabel,
    allOptionValue,
  });

  return (
    <Select
      placeholder={placeholder}
      allowClear={allowClear}
      disabled={disabled || isLoading}
      loading={isLoading}
      options={options}
      value={value}
      onChange={onChange}
      className={className}
      {...props}
    />
  );
};

SelectPriority.displayName = "SelectPriority";
