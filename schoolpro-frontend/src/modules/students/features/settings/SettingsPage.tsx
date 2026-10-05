import React from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { SettingsTabKey } from "@/modules/students/features/settings/types";
import { useSettings } from "@/modules/students/features/settings/hooks/useSettings";
import { SettingsTabs } from "@/modules/students/features/settings/components/SettingsTabs";
import { AppearanceSettingsSection } from "@/modules/students/features/settings/components/AppearanceSettingsSection";
import { NotificationSettingsSection } from "@/modules/students/features/settings/components/NotificationSettingsSection";
import { SecuritySettingsSection } from "@/modules/students/features/settings/components/SecuritySettingsSection";
import { LoginHistorySection } from "@/modules/students/features/settings/components/LoginHistorySection";

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation(["navigation", "card", "common"]);
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    settings,
    loading,
    saving,
    updateAppearance,
    updateNotifications,
    updateSecurity,
    revokeSession,
    revokeAllOtherSessions,
  } = useSettings();

  // Read active tab from URL query params (supports aliases like history-login and sessions)
  const tabParam = searchParams.get("tab");
  const activeTab: SettingsTabKey =
    tabParam === "notifications"
      ? "notifications"
      : tabParam === "security"
      ? "security"
      : tabParam === "login-history" || tabParam === "history-login" || tabParam === "sessions"
      ? "login-history"
      : "appearance";

  // Push active tab change to URL query params
  const handleTabChange = (nextTab: SettingsTabKey) => {
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      updated.set("tab", nextTab);
      return updated;
    });
  };

  const activeNotificationsCount = settings?.notifications
    ? Object.values(settings.notifications).filter(Boolean).length
    : 0;
  const sessionsCount = settings?.sessions?.length ?? 0;

  return (
    <div className="space-y-4 sm:space-y-5 pb-10">
      {/* 1. Page Header with integrated Breadcrumb */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs">
        <Breadcrumb
          items={[
            {
              href: "/student/home",
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                  <Icon name="home" size={13} className="text-slate-400 shrink-0" />
                  <span>{t("navigation:breadcrumb.home")}</span>
                </span>
              ),
            },
            {
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                  <Icon name="settings" size={13} className="text-blue-600 shrink-0" />
                  <span>{t("navigation:breadcrumb.settings")}</span>
                </span>
              ),
            },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
                {t("navigation:pageTitle.settings")}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mb-0">
              {t("navigation:pageSubtitle.settings")}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Separate Tab Navigation Bar inside Card component */}
      <div className="mb-4">
        <Card className="shadow-2xs">
          <SettingsTabs
            activeTab={activeTab}
            notificationsCount={activeNotificationsCount}
            sessionsCount={sessionsCount}
            onTabChange={handleTabChange}
          />
        </Card>
      </div>

      {/* 3. Tab Content Section inside separate Card component */}
      <Card
        loading={loading && !settings}
        className="shadow-2xs"
      >
        {settings && activeTab === "appearance" && (
          <AppearanceSettingsSection
            settings={settings.appearance}
            onChange={updateAppearance}
            disabled={saving}
          />
        )}

        {settings && activeTab === "notifications" && (
          <NotificationSettingsSection
            settings={settings.notifications}
            onChange={updateNotifications}
            disabled={saving}
          />
        )}

        {settings && activeTab === "security" && (
          <SecuritySettingsSection
            settings={settings.security}
            onChange={updateSecurity}
            disabled={saving}
          />
        )}

        {settings && activeTab === "login-history" && (
          <LoginHistorySection
            sessions={settings.sessions}
            onRevokeSession={revokeSession}
            onRevokeAllOtherSessions={revokeAllOtherSessions}
            loading={saving}
          />
        )}
      </Card>
    </div>
  );
};
