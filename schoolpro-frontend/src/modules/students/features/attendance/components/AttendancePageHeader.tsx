import type React from "react";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { AttendanceSummary } from "@/modules/students/features/attendance/types";

interface AttendancePageHeaderProps {
  summary: AttendanceSummary | null;
  loading: boolean;
  isRealtimeConnected: boolean;
  onOpenTeacherConfig: () => void;
  onRefresh: () => void;
}

export const AttendancePageHeader: React.FC<AttendancePageHeaderProps> = ({
  summary,
  loading,
  isRealtimeConnected,
  onOpenTeacherConfig,
  onRefresh,
}) => {
  const { t } = useTranslation(["navigation", "card", "button"]);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs flex flex-col gap-2.5">
      <Breadcrumb
        items={[
          {
            href: "/student/home",
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                <Icon
                  name="home"
                  size={13}
                  className="text-slate-400 shrink-0"
                />
                <span>{t("navigation:breadcrumb.home")}</span>
              </span>
            ),
          },
          {
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                <Icon
                  name="userCheck"
                  size={13}
                  className="text-blue-600 shrink-0"
                />
                <span>
                  {t("navigation:breadcrumb.attendance", {
                    defaultValue: "Điểm danh môn học",
                  })}
                </span>
              </span>
            ),
          },
        ]}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
              {t("navigation:pageTitle.attendance", {
                defaultValue: "Điểm danh môn học theo ngày",
              })}
            </h1>

            {summary?.className ? (
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {t("card:attendance.header.classBadge", {
                  className: summary.className,
                  defaultValue: `Lớp ${summary.className}`,
                })}
              </span>
            ) : loading ? (
              <span className="inline-block w-16 h-5 bg-slate-100 rounded-full animate-pulse" />
            ) : null}

            {summary?.semesterName ? (
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-[#f0f0f0]">
                {summary.semesterName}
                {summary.academicYear ? ` • ${summary.academicYear}` : ""}
              </span>
            ) : loading ? (
              <span className="inline-block w-28 h-5 bg-slate-100 rounded-full animate-pulse" />
            ) : null}

            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                isRealtimeConnected
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                  : "text-blue-700 bg-blue-50 border-blue-200"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isRealtimeConnected ? "bg-emerald-400" : "bg-blue-400"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isRealtimeConnected ? "bg-emerald-500" : "bg-blue-500"
                  }`}
                />
              </span>
              <span>
                {isRealtimeConnected
                  ? t("card:attendance.header.realtimeConnected", {
                      defaultValue: "Trực tuyến thời gian thực",
                    })
                  : t("card:attendance.header.realtimeSyncing", {
                      defaultValue: "Đồng bộ tự động",
                    })}
              </span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            {t("navigation:pageSubtitle.attendance", {
              defaultValue:
                "Điểm danh chống gian lận 100% qua Mã 6 chữ số hoặc Quét/Tải ảnh mã QR kết hợp xác thực tọa độ Kinh độ & Vĩ độ GPS theo bán kính thiết bị Giáo viên.",
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={onRefresh}
            className="font-semibold text-xs flex items-center gap-1.5"
          >
            <Icon name="refresh" size={14} />
            <span>
              {t("button:refresh", {
                defaultValue: "Làm mới",
              })}
            </span>
          </Button>

          <Button
            variant="primary"
            onClick={onOpenTeacherConfig}
            className="font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs"
          >
            <Icon name="keyRound" size={15} />
            <span>
              {t("button:openTeacherAttendanceConfig", {
                defaultValue: "Tạo mã 6 số & Bán kính (Giáo viên)",
              })}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};
