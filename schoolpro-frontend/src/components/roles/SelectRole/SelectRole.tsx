import { useMemo, useEffect, useRef } from "react";
import { Select } from "@/components/ui/Select";
import type {
  SelectRoleProps,
  RoleItem,
} from "@/components/roles/SelectRole/types";
import { useRoles } from "@/components/roles/SelectRole/hooks/useRoles";

/**
 * Check if a role is the Student role (and explicitly not Parent).
 */
const isStudentRole = (r: RoleItem): boolean => {
  const code = r.code.toUpperCase();
  const name = r.name.toLowerCase().trim();
  // Exclude Parent ("Phụ huynh học sinh" contains "học sinh", so must guard)
  if (name.includes("phụ huynh") || code.includes("PAR")) {
    return false;
  }
  return (
    code.includes("STU") ||
    code.includes("STUDENT") ||
    name === "học sinh"
  );
};

/**
 * Check if a role is the Parent role.
 */
const isParentRole = (r: RoleItem): boolean => {
  const code = r.code.toUpperCase();
  const name = r.name.toLowerCase().trim();
  return (
    code.includes("PAR") ||
    code.includes("PARENT") ||
    name.includes("phụ huynh")
  );
};

/**
 * Check if a role is Teacher.
 */
const isTeacherRole = (r: RoleItem): boolean => {
  const code = r.code.toUpperCase();
  const name = r.name.toLowerCase().trim();
  return (
    code.includes("TCH") ||
    code.includes("TEACHER") ||
    name === "giáo viên" ||
    name.startsWith("giáo viên")
  );
};

/**
 * Check if a role is Admin.
 */
const isAdminRole = (r: RoleItem): boolean => {
  const code = r.code.toUpperCase();
  const name = r.name.toLowerCase().trim();
  return (
    code.includes("ADMIN") ||
    name.includes("quản trị")
  );
};

/**
 * Helper to match role by ID, code, or common alias (e.g. "student", "teacher", "admin").
 */
const findRoleByValueOrAlias = (
  val: unknown,
  roleList: RoleItem[],
): RoleItem | undefined => {
  if (!val || typeof val !== "string") return undefined;
  const lower = val.toLowerCase().trim();
  const upper = val.toUpperCase().trim();

  // 1. Direct ID match
  const matchId = roleList.find(
    (r) => r.id === val || r.id.toLowerCase() === lower,
  );
  if (matchId) return matchId;

  // 2. Direct Code match
  const matchCode = roleList.find(
    (r) => r.code === val || r.code.toUpperCase() === upper,
  );
  if (matchCode) return matchCode;

  // 3. Exact Name match
  const matchName = roleList.find(
    (r) => r.name.toLowerCase().trim() === lower,
  );
  if (matchName) return matchName;

  // 4. Semantic alias matching
  if (
    lower === "student" ||
    lower === "stu" ||
    lower === "hoc sinh" ||
    lower === "học sinh"
  ) {
    return roleList.find(isStudentRole);
  }

  if (
    lower === "parent" ||
    lower === "par" ||
    lower === "phu huynh" ||
    lower === "phụ huynh"
  ) {
    return roleList.find(isParentRole);
  }

  if (
    lower === "teacher" ||
    lower === "tch" ||
    lower === "giao vien" ||
    lower === "giáo viên"
  ) {
    return roleList.find(isTeacherRole);
  }

  if (
    lower === "admin" ||
    lower === "quan tri" ||
    lower === "quản trị"
  ) {
    return roleList.find(isAdminRole);
  }

  if (
    lower === "staff" ||
    lower === "stf" ||
    lower === "nhan vien" ||
    lower === "nhân viên"
  ) {
    return roleList.find(
      (r) => r.code.includes("STF") || r.name.toLowerCase().includes("nhân viên"),
    );
  }

  if (
    lower === "principal" ||
    lower === "prin" ||
    lower === "hieu truong" ||
    lower === "hiệu trưởng"
  ) {
    return roleList.find(
      (r) =>
        r.code.includes("PRIN") || r.name.toLowerCase().includes("hiệu trưởng"),
    );
  }

  if (
    lower === "supervisor" ||
    lower === "sup" ||
    lower === "giam thi" ||
    lower === "giám thị"
  ) {
    return roleList.find(
      (r) => r.code.includes("SUP") || r.name.toLowerCase().includes("giám thị"),
    );
  }

  return undefined;
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

  // Find the student role in the loaded roles list (strictly student, never parent)
  const studentRole = useMemo(() => {
    return roleListFindStudent(roles);
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

const roleListFindStudent = (roleList: RoleItem[]): RoleItem | undefined => {
  return roleList.find(isStudentRole);
};

SelectRole.displayName = "SelectRole";
