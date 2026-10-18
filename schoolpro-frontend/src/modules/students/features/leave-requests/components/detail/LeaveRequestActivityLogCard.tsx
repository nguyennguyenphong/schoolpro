import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
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
  const { t } = useTranslation(["card", "button"]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const rawLogs = item.eventLogs || [];
  const logs = rawLogs.map((ev) => ({
    id: ev.id,
    time: formatDateTimeDisplay(ev.createdAt),
    title: ev.title,
    actor: ev.actor,
    badgeText: ev.badgeText || t("card:leaveRequests.detail.systemBadge"),
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

  if (logs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#f0f0f0] shadow-2xs space-y-4">
      {/* Header with expand/collapse trigger */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-4.5 rounded-full bg-slate-400 inline-block" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0">
            {t("card:leaveRequests.detail.activityLogCardTitle")}
          </h3>
          <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-medium">
            {t("card:leaveRequests.detail.eventsCount", { count: logs.length })}
          </span>
        </div>

        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-slate-600 hover:text-blue-600 flex items-center gap-1.5"
        >
          <span>
            {isExpanded
              ? t("card:leaveRequests.detail.toggleActivityLogHide")
              : t("card:leaveRequests.detail.toggleActivityLogShow", { count: logs.length })}
          </span>
          <Icon name={isExpanded ? "chevron-up" : "chevron-down"} size={14} />
        </Button>
      </div>

      {/* Expandable Timeline Content */}
      {isExpanded && (
        <div className="pt-2 border-t border-[#f0f0f0]">
          <div className="relative pl-4 space-y-3 pt-2 before:content-[''] before:absolute before:left-1.75 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {logs.map((log) => (
              <div key={log.id} className="relative pl-4">
                <span
                  className={`w-3 h-3 rounded-full border-2 border-white shadow-xs absolute -left-3.5 top-2.5 ${log.dotColor}`}
                />
                <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/70 space-y-1.5">
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
                      {t("card:leaveRequests.detail.performedBy")}{" "}
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
      )}
    </div>
  );
};
