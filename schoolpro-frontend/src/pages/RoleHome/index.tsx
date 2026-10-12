import React from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Avatar } from "@/components/ui/Avatar";
import { useLogout } from "@/hooks/useLogout";

interface RoleHomeProps {
  roleTitle: string;
  roleSubtitle: string;
  roleBadgeColor: string;
  roleIcon: IconName;
}

export const RoleHomePage: React.FC<RoleHomeProps> = ({
  roleTitle,
  roleSubtitle,
  roleBadgeColor,
  roleIcon,
}) => {
  const { t } = useTranslation(["common", "navigation", "button", "card"]);
  const { user, roleDetail } = useAuthStore();
  const { logout } = useLogout();

  const displayName = user?.name || "Người dùng SchoolPro";
  const displayEmail = user?.email || "user@schoolpro.edu.vn";
  const roleName = roleDetail?.name || roleTitle;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-[#f0f0f0] sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            SP
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">
              {t("common:brand.title")}
            </h1>
            <p className="text-xs text-slate-400 font-medium leading-none">
              {t("common:brand.portalTagline")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Tag color={roleBadgeColor} className="px-3 py-1 font-semibold rounded-full border-none">
            {roleName}
          </Tag>
          <div className="flex items-center gap-3 pl-2 border-l border-[#f0f0f0]">
            <Avatar size={36} className="bg-blue-600 font-semibold text-white">
              {displayName.charAt(0).toUpperCase()}
            </Avatar>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-700">{displayName}</div>
              <div className="text-[11px] text-slate-400">{displayEmail}</div>
            </div>
          </div>
          <Button
            variant="outline"
            size="small"
            onClick={logout}
            className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 hover:border-rose-300"
          >
            <Icon name="arrow-right" size={14} />
            <span className="hidden sm:inline">
              {t("button:logout")}
            </span>
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {/* Welcome Banner */}
        <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-xl p-6 md:p-8 text-white mb-8 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-medium tracking-wide">
                <Icon name={roleIcon} size={14} />
                <span>{t("navigation:workspace")}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                {t("navigation:welcomeUser", {
                  name: displayName,
                })}
              </h2>
              <p className="text-blue-100 text-sm max-w-xl">
                {roleSubtitle}
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-3">
              <Button
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-sm rounded-xl h-11 px-5"
              >
                {t("button:viewGuide")}
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hoverable className="rounded-xl border-[#f0f0f0] shadow-xs">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Icon name="calendar" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-base mb-1">
                  {t("card:roleCards.calendarTitle")}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-3">
                  {t("card:roleCards.calendarDesc")}
                </p>
                <span className="text-blue-600 text-xs font-semibold hover:underline cursor-pointer">
                  {t("card:roleCards.exploreNow")}
                </span>
              </div>
            </div>
          </Card>

          <Card hoverable className="rounded-xl border-[#f0f0f0] shadow-xs">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <Icon name="mail" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-base mb-1">
                  {t("card:roleCards.noticeTitle")}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-3">
                  {t("card:roleCards.noticeDesc")}
                </p>
                <span className="text-emerald-600 text-xs font-semibold hover:underline cursor-pointer">
                  {t("card:roleCards.viewNewNotices")}
                </span>
              </div>
            </div>
          </Card>

          <Card hoverable className="rounded-xl border-[#f0f0f0] shadow-xs">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                <Icon name="file" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-base mb-1">
                  {t("card:roleCards.recordsTitle")}
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-3">
                  {t("card:roleCards.recordsDesc")}
                </p>
                <span className="text-purple-600 text-xs font-semibold hover:underline cursor-pointer">
                  {t("card:roleCards.lookupRecords")}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};
