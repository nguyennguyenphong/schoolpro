import { useMemo, useEffect, useRef } from "react";
import { Select } from "@/components/ui/Select";
import type {
  SelectRoleProps,
  RoleItem,
} from "@/components/roles/SelectRole/types";
import { useRoles } from "@/components/roles/SelectRole/hooks/useRoles";

/**
 * Helper to match role by ID, code, or common alias (e.g. "student", "teacher", "admin").
 */
const findRoleByValueOrAlias = (
  val: unknown,
  roleList: RoleItem[],
): RoleItem | undefined => {
  if (!val || typeof val !== "string") return undefined;
  const lower = val.toLowerCase().trim();

  // 1. Direct ID or Code match
  const direct = roleList.find(
    (r) =>
      r.id === val ||
      r.code === val ||
      r.id.toLowerCase() === lower ||
      r.code.toLowerCase() === lower,
  );
  if (direct) return direct;

  // 2. Slug / alias match
  return roleList.find((r) => {
    const codeLower = r.code.toLowerCase();
    const nameLower = r.name.toLowerCase();
    return (
      codeLower.includes(lower) ||
      nameLower === lower ||
      (lower === "student" &&
        (codeLower.includes("stu") || nameLower.includes("học sinh"))) ||
      (lower === "teacher" &&
        (codeLower.includes("tch") || nameLower.includes("giáo viên"))) ||
      (lower === "admin" &&
        (codeLower.includes("admin") || nameLower.includes("quản trị"))) ||
      (lower === "parent" &&
        (codeLower.includes("par") || nameLower.includes("phụ huynh"))) ||
      (lower === "staff" &&
        (codeLower.includes("stf") || nameLower.includes("nhân viên"))) ||
      (lower === "principal" &&
        (codeLower.includes("prin") || nameLower.includes("hiệu trưởng"))) ||
      (lower === "supervisor" &&
        (codeLower.includes("sup") || nameLower.includes("giám thị")))
    );
  });
};

/**
 * Standard Role Select component built on top of Ant Design Select.
 * Automatically defaults to 'Học sinh' role and handles 'student' slug resolution.
 */
export const SelectRole = ({
  filterActiveOnly = true,
  customRoles,
  defaultToStudent = true,
  placeholder = "Chọn vai trò",
  allowClear = true,
  showSearch = true,
  disabled = false,
  value,
  onChange,
  ...props
}: SelectRoleProps) => {
  const { roles, isLoading } = useRoles({
    filterActiveOnly,
    initialRoles: customRoles,
    enabled: !customRoles || customRoles.length === 0,
  });

  // Find the student role in the loaded roles list
  const studentRole = useMemo(() => {
    return findRoleByValueOrAlias("student", roles);
  }, [roles]);

  // Resolve incoming value: if value is "student" or slug, map to role.id
  const resolvedValue = useMemo(() => {
    if (value !== undefined && value !== null && value !== "") {
      const matched = findRoleByValueOrAlias(value, roles);
      if (matched) {
        return matched.id;
      }
      return value;
    }

    // If no value provided and defaultToStudent is enabled, default to student role ID
    if (defaultToStudent && studentRole) {
      return studentRole.id;
    }

    return value;
  }, [value, roles, defaultToStudent, studentRole]);

  // Synchronize initial default value to parent/form if value was empty or slug "student"
  const syncedRef = useRef<boolean>(false);
  useEffect(() => {
    if (syncedRef.current || isLoading || !onChange) return;

    if (value === "student" && studentRole) {
      syncedRef.current = true;
      onChange(studentRole.id, {
        label: studentRole.name,
        value: studentRole.id,
        role: studentRole,
      });
    } else if (value === undefined && defaultToStudent && studentRole) {
      syncedRef.current = true;
      onChange(studentRole.id, {
        label: studentRole.name,
        value: studentRole.id,
        role: studentRole,
      });
    }
  }, [value, studentRole, defaultToStudent, isLoading, onChange]);

  // Map roles to standard Ant Design select options
  const options = useMemo(() => {
    return roles.map((role) => ({
      label: role.name,
      value: role.id,
      key: role.id,
      role,
    }));
  }, [roles]);

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
      onChange={onChange}
      {...props}
    />
  );
};

SelectRole.displayName = "SelectRole";
