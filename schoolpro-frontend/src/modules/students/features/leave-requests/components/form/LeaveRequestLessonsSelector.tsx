import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { LeaveAffectedLesson } from "@/modules/students/features/leave-requests/types";

interface LeaveRequestLessonsSelectorProps {
  availableLessons: LeaveAffectedLesson[];
  selectedLessonKeys?: string[];
  loadingLessons: boolean;
  hasNoLessonsInSelection: boolean;
  classDisplayName: string;
  homeroomDisplayName: string;
  onToggleLesson?: (lessonKey: string, checked: boolean) => void;
  onToggleAllLessons?: (checked: boolean) => void;
}

interface LessonsByDateGroup {
  date: string;
  dayOfWeekLabel: string;
  lessons: LeaveAffectedLesson[];
}

export const LeaveRequestLessonsSelector: React.FC<LeaveRequestLessonsSelectorProps> = ({
  availableLessons,
  loadingLessons,
  hasNoLessonsInSelection,
  classDisplayName,
  homeroomDisplayName,
}) => {
  const { t } = useTranslation(["card", "input"]);
  const [selectedDateTab, setSelectedDateTab] = useState<string>("all");

  // Group lessons by study date
  const lessonsByDate = useMemo<LessonsByDateGroup[]>(() => {
    const map = new Map<string, LessonsByDateGroup>();
    for (const lesson of availableLessons) {
      if (!map.has(lesson.date)) {
        map.set(lesson.date, {
          date: lesson.date,
          dayOfWeekLabel: lesson.dayOfWeekLabel,
          lessons: [],
        });
      }
      map.get(lesson.date)!.lessons.push(lesson);
    }

    const groups = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
    for (const group of groups) {
      group.lessons.sort((a, b) => a.periodNumber - b.periodNumber);
    }
    return groups;
  }, [availableLessons]);

  // Extract distinct affected subjects for a quick preview
  const uniqueSubjects = useMemo(() => {
    const set = new Set<string>();
    for (const lesson of availableLessons) {
      if (lesson.subjectName) {
        set.add(lesson.subjectName);
      }
    }
    return Array.from(set);
  }, [availableLessons]);

  // Determine which day groups to display (all or filtered by tab)
  const displayedGroups = useMemo(() => {
    if (selectedDateTab === "all") {
      return lessonsByDate;
    }
    return lessonsByDate.filter((group) => group.date === selectedDateTab);
  }, [lessonsByDate, selectedDateTab]);

  return (
    <>
      {hasNoLessonsInSelection && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-2.5">
          <Icon name="warning" size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">{t("card:leaveRequests.form.lockedWarningTitle")}</div>
            <p className="mb-0 text-amber-800 leading-relaxed">
              {t("card:leaveRequests.form.lockedWarningDesc", {
                className: classDisplayName,
              })}
            </p>
          </div>
        </div>
      )}

      <div
        className={`p-4 rounded-xl border space-y-3.5 transition-opacity ${
          hasNoLessonsInSelection
            ? "bg-slate-100/80 border-slate-200 opacity-75"
            : "bg-slate-50 border-slate-200/80"
        }`}
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Icon name="book" size={14} />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              {t("card:leaveRequests.form.lessonsSectionTitle")}
            </span>
            {availableLessons.length > 0 && !loadingLessons && (
              <span className="text-xs font-semibold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full border border-blue-200">
                {t("card:leaveRequests.form.periodsCount", {
                  count: availableLessons.length,
                })}
              </span>
            )}
          </div>

          {uniqueSubjects.length > 0 && !loadingLessons && (
            <div className="flex flex-wrap items-center gap-1.5">
              {uniqueSubjects.map((subject) => (
                <Tag key={subject} color="blue" className="m-0 text-[10.5px] font-medium px-2 py-0">
                  {subject}
                </Tag>
              ))}
            </div>
          )}
        </div>

        {/* Notice Section */}
        <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-[11px] text-blue-800 flex items-start gap-2">
          <Icon name="info" size={14} className="text-blue-600 shrink-0 mt-0.5" />
          <span>
            {t("card:leaveRequests.form.autoNotificationNotice", {
              teacherName: homeroomDisplayName,
            })}
          </span>
        </div>

        {/* Multi-day Quick Navigation Pills (friendly when there are many dates/lessons) */}
        {!loadingLessons && lessonsByDate.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
            <button
              type="button"
              onClick={() => setSelectedDateTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedDateTab === "all"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {t("input:filter.all")} ({availableLessons.length})
            </button>
            {lessonsByDate.map((group) => {
              const isSelected = selectedDateTab === group.date;
              const formattedDate = dayjs(group.date).format("DD/MM");
              return (
                <button
                  key={group.date}
                  type="button"
                  onClick={() => setSelectedDateTab(group.date)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <span>
                    {group.dayOfWeekLabel} ({formattedDate})
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {group.lessons.length}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Content Section: Loading / Empty / Grouped Schedule Rows */}
        {loadingLessons ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map((groupSkeletonIdx) => (
              <div
                key={groupSkeletonIdx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <div className="bg-slate-100 h-9 px-3.5 flex items-center justify-between">
                  <div className="h-4 w-36 bg-slate-200 rounded" />
                  <div className="h-4 w-14 bg-slate-200 rounded" />
                </div>
                <div className="divide-y divide-slate-100 p-1">
                  {[1, 2].map((rowSkeletonIdx) => (
                    <div
                      key={rowSkeletonIdx}
                      className="p-3 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-12 bg-slate-200 rounded" />
                        <div className="h-3 w-24 bg-slate-100 rounded" />
                        <div className="h-3 w-28 bg-slate-200 rounded" />
                      </div>
                      <div className="h-3 w-32 bg-slate-100 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : availableLessons.length === 0 ? (
          <div className="p-4 rounded-xl bg-white border border-amber-200 text-xs text-amber-800 text-center font-medium">
            {t("card:leaveRequests.form.noLessonsInSlot")}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedGroups.map((group) => (
              <div
                key={group.date}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs"
              >
                {/* Date Group Header */}
                <div className="bg-slate-50/90 px-3.5 py-2.5 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Icon name="calendar" size={13} />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {group.dayOfWeekLabel},{" "}
                      <span className="font-semibold text-slate-600">
                        {dayjs(group.date).format("DD/MM/YYYY")}
                      </span>
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {t("card:leaveRequests.form.periodsCount", {
                      count: group.lessons.length,
                    })}
                  </span>
                </div>

                {/* Timetable Rows for this Date */}
                <div className="divide-y divide-slate-100">
                  {group.lessons.map((lesson) => (
                    <div
                      key={lesson.lessonKey}
                      className="p-3 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Left: Period Badge + Time + Subject */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] shrink-0 text-white ${
                              lesson.shift === "morning" ? "bg-blue-600" : "bg-purple-600"
                            }`}
                          >
                            {t("card:leaveRequests.form.periodBadge", {
                              period: lesson.periodNumber,
                            })}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                            <Icon name="clock" size={12} className="text-slate-400 shrink-0" />
                            <span>
                              {lesson.startTime} - {lesson.endTime}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 min-w-0 truncate">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {lesson.subjectName}
                          </span>
                          {lesson.shift && (
                            <Tag
                              color={lesson.shift === "morning" ? "blue" : "purple"}
                              className="m-0 text-[10px] font-semibold px-1.5 py-0 shrink-0"
                            >
                              {t(`card:leaveRequests.shifts.${lesson.shift}`)}
                            </Tag>
                          )}
                        </div>
                      </div>

                      {/* Right: Subject Teacher + Room */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 text-[11px] pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-600 truncate">
                          <span className="text-slate-400">
                            {t("card:leaveRequests.form.subjectTeacherPrefix")}
                          </span>
                          <strong className="text-slate-800 truncate">{lesson.teacherName}</strong>
                        </div>
                        {lesson.roomName && (
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                            {lesson.roomName}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
