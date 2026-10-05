import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/Switch";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { SecuritySettings } from "@/modules/students/features/settings/types";

interface SecuritySettingsSectionProps {
  settings: SecuritySettings;
  onChange: (changes: Partial<SecuritySettings>) => void;
  disabled?: boolean;
}

export const SecuritySettingsSection: React.FC<SecuritySettingsSectionProps> = ({
  settings,
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation(["card", "button", "navigation", "common"]);
  const navigate = useNavigate();

  const timeoutOptions = [
    { value: 15, label: "15 phút" },
    { value: 30, label: "30 phút" },
    { value: 60, label: "1 giờ" },
    { value: 120, label: "2 giờ" },
  ];

  return (
    <>
      <div className="flex items-center gap-3 pb-4">
        <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
          <Icon name="shield-check" size={20} />
        </span>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-0.5">
            {t("card:settings.sections.security")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            {t("card:settings.sections.securityDesc")}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
          <div className="flex items-start gap-3.5">
            <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
              <Icon name="shield" size={18} />
            </span>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-bold text-slate-900 text-sm">
                  {t("card:settings.twoFactor.title")}
                </span>
                <Tag
                  color={settings.twoFactorEnabled ? "green" : "default"}
                  className="font-semibold text-xs px-2 py-0.5 m-0"
                >
                  {settings.twoFactorEnabled
                    ? t("card:settings.twoFactor.enabled")
                    : t("card:settings.twoFactor.disabled")}
                </Tag>
              </div>
              <p className="text-xs text-slate-500 mb-0">
                {t("card:settings.twoFactor.desc")}
              </p>
            </div>
          </div>

          <div className="self-end sm:self-center">
            <Switch
              checked={settings.twoFactorEnabled}
              disabled={disabled}
              onChange={(val) => onChange({ twoFactorEnabled: val })}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
          <div className="flex items-start gap-3.5">
            <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <Icon name="clock" size={18} />
            </span>
            <div>
              <span className="font-bold text-slate-900 text-sm block mb-1">
                {t("card:settings.sessions.idleTimeout")}
              </span>
              <p className="text-xs text-slate-500 mb-0">
                Tự động thoát phiên đăng nhập khi không phát sinh thao tác để bảo vệ tài khoản
              </p>
            </div>
          </div>

          <div>
            <Select<15 | 30 | 60 | 120>
              value={settings.idleTimeoutMinutes}
              onChange={(value) => onChange({ idleTimeoutMinutes: value })}
              disabled={disabled}
              options={timeoutOptions}
              className="w-30"
            />
          </div>
        </div>

        {/* 3. Change Password Quick CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-linear-to-r from-blue-50/40 to-slate-50 border border-blue-200/60">
          <div className="flex items-start gap-3.5">
            <span className="w-10 h-10 rounded-xl bg-white text-blue-600 border border-blue-200 flex items-center justify-center shrink-0 shadow-2xs">
              <Icon name="lock" size={18} />
            </span>
            <div>
              <span className="font-bold text-slate-900 text-sm block mb-1">
                {t("navigation:pageTitle.changePassword")}
              </span>
              <p className="text-xs text-slate-500 mb-0">
                {t("navigation:pageSubtitle.changePassword")}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate("/student/change-password")}
            className="rounded-lg h-9 px-4 font-semibold text-xs border-blue-300 text-blue-700 hover:bg-blue-50 self-start sm:self-center shrink-0"
          >
            <Icon name="edit" size={14} className="mr-1.5" />
            {t("navigation:pageTitle.changePassword")}
          </Button>
        </div>
      </div>
    </>
  );
};
