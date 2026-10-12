import type React from "react";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Popconfirm } from "@/components/ui/Popconfirm";
import { Tag } from "@/components/ui/Tag";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";
import {
  LEAVE_STATUS_COLORS,
  formatDateTimeDisplay,
  getLeaveStatusLabel,
} from "@/modules/students/features/leave-requests/utils/leaveRequestHelpers";

interface LeaveRequestDetailHeaderProps {
  item: LeaveRequestItem;
  downloading: boolean;
  deleting: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDownloadPdf: () => void;
  onDelete: () => void;
}

export const LeaveRequestDetailHeader: React.FC<LeaveRequestDetailHeaderProps> = ({
  item,
  downloading,
  deleting,
  onBack,
  onEdit,
  onDownloadPdf,
  onDelete,
}) => {
  const { t } = useTranslation(["navigation", "card", "button", "modal"]);
  const isPending = item.status === "pending";

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
      <Breadcrumb
        items={[
          {
            href: "/student/home",
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                <Icon name="home" size={13} className="text-slate-400 shrink-0" />
                <span>{t("navigation:breadcrumb.home")}</span>
              </span>
            ),
          },
          {
            href: "/student/leave-requests",
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                <Icon name="file-text" size={13} className="text-slate-400 shrink-0" />
                <span>{t("navigation:breadcrumb.leaveRequests")}</span>
              </span>
            ),
          },
          {
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                <span>{t("navigation:breadcrumb.leaveRequestDetail")}</span>
              </span>
            ),
          },
        ]}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
              {t("navigation:pageTitle.leaveRequestDetail")}
            </h1>
            {item.code && (
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                {t("card:leaveRequests.detail.requestCodeBadge", { code: item.code })}
              </span>
            )}
            <Tag
              color={LEAVE_STATUS_COLORS[item.status] || "default"}
              className="m-0 text-xs font-bold px-2.5 py-0.5"
            >
              {getLeaveStatusLabel(item.status)}
            </Tag>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span>
              {t("card:leaveRequests.detail.submittedAtPrefix")}{" "}
              <strong className="text-slate-700 font-mono">
                {formatDateTimeDisplay(item.createdAt)}
              </strong>
            </span>
            <span>•</span>
            <span>
              {t("card:leaveRequests.detail.classPrefix")}{" "}
              <strong className="text-slate-700">{item.className}</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button variant="outline" onClick={onBack} className="text-xs sm:text-sm">
            <Icon name="arrow-left" size={14} />
            <span>{t("button:back")}</span>
          </Button>

          <Button
            variant="primary"
            onClick={onDownloadPdf}
            loading={downloading}
            disabled={downloading}
            className="text-xs sm:text-sm font-semibold"
          >
            <Icon name="download" size={14} />
            <span>{t("button:downloadLeaveRequestPdf")}</span>
          </Button>

          {isPending && (
            <>
              <Button variant="outline" onClick={onEdit} className="text-xs sm:text-sm">
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
    </div>
  );
};
