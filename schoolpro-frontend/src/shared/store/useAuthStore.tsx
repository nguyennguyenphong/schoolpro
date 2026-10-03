import { create } from "zustand";
import { httpClient } from "@/shared/api/httpClient";
import type {
  AcademicContext,
  ApiResponse,
  AuthRole,
  AuthUser,
  UserProfileContext,
} from "@/shared/types/auth";
import { normalizeRoleSlug } from "@/shared/utils/roleRoutes";

interface ExtendedUser {
  id?: string;
  name: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  role: string | null;
  roleDetail: AuthRole | null;
  user: ExtendedUser | null;
  academicContext: AcademicContext | null;
  profileContext: UserProfileContext | null;
  isInitialized: boolean;
  setAuth: (payload: {
    access: string;
    refresh: string;
    user: AuthUser;
    role?: AuthRole | null;
    academic_context?: AcademicContext;
    profile?: UserProfileContext;
    remember?: boolean;
  }) => void;
  setAccessToken: (token: string) => void;
  syncSession: () => Promise<void>;
  // Backward compatibility method
  login: (role: string, token: string) => void;
  logout: () => void;
  initialize: () => void;
}

const STORAGE_KEYS = {
  ACCESS: "schoolpro_access_token",
  REFRESH: "schoolpro_refresh_token",
  USER: "schoolpro_user",
  ROLE: "schoolpro_role",
  ROLE_DETAIL: "schoolpro_role_detail",
  ACADEMIC_CONTEXT: "schoolpro_academic_context",
  PROFILE_CONTEXT: "schoolpro_profile_context",
};

const getStorage = (type: "local" | "session"): Storage | null => {
  if (typeof window === "undefined") return null;
  try {
    const storage = type === "local" ? window.localStorage : window.sessionStorage;
    if (storage && typeof storage.getItem === "function") {
      return storage;
    }
  } catch {
    // Restricted environment fallback
  }
  return null;
};

const safeGetItem = (key: string): string | null => {
  const local = getStorage("local");
  const session = getStorage("session");
  return (local ? local.getItem(key) : null) || (session ? session.getItem(key) : null);
};

const safeSetItem = (key: string, val: string, remember: boolean) => {
  const target = getStorage(remember ? "local" : "session");
  const alt = getStorage(remember ? "session" : "local");
  alt?.removeItem(key);
  target?.setItem(key, val);
};

