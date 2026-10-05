import { useMemo } from "react";
import { Select } from "@/components/ui/Select";
import type {
  SelectDepartmentProps,
  DepartmentItem,
} from "@/components/departments/SelectDepartment/types";
import { useDepartment } from "@/components/departments/SelectDepartment/hooks/useDepartment";

/**
 * Helper to match department by UUID, code (e.g. DEP_M839201), or exact/similar name.
 */
const findDepartmentByValueOrCode = (
  val: unknown,
  departmentList: DepartmentItem[],
): DepartmentItem | undefined => {
  if (!val || typeof val !== "string") return undefined;
  const lower = val.toLowerCase().trim();
  const upper = val.toUpperCase().trim();

  // 1. Direct ID match
  const matchId = departmentList.find(
    (d) => d.id === val || d.id.toLowerCase() === lower,
  );
  if (matchId) return matchId;

  // 2. Direct Code match (e.g. DEP_M839201)
  const matchCode = departmentList.find(
    (d) => d.code === val || d.code.toUpperCase() === upper,
  );
  if (matchCode) return matchCode;

  // 3. Exact Name match
  const matchName = departmentList.find(
    (d) => d.name.toLowerCase().trim() === lower,
  );
  if (matchName) return matchName;

  return undefined;
};

/**
 * Standard Department Select component built on top of Ant Design Select.
 * Supports filtering by school, department type, active status, and custom data override.
 */
export const SelectDepartment = ({
  filterActiveOnly = true,
  departmentType,
  schoolId,
  customDepartments,
  showCodePrefix = false,
  includeAllOption = false,
  allOptionLabel = "Tất cả đơn vị",
  allOptionValue = "all",
  placeholder = "Chọn phòng / tổ chuyên môn",
  allowClear = true,
  showSearch = true,
  optionFilterProp = "label",
  disabled = false,
  value,
  onChange,
  ...props
}: SelectDepartmentProps) => {
  const { departments, isLoading } = useDepartment({
    filterActiveOnly,
    departmentType,
    schoolId,
    initialDepartments: customDepartments,
    enabled: !customDepartments || customDepartments.length === 0,
  });

  // Resolve incoming value: if value is department code or slug, resolve to department.id
  const resolvedValue = useMemo(() => {
    if (includeAllOption && value === allOptionValue) {
      return allOptionValue;
    }
    if (value !== undefined && value !== null && value !== "") {
      const matched = findDepartmentByValueOrCode(value, departments);
      if (matched) {
        return matched.id;
      }
      return value;
    }
    return value;
  }, [value, departments, includeAllOption, allOptionValue]);

  // Map departments to standard Ant Design select options
  const options = useMemo(() => {
    const deptOptions = departments.map((dept) => {
      const displayLabel = showCodePrefix
        ? `[${dept.code}] ${dept.name}`
        : dept.name;

      return {
        label: displayLabel,
        value: dept.id,
        key: dept.id,
        title: dept.name,
        department: dept,
      };
    });

    if (includeAllOption) {
      return [
        {
          label: allOptionLabel,
          value: allOptionValue,
          key: allOptionValue,
          title: allOptionLabel,
        },
        ...deptOptions,
      ];
    }

    return deptOptions;
  }, [departments, showCodePrefix, includeAllOption, allOptionLabel, allOptionValue]);

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
      onChange={onChange}
      {...props}
    />
  );
};

SelectDepartment.displayName = "SelectDepartment";
