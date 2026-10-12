import { Modal } from "antd";
import type React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { AttendanceRecord } from "@/modules/students/features/attendance/types";

interface AttendanceDetailModalProps {
  open: boolean;
  record: AttendanceRecord | null;
  onClose: () => void;
}

export const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({
  open,
  record,
  onClose,
}) => {
  const { t } = useTranslation(["modal", "card", "button"]);

  if (!record) return null;

  const getMethodText = (method?: string) => {
    switch (method) {
      case "qr_scan":
        return t("card:attendance.method.qrScan");
      case "qr_upload":
        return t("card:attendance.method.qrUpload");
      case "code":
        return t("card:attendance.method.pinCode");
      default:
        return t("card:attendance.method.electronic");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={
        <div className="flex justify-end gap-2 pt-2">
          {record.leaveRequestId && (
            <Button
              variant="primary"
              href={`/student/leave-requests/${record.leaveRequestId}`}
            >
              <Icon name="file-text" size={14} />
              <span>{t("button:viewLeaveRequest")}</span>
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            {t("button:close")}
          </Button>
        </div>
      }
      width={480}
      title={
        <div className="flex items-center gap-2">
          <Icon name="checkCircle" size={18} className="text-emerald-600" />
          <span className="font-bold text-slate-800 text-base">
            {t("modal:attendance.detail.title")}
          </span>
        </div>
      }
      centered
    >
      <div className="flex flex-col gap-3 pt-2 text-xs">
        <div className="bg-slate-50 border border-[#f0f0f0] rounded-xl p-4 flex flex-col gap-2.5">
          <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f0]">
            <span className="text-slate-500">
              {t("modal:attendance.receipt.subject")}
            </span>
            <strong className="text-slate-900 font-bold text-right">
              {record.subjectName}
            </strong>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f0]">
            <span className="text-slate-500">
              {t("modal:attendance.detail.timeSlotLabel")}
            </span>
            <span className="font-medium text-slate-800">
              {record.period} ({record.timeSlot})
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f0]">
            <span className="text-slate-500">
              {t("card:attendance.card.roomLabel")}
            </span>
            <strong className="text-slate-800">
              {record.room}
              {record.building ? ` • ${record.building}` : ""}
            </strong>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f0]">
            <span className="text-slate-500">
              {t("card:attendance.card.teacherLabel")}
            </span>
            <strong className="text-slate-800">{record.teacherName}</strong>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f0]">
            <span className="text-slate-500">
              {t("modal:attendance.receipt.checkInTime")}
            </span>
            <strong className="text-emerald-700">
              {record.checkInTime || t("modal:attendance.detail.onTime")}
            </strong>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f0]">
            <span className="text-slate-500">
              {t("modal:attendance.receipt.method")}
            </span>
            <Tag color="blue" className="m-0 font-semibold">
              {getMethodText(record.checkInMethod)}
            </Tag>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">
              {t("modal:attendance.receipt.status")}
            </span>
            <Tag color="success" className="m-0 font-semibold">
              {record.distanceMeters !== null &&
              record.distanceMeters !== undefined
                ? t("modal:attendance.detail.validDistanceBadge", {
                    distance: record.distanceMeters.toFixed(1),
                    radius: record.allowedRadiusMeters,
                  })
                : t("modal:attendance.gps.validTag")}
            </Tag>
          </div>
        </div>
      </div>
    </Modal>
  );
};
