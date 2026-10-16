import { useMemo, useEffect, useRef } from "react";
import { Select } from "@/components/ui/Select";
import type {
  SelectSemesterProps,
  SemesterItem,
} from "@/components/semester/SelectSemester/types";
import { useSemester } from "@/components/semester/SelectSemester/hooks/useSemester";

/**
 * Helper to match semester by UUID, code (e.g. SEM_20262027_1), short term (e.g. HK1, HK2), or exact name.
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

  // 3. Short term code match (e.g. "HK1" -> order_no: 1, "HK2" -> order_no: 2)
  if (
    upper === "HK1" ||
    lower === "hk1" ||
    lower === "1" ||
    lower === "hoc ky 1" ||
    lower === "học kỳ 1"
  ) {
    const matchHk1 = semesterList.find((sem) => sem.order_no === 1);
    if (matchHk1) return matchHk1;
  }
  if (
    upper === "HK2" ||
    lower === "hk2" ||
    lower === "2" ||
    lower === "hoc ky 2" ||
    lower === "học kỳ 2"
  ) {
    const matchHk2 = semesterList.find((sem) => sem.order_no === 2);
    if (matchHk2) return matchHk2;
  }

  // 4. Exact or substring Name match
  const matchName = semesterList.find((sem) => {
    const semLower = sem.name.toLowerCase().trim();
    return (
      semLower === lower ||
      semLower.includes(lower) ||
      lower.includes(semLower)
    );
  });
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
  disabled = false,
  value,
  onChange,
  defaultToCurrent = false,
  ...props
}: SelectSemesterProps) => {
  const { semesters, currentSemester, isLoading } = useSemester({
    academicYearId,
    schoolId,
    filterCurrentOnly,
    excludeLocked,
    initialSemesters: customSemesters,
    enabled: !customSemesters || customSemesters.length === 0,
  });

  const hasAutoSelectedRef = useRef(false);

  // Reset auto-select flag when academicYearId changes or value is cleared
  useEffect(() => {
    hasAutoSelectedRef.current = false;
  }, [academicYearId]);

  useEffect(() => {
    if (value === undefined || value === "") {
      hasAutoSelectedRef.current = false;
    }
  }, [value]);

  // Automatically select the active semester if defaultToCurrent is enabled and value is unset
  useEffect(() => {
    if (
      defaultToCurrent &&
      (value === undefined || value === "") &&
      !hasAutoSelectedRef.current &&
      semesters.length > 0 &&
      onChange
    ) {
      const targetSem = currentSemester || semesters[0];
      if (targetSem) {
        hasAutoSelectedRef.current = true;
        onChange(targetSem.id, {
          label: showCodePrefix
            ? `[${targetSem.code}] ${targetSem.name}`
            : targetSem.name,
          value: targetSem.id,
          key: targetSem.id,
          title: targetSem.name,
          semester: targetSem,
        });
      }
    }
  }, [
    defaultToCurrent,
    value,
    semesters,
    currentSemester,
    onChange,
    showCodePrefix,
  ]);

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
