import type React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { AttendanceSummary } from "@/modules/students/features/attendance/types";

interface AttendanceSummaryCardsProps {
  summary?: AttendanceSummary | null;
  loading?: boolean;
}

export const AttendanceSummaryCards: React.FC<AttendanceSummaryCardsProps> = ({
  summary,
  loading = false,
}) => {
  const { t } = useTranslation(["card"]);

  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="rounded-xl shadow-2xs border-[#f0f0f0] [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5"
          >
            <div className="animate-pulse">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/70 shrink-0" />
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <div className="h-8 sm:h-9 w-14 bg-slate-200 rounded-lg" />
                <div className="h-4 w-16 bg-slate-100 rounded" />
                <div className="ml-auto h-5.5 w-20 bg-slate-100 rounded-md" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="h-4 w-28 bg-slate-100 rounded" />
                <div className="h-4 w-20 bg-slate-100 rounded" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Tỷ lệ chuyên cần chung */}
      <Card className="rounded-xl border border-[#f0f0f0] shadow-2xs hover:border-blue-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t("card:attendance.summary.overallRateTitle", {
              defaultValue: "Tỷ lệ chuyên cần",
            })}
          </span>
          <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Icon name="userCheck" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 tracking-tight">
            {summary.overallRate}%
          </span>
          <Tag color="success" className="ml-auto m-0 font-bold">
            {t("card:attendance.summary.excellentBadge", {
              defaultValue: "Xuất sắc",
            })}
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            {t("card:attendance.summary.disciplineScoreLabel", {
              defaultValue: "Điểm chuyên cần:",
            })}{" "}
            <strong className="text-slate-800">
              {summary.disciplineScore}/100
            </strong>
          </span>
          <span className="text-emerald-600 font-semibold">
            {t("card:attendance.summary.gpsVerifiedLabel", {
              defaultValue: "Xác thực GPS",
            })}
          </span>
        </div>
      </Card>

      {/* 2. Lịch học trong ngày */}
      <Card className="rounded-xl border border-[#f0f0f0] shadow-2xs hover:border-indigo-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t("card:attendance.summary.todayScheduleTitle", {
              defaultValue: "Lịch học trong ngày",
            })}
          </span>
          <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
            <Icon name="calendar" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {summary.totalToday}
          </span>
          <span className="text-xs text-slate-400 font-semibold">
            {t("card:attendance.summary.subjectUnit", {
              defaultValue: "môn học",
            })}
          </span>
          <Tag color="processing" className="ml-auto m-0 font-semibold">
            {summary.semesterName || "Học kỳ 1"}
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            {t("card:attendance.summary.timeWindowLabel", {
              defaultValue: "Khung giờ:",
            })}{" "}
            <strong className="text-slate-700">07:30 - 16:45</strong>
          </span>
          <span className="text-slate-500">
            {t("card:attendance.summary.sessionsCount", {
              count: summary.totalToday,
              defaultValue: `${summary.totalToday} ca học`,
            })}
          </span>
        </div>
      </Card>

      {/* 3. Đã điểm danh hợp lệ */}
      <Card className="rounded-xl border border-[#f0f0f0] shadow-2xs hover:border-emerald-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t("card:attendance.summary.attendedTitle", {
              defaultValue: "Đã điểm danh",
            })}
          </span>
          <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Icon name="checkCircle" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tracking-tight">
            {summary.attendedToday}
          </span>
          <span className="text-xs text-slate-400 font-semibold">
            / {summary.totalToday}{" "}
            {t("card:attendance.summary.subjectUnit", {
              defaultValue: "môn học",
            })}
          </span>
          <Tag
            color={summary.attendedToday > 0 ? "success" : "default"}
            className="ml-auto m-0 font-semibold"
          >
            {summary.totalToday > 0
              ? `${Math.round((summary.attendedToday / summary.totalToday) * 100)}%`
              : "0%"}
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            {t("card:attendance.summary.onTimeLabel", {
              defaultValue: "Đúng giờ & Đúng vị trí:",
            })}{" "}
            <strong className="text-emerald-700">
              {summary.attendedToday}
            </strong>
          </span>
          <span className="text-emerald-600 font-medium">
            {t("card:attendance.summary.validStatus", {
              defaultValue: "Hợp lệ 100%",
            })}
          </span>
        </div>
      </Card>

      {/* 4. Cổng đang mở / Chờ điểm danh */}
      <Card className="rounded-xl border border-[#f0f0f0] shadow-2xs hover:border-amber-400 transition-all [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t("card:attendance.summary.pendingTitle", {
              defaultValue: "Cần điểm danh",
            })}
          </span>
          <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Icon name="clock" size={17} />
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
            {summary.pendingToday}
          </span>
          <span className="text-xs text-slate-400 font-semibold">
            {t("card:attendance.summary.pendingUnit", {
              defaultValue: "môn chờ xử lý",
            })}
          </span>
          {summary.pendingToday > 0 ? (
            <span className="ml-auto relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
          ) : (
            <Tag color="success" className="ml-auto m-0 font-semibold">
              {t("card:attendance.summary.completedTag", {
                defaultValue: "Hoàn tất",
              })}
            </Tag>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            {t("card:attendance.summary.absentOrExpiredLabel", {
              defaultValue: "Vắng / Quá hạn:",
            })}{" "}
            <strong
              className={
                summary.absentToday > 0 ? "text-rose-600" : "text-slate-700"
              }
            >
              {summary.absentToday}
            </strong>
          </span>
          <span className="text-amber-600 font-medium">
            {summary.openToday && summary.openToday > 0
              ? t("card:attendance.summary.openCountLabel", {
                  count: summary.openToday,
                  defaultValue: `${summary.openToday} môn đang mở`,
                })
              : t("card:attendance.summary.waitingForTeacher", {
                  defaultValue: "Theo lịch học",
                })}
          </span>
        </div>
      </Card>
    </div>
  );
};
