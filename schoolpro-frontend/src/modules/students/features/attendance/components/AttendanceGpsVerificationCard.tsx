import type React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import type { GpsCoordinateState } from "@/modules/students/features/attendance/types";

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
 * Compact Student GPS Verification Bar:
 * Shows whether the student is within the classroom's allowed radius without technical coordinate clutter.
 */
export const AttendanceGpsVerificationCard: React.FC<
  AttendanceGpsVerificationCardProps
> = ({
  allowedRadiusMeters,
  gpsState,
  distanceMeters,
  isWithinRadius,
  onRequestBrowserGps,
}) => {
  const { t } = useTranslation(["modal", "button"]);

  return (
    <div
      className={`rounded-xl border px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs transition-all ${
        isWithinRadius
          ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
          : "bg-rose-50/70 border-rose-300 text-rose-900"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon
          name={isWithinRadius ? "checkCircle" : "warning"}
          size={15}
          className={
            isWithinRadius
              ? "text-emerald-600 shrink-0"
              : "text-rose-600 shrink-0"
          }
        />
        <span>
          {isWithinRadius
            ? t("modal:attendance.gps.compactValidText", {
                distance: distanceMeters.toFixed(1),
                radius: allowedRadiusMeters,
              })
            : t("modal:attendance.gps.outOfRangeWarning", {
                distance: distanceMeters.toFixed(1),
                radius: allowedRadiusMeters,
              })}
        </span>
      </div>

      <button
        type="button"
        onClick={onRequestBrowserGps}
        disabled={gpsState.locating}
        className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer inline-flex items-center gap-1 shrink-0"
      >
        <Icon name="refresh" size={12} />
        <span>
          {gpsState.locating
            ? t("button:locatingGps")
            : t("button:useBrowserGps")}
        </span>
      </button>
    </div>
  );
};
