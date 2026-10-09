import React from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import type { MenuProps } from "antd";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { Badge } from "@/components/ui/Badge";
import { Tag } from "@/components/ui/Tag";
import { LanguageSwitcher } from "@/i18n";
import { Avatar } from "@/components/ui/Avatar";
import { useMainLayout } from "@/hooks/useMainLayout";

export interface MainLayoutProps {
  children?: React.ReactNode;

  // Header controls
  showHeader?: boolean;
  showBrand?: boolean;
  showAcademicBadge?: boolean;
  showSearch?: boolean;
  showLanguageSwitcher?: boolean;
  showNotifications?: boolean;
  showUserProfile?: boolean;

  // Content controls
  fullWidth?: boolean;
  contentClassName?: string;

  // Footer controls
  showFooter?: boolean;
  showSupportLink?: boolean;

  // Navigation targets overrides
  homeRoute?: string;
  notificationsRoute?: string;
  profileRoute?: string;
  changePasswordRoute?: string;
  settingsRoute?: string;
}

/**
 * Universal Master Layout for all SchoolPro portals & roles.
 * Provides granular boolean visibility toggles for each component piece.
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showHeader = true,
  showBrand = true,
  showAcademicBadge = true,
  showSearch = true,
  showLanguageSwitcher = true,
  showNotifications = true,
  showUserProfile = true,
  fullWidth = false,
  contentClassName = "",
  showFooter = true,
  showSupportLink = true,
  homeRoute,
  notificationsRoute,
  profileRoute,
  changePasswordRoute,
  settingsRoute,
}) => {
  const { t } = useTranslation(["common", "navigation", "button"]);
  const navigate = useNavigate();

  const {
    user,
    displayName,
    userCode,
    subInfo,
    roleTag,
    academicBadgeString,
    unreadNotificationsCount,
    logout,
    routes,
  } = useMainLayout();

  const resolvedHomeRoute = homeRoute || routes.home;
  const resolvedNoticesRoute = notificationsRoute || routes.notices;
  const resolvedProfileRoute = profileRoute || routes.profile;
  const resolvedChangePasswordRoute = changePasswordRoute || routes.changePassword;
  const resolvedSettingsRoute = settingsRoute || routes.settings;

  const userMenuItems: MenuProps["items"] = [
    {
      key: "user-info",
      disabled: true,
      label: (
        <div className="py-2 px-2 border-b border-slate-100 min-w-52.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-slate-800 text-sm truncate max-w-40">
              {displayName}
            </span>
            <Tag color="blue" className="text-[10px] font-bold px-1.5 py-0 mr-0">
              {roleTag}
            </Tag>
          </div>
          {userCode && (
            <p className="text-xs text-slate-500 mb-0.5">
              {t("navigation:header.studentId")}: <strong>{userCode}</strong>
            </p>
          )}
          {subInfo && <p className="text-[11px] text-slate-400 mb-0 truncate">{subInfo}</p>}
        </div>
      ),
    },
    {
      key: "profile",
      icon: <Icon name="user" size={15} />,
      label: t("navigation:header.profile"),
      onClick: () => navigate(resolvedProfileRoute),
    },
    {
      key: "changePassword",
      icon: <Icon name="password" size={15} />,
      label: t("navigation:header.changePassword"),
      onClick: () => navigate(resolvedChangePasswordRoute),
    },
    {
      key: "settings",
      icon: <Icon name="settings" size={15} />,
      label: t("navigation:header.settings"),
      onClick: () => navigate(resolvedSettingsRoute),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <Icon name="close" size={15} className="text-red-500" />,
      danger: true,
      label: t("navigation:header.logout"),
      onClick: logout,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. Header (Configurable) */}
      {showHeader && (
        <header className="sticky top-0 z-40 bg-white border-b border-[#f0f0f0] shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            {/* Left: Brand & Academic Badge */}
            <div className="flex items-center gap-4 shrink-0">
              {showBrand && (
                <Link
                  to={resolvedHomeRoute}
                  className="flex items-center gap-3 no-underline group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-500/25 border border-blue-700/20 shrink-0 group-hover:bg-blue-700 transition-colors">
                    <Icon name="book" className="text-xl text-white" />
                  </div>
                  <div>
                    <span className="font-extrabold text-base text-slate-900 leading-tight block tracking-tight">
                      {t("common:brand.title")}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {t("common:brand.tagline")}
                    </span>
                  </div>
                </Link>
              )}

              {/* Academic Badge */}
              {showAcademicBadge && (
                <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-lg border border-blue-200 bg-blue-50/60 text-blue-700 text-xs font-semibold ml-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span>{academicBadgeString}</span>
                </div>
              )}
            </div>

            {/* Center: Search Bar */}
            {showSearch && (
              <div className="hidden lg:flex items-center flex-1 max-w-sm mx-4">
                <Input
                  prefix={<Icon name="search" size={15} className="text-slate-400 mr-1.5" />}
                  placeholder={t("navigation:header.searchPlaceholder")}
                  name="search"
                  allowClear
                  className="rounded-lg bg-slate-50/80 border-[#f0f0f0] hover:border-blue-400 focus:bg-white w-full text-xs"
                />
              </div>
            )}

            {/* Right: Controls & User Profile */}
            <div className="flex items-center gap-3">
              {showLanguageSwitcher && (
                <div>
                  <LanguageSwitcher width={140} />
                </div>
              )}

              {showNotifications && (
                <button
                  type="button"
                  onClick={() => navigate(resolvedNoticesRoute)}
                  className="w-9 h-9 rounded-lg border border-[#f0f0f0] hover:border-blue-400 hover:bg-slate-50 flex items-center justify-center transition-all text-slate-600 relative cursor-pointer"
                  aria-label={t("navigation:header.notifications")}
                >
                  <Badge count={unreadNotificationsCount} overflowCount={99} offset={[-2, 2]}>
                    <Icon name="info" size={17} />
                  </Badge>
                </button>
              )}

              {showUserProfile && (
                <Dropdown
                  menu={{ items: userMenuItems }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl border border-[#f0f0f0] hover:border-blue-400 hover:bg-slate-50/80 transition-all cursor-pointer select-none group bg-white">
                    <Avatar
                      size={32}
                      src={user?.avatar_url?.trim() ? user.avatar_url : undefined}
                      className="border border-[#f0f0f0] shadow-2xs bg-blue-50 text-blue-600 font-bold"
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors block leading-tight max-w-32.5 truncate">
                        {displayName}
                      </span>
                      <span className="text-[11px] text-slate-400 block leading-tight font-medium max-w-32.5 truncate">
                        {userCode || roleTag}
                      </span>
                    </div>
                    <Icon
                      name="chevron-down"
                      size={13}
                      className="text-slate-400 group-hover:text-blue-600 transition-colors hidden sm:block ml-0.5"
                    />
                  </div>
                </Dropdown>
              )}
            </div>
          </div>
        </header>
      )}

      {/* 2. Main Content Area (Flexible width & class overrides) */}
      <main
        className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 ${
          fullWidth ? "max-w-none" : "max-w-7xl"
        } ${contentClassName}`}
      >
        {children || <Outlet />}
      </main>

      {/* 3. Footer (Configurable) */}
      {showFooter && (
        <footer className="bg-white border-t border-[#f0f0f0] py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">{t("common:brand.title")}</span>
              <span>—</span>
              <span>{t("common:footer.copyright")}</span>
            </div>
            {showSupportLink && (
              <span className="hover:text-blue-600 cursor-pointer font-medium transition-colors">
                {t("common:footer.technicalSupport")}
              </span>
            )}
          </div>
        </footer>
      )}
    </div>
  );
};
