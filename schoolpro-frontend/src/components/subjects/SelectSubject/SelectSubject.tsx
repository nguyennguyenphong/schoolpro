import { useMemo } from "react";
import { Select } from "@/components/ui/Select";
import type {
  SelectSubjectProps,
  SubjectItem,
} from "@/components/subjects/SelectSubject/types";
import { useSubjects } from "@/components/subjects/SelectSubject/hooks/useSubjects";

/**
 * Helper to match subject by UUID, code (e.g. SUB_MATH101), short_name, or exact name.
 */
const findSubjectByValueOrCode = (
  val: unknown,
  subjectList: SubjectItem[],
): SubjectItem | undefined => {
  if (!val || typeof val !== "string") return undefined;
  const lower = val.toLowerCase().trim();
  const upper = val.toUpperCase().trim();

  // 1. Direct ID match
  const matchId = subjectList.find(
    (s) => s.id === val || s.id.toLowerCase() === lower,
  );
  if (matchId) return matchId;

  // 2. Direct Code match (e.g. SUB_MATH101)
  const matchCode = subjectList.find(
    (s) => s.code === val || s.code.toUpperCase() === upper,
  );
  if (matchCode) return matchCode;

  // 3. Exact Name or Short Name match
  const matchName = subjectList.find(
    (s) =>
      s.name.toLowerCase().trim() === lower ||
      (s.short_name && s.short_name.toLowerCase().trim() === lower),
  );
  if (matchName) return matchName;

  return undefined;
};

/**
 * Standard Subject Select component built on top of Ant Design Select.
 * Supports filtering by school, department, grade level, evaluation type, compulsory flag, and custom data override.
 */
export const SelectSubject = ({
  filterActiveOnly = true,
  departmentId,
  gradeLevel,
  evaluationType,
  isCompulsory,
  schoolId,
  customSubjects,
  showCodePrefix = false,
  includeAllOption = true,
  allOptionLabel = "Tất cả môn học",
  allOptionValue = "all",
  placeholder = "Chọn môn học",
  allowClear = true,
  showSearch = true,
  optionFilterProp = "label",
  disabled = false,
  value,
  onChange,
  ...props
}: SelectSubjectProps) => {
  const { subjects, isLoading } = useSubjects({
    filterActiveOnly,
    departmentId,
    gradeLevel,
    evaluationType,
    isCompulsory,
    schoolId,
    initialSubjects: customSubjects,
    enabled: !customSubjects || customSubjects.length === 0,
  });

  // Resolve incoming value: if value is "all", subject code, or name, resolve to option value
  const resolvedValue = useMemo(() => {
    if (
      value === allOptionValue ||
      (typeof value === "string" && value.toLowerCase().trim() === "all")
    ) {
      return allOptionValue;
    }
    if (value !== undefined && value !== null && value !== "") {
      const matched = findSubjectByValueOrCode(value, subjects);
      if (matched) {
        return matched.id;
      }
      return value;
    }
    return value;
  }, [value, subjects, allOptionValue]);

  const shouldIncludeAllOption =
    includeAllOption || resolvedValue === allOptionValue;

  // Map subjects to standard Ant Design select options
  const options = useMemo(() => {
    const subjectOptions = subjects.map((subj) => {
      const displayLabel = showCodePrefix
        ? `[${subj.code}] ${subj.name}`
        : subj.name;

      return {
        label: displayLabel,
        value: subj.id,
        key: subj.id,
        title: subj.name,
        subject: subj,
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
        ...subjectOptions,
      ];
    }

    return subjectOptions;
  }, [
    subjects,
    showCodePrefix,
    shouldIncludeAllOption,
    allOptionLabel,
    allOptionValue,
  ]);

  const handleChange: SelectSubjectProps["onChange"] = (val, option) => {
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

SelectSubject.displayName = "SelectSubject";
