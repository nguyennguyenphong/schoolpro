/**
 * Authentication and identity types for SchoolPro application.
 */

export interface AuthUser {
  id: string;
  username: string;
  full_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  status_code?: string;
  must_change_password?: boolean;
  is_locked?: boolean;
  locked_until?: string | null;
  failed_login_attempts?: number;
  is_2fa_enabled?: boolean;
  email_verified_at?: string | null;
  phone_verified_at?: string | null;
}

export interface AuthRole {
  id: string;
  code: string;
  name: string;
  badge_color?: string;
  icon?: string;
  is_system?: boolean;
  role_type?: "student" | "teacher" | "staff" | "admin" | "principal" | "parent" | "supervisor" | string;
}

export interface LoginPayload {
  code: string;
  password: string;
  role?: string;
  remember?: boolean;
}

export interface AcademicContext {
  academic_year_id?: string | null;
  academic_year: string;
  academic_year_code?: string;
  semester_id?: string | null;
  semester: string;
  semester_code?: string;
  current_week: number;
}

export interface UserProfileContext {
  type: "student" | "teacher" | "staff" | "user" | string;
  student_id?: string;
  student_code?: string;
  class_id?: string | null;
  class_name?: string;
  class_code?: string;
  teacher_id?: string;
  teacher_code?: string;
  department_name?: string;
  subject_major?: string;
  is_homeroom?: boolean;
  birth_place?: string | null;
  status?: string;
  [key: string]: unknown;
}

export interface LoginResponseData {
  access: string;
  refresh: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
  role: AuthRole;
  assigned_roles?: AuthRole[];
  academic_context?: AcademicContext;
  profile?: UserProfileContext;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
  errors?: unknown[];
}
