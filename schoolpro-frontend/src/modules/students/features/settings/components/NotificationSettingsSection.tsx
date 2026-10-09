import React from "react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/Switch";
import { Icon } from "@/components/ui/Icon";
import type { NotificationSettings } from "@/modules/students/features/settings/types";

interface NotificationSettingsSectionProps {
  settings: NotificationSettings;
  onChange: (changes: Partial<NotificationSettings>) => void;
  disabled?: boolean;
}

export const NotificationSettingsSection: React.FC<NotificationSettingsSectionProps> = ({
  settings,
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation(["card", "common"]);

  const notificationItems = [
    {
      key: "emailNotifications" as const,
      labelKey: "card:settings.notifications.email",
      descKey: "card:settings.notifications.emailDesc",
      icon: "mail" as const,
      color: "blue",
    },
    {
      key: "pushNotifications" as const,
      labelKey: "card:settings.notifications.push",
      descKey: "card:settings.notifications.pushDesc",
      icon: "bell" as const,
      color: "purple",
    },
    {
      key: "smsNotifications" as const,
      labelKey: "card:settings.notifications.sms",
      descKey: "card:settings.notifications.smsDesc",
      icon: "phone" as const,
      color: "green",
    },
    {
      key: "gradeAlerts" as const,
      labelKey: "card:settings.notifications.gradeAlerts",
      descKey: "card:settings.notifications.gradeAlertsDesc",
      icon: "academic" as const,
      color: "amber",
    },
    {
      key: "examReminders" as const,
      labelKey: "card:settings.notifications.examReminders",
      descKey: "card:settings.notifications.examRemindersDesc",
      icon: "calendar" as const,
      color: "rose",
    },
    {
      key: "assignmentDeadlines" as const,
      labelKey: "card:settings.notifications.assignmentDeadlines",
      descKey: "card:settings.notifications.assignmentDeadlinesDesc",
      icon: "clock" as const,
      color: "indigo",
    },
    {
      key: "soundEnabled" as const,
      labelKey: "card:settings.notifications.sound",
      descKey: "card:settings.notifications.soundDesc",
      icon: "volume" as const,
      color: "cyan",
    },
  ];

  return (
    <>
      <div className="flex items-center gap-3 pb-4">
        <span className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
          <Icon name="bell" size={20} />
        </span>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-0.5">
            {t("card:settings.sections.notifications")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            {t("card:settings.sections.notificationsDesc")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
        {notificationItems.map((item) => {
          const checked = settings[item.key];
          return (
            <div
              key={item.key}
              className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                checked
                  ? "bg-slate-50/70 border-[#f0f0f0]"
                  : "bg-white border-slate-100 opacity-75"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 rounded-xl bg-white border border-[#f0f0f0] shadow-2xs flex items-center justify-center shrink-0 text-slate-700">
                  <Icon name={item.icon} size={17} />
                </span>
                <div className="min-w-0">
                  <span className="font-bold text-slate-800 text-sm block truncate">
                    {t(item.labelKey as any)}
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate">
                    {t(item.descKey as any)}
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                <Switch
                  checked={checked}
                  disabled={disabled}
                  onChange={(val) => onChange({ [item.key]: val })}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
