import { Modal, message } from "antd";
import type React from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import type {
  AttendanceRecord,
  OpenAttendanceSessionPayload,
} from "@/modules/students/features/attendance/types";
import {
  computeRemainingSeconds,
  formatCountdownMmSs,
  generateSessionQrSvgDataUrl,
  generateSixDigitPin,
} from "@/modules/students/features/attendance/utils";

interface TeacherSessionConfigModalProps {
  open: boolean;
  records: AttendanceRecord[];
  initialRecord?: AttendanceRecord | null;
  submitting?: boolean;
  onClose: () => void;
  onOpenOrUpdateSession: (
    payload: OpenAttendanceSessionPayload,
  ) => Promise<AttendanceRecord | null>;
  onExpireSessionNow: (recordId: string) => Promise<void>;
}

export const TeacherSessionConfigModal: React.FC<
  TeacherSessionConfigModalProps
> = ({
  open,
  records,
  initialRecord,
  submitting = false,
  onClose,
  onOpenOrUpdateSession,
  onExpireSessionNow,
}) => {
  const { t } = useTranslation(["modal", "input", "button", "message"]);
  const defaultTarget = initialRecord || records[0] || null;

  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    () => defaultTarget?.id || "",
  );
  const [pinCode, setPinCode] = useState<string>(
    () => defaultTarget?.attendanceCode || generateSixDigitPin(),
  );
  const [allowedRadiusMeters, setAllowedRadiusMeters] = useState<number>(
    () => defaultTarget?.allowedRadiusMeters || 50,
  );
  const [durationSeconds, setDurationSeconds] = useState<number>(
    () => defaultTarget?.durationSeconds || 300,
  );
  const [teacherLatitude, setTeacherLatitude] = useState<number>(
    () => defaultTarget?.teacherLatitude || 10.779785,
  );
  const [teacherLongitude, setTeacherLongitude] = useState<number>(
    () => defaultTarget?.teacherLongitude || 106.693182,
  );
  const [locatingTeacherGps, setLocatingTeacherGps] = useState<boolean>(false);

  const selectedRecord = useMemo(() => {
    return (
      records.find((r) => r.id === selectedRecordId) ||
      initialRecord ||
      records[0] ||
      null
    );
  }, [initialRecord, records, selectedRecordId]);

  const handleSelectRecordChange = (newId: string) => {
    setSelectedRecordId(newId);
    const found = records.find((r) => r.id === newId);
    if (found) {
      setPinCode(found.attendanceCode || generateSixDigitPin());
      setAllowedRadiusMeters(found.allowedRadiusMeters || 50);
      setDurationSeconds(found.durationSeconds || 300);
      setTeacherLatitude(found.teacherLatitude || 10.779785);
      setTeacherLongitude(found.teacherLongitude || 106.693182);
    }
  };

  const handleGenerateRandomPin = () => {
    setPinCode(generateSixDigitPin());
  };

  const handleFetchTeacherBrowserGps = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      message.warning(
        t("message:attendance.browserNoGeolocation", {
          defaultValue: "Trình duyệt hiện tại không hỗ trợ định vị GPS.",
        }),
      );
      return;
    }
    setLocatingTeacherGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setTeacherLatitude(Number(pos.coords.latitude.toFixed(6)));
        setTeacherLongitude(Number(pos.coords.longitude.toFixed(6)));
        setLocatingTeacherGps(false);
        message.success(
          t("message:attendance.teacherGpsUpdated", {
            defaultValue: "Đã lấy tọa độ GPS thực tế của thiết bị Giáo viên!",
          }),
        );
      },
      () => {
        setLocatingTeacherGps(false);
        message.warning(
          t("message:attendance.gpsPermissionDenied", {
            defaultValue: "Không thể truy cập GPS trình duyệt.",
          }),
        );
      },
      { enableHighAccuracy: true, timeout: 6000 },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    if (!/^\d{6}$/.test(pinCode.trim())) {
      message.error(
        t("message:attendance.invalidSixDigitPin", {
          defaultValue: "Mã điểm danh bắt buộc phải gồm đúng 6 chữ số (0-9).",
        }),
      );
      return;
    }

    const updated = await onOpenOrUpdateSession({
      recordId: selectedRecord.id,
      timetableId: selectedRecord.timetableId,
      sessionId: selectedRecord.sessionId,
      date: selectedRecord.date,
      pinCode: pinCode.trim(),
      allowedRadiusMeters,
      durationSeconds,
      teacherLatitude,
      teacherLongitude,
    });

    if (updated) {
      onClose();
    }
  };

  const previewQrUrl = useMemo(() => {
    if (!selectedRecord) return "";
    const previewToken = `SP_ATT_${selectedRecord.subjectCode}_${selectedRecord.date.replace(/-/g, "")}_${pinCode}`;
    return generateSessionQrSvgDataUrl(
      previewToken,
      pinCode,
      selectedRecord.subjectCode,
    );
  }, [pinCode, selectedRecord]);

  const remainingSec =
    selectedRecord && selectedRecord.status === "open"
      ? computeRemainingSeconds(
          selectedRecord.expiresAt,
          selectedRecord.remainingSeconds ?? 0,
        )
      : 0;

  const radiusPresets = [15, 30, 50, 100, 200];
  const durationPresets = [
    { seconds: 60, label: "1 phút" },
    { seconds: 180, label: "3 phút" },
    { seconds: 300, label: "5 phút" },
    { seconds: 600, label: "10 phút" },
    { seconds: 900, label: "15 phút" },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={680}
      title={
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
            <Icon name="keyRound" size={16} />
          </span>
          <div>
            <span className="font-bold text-slate-900 text-base block leading-tight">
              {t("modal:attendance.teacherConfig.title", {
                defaultValue:
                  "Thiết lập phiên điểm danh & Bán kính quét GPS (Giáo viên)",
              })}
            </span>
            <span className="text-xs text-slate-500 font-normal">
              {t("modal:attendance.teacherConfig.subtitle", {
                defaultValue:
                  "Tạo mã 6 chữ số, mã QR, cài đặt bán kính thiết bị quét và thời gian hiệu lực theo thời gian thực",
              })}
            </span>
          </div>
        </div>
      }
      centered
      destroyOnHidden
    >
      <form onSubmit={(e) => void handleSubmit(e)} className="pt-3 flex flex-col gap-4">
        {/* 1. Select Subject Slot */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="teacher-session-subject-select"
            className="text-xs font-bold text-slate-700"
          >
            {t("input:attendance.selectSubjectSlotLabel", {
              defaultValue: "Chọn tiết học / môn học cần mở cổng điểm danh",
            })}
          </label>
          <select
            id="teacher-session-subject-select"
            name="selectedRecordId"
            value={selectedRecord?.id || ""}
            onChange={(e) => handleSelectRecordChange(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
          >
            {records.map((r) => (
              <option key={r.id} value={r.id}>
                {r.period} ({r.timeSlot}) - {r.subjectName} ({r.room})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Two-Column Layout: Left = 6-Digit PIN & Radius & Duration, Right = Live QR Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7 flex flex-col gap-3.5">
            {/* 6-digit PIN Code Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="teacher-session-pin-code"
                  className="text-xs font-bold text-slate-700"
                >
                  {t("input:attendance.teacherPinCodeLabel", {
                    defaultValue: "Mã điểm danh gồm 6 chữ số (Giáo viên tạo)",
                  })}
                </label>
                <button
                  type="button"
                  onClick={handleGenerateRandomPin}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <Icon name="refresh" size={12} />
                  <span>
                    {t("button:generateRandomPin", {
                      defaultValue: "Tạo mã 6 số ngẫu nhiên",
                    })}
                  </span>
                </button>
              </div>
              <Input
                id="teacher-session-pin-code"
                name="pinCode"
                maxLength={6}
                value={pinCode}
                onChange={(e) =>
                  setPinCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="849201"
                className="font-mono font-extrabold text-base tracking-widest text-blue-700 rounded-xl"
              />
            </div>

            {/* Allowed Scan Radius (meters) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="teacher-session-radius-meters"
                className="text-xs font-bold text-slate-700"
              >
                {t("input:attendance.allowedRadiusLabel", {
                  defaultValue:
                    "Bán kính thiết bị quét tối đa (mét) — Học sinh ở xa sẽ bị chặn",
                })}
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="teacher-session-radius-meters"
                  name="allowedRadiusMeters"
                  type="number"
                  min={5}
                  max={5000}
                  value={String(allowedRadiusMeters)}
                  onChange={(e) =>
                    setAllowedRadiusMeters(
                      Math.max(5, Number.parseInt(e.target.value, 10) || 50),
                    )
                  }
                  className="font-mono font-bold text-xs w-28 rounded-xl"
                />
                <div className="flex flex-wrap items-center gap-1">
                  {radiusPresets.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAllowedRadiusMeters(r)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        allowedRadiusMeters === r
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      {r}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Expiration Duration (seconds) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="teacher-session-duration-seconds"
                className="text-xs font-bold text-slate-700"
              >
                {t("input:attendance.durationSecondsLabel", {
                  defaultValue:
                    "Thời gian giới hạn của mã (Hết hạn sẽ mất giá trị sử dụng)",
                })}
              </label>
              <input
                id="teacher-session-duration-seconds"
                name="durationSeconds"
                type="hidden"
                value={durationSeconds}
              />
              <div className="flex flex-wrap items-center gap-1.5">
                {durationPresets.map((d) => (
                  <button
                    key={d.seconds}
                    type="button"
                    onClick={() => setDurationSeconds(d.seconds)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      durationSeconds === d.seconds
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Auto-generated QR Code Preview */}
          <div className="md:col-span-5 bg-slate-50 border border-[#f0f0f0] rounded-xl p-3.5 flex flex-col items-center justify-between gap-2 text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t("modal:attendance.teacherConfig.qrPreviewTitle", {
                defaultValue: "Mã QR phiên điểm danh",
              })}
            </span>
            {previewQrUrl && (
              <img
                src={previewQrUrl}
                alt="Mã QR của Giáo viên"
                className="w-36 h-36 object-contain rounded-lg bg-white p-1.5 border border-slate-200 shadow-2xs"
              />
            )}
            <div className="text-[11px] text-slate-500 leading-snug">
              {selectedRecord?.status === "open" && remainingSec > 0 ? (
                <span className="text-emerald-700 font-bold">
                  Đang mở • Còn {formatCountdownMmSs(remainingSec)}
                </span>
              ) : (
                <span>
                  {t("modal:attendance.teacherConfig.qrPreviewHint", {
                    defaultValue: "Tự động đồng bộ tới màn hình Học sinh",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Teacher Scanning Device GPS Coordinates (Latitude & Longitude) */}
        <div className="bg-slate-50 border border-[#f0f0f0] rounded-xl p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Icon name="map-pin" size={14} className="text-blue-600" />
              <span>
                {t("modal:attendance.teacherConfig.gpsSectionTitle", {
                  defaultValue:
                    "Tọa độ Kinh độ & Vĩ độ thiết bị quét của Giáo viên",
                })}
              </span>
            </span>
            <button
              type="button"
              onClick={handleFetchTeacherBrowserGps}
              disabled={locatingTeacherGps}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <Icon name="map-pin" size={13} />
              <span>
                {locatingTeacherGps
                  ? t("button:locatingGps", { defaultValue: "Đang định vị..." })
                  : t("button:useBrowserGps", {
                      defaultValue: "Lấy GPS hiện tại",
                    })}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="teacher-session-latitude"
                className="text-[11px] font-semibold text-slate-600"
              >
                {t("input:attendance.teacherLatitudeLabel", {
                  defaultValue: "Vĩ độ thiết bị Giáo viên (Latitude)",
                })}
              </label>
              <Input
                id="teacher-session-latitude"
                name="teacherLatitude"
                type="number"
                step="0.00001"
                value={String(teacherLatitude)}
                onChange={(e) =>
                  setTeacherLatitude(Number.parseFloat(e.target.value) || 0)
                }
                className="font-mono text-xs bg-white rounded-xl"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="teacher-session-longitude"
                className="text-[11px] font-semibold text-slate-600"
              >
                {t("input:attendance.teacherLongitudeLabel", {
                  defaultValue: "Kinh độ thiết bị Giáo viên (Longitude)",
                })}
              </label>
              <Input
                id="teacher-session-longitude"
                name="teacherLongitude"
                type="number"
                step="0.00001"
                value={String(teacherLongitude)}
                onChange={(e) =>
                  setTeacherLongitude(Number.parseFloat(e.target.value) || 0)
                }
                className="font-mono text-xs bg-white rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* 4. Footer Actions: Expire Immediately vs Open/Broadcast Session */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          {selectedRecord && selectedRecord.status === "open" ? (
            <Button
              variant="outline"
              onClick={() => {
                void onExpireSessionNow(selectedRecord.id).then(() =>
                  onClose(),
                );
              }}
              disabled={submitting}
              className="text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 flex items-center gap-1.5"
            >
              <Icon name="close" size={14} />
              <span>
                {t("button:expireSessionNow", {
                  defaultValue: "Cho hết hạn mã ngay",
                })}
              </span>
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              {t("button:cancel", { defaultValue: "Đóng" })}
            </Button>
            <Button
              htmlType="submit"
              variant="primary"
              loading={submitting}
              className="font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <Icon name="check" size={15} />
              <span>
                {t("button:publishTeacherSession", {
                  defaultValue: "Phát mã 6 số & QR (Thời gian thực)",
                })}
              </span>
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
