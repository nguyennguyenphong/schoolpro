import { useMemo, useEffect, useRef } from "react";
import { Select } from "@/components/ui/Select";
import type {
  SelectAcademicYearProps,
  AcademicYearItem,
} from "@/components/academic-year/SelectAcademicYear/types";
import { useAcademicYear } from "@/components/academic-year/SelectAcademicYear/hooks/useAcademicYear";

/**
 * Helper to match academic year by UUID, code (e.g. AY_20262027), year span (e.g. 2026-2027), or exact name.
 */
const findAcademicYearByValueOrCode = (
  val: unknown,
  academicYearList: AcademicYearItem[],
): AcademicYearItem | undefined => {
  if (!val || typeof val !== "string") return undefined;
  const lower = val.toLowerCase().trim();
  const upper = val.toUpperCase().trim();
  const stripped = lower.replace(/\s*-\s*|\s+/g, "");

  // 1. Direct ID match
  const matchId = academicYearList.find(
    (ay) => ay.id === val || ay.id.toLowerCase() === lower,
  );
  if (matchId) return matchId;

  // 2. Direct Code match (e.g. AY_20262027 or 20262027)
  const matchCode = academicYearList.find(
    (ay) =>
      ay.code === val ||
      ay.code.toUpperCase() === upper ||
      (stripped.length >= 8 &&
        ay.code.toLowerCase().replace(/[^0-9]/g, "") ===
          stripped.replace(/[^0-9]/g, "")),
  );
  if (matchCode) return matchCode;

  // 3. Exact Name match or substring match for year spans (e.g. "2025-2026" inside "Năm học 2025 - 2026")
  const matchName = academicYearList.find((ay) => {
    const ayLower = ay.name.toLowerCase().trim();
    if (ayLower === lower) return true;
    const ayStripped = ayLower.replace(/\s*-\s*|\s+/g, "");
    return ayStripped.includes(stripped) || (stripped.length >= 8 && stripped.includes(ayStripped));
  });
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
  disabled = false,
  value,
  onChange,
  defaultToCurrent = false,
  ...props
}: SelectAcademicYearProps) => {
  const { academicYears, currentAcademicYear, isLoading } = useAcademicYear({
    filterCurrentOnly,
    excludeLocked,
    schoolId,
    initialAcademicYears: customAcademicYears,
    enabled: !customAcademicYears || customAcademicYears.length === 0,
  });

  const hasAutoSelectedRef = useRef(false);

  // Reset auto-select flag when value is cleared
  useEffect(() => {
    if (value === undefined || value === "") {
      hasAutoSelectedRef.current = false;
    }
  }, [value]);

  // Automatically select the active academic year if defaultToCurrent is enabled and value is unset
  useEffect(() => {
    if (
      defaultToCurrent &&
      (value === undefined || value === "") &&
      !hasAutoSelectedRef.current &&
      academicYears.length > 0 &&
      onChange
    ) {
      const targetYear = currentAcademicYear || academicYears[0];
      if (targetYear) {
        hasAutoSelectedRef.current = true;
        onChange(targetYear.id, {
          label: showCodePrefix ? `[${targetYear.code}] ${targetYear.name}` : targetYear.name,
          value: targetYear.id,
          key: targetYear.id,
          title: targetYear.name,
          academicYear: targetYear,
        });
      }
    }
  }, [defaultToCurrent, value, academicYears, currentAcademicYear, onChange, showCodePrefix]);

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
