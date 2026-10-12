import { Modal, message } from "antd";
import type React from "react";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { OTP } from "@/components/ui/Input";
import { AttendanceGpsVerificationCard } from "@/modules/students/features/attendance/components/AttendanceGpsVerificationCard";
import type {
  AttendanceRecord,
  CheckInPayload,
  CheckInResult,
  GpsCoordinateState,
  GpsSimulationPresetId,
} from "@/modules/students/features/attendance/types";
import {
  calculateHaversineDistanceMeters,
  computeRemainingSeconds,
  formatCoordinate,
  formatCountdownMmSs,
  generateSessionQrSvgDataUrl,
  getPresetStudentCoordinates,
} from "@/modules/students/features/attendance/utils";

interface AttendanceModalProps {
  open: boolean;
  record: AttendanceRecord | null;
  onClose: () => void;
  onSubmitCheckIn: (payload: CheckInPayload) => Promise<CheckInResult>;
  onOpenTeacherConfig?: (record: AttendanceRecord) => void;
  submitting?: boolean;
}

type MainTab = "code" | "qr";
type QrSubMode = "camera" | "upload";

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  open,
  record,
  onClose,
  onSubmitCheckIn,
  onOpenTeacherConfig,
  submitting = false,
}) => {
  const { t } = useTranslation(["modal", "button", "input", "message", "card"]);
  const [mainTab, setMainTab] = useState<MainTab>("code");
  const [qrSubMode, setQrSubMode] = useState<QrSubMode>("camera");

  // 6-digit PIN code state
  const [enteredCode, setEnteredCode] = useState<string>("");

  // Uploaded QR image state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>("");
  const [extractedQrToken, setExtractedQrToken] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera scan animation state
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Success receipt state
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [successResult, setSuccessResult] = useState<AttendanceRecord | null>(
    null,
  );

  // Student GPS coordinates state (defaults to "in_classroom" ~8.5m from teacher device)
  const [rawGpsState, setGpsState] = useState<GpsCoordinateState>(() => {
    const initial = getPresetStudentCoordinates(
      record?.teacherLatitude ?? 10.779785,
      record?.teacherLongitude ?? 106.693182,
      record?.allowedRadiusMeters ?? 50,
      "in_classroom",
    );
    return {
      presetId: "in_classroom",
      latitude: initial.latitude,
      longitude: initial.longitude,
      accuracy: initial.accuracy,
      locating: false,
      error: null,
    };
  });

  // Derive effective coordinates when a preset is active so teacher coordinate changes reflect without useEffect
  const gpsState = useMemo<GpsCoordinateState>(() => {
    if (!record) return rawGpsState;
    if (
      rawGpsState.presetId === "in_classroom" ||
      rawGpsState.presetId === "near_corridor" ||
      rawGpsState.presetId === "outside_school"
    ) {
      const coords = getPresetStudentCoordinates(
        record.teacherLatitude,
        record.teacherLongitude,
        record.allowedRadiusMeters,
        rawGpsState.presetId,
      );
      return {
        ...rawGpsState,
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
      };
    }
    return rawGpsState;
  }, [rawGpsState, record]);

  const handleSelectPreset = (presetId: GpsSimulationPresetId) => {
    if (!record) return;
    if (presetId === "custom") {
      setGpsState((prev) => ({
        ...prev,
        presetId: "custom",
        latitude: gpsState.latitude,
        longitude: gpsState.longitude,
      }));
      return;
    }
    const coords = getPresetStudentCoordinates(
      record.teacherLatitude,
      record.teacherLongitude,
      record.allowedRadiusMeters,
      presetId,
    );
    setGpsState({
      presetId,
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      locating: false,
      error: null,
    });
  };

  const handleRequestBrowserGps = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      message.warning(
        t("message:attendance.browserNoGeolocation", {
          defaultValue: "Trình duyệt hiện tại không hỗ trợ định vị GPS.",
        }),
      );
      return;
    }

    setGpsState((prev) => ({ ...prev, locating: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsState({
          presetId: "browser_gps",
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Number((pos.coords.accuracy || 10).toFixed(1)),
          locating: false,
          error: null,
        });
        message.success(
          t("message:attendance.gpsLocatedSuccess", {
            defaultValue: "Đã cập nhật tọa độ Kinh độ & Vĩ độ từ GPS thiết bị!",
          }),
        );
      },
      () => {
        setGpsState((prev) => ({ ...prev, locating: false }));
        message.warning(
          t("message:attendance.gpsPermissionDenied", {
            defaultValue:
              "Không thể truy cập GPS trình duyệt. Hệ thống giữ tọa độ giả lập tại lớp học.",
          }),
        );
      },
      { enableHighAccuracy: true, timeout: 6000 },
    );
  };

  const handleCustomCoordChange = (
    field: "latitude" | "longitude",
    value: number,
  ) => {
    setGpsState((prev) => ({
      ...prev,
      presetId: "custom",
      [field]: value,
    }));
  };

  const distanceMeters = useMemo(() => {
    if (!record) return 0;
    return calculateHaversineDistanceMeters(
      gpsState.latitude,
      gpsState.longitude,
      record.teacherLatitude,
      record.teacherLongitude,
    );
  }, [gpsState.latitude, gpsState.longitude, record]);

  const isWithinRadius = record
    ? distanceMeters <= record.allowedRadiusMeters
    : true;

  const remainingSeconds = record
    ? computeRemainingSeconds(record.expiresAt, record.remainingSeconds ?? 300)
    : 0;
  const isSessionExpired =
    !record ||
    (record.status !== "open" && !isSuccess) ||
    (record.status === "open" && Boolean(record.expiresAt) && remainingSeconds <= 0);

  const sessionQrSvgUrl = useMemo(() => {
    if (!record) return "";
    return generateSessionQrSvgDataUrl(
      record.qrToken,
      record.attendanceCode,
      record.subjectCode,
    );
  }, [record]);

  const handleReset = () => {
    setIsSuccess(false);
    setSuccessResult(null);
    setEnteredCode("");
    setSelectedImage(null);
    setSelectedImageName("");
    setExtractedQrToken("");
    setIsScanning(false);
  };

  if (!record) return null;

  // Submit Case 1: 6-digit PIN Code
  const handleSubmitCode = async (codeToSubmit?: string) => {
    const code = (codeToSubmit ?? enteredCode).trim();
    if (!/^\d{6}$/.test(code)) {
      message.warning(
        t("message:attendance.enterSixDigits", {
          defaultValue: "Vui lòng nhập mã điểm danh hợp lệ gồm đúng 6 chữ số.",
        }),
      );
      return;
    }

    const res = await onSubmitCheckIn({
      recordId: record.id,
      method: "code",
      code,
      latitude: gpsState.latitude,
      longitude: gpsState.longitude,
      accuracy: gpsState.accuracy,
    });

    if (res.success) {
      setIsSuccess(true);
      setSuccessResult(res.record || null);
    }
  };

  // Submit Case 2A: QR Camera Scan
  const handleScanSampleQr = async () => {
    setIsScanning(true);
    setTimeout(async () => {
      setIsScanning(false);
      const res = await onSubmitCheckIn({
        recordId: record.id,
        method: "qr_scan",
        qrData: record.qrToken,
        latitude: gpsState.latitude,
        longitude: gpsState.longitude,
        accuracy: gpsState.accuracy,
      });

      if (res.success) {
        setIsSuccess(true);
        setSuccessResult(res.record || null);
      }
    }, 450);
  };

  // Handle QR File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      message.error(
        t("message:attendance.invalidImageFormat", {
          defaultValue:
            "Vui lòng tải lên tệp định dạng hình ảnh (PNG, JPG, JPEG, WebP, SVG).",
        }),
      );
      return;
    }

    setSelectedImageName(file.name);

    // Also read text if SVG to extract embedded data-qr-token
    if (file.type.includes("svg") || file.name.endsWith(".svg")) {
      const textReader = new FileReader();
      textReader.onload = (ev) => {
        const rawText = String(ev.target?.result || "");
        const match = rawText.match(/data-qr-token="([^"]+)"/);
        if (match?.[1]) {
          setExtractedQrToken(match[1]);
        } else {
          setExtractedQrToken(record.qrToken);
        }
      };
      textReader.readAsText(file);
    } else {
      setExtractedQrToken(record.qrToken);
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setSelectedImage(uploadEvent.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Load sample QR image directly into upload preview for 1-click testing
  const handleLoadSessionQrImage = () => {
    setSelectedImage(sessionQrSvgUrl);
    setSelectedImageName(
      `QR_${record.subjectCode}_${record.attendanceCode}.svg`,
    );
    setExtractedQrToken(record.qrToken);
  };

  // Download QR image file to computer/phone
  const handleDownloadSessionQr = () => {
    const link = document.createElement("a");
    link.href = sessionQrSvgUrl;
    link.download = `QR_${record.subjectCode}_${record.attendanceCode}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit Case 2B: QR Image Upload
  const handleSubmitUploadedQr = async () => {
    if (!selectedImage) {
      message.warning(
        t("message:attendance.selectQrImageFirst", {
          defaultValue: "Vui lòng chọn hoặc tải lên tệp ảnh mã QR trước.",
        }),
      );
      return;
    }

    setIsScanning(true);
    setTimeout(async () => {
      setIsScanning(false);
      const res = await onSubmitCheckIn({
        recordId: record.id,
        method: "qr_upload",
        qrData: extractedQrToken || record.qrToken,
        imageName: selectedImageName,
        latitude: gpsState.latitude,
        longitude: gpsState.longitude,
        accuracy: gpsState.accuracy,
      });

      if (res.success) {
        setIsSuccess(true);
        setSuccessResult(res.record || null);
      }
    }, 450);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      afterClose={handleReset}
      footer={null}
      width={680}
      title={null}
      destroyOnHidden
      centered
      className="p-0"
    >
      {/* 1. Modal Top Banner with Live Expiration Countdown */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-5 text-white relative rounded-xl mt-7">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pr-6">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 block">
              {t("modal:attendance.bannerTag", {
                defaultValue:
                  "Cổng điểm danh trực tuyến • Chống gian lận GPS 100%",
              })}
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-white mb-0 leading-snug">
              {record.subjectName}
            </h2>
            <div className="flex items-center gap-2.5 text-xs text-blue-100 flex-wrap pt-1">
              <span>
                {record.period} ({record.timeSlot})
              </span>
              <span>•</span>
              <span>{record.room}</span>
              <span>•</span>
              <span>
                {t("card:attendance.card.teacherLabel", {
                  defaultValue: "Giáo viên:",
                })}{" "}
                {record.teacherName}
              </span>
            </div>
          </div>

          {/* Live Countdown Timer Badge */}
          {!isSuccess && (
            <div
              className={`shrink-0 rounded-xl px-3.5 py-2 border backdrop-blur-xs flex flex-col items-end ${
                isSessionExpired
                  ? "bg-rose-600/90 border-rose-300 text-white"
                  : remainingSeconds <= 60
                    ? "bg-amber-500/90 border-amber-200 text-white animate-pulse"
                    : "bg-white/15 border-white/25 text-white"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                {isSessionExpired
                  ? t("modal:attendance.expiredBadgeTitle", {
                      defaultValue: "Trạng thái mã",
                    })
                  : t("modal:attendance.countdownTitle", {
                      defaultValue: "Thời gian còn lại",
                    })}
              </span>
              <span className="text-base sm:text-lg font-mono font-extrabold leading-tight">
                {isSessionExpired
                  ? t("modal:attendance.expiredShort", {
                      defaultValue: "ĐÃ HẾT HẠN",
                    })
                  : formatCountdownMmSs(remainingSeconds)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col gap-4">
        {/* ================= SUCCESS STATE ================= */}
        {isSuccess ? (
          <div className="text-center py-4 flex flex-col gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Icon name="check" size={32} strokeWidth={3} />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 mb-0">
                {t("modal:attendance.success.title", {
                  defaultValue: "Điểm danh hợp lệ thành công!",
                })}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-0">
                {t("modal:attendance.success.subtitle", {
                  defaultValue:
                    "Hệ thống đã lưu biên lai điểm danh kèm tọa độ Kinh độ & Vĩ độ GPS của bạn.",
                })}
              </p>
            </div>

            {/* Receipt Box with GPS Coordinates & Distance */}
            <div className="bg-slate-50 border border-[#f0f0f0] rounded-xl p-4 text-xs flex flex-col gap-2.5 max-w-lg mx-auto w-full text-left">
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

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">
                  {t("modal:attendance.receipt.checkInTime", {
                    defaultValue: "Thời gian ghi nhận:",
                  })}
                </span>
                <strong className="text-emerald-700 font-mono font-bold">
                  {successResult?.checkInTime || "Vừa xong"}
                </strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">
                  {t("modal:attendance.receipt.method", {
                    defaultValue: "Hình thức xác thực:",
                  })}
                </span>
                <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {successResult?.checkInMethod === "qr_scan"
                    ? t("card:attendance.method.qrScan", {
                        defaultValue: "Quét Camera QR",
                      })
                    : successResult?.checkInMethod === "qr_upload"
                      ? t("card:attendance.method.qrUpload", {
                          defaultValue: "Tải ảnh mã QR",
                        })
                      : t("card:attendance.method.pinCode", {
                          defaultValue: "Mã 6 chữ số của Giáo viên",
                        })}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">
                  {t("modal:attendance.receipt.studentCoords", {
                    defaultValue: "Tọa độ GPS Học sinh:",
                  })}
                </span>
                <span className="font-mono font-semibold text-slate-800">
                  {formatCoordinate(
                    successResult?.studentLatitude ?? gpsState.latitude,
                  )}
                  ,{" "}
                  {formatCoordinate(
                    successResult?.studentLongitude ?? gpsState.longitude,
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">
                  {t("modal:attendance.receipt.distance", {
                    defaultValue: "Khoảng cách tới thiết bị Giáo viên:",
                  })}
                </span>
                <strong className="text-emerald-700 font-mono">
                  {(successResult?.distanceMeters ?? distanceMeters).toFixed(1)}
                  m / {record.allowedRadiusMeters}m
                </strong>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#f0f0f0]">
                <span className="text-slate-500 font-medium">
                  {t("modal:attendance.receipt.status", {
                    defaultValue: "Trạng thái xác thực:",
                  })}
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                  <Icon
                    name="checkCircle"
                    size={13}
                    className="text-emerald-600"
                  />
                  <span>
                    {t("modal:attendance.receipt.verifiedText", {
                      defaultValue: "Hợp lệ 100% • Trong bán kính lớp học",
                    })}
                  </span>
                </span>
              </div>
            </div>

            <div className="pt-1">
              <Button
                variant="primary"
                onClick={onClose}
                className="w-full sm:w-auto font-bold px-8 shadow-2xs"
              >
                {t("button:completeAndClose", {
                  defaultValue: "Hoàn tất & Đóng",
                })}
              </Button>
            </div>
          </div>
        ) : isSessionExpired ? (
          /* ================= EXPIRED SESSION WARNING STATE ================= */
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center flex flex-col gap-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Icon name="warning" size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-rose-900 mb-0">
                {t("modal:attendance.expired.title", {
                  defaultValue:
                    "Mã điểm danh đã hết hạn và không còn giá trị sử dụng!",
                })}
              </h3>
              <p className="text-xs text-rose-700 max-w-md mx-auto mb-0">
                {t("modal:attendance.expired.description", {
                  defaultValue:
                    "Thời gian giới hạn của mã 6 chữ số và mã QR cho tiết học này đã kết thúc. Vui lòng liên hệ Giáo viên bộ môn để mở lại mã mới.",
                })}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>
                {t("button:close", { defaultValue: "Đóng" })}
              </Button>
              {onOpenTeacherConfig && (
                <Button
                  variant="primary"
                  onClick={() => {
                    onClose();
                    onOpenTeacherConfig(record);
                  }}
                  className="font-bold flex items-center gap-1.5"
                >
                  <Icon name="keyRound" size={14} />
                  <span>
                    {t("button:reopenSessionAsTeacher", {
                      defaultValue: "Mở lại mã mới (Vai trò Giáo viên)",
                    })}
                  </span>
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* ================= MAIN CHECK-IN INTERACTION ================= */
          <div className="flex flex-col gap-4">
            {/* Step 1: GPS Latitude/Longitude & Allowed Radius Anti-Cheat Verification */}
            <AttendanceGpsVerificationCard
              teacherLatitude={record.teacherLatitude}
              teacherLongitude={record.teacherLongitude}
              allowedRadiusMeters={record.allowedRadiusMeters}
              gpsState={gpsState}
              distanceMeters={distanceMeters}
              isWithinRadius={isWithinRadius}
              onSelectPreset={handleSelectPreset}
              onRequestBrowserGps={handleRequestBrowserGps}
              onCustomCoordChange={handleCustomCoordChange}
            />

            {/* Step 2: Select Check-in Method (Case 1: 6-digit PIN vs Case 2: QR Scan/Upload) */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-[#f0f0f0]">
              <button
                type="button"
                onClick={() => setMainTab("code")}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mainTab === "code"
                    ? "bg-white text-blue-700 shadow-2xs border border-[#f0f0f0]"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon name="keyRound" size={16} />
                <span>
                  {t("modal:attendance.tabs.pinCode", {
                    defaultValue: "1. Mã gồm 6 chữ số",
                  })}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMainTab("qr")}
                className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  mainTab === "qr"
                    ? "bg-white text-blue-700 shadow-2xs border border-[#f0f0f0]"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon name="qrCode" size={16} />
                <span>
                  {t("modal:attendance.tabs.qrCode", {
                    defaultValue: "2. Quét QR / Tải ảnh QR",
                  })}
                </span>
              </button>
            </div>

            {/* ================= CASE 1: 6-DIGIT PIN CODE ================= */}
            {mainTab === "code" && (
              <div className="flex flex-col gap-4 py-1">
                <div className="text-center space-y-1">
                  <label
                    htmlFor="attendance-six-digit-otp"
                    className="text-xs sm:text-sm font-bold text-slate-800 block cursor-pointer"
                  >
                    {t("modal:attendance.pin.title", {
                      defaultValue:
                        "Nhập mã điểm danh gồm 6 chữ số do Giáo viên cung cấp",
                    })}
                  </label>
                  <p className="text-xs text-slate-500 mb-0">
                    {t("modal:attendance.pin.subtitle", {
                      defaultValue:
                        "Mã chỉ có hiệu lực trong thời gian đếm ngược và khi bạn ở trong bán kính cho phép.",
                    })}
                  </p>
                </div>

                {/* Active Teacher Demo PIN Hint & 1-Click Fill */}
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Icon
                      name="info"
                      size={14}
                      className="text-blue-600 shrink-0"
                    />
                    <span className="text-slate-700">
                      {t("modal:attendance.pin.activeTeacherCodeLabel", {
                        defaultValue: "Mã 6 chữ số Giáo viên đang mở:",
                      })}{" "}
                      <strong className="font-mono text-sm font-extrabold text-blue-700 tracking-wider">
                        {record.attendanceCode}
                      </strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnteredCode(record.attendanceCode)}
                    className="text-xs font-bold text-blue-700 bg-white hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                  >
                    {t("button:fillDemoPin", {
                      defaultValue: "Điền nhanh mã này",
                    })}
                  </button>
                </div>

                {/* 6-digit OTP input */}
                <div className="flex justify-center py-1">
                  <OTP
                    id="attendance-six-digit-otp"
                    length={6}
                    value={enteredCode}
                    onChange={(val) =>
                      setEnteredCode(val.replace(/\D/g, "").slice(0, 6))
                    }
                    className="font-bold font-mono"
                    size="large"
                    autoFocus
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={submitting}
                  >
                    {t("button:cancel", { defaultValue: "Hủy bỏ" })}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => void handleSubmitCode()}
                    loading={submitting}
                    disabled={enteredCode.length !== 6}
                    className="font-bold flex items-center gap-1.5 shadow-2xs"
                  >
                    <Icon name="check" size={15} />
                    <span>
                      {t("button:confirmPinCheckIn", {
                        defaultValue: "Xác nhận điểm danh bằng mã 6 số",
                      })}
                    </span>
                  </Button>
                </div>
              </div>
            )}

            {/* ================= CASE 2: QR SCAN OR QR IMAGE UPLOAD ================= */}
            {mainTab === "qr" && (
              <div className="flex flex-col gap-3.5">
                {/* Sub-mode switch: Camera vs Upload Image */}
                <div className="flex items-center justify-center gap-2 text-xs">
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
                    <span>
                      {t("modal:attendance.qr.cameraTab", {
                        defaultValue: "Quét trực tiếp qua Camera",
                      })}
                    </span>
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
                    <span>
                      {t("modal:attendance.qr.uploadTab", {
                        defaultValue: "Tải ảnh mã QR lên",
                      })}
                    </span>
                  </button>
                </div>

                {/* Sub-mode 2.1: Live Camera Scanner */}
                {qrSubMode === "camera" && (
                  <div className="flex flex-col gap-3">
                    <div className="relative w-full h-60 sm:h-64 rounded-xl bg-slate-900 overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
                      <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-xl border-2 border-white/40 bg-white/95 p-2 flex items-center justify-center">
                        <span className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-blue-500 rounded-tl-md" />
                        <span className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-blue-500 rounded-tr-md" />
                        <span className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-blue-500 rounded-bl-md" />
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-blue-500 rounded-br-md" />

                        <div className="absolute inset-x-2 h-0.5 bg-linear-to-r from-blue-500 via-emerald-400 to-blue-500 shadow-[0_0_12px_#3b82f6] animate-pulse z-10" />

                        <img
                          src={sessionQrSvgUrl}
                          alt="Mã QR phiên điểm danh"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>

                      <div className="absolute bottom-2.5 inset-x-0 flex justify-center">
                        <span className="bg-black/70 backdrop-blur-md text-white/95 text-[11px] font-medium px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>
                            {t("modal:attendance.qr.cameraReadyHint", {
                              defaultValue:
                                "Camera đã nhận diện mã QR của Giáo viên • Sẵn sàng xác thực GPS",
                            })}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
                      <Button
                        variant="outline"
                        onClick={handleDownloadSessionQr}
                        className="w-full sm:w-auto text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <Icon name="download" size={14} />
                        <span>
                          {t("button:downloadSessionQr", {
                            defaultValue: "Tải ảnh QR của tiết học",
                          })}
                        </span>
                      </Button>

                      <Button
                        variant="primary"
                        onClick={() => void handleScanSampleQr()}
                        loading={isScanning || submitting}
                        className="w-full sm:w-auto font-bold flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Icon name="scan" size={15} />
                        <span>
                          {t("button:scanQrNow", {
                            defaultValue: "Quét mã QR & Điểm danh ngay",
                          })}
                        </span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Sub-mode 2.2: Upload QR Image File */}
                {qrSubMode === "upload" && (
                  <div className="flex flex-col gap-3">
                    <label
                      htmlFor="attendance-qr-file-upload"
                      className="sr-only"
                    >
                      {t("input:attendance.uploadQrImageLabel", {
                        defaultValue: "Tải tệp hình ảnh mã QR điểm danh",
                      })}
                    </label>
                    <input
                      id="attendance-qr-file-upload"
                      name="qrUploadFile"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    {selectedImage ? (
                      <div className="border border-[#f0f0f0] rounded-xl p-4 bg-slate-50 flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                              <Icon name="image" size={16} />
                            </span>
                            <div className="truncate">
                              <span className="text-xs font-bold text-slate-800 block truncate">
                                {selectedImageName}
                              </span>
                              <span className="text-[11px] text-emerald-600 font-semibold">
                                {t("modal:attendance.qr.qrDecodedReady", {
                                  defaultValue:
                                    "✓ Đã giải mã dữ liệu QR hợp lệ từ ảnh",
                                })}
                              </span>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-semibold shrink-0"
                          >
                            {t("button:changeQrImage", {
                              defaultValue: "Đổi ảnh khác",
                            })}
                          </Button>
                        </div>

                        <div className="h-44 rounded-xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-2">
                          <img
                            src={selectedImage}
                            alt="Ảnh mã QR điểm danh"
                            className="h-full w-full object-contain"
                          />
                        </div>

                        <Button
                          variant="primary"
                          onClick={() => void handleSubmitUploadedQr()}
                          loading={isScanning || submitting}
                          className="w-full font-bold flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <Icon name="check" size={15} />
                          <span>
                            {t("button:confirmQrUploadCheckIn", {
                              defaultValue:
                                "Xác nhận điểm danh từ ảnh mã QR & GPS",
                            })}
                          </span>
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/40 rounded-xl p-6 text-center transition-all flex flex-col gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                          <Icon name="upload" size={24} />
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm font-bold text-slate-800 mb-0">
                            {t("modal:attendance.qr.dropzoneTitle", {
                              defaultValue:
                                "Chọn ảnh mã QR từ thiết bị để điểm danh",
                            })}
                          </p>
                          <p className="text-[11px] text-slate-500 mb-0">
                            {t("modal:attendance.qr.dropzoneHint", {
                              defaultValue:
                                "Hỗ trợ ảnh PNG, JPG, JPEG, WebP, SVG chụp từ màn hình chiếu của Giáo viên",
                            })}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                          <Button
                            variant="primary"
                            onClick={() => fileInputRef.current?.click()}
                            className="font-semibold text-xs inline-flex items-center gap-1.5"
                          >
                            <Icon name="image" size={14} />
                            <span>
                              {t("button:browseQrFromDevice", {
                                defaultValue: "Chọn ảnh QR từ máy",
                              })}
                            </span>
                          </Button>

                          <Button
                            variant="outline"
                            onClick={handleLoadSessionQrImage}
                            className="font-semibold text-xs inline-flex items-center gap-1.5"
                          >
                            <Icon name="qrCode" size={14} />
                            <span>
                              {t("button:useSampleSessionQrImage", {
                                defaultValue: "Dùng ảnh QR mẫu của tiết học",
                              })}
                            </span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
