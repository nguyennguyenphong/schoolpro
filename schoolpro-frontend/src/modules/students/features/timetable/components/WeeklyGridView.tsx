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

  const getThemeStyles = (theme?: string) => {
    switch (theme) {
      case "emerald":
        return "border-emerald-200 bg-emerald-50/70 hover:bg-emerald-50 text-emerald-900";
      case "violet":
        return "border-violet-200 bg-violet-50/70 hover:bg-violet-50 text-violet-900";
      case "amber":
        return "border-amber-200 bg-amber-50/70 hover:bg-amber-50 text-amber-900";
      case "rose":
        return "border-rose-200 bg-rose-50/70 hover:bg-rose-50 text-rose-900";
      case "cyan":
        return "border-cyan-200 bg-cyan-50/70 hover:bg-cyan-50 text-cyan-900";
      case "indigo":
        return "border-indigo-200 bg-indigo-50/70 hover:bg-indigo-50 text-indigo-900";
      case "blue":
      default:
        return "border-blue-200 bg-blue-50/70 hover:bg-blue-50 text-blue-900";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          {/* Table Header: 7 Days */}
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="w-24 p-3 text-center border-r border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ca học
              </th>
              {weekDays.map((d) => (
                <th
                  key={d.dayNum}
                  className={`p-3 text-center border-r border-slate-200 last:border-r-0 transition-colors ${
                    d.isToday
                      ? "bg-blue-50/80 text-blue-700"
                      : d.isSelected
                      ? "bg-slate-100/80 text-slate-800"
                      : "text-slate-700"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs font-bold block">{d.label}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
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
                {/* Shift Column */}
                <td className="p-3 border-r border-slate-200 bg-slate-50/50 text-center w-28">
                  <span className="text-xs font-bold text-slate-800 block">
                    {shift.label}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {shift.timeRange}
                  </span>
                </td>

                {/* 7 Days Columns for this Shift */}
                {weekDays.map((d) => {
                  const daySlots = slots.filter(
                    (s) =>
                      s.date === d.dateStr && s.shift === shift.key
                  );

                  return (
                    <td
                      key={d.dayNum}
                      className={`p-2 border-r border-slate-200 last:border-r-0 min-h-[140px] w-[13.5%] transition-colors ${
                        d.isToday ? "bg-blue-50/20" : ""
                      }`}
                    >
                      {daySlots.length === 0 ? (
                        <div className="h-full min-h-[110px] flex items-center justify-center text-[11px] text-slate-300 italic border border-dashed border-slate-100 rounded-lg p-2">
                          Trống
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {daySlots.map((slot) => {
                            const isOngoing = slot.status === "ongoing";
                            return (
                              <div
                                key={slot.id}
                                onClick={() => onSlotClick(slot)}
                                className={`p-2.5 rounded-lg border shadow-2xs cursor-pointer transition-all duration-200 relative group hover:shadow-xs hover:-translate-y-0.5 ${getThemeStyles(
                                  slot.colorTheme
                                )} ${isOngoing ? "ring-2 ring-blue-500" : ""}`}
                              >
                                {isOngoing && (
                                  <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600" />
                                  </span>
                                )}

                                {/* Top: Course Code & Class Type */}
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="text-[11px] font-black tracking-wide font-mono">
                                    {slot.courseCode}
                                  </span>
                                  <Tag
                                    color={slot.classType === "practice" ? "green" : "blue"}
                                    className="text-[10px] px-1.5 py-0 m-0 leading-tight font-medium"
                                  >
                                    {slot.classType === "practice" ? "Thực hành" : "Lý thuyết"}
                                  </Tag>
                                </div>

                                {/* Course Name */}
                                <h4 className="text-xs font-bold leading-snug line-clamp-2 mb-1.5 group-hover:text-blue-600 transition-colors">
                                  {slot.courseName}
                                </h4>

                                {/* Time & Periods */}
                                <div className="flex items-center gap-1 text-[11px] text-slate-600 mb-1">
                                  <Icon name="clock" size={11} className="shrink-0 text-slate-400" />
                                  <span className="font-medium">
                                    {slot.startTime} - {slot.endTime}
                                  </span>
                                </div>

                                {/* Room & Building */}
                                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 mb-1">
                                  <Icon name="map-pin" size={11} className="shrink-0 text-slate-400" />
                                  <span className="truncate">
                                    {slot.room} • {slot.building}
                                  </span>
                                </div>

                                {/* Instructor */}
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 truncate pt-1 border-t border-slate-200/60 mt-1">
                                  <Icon name="user" size={10} className="shrink-0 text-slate-400" />
                                  <span className="truncate">{slot.instructorName}</span>
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
