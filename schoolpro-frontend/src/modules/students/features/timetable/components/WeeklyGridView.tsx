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
  onSlotClick?: (slot: TimetableSlot) => void;
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
    <div className="bg-white border border-[#f0f0f0] rounded-xl shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1850px] border-collapse table-fixed text-left">
          {/* Table Header: 7 Days with expanded equal width columns */}
          <thead>
            <tr className="bg-slate-50 border-b border-[#f0f0f0]">
              <th className="w-32 min-w-32 p-3 text-center border-r border-[#f0f0f0] text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Ca học
              </th>
              {weekDays.map((d) => (
                <th
                  key={d.dayNum}
                  className={`p-3 text-center border-r border-[#f0f0f0] last:border-r-0 transition-colors w-61.25 min-w-61.25 ${
                    d.isToday
                      ? "bg-blue-50/80 text-blue-700"
                      : "text-slate-700"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs font-bold block">{d.label}</span>
                    <div className="mt-0.5">
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium inline-block ${
                          d.isToday
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

                {/* 7 Day Columns with identical equal height cards */}
                {weekDays.map((d) => {
                  const daySlots = slots.filter(
                    (s) => s.date === d.dateStr && s.shift === shift.key,
                  );

                  return (
                    <td
                      key={d.dayNum}
                      className={`p-2.5 border-r border-[#f0f0f0] last:border-r-0 w-61.25 min-w-61.25 align-top transition-colors h-1 ${
                        d.isToday ? "bg-blue-50/20" : ""
                      }`}
                    >
                      {daySlots.length === 0 ? (
                        <div className="w-full h-full min-h-105 flex items-center justify-center text-xs text-slate-300 italic border border-dashed border-slate-100 rounded-xl bg-slate-50/30 select-none">
                          <span>Trống</span>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col gap-2.5">
                          {daySlots.map((slot) => {
                            const isPractice = slot.classType === "practice";
                            const isOnline = Boolean(slot.onlineUrl);
                            const isOngoing = slot.status === "ongoing";

                            return (
                              <div
                                key={slot.id}
                                className="w-full h-full min-h-105 bg-white border border-[#f0f0f0] rounded-xl p-3.5 flex flex-col justify-between shadow-2xs transition-all relative"
                              >
                                {isOngoing && (
                                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
                                  </span>
                                )}

                                {/* Top Section: Info 1 -> 6 */}
                                <div className="space-y-2.5">
                                  {/* 1. Môn học */}
                                  <div className="pb-2 border-b border-slate-100 min-h-14.5">
                                    <div className="text-[11px] font-mono font-medium text-slate-500 mb-0.5 truncate">
                                      {slot.courseCode} • {slot.classCode}
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-0" title={slot.courseName}>
                                      {slot.courseName}
                                    </h4>
                                  </div>

                                  {/* 2. Phòng học */}
                                  <div className="flex items-start gap-2 text-xs text-slate-700 min-h-8.5">
                                    <Icon
                                      name="map-pin"
                                      size={14}
                                      className="text-slate-400 shrink-0 mt-0.5"
                                    />
                                    <div className="leading-snug">
                                      <span className="font-semibold text-slate-800">
                                        {slot.room}
                                      </span>
                                      <span className="text-slate-500">
                                        {" "}• {slot.building}
                                      </span>
                                      {slot.campus && (
                                        <div className="text-[11px] text-slate-400 mt-0.5">
                                          {slot.campus}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* 3. Giờ học */}
                                  <div className="flex items-center gap-2 text-xs text-slate-700">
                                    <Icon
                                      name="clock"
                                      size={14}
                                      className="text-slate-400 shrink-0"
                                    />
                                    <div className="font-medium">
                                      <span>
                                        {slot.startTime} - {slot.endTime}
                                      </span>
                                      <span className="text-slate-500 text-[11px] ml-1">
                                        ({slot.periods})
                                      </span>
                                    </div>
                                  </div>

                                  {/* 4. Người dạy */}
                                  <div className="flex items-center gap-2 text-xs text-slate-700">
                                    <Icon
                                      name="user"
                                      size={14}
                                      className="text-slate-400 shrink-0"
                                    />
                                    <span className="font-medium text-slate-800 truncate" title={slot.instructorName}>
                                      {slot.instructorName}
                                    </span>
                                  </div>

                                  {/* 5. Hình thức học: Lý thuyết hoặc thực hành */}
                                  <div className="flex items-center justify-between gap-1.5 text-xs">
                                    <span className="text-slate-500">
                                      Hình thức học:
                                    </span>
                                    <Tag
                                      color={isPractice ? "green" : "blue"}
                                      className="m-0 text-[11px] font-semibold px-2 py-0.5"
                                    >
                                      {isPractice ? "Thực hành" : "Lý thuyết"}
                                    </Tag>
                                  </div>

                                  {/* 6. Hình thức dạy: Trực tuyến hay Trực tiếp */}
                                  <div className="flex items-center justify-between gap-1.5 text-xs">
                                    <span className="text-slate-500">
                                      Hình thức dạy:
                                    </span>
                                    <Tag
                                      color={isOnline ? "purple" : "cyan"}
                                      className="m-0 text-[11px] font-semibold px-2 py-0.5"
                                    >
                                      {isOnline ? "Trực tuyến" : "Trực tiếp"}
                                    </Tag>
                                  </div>
                                </div>

                                {/* Bottom Section: Info 7 -> 8 */}
                                <div className="space-y-2 pt-2.5 border-t border-slate-100">
                                  {/* 7. Ghi chú: */}
                                  <div className="text-xs">
                                    <span className="text-slate-500 font-medium block mb-1">
                                      Ghi chú:
                                    </span>
                                    <div
                                      className="text-slate-700 italic text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100/80 leading-relaxed min-h-11.5 flex items-center"
                                      title={slot.notes || slot.lessonTopic}
                                    >
                                      <span className="line-clamp-2">
                                        {slot.notes || slot.lessonTopic || "Không có ghi chú"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* 8. Liên kết khác */}
                                  <div className="text-xs min-h-9.5 flex flex-col justify-end">
                                    <span className="text-slate-500 font-medium block mb-1">
                                      Liên kết khác:
                                    </span>
                                    {slot.onlineUrl ? (
                                      <a
                                        href={slot.onlineUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold hover:underline text-xs bg-blue-50/60 hover:bg-blue-50 px-2 py-1 rounded-md border border-blue-100 transition-colors w-fit"
                                      >
                                        <Icon
                                          name="external-link"
                                          size={13}
                                          className="shrink-0"
                                        />
                                        <span>Vào lớp học trực tuyến</span>
                                      </a>
                                    ) : (
                                      <span className="text-slate-400 italic text-xs">
                                        Không có
                                      </span>
                                    )}
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
