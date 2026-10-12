import React from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { TimetableSlot } from "@/modules/students/features/timetable/types";

export interface MobileTimetableListProps {
  slots: TimetableSlot[];
  selectedDate: string;
  onSlotClick?: (slot: TimetableSlot) => void;
}

export const MobileTimetableList: React.FC<MobileTimetableListProps> = ({
  slots,
  selectedDate,
  onSlotClick,
}) => {
  const { t } = useTranslation(["card", "button"]);
  const currentDayjs = dayjs(selectedDate);
  const weekStart = currentDayjs.startOf("isoWeek");

  const dayNames: Record<number, string> = {
    2: t("card:timetable.days.mon"),
    3: t("card:timetable.days.tue"),
    4: t("card:timetable.days.wed"),
    5: t("card:timetable.days.thu"),
    6: t("card:timetable.days.fri"),
    7: t("card:timetable.days.sat"),
    8: t("card:timetable.days.sun"),
  };

  // Group slots by day of week (Monday to Sunday)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = weekStart.add(i, "day");
    const dStr = d.format("YYYY-MM-DD");
    const daySlots = slots.filter((s) => s.date === dStr);
    const isToday = d.isSame(dayjs(), "day");
    const isSelected = d.isSame(currentDayjs, "day");
    const dayNum = i === 6 ? 8 : i + 2;

    return {
      date: d,
      dateStr: dStr,
      dayNum,
      dayLabel: dayNames[dayNum],
      isToday,
      isSelected,
      slots: daySlots,
    };
  });

  return (
    <div className="space-y-3.5">
      {days.map((day) => {
        return (
          <div
            key={day.dateStr}
            className={`rounded-xl border transition-all overflow-hidden ${
              day.isToday
                ? "border-blue-300 bg-blue-50/20 shadow-2xs"
                : "border-slate-200 bg-white shadow-2xs"
            }`}
          >
            {/* Day Header */}
            <div
              className={`p-3 sm:p-3.5 flex items-center justify-between border-b ${
                day.isToday
                  ? "bg-blue-50/80 border-blue-200"
                  : "bg-slate-50/80 border-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    day.isToday
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-white text-slate-700 border border-slate-200"
                  }`}
                >
                  {day.date.date()}
                </span>
                <div>
                  <span className="font-bold text-slate-900 text-sm block leading-none">
                    {day.dayLabel}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1 block leading-none">
                    {day.date.format("DD/MM/YYYY")}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {day.isToday && (
                  <Tag color="blue" className="text-[10px] font-bold px-2 py-0.5 m-0">
                    {t("button:today")}
                  </Tag>
                )}
                <span className="text-xs text-slate-500 font-medium bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {day.slots.length} {t("card:timetable.slotsCountSuffix")}
                </span>
              </div>
            </div>

            {/* Day Slots List */}
            <div className="p-3">
              {day.slots.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 italic bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                  {t("card:timetable.emptySlot")}
                </div>
              ) : (
                <div className="space-y-3">
                  {day.slots.map((slot) => {
                    const isPractice = slot.classType === "practice";
                    const isOnline = Boolean(slot.onlineUrl);
                    const isOngoing = slot.status === "ongoing";

                    return (
                      <div
                        key={slot.id}
                        onClick={() => onSlotClick?.(slot)}
                        className={`p-3.5 rounded-xl border transition-all bg-white relative ${
                          isOngoing
                            ? "border-blue-400 ring-2 ring-blue-500/15"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {isOngoing && (
                          <span className="absolute top-2 right-2 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                          </span>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="mb-1">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-xl border border-blue-100">
                                  <Icon name="academic" size={12} className="text-blue-600 shrink-0" />
                                  <span>
                                    {t("card:timetable.classLabel", {
                                      classCode: slot.className || slot.classCode,
                                    })}
                                  </span>
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 mt-0.5 mb-0">
                                {slot.courseName}
                              </h4>
                            </div>
                            <Tag
                              color={isPractice ? "green" : "blue"}
                              className="text-[10px] font-semibold px-1.5 py-0.5 m-0 shrink-0"
                            >
                              {isPractice
                                ? t("card:timetable.classTypes.practice")
                                : t("card:timetable.classTypes.theory")}
                            </Tag>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Icon name="clock" size={13} className="text-slate-400 shrink-0" />
                              <span className="font-medium text-slate-800">
                                {slot.startTime} - {slot.endTime}
                              </span>
                              <span className="text-slate-400 text-[11px]">
                                ({slot.periods})
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Icon name="map-pin" size={13} className="text-slate-400 shrink-0" />
                              <span className="truncate" title={slot.room}>
                                {slot.room} • {slot.building}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Icon name="user" size={13} className="text-slate-400 shrink-0" />
                              <span className="truncate font-medium text-slate-800" title={slot.instructorName}>
                                {slot.instructorName}
                              </span>
                            </div>
                            {slot.instructorEmail ? (
                              <div className="flex items-center gap-1.5">
                                <Icon name="mail" size={13} className="text-slate-400 shrink-0" />
                                <a
                                  href={`mailto:${slot.instructorEmail}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-blue-600 hover:text-blue-800 hover:underline truncate text-[11px] font-medium"
                                  title={slot.instructorEmail}
                                >
                                  {slot.instructorEmail}
                                </a>
                              </div>
                            ) : null}
                            <div className="flex items-center justify-between gap-1.5">
                              <Tag
                                color={isOnline ? "purple" : "cyan"}
                                className="text-[10px] px-1.5 py-0.5 m-0 font-semibold"
                              >
                                {isOnline
                                  ? t("card:timetable.teachingMethods.online")
                                  : t("card:timetable.teachingMethods.inPerson")}
                              </Tag>
                              {slot.onlineUrl && (
                                <a
                                  href={slot.onlineUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-xs hover:underline"
                                >
                                  <Icon name="external-link" size={12} />
                                  <span>{t("card:timetable.joinOnlineClass")}</span>
                                </a>
                              )}
                            </div>
                          </div>

                          {slot.notes && (
                            <div className="pt-1.5 border-t border-slate-100 text-[11px] text-slate-500 italic">
                              <span className="font-medium text-slate-600 not-italic">
                                {t("card:timetable.notes")}:{" "}
                              </span>
                              {slot.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
