import type React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import type {
  GpsCoordinateState,
  GpsSimulationPresetId,
} from "@/modules/students/features/attendance/types";
import { formatCoordinate } from "@/modules/students/features/attendance/utils";

interface AttendanceGpsVerificationCardProps {
  teacherLatitude: number;
  teacherLongitude: number;
  allowedRadiusMeters: number;
  gpsState: GpsCoordinateState;
  distanceMeters: number;
  isWithinRadius: boolean;
  onSelectPreset: (presetId: GpsSimulationPresetId) => void;
  onRequestBrowserGps: () => void;
  onCustomCoordChange: (field: "latitude" | "longitude", value: number) => void;
}

export const AttendanceGpsVerificationCard: React.FC<
  AttendanceGpsVerificationCardProps
> = ({
  teacherLatitude,
  teacherLongitude,
  allowedRadiusMeters,
  gpsState,
  distanceMeters,
  isWithinRadius,
  onSelectPreset,
  onRequestBrowserGps,
  onCustomCoordChange,
}) => {
  const { t } = useTranslation(["modal", "input", "button"]);

  const presets: {
    id: GpsSimulationPresetId;
    label: string;
    badge: string;
    isError?: boolean;
  }[] = [
    {
      id: "in_classroom",
      label: t("modal:attendance.gps.presetInClassroom", {
        defaultValue: "Trong lớp học (~8.5m)",
      }),
      badge: t("modal:attendance.gps.validTag", { defaultValue: "Hợp lệ" }),
    },
    {
      id: "near_corridor",
      label: t("modal:attendance.gps.presetNearCorridor", {
        defaultValue: "Cửa lớp / Hành lang",
      }),
      badge: t("modal:attendance.gps.validTag", { defaultValue: "Hợp lệ" }),
    },
    {
      id: "outside_school",
      label: t("modal:attendance.gps.presetOutsideSchool", {
        defaultValue: "Ở xa ngoài bán kính (~245m)",
      }),
      badge: t("modal:attendance.gps.blockedTag", {
        defaultValue: "Chặn gian lận",
      }),
      isError: true,
    },
    {
      id: "custom",
      label: t("modal:attendance.gps.presetCustom", {
        defaultValue: "Tọa độ tùy chỉnh",
      }),
      badge: "GPS",
    },
  ];

  return (
    <div
      className={`rounded-xl border p-3.5 flex flex-col gap-3 transition-all ${
        isWithinRadius
          ? "bg-emerald-50/50 border-emerald-200"
          : "bg-rose-50/60 border-rose-300"
      }`}
    >
      {/* Header: Anti-cheat Status & Distance vs Allowed Radius */}
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
                defaultValue:
                  "Xác thực vị trí GPS chống gian lận 100% (Kinh độ & Vĩ độ)",
              })}
            </span>
            <span className="text-[11px] text-slate-500">
              {t("modal:attendance.gps.subtitle", {
                radius: allowedRadiusMeters,
                defaultValue: `Bán kính thiết bị quét của Giáo viên cho phép: tối đa ${allowedRadiusMeters}m`,
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
                    defaultValue: "Đạt yêu cầu",
                  })
                : t("modal:attendance.gps.outOfRange", {
                    defaultValue: "Quá xa - Bị chặn",
                  })}
            </span>
          </span>
        </div>
      </div>

      {/* Coordinates Comparison Grid: Teacher Device vs Student Device */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        <div className="bg-white/90 rounded-lg p-2.5 border border-slate-200/80 flex flex-col gap-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {t("modal:attendance.gps.teacherDeviceLabel", {
              defaultValue: "Tọa độ thiết bị Giáo viên (Tâm quét)",
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

        <div className="bg-white/90 rounded-lg p-2.5 border border-slate-200/80 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t("modal:attendance.gps.studentDeviceLabel", {
                defaultValue: "Tọa độ thiết bị Học sinh",
              })}
            </span>
            <button
              type="button"
              onClick={onRequestBrowserGps}
              disabled={gpsState.locating}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
            >
              <Icon name="map-pin" size={11} />
              <span>
                {gpsState.locating
                  ? t("button:locatingGps", { defaultValue: "Đang định vị..." })
                  : t("button:useBrowserGps", {
                      defaultValue: "Lấy GPS thực tế",
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
      </div>

      {/* Quick Simulation Presets for Testing In-Range vs Out-of-Range */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold text-slate-600">
          {t("modal:attendance.gps.testPositionLabel", {
            defaultValue:
              "Chọn vị trí thiết bị Học sinh (Kiểm thử khoảng cách bán kính):",
          })}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {presets.map((p) => {
            const active = gpsState.presetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPreset(p.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
                  active
                    ? p.isError
                      ? "bg-rose-600 text-white border-rose-600 shadow-2xs"
                      : "bg-blue-600 text-white border-blue-600 shadow-2xs"
                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                }`}
              >
                <span>{p.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    active
                      ? "bg-white/20 text-white"
                      : p.isError
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {p.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Latitude / Longitude Inputs when "custom" preset is selected */}
      {gpsState.presetId === "custom" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="student-checkin-latitude"
              className="text-[11px] font-semibold text-slate-700"
            >
              {t("input:attendance.studentLatitudeLabel", {
                defaultValue: "Vĩ độ Học sinh (Latitude)",
              })}
            </label>
            <Input
              id="student-checkin-latitude"
              name="studentLatitude"
              type="number"
              step="0.0001"
              value={String(gpsState.latitude)}
              onChange={(e) =>
                onCustomCoordChange(
                  "latitude",
                  Number.parseFloat(e.target.value) || 0,
                )
              }
              className="font-mono text-xs"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="student-checkin-longitude"
              className="text-[11px] font-semibold text-slate-700"
            >
              {t("input:attendance.studentLongitudeLabel", {
                defaultValue: "Kinh độ Học sinh (Longitude)",
              })}
            </label>
            <Input
              id="student-checkin-longitude"
              name="studentLongitude"
              type="number"
              step="0.0001"
              value={String(gpsState.longitude)}
              onChange={(e) =>
                onCustomCoordChange(
                  "longitude",
                  Number.parseFloat(e.target.value) || 0,
                )
              }
              className="font-mono text-xs"
            />
          </div>
        </div>
      )}

      {!isWithinRadius && (
        <div className="bg-rose-100/80 border border-rose-300 rounded-lg px-3 py-2 text-xs text-rose-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Icon name="warning" size={14} className="text-rose-600 shrink-0" />
            <span>
              {t("modal:attendance.gps.outOfRangeWarning", {
                distance: distanceMeters.toFixed(1),
                radius: allowedRadiusMeters,
                defaultValue: `Khoảng cách hiện tại (${distanceMeters.toFixed(1)}m) vượt quá bán kính thiết bị quét của Giáo viên (${allowedRadiusMeters}m). Bạn không thể điểm danh từ xa!`,
              })}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => onSelectPreset("in_classroom")}
            className="text-[11px] font-bold shrink-0 bg-white border-rose-300 text-rose-700"
          >
            {t("button:moveIntoClassroom", {
              defaultValue: "Về vị trí lớp học",
            })}
          </Button>
        </div>
      )}
    </div>
  );
};
