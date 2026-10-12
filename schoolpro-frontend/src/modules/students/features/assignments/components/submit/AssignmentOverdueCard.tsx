import React from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

interface AssignmentOverdueCardProps {
  assignment: AssignmentItem;
  onRequestReopen: () => void;
}

export const AssignmentOverdueCard: React.FC<AssignmentOverdueCardProps> = ({
  assignment,
  onRequestReopen,
}) => {
  const { t } = useTranslation(["card", "button"]);

  return (
    <div className="p-4 sm:p-5 border border-rose-200 bg-rose-50/30 rounded-xl space-y-3.5">
      {/* 1. Header Alert Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-rose-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
            <Icon name="lock" size={17} />
          </div>
          <div>
            <span className="font-bold text-rose-950 text-sm block">
              {t("card:assignments.detail.overdueLockedTitle")}
            </span>
            <span className="text-xs text-rose-700">
              {t("card:assignments.detail.overdueEndedAt", {
                dueDate: assignment.dueDate,
              })}
            </span>
          </div>
        </div>
        <Tag color="error" className="m-0 font-semibold self-start sm:self-auto">
          {t("card:assignments.statusLabels.overdue")}
        </Tag>
      </div>

      <p className="text-xs text-slate-600 mb-0 leading-relaxed">
        {t("card:assignments.detail.overdueLockedDesc")}
      </p>

      {/* 2. Reopen Request Status Preview if already sent */}
      {assignment.reopenRequest && (
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs space-y-1.5 mt-4">
          <div className="flex items-center justify-between font-bold text-amber-900">
            <span className="flex items-center gap-1.5">
              <Icon name="clock" size={13} className="text-amber-600" />
              <span>{t("card:assignments.detail.reopenSentTitle")}</span>
            </span>
            <Tag color="warning" className="m-0 text-[10px]">
              {t("card:assignments.detail.reopenWaitingTag")}
            </Tag>
          </div>
          <p className="text-slate-600 mb-0">
            {t("card:assignments.detail.reopenSentMeta", {
              email: assignment.reopenRequest.teacherEmail,
              time: assignment.reopenRequest.requestedAt,
            })}
          </p>
          <div className="p-2.5 bg-white rounded border border-amber-200 text-slate-700 italic mt-2">
            "{assignment.reopenRequest.reason}"
          </div>
        </div>
      )}

      {/* 3. Action Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-rose-200/60">
        <span className="text-[11px] text-slate-500 italic">
          {t("card:assignments.detail.overdueEmailHint")}
        </span>
        <Button variant="primary" onClick={onRequestReopen}>
          <Icon name="mail" size={13} className="mr-1.5" />
          {assignment.reopenRequest
            ? t("button:resendReopenRequest")
            : t("button:requestReopenPort")}
        </Button>
      </div>
    </div>
  );
};
