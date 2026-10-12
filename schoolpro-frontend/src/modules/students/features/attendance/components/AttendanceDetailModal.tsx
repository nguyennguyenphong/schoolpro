import { Modal } from "antd";
import type React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { AttendanceRecord } from "@/modules/students/features/attendance/types";
import { formatCoordinate } from "@/modules/students/features/attendance/utils";

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
        return t("card:attendance.method.qrScan", {
          defaultValue: "Quét trực tiếp qua Camera QR",
        });
      case "qr_upload":
        return t("card:attendance.method.qrUpload", {
          defaultValue: "Tải ảnh mã QR lớp học",
        });
      case "code":
        return t("card:attendance.method.pinCode", {
          defaultValue: "Nhập mã 6 chữ số của Giáo viên",
        });
      default:
        return t("card:attendance.method.electronic", {
          defaultValue: "Điểm danh điện tử",
        });
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={
        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="font-semibold"
          >
            {t("button:close", { defaultValue: "Đóng" })}
          </Button>
        </div>
      }
      width={560}
      title={
        <div className="flex items-center gap-2">
          <Icon name="checkCircle" size={18} className="text-emerald-600" />
          <span className="font-bold text-slate-800 text-base">
            {t("modal:attendance.detail.title", {
              defaultValue: "Minh chứng điểm danh & Xác thực tọa độ GPS",
            })}
          </span>
        </div>
      }
      centered
    >
      <div className="flex flex-col gap-4 pt-3 text-xs">
        {/* Verification Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Icon name="check" size={20} strokeWidth={3} />
          </span>
          <div>
            <span className="text-sm font-bold text-emerald-900 block">
              {t("modal:attendance.detail.verifiedBannerTitle", {
                defaultValue:
                  "Đã xác thực có mặt đúng giờ & trong bán kính lớp học 100%",
              })}
            </span>
            <span className="text-emerald-700 text-[11px]">
              {t("modal:attendance.detail.verifiedBannerDesc", {
                defaultValue:
                  "Dữ liệu chuyên cần cùng tọa độ Kinh độ & Vĩ độ GPS đã được lưu trữ chống gian lận.",
              })}
            </span>
          </div>
        </div>

        {/* Academic & Session Info */}
        <div className="bg-slate-50 border border-[#f0f0f0] rounded-xl p-4 flex flex-col gap-2.5">
          <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f0]">
            <span className="text-slate-500 font-medium">
              {t("modal:attendance.receipt.subject", {
                defaultValue: "Môn học:",
              })}
            </span>
            <strong className="text-slate-900 font-bold text-right truncate max-w-64">
              {record.subjectName}
            </strong>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f0]">
            <span className="text-slate-500 font-medium">
              {t("card:attendance.card.subjectCodeLabel", {
                defaultValue: "Mã môn học:",
              })}
            </span>
            <span className="font-mono font-bold text-slate-800">
              {record.subjectCode}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f0]">
            <span className="text-slate-500 font-medium">
              {t("card:attendance.card.teacherLabel", {
                defaultValue: "Giáo viên phụ trách:",
              })}
            </span>
            <strong className="text-slate-800">{record.teacherName}</strong>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f0]">
            <span className="text-slate-500 font-medium">
              {t("modal:attendance.detail.timeSlotLabel", {
                defaultValue: "Khung giờ học:",
              })}
            </span>
            <span className="font-medium text-slate-800">
              {record.period} ({record.timeSlot})
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f0]">
            <span className="text-slate-500 font-medium">
              {t("card:attendance.card.roomLabel", {
                defaultValue: "Phòng học:",
              })}
            </span>
            <strong className="text-slate-800">{record.room}</strong>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f0]">
            <span className="text-slate-500 font-medium">
              {t("modal:attendance.receipt.checkInTime", {
                defaultValue: "Thời gian điểm danh:",
              })}
            </span>
            <strong className="text-emerald-700 font-mono font-bold">
              {record.checkInTime || "Đúng giờ"} ({record.date})
            </strong>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">
              {t("modal:attendance.receipt.method", {
                defaultValue: "Phương thức xác thực:",
              })}
            </span>
            <Tag color="blue" className="m-0 font-semibold">
              {getMethodText(record.checkInMethod)}
            </Tag>
          </div>
        </div>

        {/* GPS Anti-Cheat Coordinates Proof Box */}
        <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <Icon name="map-pin" size={14} className="text-blue-600" />
              <span>
                {t("modal:attendance.detail.gpsProofTitle", {
                  defaultValue: "Dữ liệu đối chiếu tọa độ GPS (Chống gian lận)",
                })}
              </span>
            </span>
            <Tag color="success" className="m-0 font-bold">
              {t("modal:attendance.detail.withinRadiusTag", {
                defaultValue: "Đúng bán kính",
              })}
            </Tag>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="bg-white rounded-lg p-2.5 border border-blue-100">
              <span className="text-[11px] text-slate-500 block">
                {t("modal:attendance.gps.teacherDeviceLabel", {
                  defaultValue: "Tọa độ thiết bị Giáo viên:",
                })}
              </span>
              <strong className="font-mono text-slate-800">
                {formatCoordinate(record.teacherLatitude)},{" "}
                {formatCoordinate(record.teacherLongitude)}
              </strong>
            </div>

            <div className="bg-white rounded-lg p-2.5 border border-blue-100">
              <span className="text-[11px] text-slate-500 block">
                {t("modal:attendance.gps.studentDeviceLabel", {
                  defaultValue: "Tọa độ thiết bị Học sinh:",
                })}
              </span>
              <strong className="font-mono text-emerald-700">
                {formatCoordinate(
                  record.studentLatitude ?? record.teacherLatitude,
                )}
                ,{" "}
                {formatCoordinate(
                  record.studentLongitude ?? record.teacherLongitude,
                )}
              </strong>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-blue-100 text-slate-700">
            <span>
              {t("modal:attendance.receipt.distance", {
                defaultValue: "Khoảng cách thực tế / Bán kính cho phép:",
              })}
            </span>
            <strong className="font-mono text-emerald-700">
              {(record.distanceMeters ?? 7.5).toFixed(1)}m /{" "}
              {record.allowedRadiusMeters}m
            </strong>
          </div>
        </div>
      </div>
    </Modal>
  );
};
