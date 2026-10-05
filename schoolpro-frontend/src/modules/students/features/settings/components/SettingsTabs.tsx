import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon/types";
import type { SettingsTabKey } from "@/modules/students/features/settings/types";

export interface SettingsTabsProps {
  /**
   * Currently active tab key.
   */
  activeTab: SettingsTabKey;

  /**
   * Number of active notifications channels enabled.
   */
  notificationsCount?: number;

  /**
   * Number of active sessions connected.
   */
  sessionsCount?: number;

  /**
   * Callback fired when tab is clicked.
   */
  onTabChange: (tab: SettingsTabKey) => void;
}

/**
 * Settings tab selector styled identically to AnnouncementStatusTabs.
 */
export const SettingsTabs: React.FC<SettingsTabsProps> = ({
  activeTab,
  notificationsCount,
  sessionsCount,
  onTabChange,
}) => {
  const { t } = useTranslation(["card"]);

  const tabs: Array<{
    key: SettingsTabKey;
    label: string;
    icon: IconName;
    badge?: number;
  }> = [
    {
      key: "appearance",
      label: t("card:settings.tabs.appearance"),
      icon: "sun",
    },
    {
      key: "notifications",
      label: t("card:settings.tabs.notifications"),
      icon: "bell",
      badge: notificationsCount,
    },
    {
      key: "security",
      label: t("card:settings.tabs.security"),
      icon: "shield-check",
    },
    {
      key: "login-history",
      label: t("card:settings.tabs.loginHistory"),
      icon: "device",
      badge: sessionsCount,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Icon
              name={tab.icon}
              size={14}
              className={isActive ? "text-white shrink-0" : "text-slate-400 shrink-0"}
            />
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
