import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Popconfirm } from "@/components/ui/Popconfirm";
import { Tag } from "@/components/ui/Tag";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";
import {
  LEAVE_STATUS_COLORS,
  getLeaveStatusLabel,
} from "@/modules/students/features/leave-requests/utils/leaveRequestHelpers";

interface LeaveRequestWorkspaceCardProps {
  item: LeaveRequestItem;
  printing?: boolean;
  deleting?: boolean;
  onPrint: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const LeaveRequestWorkspaceCard: React.FC<LeaveRequestWorkspaceCardProps> = ({
  item,
  printing = false,
  deleting = false,
  onPrint,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation(["card", "button", "modal"]);

  const isPending = item.status === "pending";
  const hasAttachments =
    (item.attachments && item.attachments.length > 0) || Boolean(item.supportingDocumentUrl);

  return (
    <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-5">
      {/* 1. Header with accent bar and status tag */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#f0f0f0]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
          <h3 className="text-base font-bold text-slate-900 mb-0">
            {t("card:leaveRequests.detail.workspaceTitle")}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Tag
            color={LEAVE_STATUS_COLORS[item.status] || "default"}
            className="m-0 text-xs font-bold px-2.5 py-0.5"
          >
            {getLeaveStatusLabel(item.status)}
          </Tag>
        </div>
      </div>

      {/* 2. Primary Actions Toolbar */}
      <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 block">
            {t("card:leaveRequests.detail.workspaceActionsLabel")}
          </span>
          <span className="text-[11px] text-slate-500">
            {t("card:leaveRequests.detail.workspaceSubtitle")}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <Button
            variant="primary"
            onClick={onPrint}
            loading={printing}
            disabled={printing}
            className="text-xs sm:text-sm font-semibold"
          >
            <Icon name="print" size={14} />
            <span>{t("button:printLeaveRequest")}</span>
          </Button>

          {isPending && (
            <>
              <Button
                variant="outline"
                onClick={onEdit}
                className="text-xs sm:text-sm font-semibold"
              >
                <Icon name="edit" size={14} />
                <span>{t("button:edit")}</span>
              </Button>

              <Popconfirm
                title={t("modal:deleteLeaveRequestConfirmTitle")}
                description={t("modal:deleteLeaveRequestConfirmDesc")}
                okText={t("button:deleteLeaveRequest")}
                cancelText={t("button:cancel")}
                okButtonProps={{ danger: true, loading: deleting }}
                onConfirm={onDelete}
              >
                <Button
                  variant="danger"
                  disabled={deleting}
                  loading={deleting}
                  className="text-xs sm:text-sm font-semibold"
                >
                  <Icon name="delete" size={14} />
                  <span>{t("button:deleteLeaveRequest")}</span>
                </Button>
              </Popconfirm>
            </>
          )}
        </div>
      </div>

      {/* 3. Attached Supporting Documents */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-slate-700 block">
          {t("card:leaveRequests.detail.workspaceAttachmentsLabel")}
        </span>

        {hasAttachments ? (
          <div className="space-y-2">
            {item.attachments && item.attachments.length > 0 ? (
              item.attachments.map((att, idx) => (
                <div
                  key={att.id || idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/90 border border-slate-200/80 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Icon name="paperclip" size={15} />
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-900 block truncate">
                        {att.name}
                      </span>
                      {att.size && (
                        <span className="text-slate-400 text-[11px]">{att.size}</span>
                      )}
                    </div>
                  </div>

                  {att.url && (
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 font-semibold shrink-0 ml-2 hover:underline"
                    >
                      <span>{t("button:openAttachment")}</span>
                      <Icon name="external-link" size={12} />
                    </a>
                  )}
                </div>
              ))
            ) : item.supportingDocumentUrl ? (
              <a
                href={item.supportingDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs font-semibold text-blue-700 hover:bg-blue-50"
              >
                <span className="inline-flex items-center gap-2">
                  <Icon name="paperclip" size={15} />
                  <span>{t("card:leaveRequests.detail.supportingDocumentDefault")}</span>
                </span>
                <Icon name="external-link" size={13} />
              </a>
            ) : null}
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 text-xs text-slate-500 text-center">
            {t("card:leaveRequests.detail.noAttachments")}
          </div>
        )}
      </div>
    </div>
  );
};
