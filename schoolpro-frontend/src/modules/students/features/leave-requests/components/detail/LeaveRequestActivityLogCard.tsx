import type React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";
import { formatDateTimeDisplay } from "@/modules/students/features/leave-requests/utils";

interface LeaveRequestActivityLogCardProps {
  item: LeaveRequestItem;
}

const mapBadgeColorToDot = (color?: string): string => {
  switch (color) {
    case "success":
      return "bg-emerald-600";
    case "error":
      return "bg-rose-600";
    case "warning":
      return "bg-amber-500";
    case "purple":
      return "bg-purple-600";
    case "cyan":
      return "bg-cyan-600";
    default:
      return "bg-blue-600";
  }
};

export const LeaveRequestActivityLogCard: React.FC<LeaveRequestActivityLogCardProps> = ({
  item,
}) => {
  const { t } = useTranslation("card");

  const logs = (item.eventLogs || []).map((ev) => ({
    id: ev.id,
    time: formatDateTimeDisplay(ev.createdAt),
    title: ev.title,
    actor: ev.actor,
    badgeText: ev.badgeText || t("leaveRequests.detail.systemBadge"),
    badgeColor: (ev.badgeColor || "blue") as
      | "blue"
      | "cyan"
      | "purple"
      | "success"
      | "warning"
      | "error"
      | "default",
    dotColor: mapBadgeColorToDot(ev.badgeColor),
    recipientEmail: ev.recipientEmail || "",
    description: ev.description,
  }));

  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-emerald-600 inline-block" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0">
            {t("leaveRequests.detail.activityLogCardTitle")}
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {t("leaveRequests.detail.eventsCount", { count: logs.length })}
        </span>
      </div>

      <div className="relative pl-4 space-y-3 before:content-[''] before:absolute before:left-1.75 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {logs.map((log) => (
          <div key={log.id} className="relative pl-4">
            <span
              className={`w-3 h-3 rounded-full border-2 border-white shadow-xs absolute -left-3.5 top-1.5 ${log.dotColor}`}
            />
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-900">{log.title}</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Tag color={log.badgeColor} className="m-0 text-[10px] font-semibold">
                    {log.badgeText}
                  </Tag>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600">
                    <Icon name="clock" size={11} className="text-blue-600 shrink-0" />
                    <span>{log.time}</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                <span>
                  {t("leaveRequests.detail.performedBy")}{" "}
                  <strong className="text-slate-700">{log.actor}</strong>
                </span>
                {log.recipientEmail && (
                  <span className="text-blue-600 font-medium">{log.recipientEmail}</span>
                )}
              </div>

              {log.description && (
                <p className="text-xs text-slate-600 leading-relaxed mb-0 pt-0.5">
                  {log.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
