import React from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import type {
  TimetableSlot,
  ClassShift,
} from "@/modules/students/features/timetable/types";
import { TimetableSlotCard } from "@/modules/students/features/timetable/components/TimetableSlotCard";
import { MobileTimetableList } from "@/modules/students/features/timetable/components/MobileTimetableList";

interface WeeklyGridViewProps {
  selectedDate: string;
  slots: TimetableSlot[];
  onSlotClick?: (slot: TimetableSlot) => void;
}

export const WeeklyGridView: React.FC<WeeklyGridViewProps> = ({
  selectedDate,
  slots,
  onSlotClick,
}) => {
  const { t } = useTranslation(["card"]);
  const currentDayjs = dayjs(selectedDate);
  const weekStart = currentDayjs.startOf("isoWeek");

  const DAYS_OF_WEEK = [
    { dayNum: 2, label: t("card:timetable.days.mon"), short: "T2" },
    { dayNum: 3, label: t("card:timetable.days.tue"), short: "T3" },
    { dayNum: 4, label: t("card:timetable.days.wed"), short: "T4" },
    { dayNum: 5, label: t("card:timetable.days.thu"), short: "T5" },
    { dayNum: 6, label: t("card:timetable.days.fri"), short: "T6" },
    { dayNum: 7, label: t("card:timetable.days.sat"), short: "T7" },
    { dayNum: 8, label: t("card:timetable.days.sun"), short: "CN" },
  ];

  const SHIFTS: { key: ClassShift; label: string; timeRange: string }[] = [
    { key: "morning", label: t("card:timetable.shifts.morning"), timeRange: "07:00 - 11:30" },
    { key: "afternoon", label: t("card:timetable.shifts.afternoon"), timeRange: "12:30 - 17:30" },
    { key: "evening", label: t("card:timetable.shifts.evening"), timeRange: "17:45 - 21:00" },
  ];

  // Map each day with its specific date in this week
  const weekDays = DAYS_OF_WEEK.map((d, index) => {
    const dayDate = weekStart.add(index, "day");
    const dateStr = dayDate.format("YYYY-MM-DD");
    const isSelected = dayDate.isSame(currentDayjs, "day");
    const isToday = dayDate.isSame(dayjs(), "day");
    const allDaySlots = slots.filter((s) => s.date === dateStr);
    const leaveDaySlots = allDaySlots.filter(
      (s) => Boolean(s.isOnLeave) || s.attendanceStatus === "excused",
    );
    const hasLeave = leaveDaySlots.length > 0;
    const isFullDayLeave =
      allDaySlots.length > 0 &&
      (leaveDaySlots.some((s) => s.leaveSessionShift === "all_day") ||
        leaveDaySlots.length === allDaySlots.length);

    return {
      ...d,
      dateStr,
      formattedDate: dayDate.format("DD/MM"),
      isSelected,
      isToday,
      hasLeave,
      isFullDayLeave,
    };
  });

  return (
    <div className="space-y-4">
      {/* 1. Mobile & Small Tablet View: Vertical Accordion-like cards */}
      <div className="block md:hidden">
        <MobileTimetableList
          slots={slots}
          selectedDate={selectedDate}
          onSlotClick={onSlotClick}
        />
      </div>

      {/* 2. Desktop & Tablet Large View: 7-Column Weekly Grid Table */}
      <div className="hidden md:block bg-white border border-[#f0f0f0] rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1600px] border-collapse table-fixed text-left">
            {/* Table Header: 7 Days with equal width columns */}
            <thead>
              <tr className="bg-slate-50 border-b border-[#f0f0f0]">
                <th className="w-32 min-w-32 p-3 text-center border-r border-[#f0f0f0] text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t("card:timetable.shiftColumn")}
                </th>
                {weekDays.map((d) => (
                  <th
                    key={d.dayNum}
                    className={`p-3 text-center border-r border-[#f0f0f0] last:border-r-0 transition-colors w-56 min-w-56 ${
                      d.hasLeave
                        ? "bg-amber-50/90 text-amber-800"
                        : d.isToday
                          ? "bg-blue-50/80 text-blue-700"
                          : "text-slate-700"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-xs font-bold block">{d.label}</span>
                      <div className="mt-0.5">
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium inline-block ${
                            d.hasLeave
                              ? "bg-amber-500 text-white font-bold shadow-2xs"
                              : d.isToday
                                ? "bg-blue-600 text-white font-bold shadow-2xs"
                                : "text-slate-500"
                          }`}
                        >
                          {d.formattedDate}
                        </span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body: 3 Shifts (Morning, Afternoon, Evening) */}
            <tbody className="divide-y divide-slate-200">
              {SHIFTS.map((shift) => (
                <tr key={shift.key} className="align-top">
                  {/* Shift Info Column */}
                  <td className="p-3 border-r border-[#f0f0f0] bg-slate-50/50 text-center w-32 min-w-32 align-middle h-1">
                    <span className="text-xs font-bold text-slate-800 block">
                      {shift.label}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {shift.timeRange}
                    </span>
                  </td>

                  {/* 7 Day Columns */}
                  {weekDays.map((d) => {
                    const daySlots = slots.filter(
                      (s) => s.date === d.dateStr && s.shift === shift.key,
                    );
                    const isShiftOnLeave =
                      d.isFullDayLeave ||
                      daySlots.some(
                        (s) => Boolean(s.isOnLeave) || s.attendanceStatus === "excused",
                      );

                    return (
                      <td
                        key={d.dayNum}
                        className={`p-2.5 border-r border-[#f0f0f0] last:border-r-0 w-56 min-w-56 align-top transition-colors h-1 ${
                          isShiftOnLeave
                            ? "bg-amber-50/50"
                            : d.isToday
                              ? "bg-blue-50/20"
                              : ""
                        }`}
                      >
                        {daySlots.length === 0 ? (
                          <div className="w-full h-full min-h-105 flex items-center justify-center text-xs text-slate-300 italic border border-dashed border-slate-100 rounded-xl bg-slate-50/30 select-none">
                            <span>{t("card:timetable.emptySlot")}</span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col gap-2.5">
                            {daySlots.map((slot) => (
                              <TimetableSlotCard
                                key={slot.id}
                                slot={slot}
                                onSlotClick={onSlotClick}
                              />
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