const safeRemoveItem = (key: string) => {
  getStorage("local")?.removeItem(key);
  getStorage("session")?.removeItem(key);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  role: null,
  roleDetail: null,
  user: null,
  academicContext: null,
  profileContext: null,
  isInitialized: false,

  setAuth: ({
    access,
    refresh,
    user,
    role,
    academic_context,
    profile,
    remember = true,
  }) => {
    safeSetItem(STORAGE_KEYS.ACCESS, access, remember);
    safeSetItem(STORAGE_KEYS.REFRESH, refresh, remember);
    safeSetItem(STORAGE_KEYS.USER, JSON.stringify(user), remember);

    const roleSlug = role?.code || role?.role_type || normalizeRoleSlug(role?.name);
    safeSetItem(STORAGE_KEYS.ROLE, roleSlug, remember);

    if (role) {
      safeSetItem(STORAGE_KEYS.ROLE_DETAIL, JSON.stringify(role), remember);
    }
    if (academic_context) {
      safeSetItem(STORAGE_KEYS.ACADEMIC_CONTEXT, JSON.stringify(academic_context), remember);
    }
    if (profile) {
      safeSetItem(STORAGE_KEYS.PROFILE_CONTEXT, JSON.stringify(profile), remember);
    }

    set({
      isAuthenticated: true,
      accessToken: access,
      refreshToken: refresh,
      role: roleSlug,
      roleDetail: role || null,
      academicContext: academic_context || null,
      profileContext: profile || null,
      user: {
        id: user.id,
        name: user.full_name || user.username,
        email: user.email || `${user.username}@schoolpro.edu.vn`,
        username: user.username,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
      },
      isInitialized: true,
    });
  },

  setAccessToken: (token: string) => {
    // Determine whether token was stored in local or session storage
    const isSession = !!sessionStorage.getItem(STORAGE_KEYS.ACCESS);
    if (isSession) {
      sessionStorage.setItem(STORAGE_KEYS.ACCESS, token);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACCESS, token);
    }

    set({ accessToken: token });
  },

  syncSession: async () => {
    const token = get().accessToken || safeGetItem(STORAGE_KEYS.ACCESS);
    if (!token) return;

    try {
      const response = await httpClient.get<
        ApiResponse<{
          user: AuthUser;
          active_role?: AuthRole;
          academic_context?: AcademicContext;
          profile?: UserProfileContext;
        }>
      >("/core/auth/me/");

      const data = response.data?.data;
      if (data) {
        const isSession = !localStorage.getItem(STORAGE_KEYS.ACCESS);
        const remember = !isSession;

        if (data.user) {
          safeSetItem(STORAGE_KEYS.USER, JSON.stringify(data.user), remember);
        }
        if (data.active_role) {
          safeSetItem(STORAGE_KEYS.ROLE_DETAIL, JSON.stringify(data.active_role), remember);
        }
        if (data.academic_context) {
          safeSetItem(STORAGE_KEYS.ACADEMIC_CONTEXT, JSON.stringify(data.academic_context), remember);
        }
        if (data.profile) {
          safeSetItem(STORAGE_KEYS.PROFILE_CONTEXT, JSON.stringify(data.profile), remember);
        }

        set((state) => ({
          roleDetail: data.active_role || state.roleDetail,
          academicContext: data.academic_context || state.academicContext,
          profileContext: data.profile || state.profileContext,
          user: data.user
            ? {
                id: data.user.id,
                name: data.user.full_name || data.user.username,
                email: data.user.email || `${data.user.username}@schoolpro.edu.vn`,
                username: data.user.username,
                full_name: data.user.full_name,
                avatar_url: data.user.avatar_url,
              }
            : state.user,
        }));
      }
    } catch {
      // Ignore background sync network failures
    }
  },

  login: (role, token) => {
    safeSetItem(STORAGE_KEYS.ACCESS, token, true);
    safeSetItem(STORAGE_KEYS.ROLE, role, true);
    set({
      isAuthenticated: true,
      accessToken: token,
      role,
      user: {
        name: "Người dùng SchoolPro",
        email: "user@schoolpro.edu.vn",
      },
      isInitialized: true,
    });
  },

  logout: () => {
    Object.values(STORAGE_KEYS).forEach((k) => safeRemoveItem(k));

    set({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      role: null,
      roleDetail: null,
      user: null,
      academicContext: null,
      profileContext: null,
      isInitialized: true,
    });
  },

  initialize: () => {
    const access = safeGetItem(STORAGE_KEYS.ACCESS);
    const refresh = safeGetItem(STORAGE_KEYS.REFRESH);
    const rawUser = safeGetItem(STORAGE_KEYS.USER);
    const role = safeGetItem(STORAGE_KEYS.ROLE);
    const rawRoleDetail = safeGetItem(STORAGE_KEYS.ROLE_DETAIL);
    const rawAcademicContext = safeGetItem(STORAGE_KEYS.ACADEMIC_CONTEXT);
    const rawProfileContext = safeGetItem(STORAGE_KEYS.PROFILE_CONTEXT);

    if (access && rawUser) {
      try {
        const parsedUser: AuthUser = JSON.parse(rawUser);
        const parsedRoleDetail: AuthRole | null = rawRoleDetail
          ? JSON.parse(rawRoleDetail)
          : null;
        const parsedAcademicContext: AcademicContext | null = rawAcademicContext
          ? JSON.parse(rawAcademicContext)
          : null;
        const parsedProfileContext: UserProfileContext | null = rawProfileContext
          ? JSON.parse(rawProfileContext)
          : null;

        set({
          isAuthenticated: true,
          accessToken: access,
          refreshToken: refresh || null,
          role: role || (parsedRoleDetail?.code ? normalizeRoleSlug(parsedRoleDetail.code) : "student"),
          roleDetail: parsedRoleDetail,
          academicContext: parsedAcademicContext,
          profileContext: parsedProfileContext,
          user: {
            id: parsedUser.id,
            name: parsedUser.full_name || parsedUser.username,
            email: parsedUser.email || `${parsedUser.username}@schoolpro.edu.vn`,
            username: parsedUser.username,
            full_name: parsedUser.full_name,
            avatar_url: parsedUser.avatar_url,
          },
          isInitialized: true,
        });

        // Automatically sync latest academic & profile context in background if missing
        if (!parsedAcademicContext || !parsedProfileContext) {
          get().syncSession();
        }

        return;
      } catch {
        // Corrupted storage fallback
      }
    }

    set({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      role: null,
      roleDetail: null,
      user: null,
      academicContext: null,
      profileContext: null,
      isInitialized: true,
    });
  },
}));

// Auto-initialize auth store immediately upon evaluation
useAuthStore.getState().initialize();
