import { Select } from "@/components/ui/Select";
import type { SelectSortProps } from "@/components/sort/SelectSort/types";
import { useSortOptions } from "@/components/sort/SelectSort/hooks/useSortOptions";

/**
 * Standard SelectSort component for ordering data lists.
 * Supports custom options and predefined presets (announcements, general, alphabetical).
 */
export const SelectSort = <T extends string = string>({
  value,
  onChange,
  options,
  preset = "announcements",
  placeholder = "Sắp xếp theo",
  allowClear = false,
  disabled = false,
  className,
  ...props
}: SelectSortProps<T>) => {
  const { options: sortOptions } = useSortOptions({
    options,
    preset,
  });

  return (
    <Select
      placeholder={placeholder}
      allowClear={allowClear}
      disabled={disabled}
      options={sortOptions}
      value={value}
      onChange={onChange}
      className={className}
      {...props}
    />
  );
};

SelectSort.displayName = "SelectSort";
