import React from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon/types";
import type {
  AssignmentEventLogItem,
  AssignmentItem,
} from "@/modules/students/features/assignments/types";

interface AssignmentOverdueLogProps {
  assignment: AssignmentItem;
  embedded?: boolean;
}

interface LogEventItem {
  id: string;
  time: string;
  title: string;
  description: React.ReactNode;
  tagText: string;
  tagColor: "default" | "processing" | "success" | "warning" | "error";
  iconName: IconName;
  iconBgClass: string;
  iconTextClass: string;
}

export const AssignmentOverdueLog: React.FC<AssignmentOverdueLogProps> = ({
  assignment,
  embedded = false,
}) => {
  const { t } = useTranslation(["card"]);

  const mapBackendEvent = (item: AssignmentEventLogItem): LogEventItem => {
    switch (item.eventType) {
      case "ASSIGNED":
        return {
          id: item.id,
          time: item.createdAt,
          title: item.title || t("card:assignments.detail.stepAssigned"),
          description: item.description,
          tagText: t("card:assignments.detail.stepAssigned"),
          tagColor: "processing",
          iconName: "file-text",
          iconBgClass: "bg-blue-100 text-blue-700 border border-blue-200",
          iconTextClass: "text-blue-700",
        };
      case "DEADLINE_EXTENDED":
        return {
          id: item.id,
          time: item.createdAt,
          title: item.title,
          description: item.description,
          tagText: t("card:assignments.card.extendedBadge", { level: 1 }),
          tagColor: "warning",
          iconName: "clock",
          iconBgClass: "bg-amber-100 text-amber-700 border border-amber-200",
          iconTextClass: "text-amber-700",
        };
      case "SUBMITTED":
      case "RESUBMITTED":
        return {
          id: item.id,
          time: item.createdAt,
          title: item.title,
          description: item.description,
          tagText: t("card:assignments.statusLabels.submitted"),
          tagColor: "processing",
          iconName: "upload",
          iconBgClass: "bg-indigo-100 text-indigo-700 border border-indigo-200",
          iconTextClass: "text-indigo-700",
        };
      case "GRADED":
        return {
          id: item.id,
          time: item.createdAt,
          title: item.title,
          description: item.description,
          tagText: t("card:assignments.statusLabels.graded"),
          tagColor: "success",
          iconName: "check",
          iconBgClass: "bg-emerald-100 text-emerald-700 border border-emerald-200",
          iconTextClass: "text-emerald-700",
        };
      case "REOPEN_REQUESTED":
        return {
          id: item.id,
          time: item.createdAt,
          title: item.title,
          description: item.description,
          tagText: t("card:assignments.detail.reopenWaitingTag"),
          tagColor: "warning",
          iconName: "mail",
          iconBgClass: "bg-amber-100 text-amber-700 border border-amber-200",
          iconTextClass: "text-amber-700",
        };
      case "DUE_EXPIRED":
      default:
        return {
          id: item.id,
          time: item.createdAt,
          title: item.title || t("card:assignments.detail.overdueLockedTitle"),
          description: item.description,
          tagText: t("card:assignments.detail.expiredTag"),
          tagColor: "error",
          iconName: "lock",
          iconBgClass: "bg-rose-100 text-rose-700 border border-rose-200",
          iconTextClass: "text-rose-700",
        };
    }
  };

  let events: LogEventItem[] = [];

  if (assignment.eventLogs && assignment.eventLogs.length > 0) {
    events = assignment.eventLogs
      .filter((item) => item.eventType !== "APPEAL_SUBMITTED")
      .map(mapBackendEvent);
  } else {
    events = [
      {
        id: "event-assigned",
        time: assignment.assignedDate,
        title: t("card:assignments.detail.stepAssigned"),
        description: `${t("card:assignments.detail.eventActorPrefix")} ${assignment.teacherName}`,
        tagText: t("card:assignments.detail.stepAssigned"),
        tagColor: "processing",
        iconName: "file-text",
        iconBgClass: "bg-blue-100 text-blue-700 border border-blue-200",
        iconTextClass: "text-blue-700",
      },
    ];

    if (assignment.status === "overdue") {
      events.push({
        id: "event-due",
        time: assignment.dueDate,
        title: t("card:assignments.detail.overdueLockedTitle"),
        description: t("card:assignments.detail.overdueLockedDesc"),
        tagText: t("card:assignments.detail.expiredTag"),
        tagColor: "error",
        iconName: "lock",
        iconBgClass: "bg-rose-100 text-rose-700 border border-rose-200",
        iconTextClass: "text-rose-700",
      });
    }
  }

  const timelineContent = (
    <div className="relative pl-1 pr-1 pt-1 space-y-4">
      {events.map((event, index) => {
        const isFinal = index === events.length - 1;

        return (
          <div key={event.id} className="relative flex items-start gap-3 sm:gap-4 group">
            {!isFinal && (
              <div
                className="absolute left-4 top-8 -bottom-4 w-0.5 bg-slate-200 group-hover:bg-blue-300 transition-colors"
                aria-hidden="true"
              />
            )}

            <div
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-transform ${event.iconBgClass}`}
            >
              <Icon name={event.iconName} size={14} className={event.iconTextClass} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="bg-slate-50/70 border border-[#f0f0f0]/80 rounded-xl p-3 sm:p-3.5 space-y-1.5 transition-colors hover:bg-slate-50 hover:border-slate-300">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="text-xs font-bold text-slate-800">{event.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <Icon name="clock" size={11} className="text-slate-400" />
                      <span>{event.time}</span>
                    </span>
                    <Tag color={event.tagColor} className="m-0 font-semibold text-[10px]">
                      {event.tagText}
                    </Tag>
                  </div>
                </div>

                <div className="text-xs text-slate-600 leading-relaxed">
                  {event.description}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (embedded) {
    return timelineContent;
  }

  return (
    <div className="p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
          <h3 className="text-base font-bold text-slate-900 mb-0">
            {t("card:assignments.detail.eventLogTitle")}
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          {t("card:assignments.detail.eventLogSubtitle")}
        </span>
      </div>

      {timelineContent}
    </div>
  );
};
