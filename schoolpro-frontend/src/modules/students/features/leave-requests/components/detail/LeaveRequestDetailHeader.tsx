import { Popconfirm } from "antd";
import type React from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { LeaveRequestItem } from "@/modules/students/features/leave-requests/types";
import {
  LEAVE_STATUS_COLORS,
  LEAVE_STATUS_LABELS,
  LEAVE_TYPE_COLORS,
  LEAVE_TYPE_LABELS,
  SESSION_SHIFT_LABELS,
  formatDateTimeDisplay,
  formatLeaveDateRange,
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
                <span>Trang chủ</span>
              </span>
            ),
          },
          {
            href: "/student/leave-requests",
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                <Icon name="file-text" size={13} className="text-slate-400 shrink-0" />
                <span>Xin nghỉ phép</span>
              </span>
            ),
          },
          {
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                <span>Chi tiết & Tiến trình xử lý</span>
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
              Chi tiết đơn xin nghỉ phép
            </h1>
            {item.code && (
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                Mã đơn: {item.code}
              </span>
            )}
            <Tag
              color={LEAVE_TYPE_COLORS[item.leaveType] || "blue"}
              className="m-0 text-xs font-semibold px-2.5 py-0.5"
            >
              {LEAVE_TYPE_LABELS[item.leaveType] || "Xin nghỉ phép"}
            </Tag>
            <Tag
              color={LEAVE_STATUS_COLORS[item.status] || "default"}
              className="m-0 text-xs font-bold px-2.5 py-0.5"
            >
              {LEAVE_STATUS_LABELS[item.status] || item.status}
            </Tag>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>
              Thời gian nghỉ:{" "}
              <strong className="text-slate-800">
                {formatLeaveDateRange(item.startDate, item.endDate)}
              </strong>{" "}
              ({item.totalDays} ngày • {SESSION_SHIFT_LABELS[item.sessionShift] || "Cả ngày"})
            </span>
            <span>•</span>
            <span>
              Lớp: <strong className="text-slate-700">{item.className}</strong>
            </span>
            <span>•</span>
            <span>
              Gửi lúc: <strong className="text-slate-700">{formatDateTimeDisplay(item.createdAt)}</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button variant="outline" onClick={onBack} className="text-xs sm:text-sm">
            <Icon name="arrow-left" size={14} />
            <span>Quay lại</span>
          </Button>

          <Button
            variant="primary"
            onClick={onDownloadPdf}
            loading={downloading}
            disabled={downloading}
            className="text-xs sm:text-sm font-semibold"
          >
            <Icon name="download" size={14} />
            <span>Tải đơn (PDF)</span>
          </Button>

          {isPending && (
            <>
              <Button variant="outline" onClick={onEdit} className="text-xs sm:text-sm">
                <Icon name="edit" size={14} />
                <span>Chỉnh sửa</span>
              </Button>

              <Popconfirm
                title="Xác nhận xóa đơn xin nghỉ phép?"
                description="Đơn xin nghỉ phép chưa duyệt này sẽ bị xóa vĩnh viễn."
                okText="Xóa đơn"
                cancelText="Hủy"
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
                  <span>Xóa đơn</span>
                </Button>
              </Popconfirm>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
