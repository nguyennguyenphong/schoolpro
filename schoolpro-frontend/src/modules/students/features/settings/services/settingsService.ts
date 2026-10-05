import type {
  UserSettingsData,
  AppearanceSettings,
  NotificationSettings,
  SecuritySettings,
} from "@/modules/students/features/settings/types";
import { initialMockSettingsData } from "@/modules/students/features/settings/services/mockSettingsData";

const SETTINGS_STORAGE_KEY = "schoolpro_user_settings";

export const settingsService = {
  getSettings: async (): Promise<UserSettingsData> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const cached = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached) as UserSettingsData;
      } catch (err) {
        console.error("Failed to parse cached settings:", err);
      }
    }
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(initialMockSettingsData));
    return initialMockSettingsData;
  },

  updateAppearance: async (appearance: Partial<AppearanceSettings>): Promise<UserSettingsData> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const current = await settingsService.getSettings();
    const updated: UserSettingsData = {
      ...current,
      appearance: {
        ...current.appearance,
        ...appearance,
      },
    };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  updateNotifications: async (
    notifications: Partial<NotificationSettings>,
  ): Promise<UserSettingsData> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const current = await settingsService.getSettings();
    const updated: UserSettingsData = {
      ...current,
      notifications: {
        ...current.notifications,
        ...notifications,
      },
    };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  updateSecurity: async (security: Partial<SecuritySettings>): Promise<UserSettingsData> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const current = await settingsService.getSettings();
    const updated: UserSettingsData = {
      ...current,
      security: {
        ...current.security,
        ...security,
      },
    };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  revokeSession: async (sessionId: string): Promise<UserSettingsData> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const current = await settingsService.getSettings();
    const updated: UserSettingsData = {
      ...current,
      sessions: current.sessions.filter((s) => s.id !== sessionId),
    };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  revokeAllOtherSessions: async (): Promise<UserSettingsData> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const current = await settingsService.getSettings();
    const updated: UserSettingsData = {
      ...current,
      sessions: current.sessions.filter((s) => s.isCurrent),
    };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },
};
