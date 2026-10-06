import React from "react";
import dayjs from "dayjs";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type {
  TimetableSlot,
  ClassShift,
} from "@/modules/students/features/timetable/types";

interface WeeklyGridViewProps {
  selectedDate: string;
  slots: TimetableSlot[];
  onSlotClick: (slot: TimetableSlot) => void;
}

const DAYS_OF_WEEK = [
  { dayNum: 2, label: "Thứ Hai", short: "T2" },
  { dayNum: 3, label: "Thứ Ba", short: "T3" },
  { dayNum: 4, label: "Thứ Tư", short: "T4" },
  { dayNum: 5, label: "Thứ Năm", short: "T5" },
  { dayNum: 6, label: "Thứ Sáu", short: "T6" },
  { dayNum: 7, label: "Thứ Bảy", short: "T7" },
  { dayNum: 8, label: "Chủ Nhật", short: "CN" },
];

const SHIFTS: { key: ClassShift; label: string; timeRange: string }[] = [
  { key: "morning", label: "Ca Sáng", timeRange: "07:00 - 11:30" },
  { key: "afternoon", label: "Ca Chiều", timeRange: "12:30 - 17:30" },
  { key: "evening", label: "Ca Tối", timeRange: "17:45 - 21:00" },
];

export const WeeklyGridView: React.FC<WeeklyGridViewProps> = ({
  selectedDate,
  slots,
  onSlotClick,
}) => {
  const currentDayjs = dayjs(selectedDate);
  const weekStart = currentDayjs.startOf("isoWeek");

  // Map each day with its specific date in this week
  const weekDays = DAYS_OF_WEEK.map((d, index) => {
    const dayDate = weekStart.add(index, "day");
    const isSelected = dayDate.isSame(currentDayjs, "day");
    const isToday = dayDate.isSame(dayjs(), "day");
    return {
      ...d,
      dateStr: dayDate.format("YYYY-MM-DD"),
      formattedDate: dayDate.format("DD/MM"),
      isSelected,
      isToday,
    };
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-237.5 border-collapse table-fixed text-left">
          {/* Table Header: 7 Days with equal width columns */}
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="w-28 p-3 text-center border-r border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ca học
              </th>
              {weekDays.map((d) => (
                <th
                  key={d.dayNum}
                  className={`p-3 text-center border-r border-slate-200 last:border-r-0 transition-colors w-[13.14%] ${
                    d.isToday
                      ? "bg-blue-50/80 text-blue-700"
                      : "text-slate-700"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs font-bold block">{d.label}</span>
                    <div className="mt-0.5">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium inline-block ${
                          d.isToday
                            ? "bg-blue-600 text-white font-bold"
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
                <td className="p-3 border-r border-slate-200 bg-slate-50/50 text-center w-28 align-middle">
                  <span className="text-xs font-bold text-slate-800 block">
                    {shift.label}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {shift.timeRange}
                  </span>
                </td>

                {/* 7 Day Columns with equal width and equal card height */}
                {weekDays.map((d) => {
                  const daySlots = slots.filter(
                    (s) => s.date === d.dateStr && s.shift === shift.key,
                  );

                  return (
                    <td
                      key={d.dayNum}
                      className={`p-2 border-r border-slate-200 last:border-r-0 w-[13.14%] align-top transition-colors ${
                        d.isToday ? "bg-blue-50/20" : ""
                      }`}
                    >
                      {daySlots.length === 0 ? (
                        <div className="h-46.25 w-full flex items-center justify-center text-xs text-slate-300 italic border border-dashed border-slate-100 rounded-xl bg-slate-50/30 select-none">
                          <span>Trống</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {daySlots.map((slot) => {
                            const isPractice = slot.classType === "practice";
                            const isOngoing = slot.status === "ongoing";

                            return (
                              <div
                                key={slot.id}
                                onClick={() => onSlotClick(slot)}
                                className="h-46.25 w-full bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between transition-all cursor-pointer relative group"
                              >
                                {isOngoing && (
                                  <span className="absolute -top-1.5 -right-1.5 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
                                  </span>
                                )}

                                {/* Top Section: Code, Tag & Title */}
                                <div>
                                  {/* Row 1: Code & Type Tag */}
                                  <div className="flex items-center justify-between gap-1 mb-1.5">
                                    <span className="font-mono text-xs font-bold text-slate-700 truncate">
                                      {slot.courseCode}
                                    </span>
                                    <Tag
                                      color={isPractice ? "green" : "blue"}
                                      className="m-0 text-[10px] shrink-0 font-medium"
                                    >
                                      {isPractice ? "Thực hành" : "Lý thuyết"}
                                    </Tag>
                                  </div>

                                  {/* Row 2: Course Name (Dedicated 2-line row) */}
                                  <h4
                                    className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug h-8 group-hover:text-blue-600 transition-colors mb-0"
                                    title={slot.courseName}
                                  >
                                    {slot.courseName}
                                  </h4>
                                </div>

                                {/* Bottom Section: Each info on its own row */}
                                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px]">
                                  {/* Row 3: Dedicated Time Row */}
                                  <div className="flex items-center gap-1.5 text-slate-600">
                                    <Icon name="clock" size={12} className="text-slate-400 shrink-0" />
                                    <span className="truncate font-medium">
                                      {slot.startTime} - {slot.endTime} ({slot.periods})
                                    </span>
                                  </div>

                                  {/* Row 4: Dedicated Room & Building Row */}
                                  <div className="flex items-center gap-1.5 text-slate-700">
                                    <Icon name="map-pin" size={12} className="text-slate-400 shrink-0" />
                                    <span className="truncate font-semibold" title={`${slot.room} • ${slot.building}`}>
                                      {slot.room} • {slot.building}
                                    </span>
                                  </div>

                                  {/* Row 5: Dedicated Instructor Row */}
                                  <div className="flex items-center gap-1.5 text-slate-500">
                                    <Icon name="user" size={12} className="text-slate-400 shrink-0" />
                                    <span className="truncate" title={slot.instructorName}>
                                      {slot.instructorName}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
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
  );
};
