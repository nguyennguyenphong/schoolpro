import type React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import type { GpsCoordinateState } from "@/modules/students/features/attendance/types";
import { formatCoordinate } from "@/modules/students/features/attendance/utils";

interface AttendanceGpsVerificationCardProps {
  teacherLatitude: number;
  teacherLongitude: number;
  allowedRadiusMeters: number;
  gpsState: GpsCoordinateState;
  distanceMeters: number;
  isWithinRadius: boolean;
  onRequestBrowserGps: () => void;
}

/**
 * Student GPS Verification Card displaying the student's live GPS coordinates
 * (latitude & longitude), the teacher's allowed scan radius, and the calculated distance.
 */
export const AttendanceGpsVerificationCard: React.FC<
  AttendanceGpsVerificationCardProps
> = ({
  teacherLatitude,
  teacherLongitude,
  allowedRadiusMeters,
  gpsState,
  distanceMeters,
  isWithinRadius,
  onRequestBrowserGps,
}) => {
  const { t } = useTranslation(["modal", "button"]);

  return (
    <div
      className={`rounded-xl border p-3.5 flex flex-col gap-3 transition-all ${
        isWithinRadius
          ? "bg-emerald-50/50 border-emerald-200"
          : "bg-rose-50/60 border-rose-300"
      }`}
    >
      {/* Header: GPS Verification Status & Distance vs Allowed Radius */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isWithinRadius
                ? "bg-emerald-600 text-white"
                : "bg-rose-600 text-white"
            }`}
          >
            <Icon name="map-pin" size={14} />
          </span>
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              {t("modal:attendance.gps.title", {
                defaultValue: "Xác thực vị trí GPS Học sinh (Kinh độ & Vĩ độ)",
              })}
            </span>
            <span className="text-[11px] text-slate-500">
              {t("modal:attendance.gps.subtitle", {
                radius: allowedRadiusMeters,
                defaultValue: `Bán kính điểm danh cho phép tại phòng học: tối đa ${allowedRadiusMeters}m`,
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-full border ${
              isWithinRadius
                ? "bg-white text-emerald-700 border-emerald-300"
                : "bg-white text-rose-700 border-rose-300"
            }`}
          >
            <Icon
              name={isWithinRadius ? "checkCircle" : "warning"}
              size={13}
              className={isWithinRadius ? "text-emerald-600" : "text-rose-600"}
            />
            <span>
              {distanceMeters.toFixed(1)}m / {allowedRadiusMeters}m •{" "}
              {isWithinRadius
                ? t("modal:attendance.gps.withinRange", {
                    defaultValue: "Hợp lệ",
                  })
                : t("modal:attendance.gps.outOfRange", {
                    defaultValue: "Ngoài bán kính",
                  })}
            </span>
          </span>
        </div>
      </div>

      {/* Coordinates Grid: Student GPS vs Classroom Center */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        <div className="bg-white/90 rounded-lg p-2.5 border border-slate-200/80 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t("modal:attendance.gps.studentDeviceLabel", {
                defaultValue: "Tọa độ GPS của bạn",
              })}
            </span>
            <button
              type="button"
              onClick={onRequestBrowserGps}
              disabled={gpsState.locating}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
            >
              <Icon name="refresh" size={11} />
              <span>
                {gpsState.locating
                  ? t("button:locatingGps", { defaultValue: "Đang định vị..." })
                  : t("button:useBrowserGps", {
                      defaultValue: "Cập nhật GPS",
                    })}
              </span>
            </button>
          </div>
          <div className="font-mono font-bold text-slate-800 flex items-center justify-between">
            <span>
              {t("modal:attendance.gps.latShort", { defaultValue: "Vĩ độ:" })}{" "}
              {formatCoordinate(gpsState.latitude)}
            </span>
            <span>
              {t("modal:attendance.gps.lngShort", { defaultValue: "Kinh độ:" })}{" "}
              {formatCoordinate(gpsState.longitude)}
            </span>
          </div>
        </div>

        <div className="bg-white/90 rounded-lg p-2.5 border border-slate-200/80 flex flex-col gap-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {t("modal:attendance.gps.teacherDeviceLabel", {
              defaultValue: "Tâm điểm danh tại lớp học",
            })}
          </span>
          <div className="font-mono font-bold text-slate-800 flex items-center justify-between">
            <span>
              {t("modal:attendance.gps.latShort", { defaultValue: "Vĩ độ:" })}{" "}
              {formatCoordinate(teacherLatitude)}
            </span>
            <span>
              {t("modal:attendance.gps.lngShort", { defaultValue: "Kinh độ:" })}{" "}
              {formatCoordinate(teacherLongitude)}
            </span>
          </div>
        </div>
      </div>

      {!isWithinRadius && (
        <div className="bg-rose-100/80 border border-rose-300 rounded-lg px-3 py-2 text-xs text-rose-800 flex items-center gap-2">
          <Icon name="warning" size={14} className="text-rose-600 shrink-0" />
          <span>
            {t("modal:attendance.gps.outOfRangeWarning", {
              distance: distanceMeters.toFixed(1),
              radius: allowedRadiusMeters,
              defaultValue: `Khoảng cách hiện tại (${distanceMeters.toFixed(1)}m) vượt quá bán kính cho phép (${allowedRadiusMeters}m). Vui lòng di chuyển vào khu vực phòng học và bấm Cập nhật GPS.`,
            })}
          </span>
        </div>
      )}
    </div>
  );
};
