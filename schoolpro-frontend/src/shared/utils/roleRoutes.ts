/**
 * Role-to-route resolution utilities.
 * Maps organizational security roles to their respective landing spaces.
 */

export type RoleType =
  | "student"
  | "teacher"
  | "staff"
  | "admin"
  | "principal"
  | "parent"
  | "supervisor";

/**
 * Normalizes any role representation (UUID, role code, or alias) into standard role slug.
 */
export const normalizeRoleSlug = (roleIdentifier?: string | null): RoleType => {
  if (!roleIdentifier) return "student";

  const raw = roleIdentifier.toLowerCase().trim();

  // Parent check must precede student check because 'Phụ huynh học sinh' contains 'học sinh'
  if (raw.includes("par") || raw === "parent" || raw.includes("phu_huynh") || raw.includes("phụ huynh")) {
    return "parent";
  }

  // Strict check on code prefixes or slugs
  if (raw.includes("stu") || raw === "student" || raw.includes("hoc_sinh") || raw.includes("học sinh")) {
    return "student";
  }
  if (raw.includes("tch") || raw === "teacher" || raw.includes("giao_vien") || raw.includes("giáo viên")) {
    return "teacher";
  }
  if (raw.includes("stf") || raw === "staff" || raw.includes("can_bo") || raw.includes("cán bộ")) {
    return "staff";
  }
  if (raw.includes("admin") || raw.includes("quan_tri") || raw.includes("quản trị")) {
    return "admin";
  }
  if (raw.includes("prin") || raw === "principal" || raw.includes("hieu_truong") || raw.includes("hiệu trưởng")) {
    return "principal";
  }
  if (raw.includes("sup") || raw === "supervisor" || raw.includes("giam_thi") || raw.includes("giám thị")) {
    return "supervisor";
  }

  return "student";
};

/**
 * Returns primary landing route path based on user active role.
 */
export const getRoleHomeRoute = (roleIdentifier?: string | null): string => {
  const roleSlug = normalizeRoleSlug(roleIdentifier);

  switch (roleSlug) {
    case "student":
      return "/student/home";
    case "teacher":
      return "/teacher/home";
    case "staff":
      return "/staff/home";
    case "admin":
    case "principal":
      return "/admin/dashboard";
    case "parent":
      return "/parent/home";
    case "supervisor":
      return "/supervisor/home";
    default:
      return "/student/home";
  }
};

/**
 * Validates if a user role matches allowed roles for a protected route.
 */
export const isRoleAuthorized = (
  userRole?: string | null,
  allowedRoles?: string[]
): boolean => {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }
  if (!userRole) {
    return false;
  }

  const userSlug = normalizeRoleSlug(userRole);
  const userRaw = userRole.toLowerCase().trim();

  return allowedRoles.some((allowed) => {
    const allowedLower = allowed.toLowerCase().trim();
    if (allowedLower === userRaw) return true;
    if (allowedLower === userSlug) return true;
    return normalizeRoleSlug(allowedLower) === userSlug;
  });
};
