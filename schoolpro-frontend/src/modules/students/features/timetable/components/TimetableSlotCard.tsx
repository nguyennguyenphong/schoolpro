import React from "react";
import { useTranslation } from "react-i18next";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { TimetableSlot } from "@/modules/students/features/timetable/types";

export interface TimetableSlotCardProps {
  slot: TimetableSlot;
  className?: string;
  onSlotClick?: (slot: TimetableSlot) => void;
}

export const TimetableSlotCard: React.FC<TimetableSlotCardProps> = ({
  slot,
  className = "",
  onSlotClick,
}) => {
  const { t } = useTranslation(["card"]);
  const isPractice = slot.classType === "practice";
  const isOnline = Boolean(slot.onlineUrl);
  const isOngoing = slot.status === "ongoing";
  const isOnLeave = Boolean(slot.isOnLeave) || slot.attendanceStatus === "excused";

  return (
    <div
      onClick={() => onSlotClick?.(slot)}
      className={`w-full h-full min-h-105 border rounded-xl p-3.5 sm:p-4 flex flex-col justify-between shadow-2xs transition-all relative ${
        isOnLeave
          ? "bg-amber-50/80 border-amber-200"
          : "bg-white border-[#f0f0f0]"
      } ${className}`}
    >
      {isOngoing && (
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
        </span>
      )}

      {/* Top Section: Môn học, Lớp, Phòng, Thời gian, Giáo viên & Email, Hình thức */}
      <div className="space-y-2.5">
        {/* 1. Môn học & Lớp (Không hiển thị mã code) */}
        <div className="pb-2 border-b border-[#f0f0f0] min-h-14.5">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-xl border border-blue-100">
              <Icon name="academic" size={12} className="text-blue-600 shrink-0" />
              <span>
                {t("card:timetable.classLabel", {
                  classCode: slot.className || slot.classCode,
                })}
              </span>
            </span>
          </div>
          <h4
            className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mb-0"
            title={slot.courseName}
          >
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
          <div className="leading-snug space-y-0.5">
            <div className="font-semibold text-slate-800">
              <span>{slot.room}</span>
              {slot.building && (
                <span className="font-normal text-slate-500"> • {slot.building}</span>
              )}
            </div>
            {slot.campus && (
              <div className="text-[11px] text-slate-400">
                {slot.campus}
              </div>
            )}
          </div>
        </div>

        {/* 3. Thời gian học & Tiết mấy */}
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
            <span className="text-slate-500 text-[11px] ml-1.5 font-normal">
              ({slot.periods})
            </span>
          </div>
        </div>

        {/* 4. Giáo viên */}
        <div className="flex items-center gap-2 text-xs text-slate-700">
          <Icon
            name="user"
            size={14}
            className="text-slate-400 shrink-0"
          />
          <span className="font-semibold text-slate-800 truncate" title={slot.instructorName}>
            {slot.instructorName}
          </span>
        </div>

        {/* 5. Hình thức học */}
        <div className="flex items-center justify-between gap-1.5 text-xs">
          <span className="text-slate-500">
            {t("card:timetable.learningMode")}
          </span>
          <Tag
            color={isPractice ? "green" : "blue"}
            className="m-0 text-[11px] font-semibold px-2 py-0.5"
          >
            {isPractice ? t("card:timetable.classTypes.practice") : t("card:timetable.classTypes.theory")}
          </Tag>
        </div>

        {/* 6. Hình thức dạy */}
        <div className="flex items-center justify-between gap-1.5 text-xs">
          <span className="text-slate-500">
            {t("card:timetable.teachingMode")}
          </span>
          <Tag
            color={isOnline ? "purple" : "cyan"}
            className="m-0 text-[11px] font-semibold px-2 py-0.5"
          >
            {isOnline ? t("card:timetable.teachingMethods.online") : t("card:timetable.teachingMethods.inPerson")}
          </Tag>
        </div>
      </div>

      {/* Bottom Section: Ghi chú & Liên kết khác */}
      <div className="space-y-2 pt-2.5 border-t border-[#f0f0f0]">
        {/* 7. Ghi chú */}
        <div className="text-xs">
          <span className="text-slate-500 font-medium italic block mb-1">
            {t("card:timetable.notes")}
          </span>
          <div
            className="text-slate-700 italic text-[11px] bg-slate-50 p-2 rounded-lg border border-[#f0f0f0]/80 leading-relaxed min-h-11.5 flex items-center"
            title={slot.notes || slot.lessonTopic}
          >
            <span className="line-clamp-2">
              {slot.notes || slot.lessonTopic || t("card:timetable.noNotes")}
            </span>
          </div>
        </div>

        {/* 8. Liên kết khác */}
        <div className="text-xs min-h-9.5 flex flex-col justify-end">
          <span className="text-slate-500 font-medium italic block mb-1">
            {t("card:timetable.otherLinks")}
          </span>
          {slot.onlineUrl ? (
            <a
              href={slot.onlineUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold hover:underline text-xs bg-blue-50/60 hover:bg-blue-50 px-2 py-1 rounded-xl border border-blue-100 transition-colors w-fit"
            >
              <Icon
                name="external-link"
                size={13}
                className="shrink-0"
              />
              <span>{t("card:timetable.joinOnlineClass")}</span>
            </a>
          ) : (
            <span className="text-slate-400 italic text-xs">
              {t("card:timetable.noLink")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
