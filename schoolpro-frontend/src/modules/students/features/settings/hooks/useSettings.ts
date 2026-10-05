import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { message } from "@/components/ui/Message";
import { settingsService } from "@/modules/students/features/settings/services/settingsService";
import type {
  UserSettingsData,
  AppearanceSettings,
  NotificationSettings,
  SecuritySettings,
} from "@/modules/students/features/settings/types";

export const useSettings = () => {
  const { t, i18n } = useTranslation(["message", "common"]);
  const [settings, setSettings] = useState<UserSettingsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    void (async () => {
      try {
        const data = await settingsService.getSettings();
        if (isMounted) setSettings(data);
      } catch (err) {
        console.error("Failed to fetch settings:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const updateAppearance = async (changes: Partial<AppearanceSettings>) => {
    try {
      setSaving(true);
      const updated = await settingsService.updateAppearance(changes);
      setSettings(updated);

      if (changes.language && changes.language !== i18n.language) {
        await i18n.changeLanguage(changes.language);
      }

      message.success(t("message:settingsSavedSuccess"));
    } catch (err) {
      console.error("Failed to update appearance:", err);
    } finally {
      setSaving(false);
    }
  };

  const updateNotifications = async (changes: Partial<NotificationSettings>) => {
    try {
      setSaving(true);
      const updated = await settingsService.updateNotifications(changes);
      setSettings(updated);
      message.success(t("message:settingsSavedSuccess"));
    } catch (err) {
      console.error("Failed to update notifications:", err);
    } finally {
      setSaving(false);
    }
  };

  const updateSecurity = async (changes: Partial<SecuritySettings>) => {
    try {
      setSaving(true);
      const updated = await settingsService.updateSecurity(changes);
      setSettings(updated);
      message.success(t("message:settingsSavedSuccess"));
    } catch (err) {
      console.error("Failed to update security:", err);
    } finally {
      setSaving(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      setSaving(true);
      const updated = await settingsService.revokeSession(sessionId);
      setSettings(updated);
      message.success(t("message:sessionRevokedSuccess"));
    } catch (err) {
      console.error("Failed to revoke session:", err);
    } finally {
      setSaving(false);
    }
  };

  const revokeAllOtherSessions = async () => {
    try {
      setSaving(true);
      const updated = await settingsService.revokeAllOtherSessions();
      setSettings(updated);
      message.success(t("message:sessionRevokedSuccess"));
    } catch (err) {
      console.error("Failed to revoke all other sessions:", err);
    } finally {
      setSaving(false);
    }
  };

  return {
    settings,
    loading,
    saving,
    updateAppearance,
    updateNotifications,
    updateSecurity,
    revokeSession,
    revokeAllOtherSessions,
    refreshSettings: loadSettings,
  };
};
