import { useTranslation } from "react-i18next";
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
  allOptionLabel,
  allOptionValue = "all" as T,
  customPriorities,
  showBadgeDot: _showBadgeDot = false,
  placeholder,
  allowClear = false,
  disabled = false,
  className,
  ...props
}: SelectPriorityProps<T>) => {
  const { t } = useTranslation(["input", "card"]);
  const effectiveAllOptionLabel =
    allOptionLabel ?? t("input:filter.allPriorities");
  const effectivePlaceholder =
    placeholder ?? t("input:placeholder.priority");

  const { options, isLoading } = usePriority({
    initialPriorities: customPriorities,
    includeAllOption,
    allOptionLabel: effectiveAllOptionLabel,
    allOptionValue,
  });

  return (
    <Select
      placeholder={effectivePlaceholder}
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
