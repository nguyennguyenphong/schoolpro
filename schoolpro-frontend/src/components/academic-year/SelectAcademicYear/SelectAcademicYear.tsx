import { useMemo } from "react";
import { Select } from "@/components/ui/Select";
import type {
  SelectAcademicYearProps,
  AcademicYearItem,
} from "@/components/academic-year/SelectAcademicYear/types";
import { useAcademicYear } from "@/components/academic-year/SelectAcademicYear/hooks/useAcademicYear";

/**
 * Helper to match academic year by UUID, code (e.g. AY_20262027), or exact name.
 */
const findAcademicYearByValueOrCode = (
  val: unknown,
  academicYearList: AcademicYearItem[],
): AcademicYearItem | undefined => {
  if (!val || typeof val !== "string") return undefined;
  const lower = val.toLowerCase().trim();
  const upper = val.toUpperCase().trim();

  // 1. Direct ID match
  const matchId = academicYearList.find(
    (ay) => ay.id === val || ay.id.toLowerCase() === lower,
  );
  if (matchId) return matchId;

  // 2. Direct Code match (e.g. AY_20262027)
  const matchCode = academicYearList.find(
    (ay) => ay.code === val || ay.code.toUpperCase() === upper,
  );
  if (matchCode) return matchCode;

  // 3. Exact Name match
  const matchName = academicYearList.find(
    (ay) => ay.name.toLowerCase().trim() === lower,
  );
  if (matchName) return matchName;

  return undefined;
};

/**
 * Standard AcademicYear Select component built on top of Ant Design Select.
 * Supports filtering by school, current flag, locked status, and custom data override.
 */
export const SelectAcademicYear = ({
  filterCurrentOnly = false,
  excludeLocked = false,
  schoolId,
  customAcademicYears,
  showCodePrefix = false,
  includeAllOption = true,
  allOptionLabel = "Tất cả năm học",
  allOptionValue = "all",
  placeholder = "Chọn năm học",
  allowClear = true,
  showSearch = true,
  optionFilterProp = "label",
  disabled = false,
  value,
  onChange,
  ...props
}: SelectAcademicYearProps) => {
  const { academicYears, isLoading } = useAcademicYear({
    filterCurrentOnly,
    excludeLocked,
    schoolId,
    initialAcademicYears: customAcademicYears,
    enabled: !customAcademicYears || customAcademicYears.length === 0,
  });

  // Resolve incoming value: if value is "all", academic year code, or name, resolve to option value
  const resolvedValue = useMemo(() => {
    if (
      value === allOptionValue ||
      (typeof value === "string" && value.toLowerCase().trim() === "all")
    ) {
      return allOptionValue;
    }
    if (value !== undefined && value !== null && value !== "") {
      const matched = findAcademicYearByValueOrCode(value, academicYears);
      if (matched) {
        return matched.id;
      }
      return value;
    }
    return value;
  }, [value, academicYears, allOptionValue]);

  const shouldIncludeAllOption =
    includeAllOption || resolvedValue === allOptionValue;

  // Map academic years to standard Ant Design select options
  const options = useMemo(() => {
    const yearOptions = academicYears.map((ay) => {
      const displayLabel = showCodePrefix ? `[${ay.code}] ${ay.name}` : ay.name;

      return {
        label: displayLabel,
        value: ay.id,
        key: ay.id,
        title: ay.name,
        academicYear: ay,
      };
    });

    if (shouldIncludeAllOption) {
      return [
        {
          label: allOptionLabel,
          value: allOptionValue,
          key: allOptionValue,
          title: allOptionLabel,
        },
        ...yearOptions,
      ];
    }

    return yearOptions;
  }, [
    academicYears,
    showCodePrefix,
    shouldIncludeAllOption,
    allOptionLabel,
    allOptionValue,
  ]);

  const handleChange: SelectAcademicYearProps["onChange"] = (val, option) => {
    if (!onChange) return;
    if (val === undefined && shouldIncludeAllOption && value !== undefined) {
      onChange(allOptionValue, {
        label: allOptionLabel,
        value: allOptionValue,
      });
      return;
    }
    onChange(val, option);
  };

  return (
    <Select
      placeholder={placeholder}
      allowClear={allowClear}
      showSearch={
        showSearch
          ? {
              filterOption: (input, option) =>
                String(option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase()),
            }
          : false
      }
      optionFilterProp={optionFilterProp}
      disabled={disabled || isLoading}
      loading={isLoading}
      options={options}
      value={resolvedValue}
      onChange={handleChange}
      {...props}
    />
  );
};

SelectAcademicYear.displayName = "SelectAcademicYear";
