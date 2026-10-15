import React from "react";
import { useTranslation } from "react-i18next";
import { Select } from "@/components/ui/Select";
import { Icon } from "@/components/ui/Icon";
import type {
  AppearanceSettings,
  ThemeMode,
  DisplayDensity,
} from "@/modules/students/features/settings/types";

interface AppearanceSettingsSectionProps {
  settings: AppearanceSettings;
  onChange: (changes: Partial<AppearanceSettings>) => void;
  disabled?: boolean;
}

export const AppearanceSettingsSection: React.FC<AppearanceSettingsSectionProps> = ({
  settings,
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation(["card", "input", "common"]);

  const themeOptions: { key: ThemeMode; labelKey: string; icon: "sun" | "moon" | "device"; desc: string }[] = [
    { key: "light", labelKey: "card:settings.theme.light", icon: "sun", desc: "Màu nền sáng tiêu chuẩn" },
    { key: "dark", labelKey: "card:settings.theme.dark", icon: "moon", desc: "Dịu mắt trong bóng tối" },
    { key: "system", labelKey: "card:settings.theme.system", icon: "device", desc: "Tự động theo hệ điều hành" },
  ];

  const densityOptions = [
    { value: "compact", label: t("card:settings.density.compact") },
    { value: "normal", label: t("card:settings.density.normal") },
    { value: "comfortable", label: t("card:settings.density.comfortable") },
  ];

  return (
    <>
      <div className="flex items-center gap-3 pb-4">
        <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
          <Icon name="sun" size={20} />
        </span>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-0.5">
            {t("card:settings.sections.appearance")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            {t("card:settings.sections.appearanceDesc")}
          </p>
        </div>
      </div>

      <div className="space-y-6 mt-4">
        <div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
            {t("card:settings.theme.title")}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {themeOptions.map((opt) => {
              const isSelected = settings.theme === opt.key;
              return (
                <div
                  key={opt.key}
                  role="button"
                  tabIndex={0}
                  onClick={() => !disabled && onChange({ theme: opt.key })}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && !disabled) {
                      onChange({ theme: opt.key });
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/30 shadow-2xs"
                      : "border-[#f0f0f0] bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
                  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition-colors ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white text-slate-600 border border-[#f0f0f0]"
                    }`}
                  >
                    <Icon name={opt.icon} size={20} />
                  </span>
                  <span
                    className={`text-sm font-bold mb-0.5 ${
                      isSelected ? "text-blue-700" : "text-slate-800"
                    }`}
                  >
                    {t(opt.labelKey as any)}
                  </span>
                  <span className="text-[11px] text-slate-400 text-center">
                    {opt.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-[#f0f0f0] rounded-xl">
          <div>
            <span className="font-bold text-slate-800 text-sm block">
              {t("card:settings.density.title")}
            </span>
            <span className="text-xs text-slate-500">
              {t("card:settings.density.normal")}
            </span>
          </div>
          <div>
            <Select<DisplayDensity>
              value={settings.density}
              onChange={(value) => onChange({ density: value })}
              disabled={disabled}
              options={densityOptions}
              className="w-30"
            />
          </div>
        </div>
      </div>
    </>
  );
};
