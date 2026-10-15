import React from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { TimetableSlot } from "@/modules/students/features/timetable/types";

interface ListViewProps {
  slots: TimetableSlot[];
  onSlotClick?: (slot: TimetableSlot) => void;
}

export const ListView: React.FC<ListViewProps> = ({ slots, onSlotClick }) => {
  const { t } = useTranslation(["card", "message"]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ongoing":
        return <Tag color="processing">{t("card:timetable.status.ongoing")}</Tag>;
      case "completed":
        return <Tag color="default">{t("card:timetable.status.completed")}</Tag>;
      case "cancelled":
        return <Tag color="error">{t("card:timetable.status.cancelled")}</Tag>;
      case "upcoming":
      default:
        return <Tag color="blue">{t("card:timetable.status.upcoming")}</Tag>;
    }
  };

  const getDayLabel = (dayNum: number) => {
    switch (dayNum) {
      case 2:
        return t("card:timetable.days.mon");
      case 3:
        return t("card:timetable.days.tue");
      case 4:
        return t("card:timetable.days.wed");
      case 5:
        return t("card:timetable.days.thu");
      case 6:
        return t("card:timetable.days.fri");
      case 7:
        return t("card:timetable.days.sat");
      case 8:
      default:
        return t("card:timetable.days.sun");
    }
  };

  if (slots.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center bg-white border border-[#f0f0f0] rounded-xl shadow-2xs">
        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Icon name="search" size={20} />
        </div>
        <h4 className="text-sm font-bold text-slate-800 mb-1">
          {t("message:empty.noFilteredResults")}
        </h4>
        <p className="text-xs text-slate-500 mb-0">
          {t("message:empty.noFilteredDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {/* 1. Mobile & Small Tablet View: List Cards */}
      <div className="block md:hidden space-y-3">
        {slots.map((slot) => {
          const slotDate = dayjs(slot.date);
          const formattedDate = slotDate.format("DD/MM/YYYY");
          const dayName = getDayLabel(slot.dayOfWeek);
          const isPractice = slot.classType === "practice";
          const isOnline = Boolean(slot.onlineUrl);
          const isOnLeave =
            Boolean(slot.isOnLeave) || slot.attendanceStatus === "excused";

          return (
            <div
              key={slot.id}
              onClick={() => onSlotClick?.(slot)}
              className={`p-3.5 rounded-xl border shadow-2xs space-y-2.5 transition-all ${
                isOnLeave
                  ? "bg-amber-50/80 border-amber-200"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              {/* Card Header: Date & Status */}
              <div className="flex items-center justify-between pb-2 border-b border-[#f0f0f0]">
                <div className="flex items-center gap-1.5 text-xs text-slate-700">
                  <Icon name="calendar" size={13} className="text-blue-600 shrink-0" />
                  <span className="font-bold text-slate-900">{formattedDate}</span>
                  <span className="text-slate-500">({dayName})</span>
                </div>
                {getStatusBadge(slot.status)}
              </div>

              {/* Course & Class */}
              <div className="space-y-1">
                <div className="text-[11px] text-slate-500">
                  {slot.courseCode} • {t("card:timetable.classLabel", { classCode: slot.className || slot.classCode })}
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-0">
                  {slot.courseName}
                </h4>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#f0f0f0] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Icon name="clock" size={13} className="text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800">
                    {slot.startTime} - {slot.endTime}
                  </span>
                  <span className="text-slate-400 text-[11px]">({slot.periods})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="map-pin" size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate" title={slot.room}>
                    {slot.room} • {slot.building}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="user" size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate" title={slot.instructorName}>
                    {slot.instructorName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Tag
                    color={isPractice ? "green" : "blue"}
                    className="text-[10px] px-1.5 py-0.5 m-0 font-semibold"
                  >
                    {isPractice
                      ? t("card:timetable.classTypes.practice")
                      : t("card:timetable.classTypes.theory")}
                  </Tag>
                  <Tag
                    color={isOnline ? "purple" : "cyan"}
                    className="text-[10px] px-1.5 py-0.5 m-0 font-semibold"
                  >
                    {isOnline
                      ? t("card:timetable.teachingMethods.online")
                      : t("card:timetable.teachingMethods.inPerson")}
                  </Tag>
                </div>
              </div>

              {/* Online class link or note */}
              {slot.onlineUrl && (
                <div className="pt-2 border-t border-[#f0f0f0]">
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
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 2. Desktop & Tablet Large View: Table with Horizontal Scroll */}
      <div className="hidden md:block bg-white border border-[#f0f0f0] rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap min-w-350">
            <thead>
              <tr className="bg-slate-50/80 border-b border-[#f0f0f0] text-slate-500 font-semibold uppercase text-[11px] tracking-wider whitespace-nowrap">
                <th className="py-3 px-4">{t("card:timetable.tableHeaders.date")}</th>
                <th className="py-3 px-4">{t("card:timetable.tableHeaders.timePeriods")}</th>
                <th className="py-3 px-4">{t("card:timetable.tableHeaders.courseCode")}</th>
                <th className="py-3 px-4">{t("card:timetable.tableHeaders.courseName")}</th>
                <th className="py-3 px-4 text-center">{t("card:timetable.tableHeaders.classType")}</th>
                <th className="py-3 px-4 text-center">{t("card:timetable.tableHeaders.teachingMethod")}</th>
                <th className="py-3 px-4">{t("card:timetable.tableHeaders.room")}</th>
                <th className="py-3 px-4">{t("card:timetable.tableHeaders.teacher")}</th>
                <th className="py-3 px-4">{t("card:timetable.tableHeaders.notes")}</th>
                <th className="py-3 px-4 text-center">{t("card:timetable.tableHeaders.status")}</th>
                <th className="py-3 px-4 text-center">{t("card:timetable.tableHeaders.link")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {slots.map((slot) => {
                const slotDate = dayjs(slot.date);
                const formattedDate = slotDate.format("DD/MM/YYYY");
                const dayName = getDayLabel(slot.dayOfWeek);
                const isPractice = slot.classType === "practice";
                const isOnline = Boolean(slot.onlineUrl);
                const isOnLeave =
                  Boolean(slot.isOnLeave) || slot.attendanceStatus === "excused";

                return (
                  <tr
                    key={slot.id}
                    onClick={() => onSlotClick?.(slot)}
                    className={`transition-colors whitespace-nowrap ${
                      isOnLeave
                        ? "bg-amber-50/70 hover:bg-amber-100/60"
                        : "hover:bg-slate-50/70"
                    }`}
                  >
                    {/* 1. Date Column */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">
                        {formattedDate}
                      </span>
                      <span className="text-slate-400 font-medium ml-1.5">
                        ({dayName})
                      </span>
                    </td>

                    {/* 2. Time & Periods */}
                    <td className="py-3 px-4 font-medium text-slate-700">
                      <span>{slot.startTime} - {slot.endTime}</span>
                      <span className="text-blue-600 font-medium ml-1.5">
                        ({slot.periods})
                      </span>
                    </td>

                    {/* 3. Course Code */}
                    <td className="py-3 px-4 font-bold text-slate-700">
                      {slot.courseCode}
                    </td>

                    {/* 4. Course Name */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">
                        {slot.courseName}
                      </span>
                      <span className="text-slate-400 text-[11px] ml-1.5">
                        ({t("card:timetable.classLabel", { classCode: slot.className || slot.classCode })} • {t("card:timetable.periodsPerWeek", { count: slot.credits })})
                      </span>
                    </td>

                    {/* 5. Class Type */}
                    <td className="py-3 px-4 text-center">
                      <Tag
                        color={isPractice ? "green" : "blue"}
                        className="text-[10px] px-2 py-0.5 m-0 font-semibold inline-block"
                      >
                        {isPractice ? t("card:timetable.classTypes.practice") : t("card:timetable.classTypes.theory")}
                      </Tag>
                    </td>

                    {/* 6. Teaching Method */}
                    <td className="py-3 px-4 text-center">
                      <Tag
                        color={isOnline ? "purple" : "cyan"}
                        className="text-[10px] px-2 py-0.5 m-0 font-semibold inline-block"
                      >
                        {isOnline ? t("card:timetable.teachingMethods.online") : t("card:timetable.teachingMethods.inPerson")}
                      </Tag>
                    </td>

                    {/* 7. Room & Building */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">
                        {slot.room}
                      </span>
                      <span className="text-slate-500">
                        {" "}• {slot.building}
                      </span>
                    </td>

                    {/* 8. Teacher */}
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {slot.instructorName}
                    </td>

                    {/* 9. Note */}
                    <td className="py-3 px-4 text-slate-600 italic text-[11px]">
                      {slot.notes || slot.lessonTopic || "—"}
                    </td>

                    {/* 10. Status */}
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(slot.status)}
                    </td>

                    {/* 11. Online Link */}
                    <td className="py-3 px-4 text-center">
                      {slot.onlineUrl ? (
                        <a
                          href={slot.onlineUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium hover:underline text-xs"
                        >
                          <Icon name="external-link" size={13} className="shrink-0" />
                          <span>{t("card:timetable.joinOnlineClass")}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
