import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon/types";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";
import { formatDateTimeDisplay } from "@/modules/students/features/leave-requests/utils";

interface LeaveRequestActivityLogCardProps {
  item: LeaveRequestItem;
  embedded?: boolean;
  defaultExpanded?: boolean;
}

interface TimelineMarkerConfig {
  bgClass: string;
  iconName: IconName;
}

/**
 * Resolves theme color and status icon for timeline markers based on event characteristics.
 * Supported themes: success (approved), error (rejected), warning/in-progress (pending),
 * notification (email/alerts), and request submission.
 */
const getTimelineMarkerConfig = (
  badgeColor?: string,
  eventType?: string
): TimelineMarkerConfig => {
  const normType = (eventType || "").toUpperCase();
  const normColor = (badgeColor || "").toLowerCase();

  // Success / Approved
  if (
    normColor === "success" ||
    normType === "APPROVED" ||
    normType === "AUTO_APPROVED" ||
    normType === "LEAVE_REQUEST_REVIEWED"
  ) {
    return {
      bgClass: "bg-emerald-600 text-white",
      iconName: "check",
    };
  }

  // Rejected / Error
  if (normColor === "error" || normType === "REJECTED") {
    return {
      bgClass: "bg-rose-600 text-white",
      iconName: "close",
    };
  }

  // Cancelled
  if (normType === "CANCELLED" || normColor === "default") {
    return {
      bgClass: "bg-slate-500 text-white",
      iconName: "close",
    };
  }

  // Processing / Pending / In-progress
  if (normColor === "warning" || normType.includes("PENDING")) {
    return {
      bgClass: "bg-amber-500 text-white",
      iconName: "clock",
    };
  }

  // Notification / Email delivery
  if (
    normColor === "purple" ||
    normColor === "cyan" ||
    normType.includes("NOTIF") ||
    normType.includes("EMAIL")
  ) {
    return {
      bgClass: normColor === "purple" ? "bg-purple-600 text-white" : "bg-cyan-600 text-white",
      iconName: "send",
    };
  }

  // Created / Submitted
  if (normType === "CREATED" || normType === "LEAVE_REQUEST_CREATED") {
    return {
      bgClass: "bg-blue-600 text-white",
      iconName: "fileText",
    };
  }

  // Fallback by badgeColor
  switch (normColor) {
    case "success":
      return { bgClass: "bg-emerald-600 text-white", iconName: "check" };
    case "error":
      return { bgClass: "bg-rose-600 text-white", iconName: "close" };
    case "warning":
      return { bgClass: "bg-amber-500 text-white", iconName: "clock" };
    case "purple":
      return { bgClass: "bg-purple-600 text-white", iconName: "send" };
    case "cyan":
      return { bgClass: "bg-cyan-600 text-white", iconName: "send" };
    default:
      return { bgClass: "bg-blue-600 text-white", iconName: "clock" };
  }
};

export const LeaveRequestActivityLogCard: React.FC<LeaveRequestActivityLogCardProps> = ({
  item,
  embedded = false,
  defaultExpanded = false,
}) => {
  const { t } = useTranslation(["card", "button"]);
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded || embedded);

  const rawLogs = item.eventLogs || [];
  const logs = rawLogs.map((ev) => ({
    id: ev.id,
    time: formatDateTimeDisplay(ev.createdAt),
    title: ev.title,
    actor: ev.actor,
    marker: getTimelineMarkerConfig(ev.badgeColor, ev.eventType),
    recipientEmail: ev.recipientEmail || "",
    description: ev.description,
  }));

  if (logs.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
        {t("card:leaveRequests.detail.noAttachments")}
      </div>
    );
  }

  return (
    <div
      className={
        embedded
          ? "space-y-4 pt-1"
          : "bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-4"
      }
    >
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
          <div className="relative pl-8 space-y-3.5 pt-2 before:content-[''] before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
            {logs.map((log) => (
              <div key={log.id} className="relative">
                {/* Timeline Dot Marker with status icon */}
                <div
                  className={`w-8 h-8 rounded-full border-2 border-white shadow-xs absolute -left-9 top-3 flex items-center justify-center shrink-0 ${log.marker.bgClass}`}
                >
                  <Icon name={log.marker.iconName} size={15} strokeWidth={3} />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/70 space-y-1.5">
                  {/* Header Row: Title on the left, Log time on the right */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {log.title}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 shrink-0">
                      <Icon name="clock" size={11} className="text-blue-600 shrink-0" />
                      <span>{log.time}</span>
                    </span>
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
