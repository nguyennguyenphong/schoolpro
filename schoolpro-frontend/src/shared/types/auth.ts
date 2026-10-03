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

export interface LoginResponseData {
  access: string;
  refresh: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
  role: AuthRole;
  assigned_roles?: AuthRole[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
  errors?: unknown[];
}
