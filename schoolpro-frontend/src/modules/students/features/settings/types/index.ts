export type ThemeMode = "light" | "dark" | "system";
export type LanguageCode = "vi" | "en" | "ja" | "ko" | "zh";
export type DisplayDensity = "compact" | "normal" | "comfortable";
export type SettingsTabKey = "appearance" | "notifications" | "security" | "login-history";

export interface AppearanceSettings {
  theme: ThemeMode;
  language: LanguageCode;
  density: DisplayDensity;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  gradeAlerts: boolean;
  examReminders: boolean;
  assignmentDeadlines: boolean;
  schoolAnnouncements: boolean;
  soundEnabled: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  idleTimeoutMinutes: 15 | 30 | 60 | 120;
  loginAlerts: boolean;
}

export interface ActiveSession {
  id: string;
  deviceName: string;
  deviceType: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export interface UserSettingsData {
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  sessions: ActiveSession[];
}
