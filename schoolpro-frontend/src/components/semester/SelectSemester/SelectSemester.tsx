import { useMemo } from "react";
import { Select } from "@/components/ui/Select";
import type {
  SelectSemesterProps,
  SemesterItem,
} from "@/components/semester/SelectSemester/types";
import { useSemester } from "@/components/semester/SelectSemester/hooks/useSemester";

/**
 * Helper to match semester by UUID, code (e.g. SEM_20262027_1), or exact name.
 */
const findSemesterByValueOrCode = (
  val: unknown,
  semesterList: SemesterItem[],
): SemesterItem | undefined => {
  if (!val || typeof val !== "string") return undefined;
  const lower = val.toLowerCase().trim();
  const upper = val.toUpperCase().trim();

  // 1. Direct ID match
  const matchId = semesterList.find(
    (sem) => sem.id === val || sem.id.toLowerCase() === lower,
  );
  if (matchId) return matchId;

  // 2. Direct Code match (e.g. SEM_20262027_1)
  const matchCode = semesterList.find(
    (sem) => sem.code === val || sem.code.toUpperCase() === upper,
  );
  if (matchCode) return matchCode;

  // 3. Exact Name match
  const matchName = semesterList.find(
    (sem) => sem.name.toLowerCase().trim() === lower,
  );
  if (matchName) return matchName;

  return undefined;
};

/**
 * Standard Semester Select component built on top of Ant Design Select.
 * Supports filtering by academic year, school, current flag, locked status, and custom data override.
 */
export const SelectSemester = ({
  academicYearId,
  schoolId,
  filterCurrentOnly = false,
  excludeLocked = false,
  customSemesters,
  showCodePrefix = false,
  includeAllOption = true,
  allOptionLabel = "Tất cả học kỳ",
  allOptionValue = "all",
  placeholder = "Chọn học kỳ",
  allowClear = true,
  showSearch = true,
  optionFilterProp = "label",
  disabled = false,
  value,
  onChange,
  ...props
}: SelectSemesterProps) => {
  const { semesters, isLoading } = useSemester({
    academicYearId,
    schoolId,
    filterCurrentOnly,
    excludeLocked,
    initialSemesters: customSemesters,
    enabled: !customSemesters || customSemesters.length === 0,
  });

  // Resolve incoming value: if value is "all", semester code, or name, resolve to option value
  const resolvedValue = useMemo(() => {
    if (
      value === allOptionValue ||
      (typeof value === "string" && value.toLowerCase().trim() === "all")
    ) {
      return allOptionValue;
    }
    if (value !== undefined && value !== null && value !== "") {
      const matched = findSemesterByValueOrCode(value, semesters);
      if (matched) {
        return matched.id;
      }
      return value;
    }
    return value;
  }, [value, semesters, allOptionValue]);

  const shouldIncludeAllOption =
    includeAllOption || resolvedValue === allOptionValue;

  // Map semesters to standard Ant Design select options
  const options = useMemo(() => {
    const semesterOptions = semesters.map((sem) => {
      const displayLabel = showCodePrefix
        ? `[${sem.code}] ${sem.name}`
        : sem.name;

      return {
        label: displayLabel,
        value: sem.id,
        key: sem.id,
        title: sem.name,
        semester: sem,
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
        ...semesterOptions,
      ];
    }

    return semesterOptions;
  }, [
    semesters,
    showCodePrefix,
    shouldIncludeAllOption,
    allOptionLabel,
    allOptionValue,
  ]);

  const handleChange: SelectSemesterProps["onChange"] = (val, option) => {
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

SelectSemester.displayName = "SelectSemester";
