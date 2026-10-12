import React, { useState, useRef } from "react";
import { Modal, message } from "antd";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { OTP } from "@/components/ui/Input";
import type {
  AttendanceRecord,
  CheckInPayload,
  CheckInResult,
} from "@/modules/students/features/attendance/types";

interface AttendanceModalProps {
  open: boolean;
  record: AttendanceRecord | null;
  onClose: () => void;
  onSubmitCheckIn: (payload: CheckInPayload) => Promise<CheckInResult>;
  submitting?: boolean;
}

type MainTab = "qr" | "code";
type QrSubMode = "camera" | "upload";

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  open,
  record,
  onClose,
  onSubmitCheckIn,
  submitting = false,
}) => {
  const [mainTab, setMainTab] = useState<MainTab>("qr");
  const [qrSubMode, setQrSubMode] = useState<QrSubMode>("camera");

  // Code state
  const [enteredCode, setEnteredCode] = useState<string>("");

  // Upload image state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera mock stream state
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Success state
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<AttendanceRecord | null>(null);

  const handleReset = () => {
    setIsSuccess(false);
    setSuccessResult(null);
    setEnteredCode("");
    setSelectedImage(null);
    setSelectedImageName("");
    setIsScanning(false);
  };

  if (!record) return null;

  // Handle Code submission
  const handleSubmitCode = async (codeToSubmit?: string) => {
    const code = codeToSubmit ?? enteredCode;
    if (!code || !code.trim()) {
      message.warning("Vui lòng nhập mã code do giáo viên cung cấp.");
      return;
    }

    const res = await onSubmitCheckIn({
      recordId: record.id,
      method: "code",
      code: code.trim(),
    });

    if (res.success) {
      setIsSuccess(true);
      setSuccessResult(res.record || null);
    }
  };

  // Handle Mock QR Camera Scan
  const handleScanSampleQr = async () => {
    setIsScanning(true);
    setTimeout(async () => {
      setIsScanning(false);
      const res = await onSubmitCheckIn({
        recordId: record.id,
        method: "qr_scan",
        qrData: record.qrToken,
      });

      if (res.success) {
        setIsSuccess(true);
        setSuccessResult(res.record || null);
      }
    }, 700);
  };

  // Handle File Image Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        message.error("Vui lòng tải lên tệp định dạng hình ảnh (PNG, JPG, JPEG, WebP).");
        return;
      }
      setSelectedImageName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setSelectedImage(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Upload Image Check-in
  const handleSubmitUploadedQr = async () => {
    if (!selectedImage) {
      message.warning("Vui lòng chọn hoặc tải lên tệp ảnh mã QR trước.");
      return;
    }

    setIsScanning(true);
    setTimeout(async () => {
      setIsScanning(false);
      const res = await onSubmitCheckIn({
        recordId: record.id,
        method: "qr_upload",
        qrData: record.qrToken,
        imageName: selectedImageName,
      });

      if (res.success) {
        setIsSuccess(true);
        setSuccessResult(res.record || null);
      }
    }, 600);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      afterClose={handleReset}
      footer={null}
      width={620}
      title={null}
      destroyOnHidden
      centered
      className="p-0"
    >
      {/* 1. Modal Top Banner */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-5 text-white relative rounded-xl mt-7">
        <div className="flex items-start justify-between gap-3 pr-8">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 block">
              Phiên điểm danh trực tuyến
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mb-0 leading-snug">
              {record.subjectName}
            </h2>
            <div className="flex items-center gap-3 text-xs text-blue-100 flex-wrap pt-1">
              <span>{record.period} ({record.timeSlot})</span>
              <span>•</span>
              <span>{record.room}</span>
              <span>•</span>
              <span>Giáo viên: {record.teacherName}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* ================= SUCCESS STATE ================= */}
        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Icon name="check" size={32} strokeWidth={3} />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 mb-0">
                Điểm danh thành công!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Chuyên cần của em cho buổi học này đã được hệ thống ghi nhận chính thức.
              </p>
            </div>

            {/* Receipt Box */}
            <div className="bg-slate-50 border border-[#f0f0f0] rounded-xl p-4 text-xs space-y-2.5 max-w-md mx-auto text-left">
              <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f0]">
                <span className="text-slate-500 font-medium">Môn học:</span>
                <strong className="text-slate-900 font-bold text-right truncate max-w-64">
                  {record.subjectName}
                </strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Thời gian ghi nhận:</span>
                <strong className="text-emerald-700 font-mono font-bold">
                  {successResult?.checkInTime || "Vừa xong"} (Đúng giờ)
                </strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Hình thức xác thực:</span>
                <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {successResult?.checkInMethod === "qr_scan"
                    ? "Quét trực tiếp QR Camera"
                    : successResult?.checkInMethod === "qr_upload"
                    ? "Tải ảnh mã QR"
                    : "Mã Code giáo viên"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#f0f0f0]">
                <span className="text-slate-500 font-medium">Trạng thái:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <Icon name="checkCircle" size={13} className="text-emerald-600" />
                  <span>Hợp lệ • Có mặt</span>
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                onClick={onClose}
                className="w-full sm:w-auto font-bold px-8 shadow-xs"
              >
                Hoàn tất & Đóng
              </Button>
            </div>
          </div>
        ) : (
          /* ================= MAIN CHECK-IN INTERACTION ================= */
          <div className="space-y-4">
            {/* Main Tabs: 2 Hình thức (Quét/Upload QR vs Nhập Code) */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-[#f0f0f0]">
              <button
                type="button"
                onClick={() => setMainTab("qr")}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mainTab === "qr"
                    ? "bg-white text-blue-700 shadow-xs border border-[#f0f0f0]"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon name="qrCode" size={17} />
                <span>Quét mã / Tải ảnh QR</span>
              </button>

              <button
                type="button"
                onClick={() => setMainTab("code")}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mainTab === "code"
                    ? "bg-white text-blue-700 shadow-xs border border-[#f0f0f0]"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon name="keyRound" size={17} />
                <span>Nhập mã Code</span>
              </button>
            </div>

            {/* TAB CONTENT 1: QR CODE (Camera scan or Upload image) */}
            {mainTab === "qr" && (
              <div className="space-y-4">
                {/* Sub-mode switch: Camera vs Upload File */}
                <div className="flex items-center justify-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setQrSubMode("camera")}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      qrSubMode === "camera"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Icon name="camera" size={14} />
                    <span>Quét trực tiếp qua Camera</span>
                  </button>

                  <span className="text-slate-300">|</span>

                  <button
                    type="button"
                    onClick={() => setQrSubMode("upload")}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      qrSubMode === "upload"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Icon name="upload" size={14} />
                    <span>Tải ảnh mã QR lên</span>
                  </button>
                </div>

                {/* Sub-mode 1.1: Live Camera Scanner */}
                {qrSubMode === "camera" && (
                  <div className="space-y-3">
                    <div className="relative w-full h-64 sm:h-72 rounded-xl bg-slate-900 overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
                      {/* Viewfinder Overlay */}
                      <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-xl border-2 border-white/40 flex items-center justify-center">
                        {/* 4 Corner Markers */}
                        <span className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-blue-500 rounded-tl-md" />
                        <span className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-blue-500 rounded-tr-md" />
                        <span className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-blue-500 rounded-bl-md" />
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-blue-500 rounded-br-md" />

                        {/* Moving Laser Beam */}
                        <div className="absolute inset-x-2 h-0.5 bg-linear-to-r from-blue-400 via-emerald-400 to-blue-400 shadow-[0_0_12px_#3b82f6] animate-pulse" />

                        {/* Center QR Hint Icon */}
                        <Icon name="qrCode" size={64} className="text-white/20" />
                      </div>

                      {/* Camera Status Label */}
                      <div className="absolute bottom-3 inset-x-0 flex justify-center">
                        <span className="bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-medium px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Camera đang sẵn sàng. Hướng ống kính vào mã QR</span>
                        </span>
                      </div>
                    </div>

                    {/* Camera Quick Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
                      <div className="text-[11px] text-slate-400 text-center sm:text-left">
                        * Quét mã QR do giáo viên chiếu tại lớp học
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          variant="primary"
                          onClick={handleScanSampleQr}
                          loading={isScanning || submitting}
                          className="w-full sm:w-auto font-bold flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Icon name="scan" size={15} />
                          <span>Quét thử mã QR mẫu</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-mode 1.2: Upload Image File */}
                {qrSubMode === "upload" && (
                  <div className="space-y-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    {selectedImage ? (
                      /* Image Preview Box */
                      <div className="border border-[#f0f0f0] rounded-xl p-4 bg-slate-50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                              <Icon name="image" size={16} />
                            </span>
                            <div className="truncate max-w-xs">
                              <span className="text-xs font-bold text-slate-800 block truncate">
                                {selectedImageName}
                              </span>
                              <span className="text-[11px] text-emerald-600 font-semibold">
                                ✓ Đã sẵn sàng nhận diện QR
                              </span>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-semibold"
                          >
                            Đổi ảnh khác
                          </Button>
                        </div>

                        {/* Thumbnail */}
                        <div className="h-44 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center">
                          <img
                            src={selectedImage}
                            alt="Mã QR điểm danh"
                            className="h-full w-full object-contain"
                          />
                        </div>

                        {/* Submit Button */}
                        <Button
                          variant="primary"
                          onClick={handleSubmitUploadedQr}
                          loading={isScanning || submitting}
                          className="w-full font-bold flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Icon name="check" size={15} />
                          <span>Xác nhận điểm danh từ ảnh</span>
                        </Button>
                      </div>
                    ) : (
                      /* Drag & Drop Upload Zone */
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/40 rounded-xl p-8 text-center cursor-pointer transition-all space-y-3"
                      >
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                          <Icon name="upload" size={24} />
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 mb-0">
                            Bấm để chọn ảnh hoặc kéo thả ảnh mã QR vào đây
                          </p>
                          <p className="text-[11px] text-slate-400 mb-0">
                            Hỗ trợ định dạng PNG, JPG, JPEG, WebP từ điện thoại hoặc màn hình chụp
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="font-semibold text-xs inline-flex items-center gap-1.5"
                        >
                          <Icon name="image" size={14} />
                          <span>Duyệt ảnh từ thiết bị</span>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: ENTER CODE (OTP / Secret Code from teacher) */}
            {mainTab === "code" && (
              <div className="space-y-4 py-2">
                <div className="text-center space-y-1">
                  <span className="text-xs font-bold text-slate-700">
                    Nhập mã số điểm danh gồm 6 ký tự
                  </span>
                  <p className="text-[11px] text-slate-400 mb-0">
                    Giáo viên bộ môn sẽ thông báo hoặc hiển thị mã số này trên bảng
                  </p>
                </div>

                {/* 6-digit Code input with modern large font */}
                <div className="flex justify-center py-2">
                  <OTP
                    length={6}
                    value={enteredCode}
                    onChange={(val) => setEnteredCode(val)}
                    className="font-bold"
                    size="large"
                    autoFocus
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button variant="outline" onClick={onClose} disabled={submitting}>
                    Hủy bỏ
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleSubmitCode()}
                    loading={submitting}
                    disabled={enteredCode.length < 4}
                    className="font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <Icon name="check" size={15} />
                    <span>Xác nhận điểm danh</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
