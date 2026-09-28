import React from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { Avatar, message } from "antd";
import type { MenuProps } from "antd";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { Badge } from "@/components/ui/Badge";
import { Tag } from "@/components/ui/Tag";
import { LanguageSwitcher } from "@/i18n";
import { useAuthStore } from "@/shared/store/useAuthStore";

export const StudentLayout: React.FC = () => {
  const { t } = useTranslation(["common", "student"]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const studentName = user?.name || "Nguyễn Văn An";
  const studentCode = "SV202688";
  const studentFaculty = "Khoa CNTT • KTPM K23";

  const handleLogout = () => {
    logout();
    message.success(t("common:status.success"));
    navigate("/login");
  };

  const navItems = [
    {
      key: "home",
      label: t("student:home.title"),
      path: "/student/home",
      icon: "book" as const,
    },
    {
      key: "dashboard",
      label: t("student:dashboard.title"),
      path: "/student/dashboard",
      icon: "chart" as const,
    },
    {
      key: "timetable",
      label: t("student:features.timetable.title"),
      path: "/student/timetable",
      icon: "calendar" as const,
    },
    {
      key: "notices",
      label: t("student:features.announcements.title"),
      path: "/student/notices",
      icon: "info" as const,
    },
    {
      key: "assignments",
      label: t("student:features.assignments.title"),
      path: "#assignments",
      icon: "edit" as const,
      onClick: () => message.info(t("student:features.assignments.title")),
    },
    {
      key: "materials",
      label: t("student:features.materials.title"),
      path: "#materials",
      icon: "download" as const,
      onClick: () => message.info(t("student:features.materials.title")),
    },
    {
      key: "gradebook",
      label: t("student:features.gradebook.title"),
      path: "#grades",
      icon: "file" as const,
      onClick: () => message.info(t("student:features.gradebook.title")),
    },
    {
      key: "evaluations",
      label: t("student:features.evaluations.title"),
      path: "#evaluations",
      icon: "settings" as const,
      onClick: () => message.info(t("student:features.evaluations.title")),
    },
  ];

  const userMenuItems: MenuProps["items"] = [
    {
      key: "user-info",
      disabled: true,
      label: (
        <div className="py-2 px-2 border-b border-slate-100 min-w-52.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-slate-800 text-sm">{studentName}</span>
            <Tag color="blue" className="text-[10px] font-bold px-1.5 py-0 mr-0">
              SV
            </Tag>
          </div>
          <p className="text-xs text-slate-500 mb-0.5">
            {t("student:header.studentId")}: <strong>{studentCode}</strong>
          </p>
          <p className="text-[11px] text-slate-400 mb-0">{studentFaculty}</p>
        </div>
      ),
    },
    {
      key: "profile",
      icon: <Icon name="user" size={15} />,
      label: t("student:header.profile"),
      onClick: () => message.info(t("student:header.profile")),
    },
    {
      key: "changePassword",
      icon: <Icon name="password" size={15} />,
      label: t("student:header.changePassword"),
      onClick: () => navigate("/forgot-password"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <Icon name="close" size={15} className="text-red-500" />,
      danger: true,
      label: t("student:header.logout"),
      onClick: handleLogout,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 shrink-0">
            <Link
              to="/student/home"
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

            {/* Academic Semester Badge (Bordered) */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-lg border border-blue-200 bg-blue-50/60 text-blue-700 text-xs font-semibold ml-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>HK1 • 2026-2027 • Tuần 4</span>
            </div>
          </div>

          {/* Center: Search Bar (Bordered) */}
          <div className="hidden lg:flex items-center flex-1 max-w-sm mx-4">
            <Input
              prefix={<Icon name="search" size={15} className="text-slate-400 mr-1.5" />}
              placeholder={t("student:header.searchPlaceholder")}
              className="rounded-lg bg-slate-50/80 border-slate-200 hover:border-blue-400 focus:bg-white w-full text-xs"
            />
          </div>

          {/* Right: Controls & User Profile (Bordered) */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div>
              <LanguageSwitcher width={140} />
            </div>

            {/* Notifications Button (Bordered) */}
            <button
              type="button"
              onClick={() => navigate("/student/notices")}
              className="w-9 h-9 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-slate-50 flex items-center justify-center transition-all text-slate-600 relative cursor-pointer"
              aria-label={t("student:header.notifications")}
            >
              <Badge count={3} offset={[-2, 2]}>
                <Icon name="info" size={17} />
              </Badge>
            </button>

            {/* User Profile Card Dropdown (Bordered) */}
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50/80 transition-all cursor-pointer select-none group bg-white">
                <Avatar
                  size={32}
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                  className="border border-slate-200 shadow-2xs"
                />
                <div className="hidden md:block text-left">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors block leading-tight">
                    {studentName}
                  </span>
                  <span className="text-[11px] text-slate-400 block leading-tight font-medium">
                    {studentCode}
                  </span>
                </div>
                <Icon
                  name="chevron-down"
                  size={13}
                  className="text-slate-400 group-hover:text-blue-600 transition-colors hidden sm:block ml-0.5"
                />
              </div>
            </Dropdown>
          </div>
        </div>
      </header>

      {/* 2. Sub-Navigation Bar (Bordered) */}
      <nav aria-label="Student portal navigation" className="bg-white border-b border-slate-200 overflow-x-auto shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            if (item.onClick) {
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.onClick}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  <Icon name={item.icon} size={14} className="text-slate-400" />
                  <span>{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.key}
                to={item.path}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all no-underline ${
                  isActive
                    ? "border border-blue-300 bg-blue-50 text-blue-700 shadow-2xs"
                    : "border border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Icon
                  name={item.icon}
                  size={14}
                  className={isActive ? "text-blue-600" : "text-slate-400"}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 3. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* 4. Footer (Bordered) */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">{t("common:brand.title")}</span>
            <span>—</span>
            <span>{t("common:footer.copyright")}</span>
          </div>
          <span className="hover:text-blue-600 cursor-pointer font-medium transition-colors">
            {t("common:footer.technicalSupport")}
          </span>
        </div>
      </footer>
    </div>
  );
};
