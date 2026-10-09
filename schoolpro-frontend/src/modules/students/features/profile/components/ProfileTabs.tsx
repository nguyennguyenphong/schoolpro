import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon/types";
import type { ProfileTabKey } from "@/modules/students/features/profile/types";

export interface ProfileTabsProps {
  /**
   * Currently active tab key.
   */
  activeTab: ProfileTabKey;

  /**
   * Number of guardians in student record.
   */
  guardiansCount?: number;

  /**
   * Callback fired when tab is clicked.
   */
  onTabChange: (tab: ProfileTabKey) => void;
}

/**
 * Profile tab navigation bar styled identically to SettingsTabs.
 */
export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  guardiansCount,
  onTabChange,
}) => {
  const { t } = useTranslation(["card"]);

  const tabs: Array<{
    key: ProfileTabKey;
    label: string;
    icon: IconName;
    badge?: number;
  }> = [
    {
      key: "personal",
      label: t("card:profile.tabs.personal"),
      icon: "user",
    },
    {
      key: "academic",
      label: t("card:profile.tabs.academic"),
      icon: "academic",
    },
    {
      key: "guardians",
      label: t("card:profile.tabs.guardians"),
      icon: "users",
      badge: guardiansCount,
    },
    {
      key: "health",
      label: t("card:profile.tabs.health"),
      icon: "heart",
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
                    : "bg-slate-100 text-slate-600 border border-[#f0f0f0]"
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
