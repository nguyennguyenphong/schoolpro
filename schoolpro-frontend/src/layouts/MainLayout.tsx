import React, { useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import type { MenuProps } from "antd";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { Badge } from "@/components/ui/Badge";
import { Tag } from "@/components/ui/Tag";
import { Drawer } from "@/components/ui/Drawer";
import { LanguageSwitcher } from "@/i18n";
import { Avatar } from "@/components/ui/Avatar";
import { useMainLayout } from "@/hooks/useMainLayout";
import type { UserModuleItem } from "@/shared/services/moduleService";

export interface MainLayoutProps {
  children?: React.ReactNode;

  // Header controls
  showHeader?: boolean;
  showMenuButton?: boolean;
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
 * Provides full responsive support, Ant Design drawer navigation,
 * dynamic API-driven module listing, and granular visibility toggles.
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showHeader = true,
  showMenuButton = true,
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
  const location = useLocation();

  // Local menu drawer state
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);

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
    modules,
  } = useMainLayout();

  const resolvedHomeRoute = homeRoute || routes.home;
  const resolvedNoticesRoute = notificationsRoute || routes.notices;
  const resolvedProfileRoute = profileRoute || routes.profile;
  const resolvedChangePasswordRoute = changePasswordRoute || routes.changePassword;
  const resolvedSettingsRoute = settingsRoute || routes.settings;

  const handleModuleClick = (moduleItem: UserModuleItem) => {
    closeMenu();
    navigate(moduleItem.route);
  };

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
      {/* 1. Header (Responsive & Configurable) */}
      {showHeader && (
        <header className="sticky top-0 z-40 bg-white border-b border-[#f0f0f0] shadow-2xs">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Menu Hamburger & Brand */}
            <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
              {showMenuButton && (
                <button
                  type="button"
                  onClick={openMenu}
                  aria-label="Open Navigation Menu"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[#f0f0f0] hover:border-blue-400 hover:bg-blue-50/60 active:scale-95 flex items-center justify-center transition-all text-slate-700 cursor-pointer shrink-0 shadow-2xs"
                  title="Danh sách chức năng"
                >
                  <Icon name="menu" size={20} className="text-slate-700 hover:text-blue-600" />
                </button>
              )}

              {showBrand && (
                <Link
                  to={resolvedHomeRoute}
                  className="flex items-center gap-2.5 sm:gap-3 no-underline group"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-500/25 border border-blue-700/20 shrink-0 group-hover:bg-blue-700 transition-colors">
                    <Icon name="book" className="text-lg sm:text-xl text-white" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight block tracking-tight">
                      {t("common:brand.title")}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium hidden sm:block">
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
            <div className="flex items-center gap-1.5 sm:gap-3">
              {showLanguageSwitcher && (
                <div className="hidden md:block">
                  <LanguageSwitcher width={130} />
                </div>
              )}

              {showNotifications && (
                <button
                  type="button"
                  onClick={() => navigate(resolvedNoticesRoute)}
                  className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-lg border border-[#f0f0f0] hover:border-blue-400 hover:bg-slate-50 flex items-center justify-center transition-all text-slate-600 relative cursor-pointer"
                  aria-label={t("navigation:header.notifications")}
                >
                  <Badge count={unreadNotificationsCount} overflowCount={99} offset={[-2, 2]}>
                    <Icon name="info" size={16} />
                  </Badge>
                </button>
              )}

              {showUserProfile && (
                <Dropdown
                  menu={{ items: userMenuItems }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <div className="flex items-center gap-2 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border border-[#f0f0f0] hover:border-blue-400 hover:bg-slate-50/80 transition-all cursor-pointer select-none group bg-white">
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

      {/* 2. Navigation Drawer (Ant Design Drawer with API-driven modules) */}
      <Drawer
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-2xs">
              <Icon name="book" size={16} />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm block leading-tight">
                {t("common:brand.title")}
              </span>
              <span className="text-[11px] text-slate-500 font-normal block leading-tight">
                Menu chức năng
              </span>
            </div>
          </div>
        }
        placement="left"
        onClose={closeMenu}
        open={isMenuOpen}
        width={320}
        styles={{
          body: {
            padding: "16px 20px 24px 20px",
            display: "flex",
            flexDirection: "column",
          },
          header: {
            padding: "16px 20px",
          },
        }}
      >
        <div className="flex flex-col h-full justify-between gap-4">
          <div className="space-y-4">
            {/* User Info Box */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
              <Avatar
                size={40}
                src={user?.avatar_url?.trim() ? user.avatar_url : undefined}
                className="bg-blue-600 text-white font-bold shrink-0"
              >
                {displayName.charAt(0).toUpperCase()}
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-slate-800 mb-0 truncate">
                    {displayName}
                  </h4>
                  <Tag color="blue" className="text-[10px] font-bold px-1 py-0 m-0">
                    {roleTag}
                  </Tag>
                </div>
                <p className="text-xs text-slate-500 mb-0 truncate">
                  {userCode ? `${userCode} • ` : ""}{subInfo}
                </p>
              </div>
            </div>

            {/* Modules Navigation Links */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-2">
                Danh mục chức năng
              </span>

              <nav className="space-y-1">
                {modules.map((item) => {
                  const isActive = location.pathname.startsWith(item.route);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleModuleClick(item)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-2xs"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Icon with colors from API */}
                        <span
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            isActive
                              ? "bg-blue-600 text-white shadow-2xs"
                              : item.iconBgColor || "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Icon
                            name={item.icon || "file"}
                            size={15}
                            className={!isActive && item.iconColor ? item.iconColor : undefined}
                          />
                        </span>
                        <span className="text-sm truncate">{item.name}</span>
                      </div>

                      {/* Badge with colors from API */}
                      {item.badgeText && (
                        <Tag
                          color={item.badgeColor || "blue"}
                          className="m-0 text-[10px] font-semibold px-1.5 py-0 shrink-0"
                        >
                          {item.badgeText}
                        </Tag>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Drawer Bottom Controls (Spaced with breathing room from bottom edge) */}
          <div className="pt-4 pb-4 sm:pb-6 border-t border-slate-200/80 space-y-3 mt-auto shrink-0">
            <div className="md:hidden">
              <span className="text-xs text-slate-500 font-medium block mb-1.5">
                Ngôn ngữ hệ thống
              </span>
              <LanguageSwitcher width="100%" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  navigate(resolvedProfileRoute);
                }}
                className="p-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-slate-50 flex items-center gap-1.5 text-slate-700 cursor-pointer justify-center transition-colors"
              >
                <Icon name="user" size={13} />
                <span>Hồ sơ</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  navigate(resolvedSettingsRoute);
                }}
                className="p-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-slate-50 flex items-center gap-1.5 text-slate-700 cursor-pointer justify-center transition-colors"
              >
                <Icon name="settings" size={13} />
                <span>Cài đặt</span>
              </button>
            </div>

            {/* Logout Button with bottom margin to prevent hugging bottom screen edge */}
            <div className="pt-1 mb-2">
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  logout();
                }}
                className="w-full p-2.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/80 text-rose-600 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                <Icon name="close" size={14} className="text-rose-600" />
                <span>{t("navigation:header.logout")}</span>
              </button>
            </div>
          </div>
        </div>
      </Drawer>

      {/* 3. Main Content Area (Flexible width & class overrides) */}
      <main
        className={`flex-1 w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 ${
          fullWidth ? "max-w-none" : "max-w-7xl"
        } ${contentClassName}`}
      >
        {children || <Outlet />}
      </main>

      {/* 4. Footer (Responsive & Configurable) */}
      {showFooter && (
        <footer className="bg-white border-t border-[#f0f0f0] py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-2 text-center sm:text-left">
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
