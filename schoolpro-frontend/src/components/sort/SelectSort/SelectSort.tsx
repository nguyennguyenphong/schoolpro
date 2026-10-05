import { useTranslation } from "react-i18next";
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
  placeholder,
  allowClear = false,
  disabled = false,
  className,
  ...props
}: SelectSortProps<T>) => {
  const { t } = useTranslation(["input"]);
  const effectivePlaceholder =
    placeholder ?? t("input:placeholder.sort");

  const { options: sortOptions } = useSortOptions({
    options,
    preset,
  });

  return (
    <Select
      placeholder={effectivePlaceholder}
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
