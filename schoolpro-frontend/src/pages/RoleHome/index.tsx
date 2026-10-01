import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Card, Tag, message } from "antd";
import { useAuthStore } from "@/shared/store/useAuthStore";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";

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
  const navigate = useNavigate();
  const { user, roleDetail, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    message.success("Đã đăng xuất thành công!");
    navigate("/login");
  };

  const displayName = user?.name || "Người dùng SchoolPro";
  const displayEmail = user?.email || "user@schoolpro.edu.vn";
  const roleName = roleDetail?.name || roleTitle;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            SP
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 leading-tight">SchoolPro</h1>
            <p className="text-xs text-slate-400 font-medium leading-none">Cổng thông tin quản lý giáo dục</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Tag color={roleBadgeColor} className="px-3 py-1 font-semibold rounded-full border-none">
            {roleName}
          </Tag>
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
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
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 hover:border-rose-300"
          >
            <Icon name="arrow-right" size={14} />
            <span className="hidden sm:inline">Đăng xuất</span>
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
        {/* Welcome Banner */}
        <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-6 md:p-8 text-white mb-8 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-medium tracking-wide">
                <Icon name={roleIcon} size={14} />
                <span>Không gian làm việc</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Xin chào, {displayName}!
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
                Xem hướng dẫn
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hoverable className="rounded-xl border-slate-200 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Icon name="calendar" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-base mb-1">Lịch biểu & Kế hoạch</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-3">
                  Theo dõi lịch làm việc, giảng dạy và các sự kiện được phân công trong tuần.
                </p>
                <span className="text-blue-600 text-xs font-semibold hover:underline cursor-pointer">
                  Khám phá ngay →
                </span>
              </div>
            </div>
          </Card>

          <Card hoverable className="rounded-xl border-slate-200 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <Icon name="mail" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-base mb-1">Thông báo & Tin nhắn</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-3">
                  Cập nhật các thông báo mới nhất từ nhà trường và bộ môn liên quan.
                </p>
                <span className="text-emerald-600 text-xs font-semibold hover:underline cursor-pointer">
                  Xem 3 tin mới →
                </span>
              </div>
            </div>
          </Card>

          <Card hoverable className="rounded-xl border-slate-200 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
                <Icon name="file" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-base mb-1">Hồ sơ & Tài liệu</h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-3">
                  Quản lý hồ sơ công tác, biểu mẫu điện tử và báo cáo định kỳ.
                </p>
                <span className="text-purple-600 text-xs font-semibold hover:underline cursor-pointer">
                  Tra cứu hồ sơ →
                </span>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};
