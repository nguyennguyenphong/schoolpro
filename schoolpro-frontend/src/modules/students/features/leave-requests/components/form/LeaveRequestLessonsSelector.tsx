import dayjs from "dayjs";
import type React from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/Checkbox";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { LeaveAffectedLesson } from "@/modules/students/features/leave-requests/types";

interface LeaveRequestLessonsSelectorProps {
  availableLessons: LeaveAffectedLesson[];
  selectedLessonKeys: string[];
  loadingLessons: boolean;
  hasNoLessonsInSelection: boolean;
  classDisplayName: string;
  homeroomDisplayName: string;
  onToggleLesson: (lessonKey: string, checked: boolean) => void;
  onToggleAllLessons: (checked: boolean) => void;
}

export const LeaveRequestLessonsSelector: React.FC<LeaveRequestLessonsSelectorProps> = ({
  availableLessons,
  selectedLessonKeys,
  loadingLessons,
  hasNoLessonsInSelection,
  classDisplayName,
  homeroomDisplayName,
  onToggleLesson,
  onToggleAllLessons,
}) => {
  const { t } = useTranslation(["card", "input"]);
  const selectedCount = availableLessons.filter((l) =>
    selectedLessonKeys.includes(l.lessonKey),
  ).length;

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
        className={`p-4 rounded-xl border space-y-3 transition-opacity ${
          hasNoLessonsInSelection
            ? "bg-slate-100/80 border-slate-200 opacity-75"
            : "bg-slate-50 border-slate-200/80"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <Icon name="book" size={14} className="text-blue-600" />
            <span>{t("card:leaveRequests.form.lessonsSectionTitle")}</span>
          </div>

          {availableLessons.length > 0 && (
            <Checkbox
              id="leave-request-select-all-lessons"
              name="selectAllLessons"
              checked={
                availableLessons.length > 0 &&
                selectedLessonKeys.length === availableLessons.length
              }
              indeterminate={
                selectedLessonKeys.length > 0 &&
                selectedLessonKeys.length < availableLessons.length
              }
              onChange={(e) => onToggleAllLessons(e.target.checked)}
            >
              <span className="text-xs font-semibold text-slate-600">
                {t("input:leaveRequests.selectAllLessons", {
                  selected: selectedCount,
                  total: availableLessons.length,
                })}
              </span>
            </Checkbox>
          )}
        </div>

        <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-[11px] text-blue-800 flex items-start gap-2">
          <Icon name="info" size={14} className="text-blue-600 shrink-0 mt-0.5" />
          <span>
            {t("card:leaveRequests.form.autoNotificationNotice", {
              teacherName: homeroomDisplayName,
            })}
          </span>
        </div>

        {loadingLessons ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-pulse">
            {[1, 2, 3, 4].map((skeletonIdx) => (
              <div
                key={skeletonIdx}
                className="p-3 rounded-xl bg-white border border-slate-200 flex items-start gap-2.5"
              >
                <div className="w-4 h-4 rounded bg-slate-200 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="h-4 w-28 bg-slate-200 rounded" />
                    <div className="h-4 w-14 bg-slate-100 rounded" />
                  </div>
                  <div className="h-3 w-40 bg-slate-100 rounded" />
                  <div className="h-3 w-32 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : availableLessons.length === 0 ? (
          <div className="p-4 rounded-xl bg-white border border-amber-200 text-xs text-amber-800 text-center font-medium">
            {t("card:leaveRequests.form.noLessonsInSlot")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {availableLessons.map((lesson) => {
              const isChecked = selectedLessonKeys.includes(lesson.lessonKey);
              const checkboxId = `leave-request-lesson-${lesson.lessonKey}`;
              return (
                <div
                  key={lesson.lessonKey}
                  onClick={() => onToggleLesson(lesson.lessonKey, !isChecked)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                    isChecked
                      ? "bg-white border-blue-300 shadow-2xs"
                      : "bg-slate-100/60 border-slate-200 opacity-75"
                  }`}
                >
                  <div onClick={(e) => e.stopPropagation()} className="pt-0.5">
                    <Checkbox
                      id={checkboxId}
                      name={`lesson_${lesson.lessonKey}`}
                      aria-label={`${lesson.subjectName} - ${t("card:leaveRequests.form.periodBadge", {
                        period: lesson.periodNumber,
                      })}`}
                      checked={isChecked}
                      onChange={(e) => onToggleLesson(lesson.lessonKey, e.target.checked)}
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {lesson.subjectName}
                      </span>
                      <Tag color="blue" className="m-0 text-[10px] font-semibold px-1.5 py-0">
                        {t("card:leaveRequests.form.periodBadge", {
                          period: lesson.periodNumber,
                        })}
                      </Tag>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {lesson.dayOfWeekLabel} ({dayjs(lesson.date).format("DD/MM/YYYY")}) •{" "}
                      {lesson.startTime} - {lesson.endTime}
                    </div>
                    <div className="text-[11px] text-slate-600 truncate">
                      {t("card:leaveRequests.form.subjectTeacherPrefix")}{" "}
                      <strong className="text-slate-800">{lesson.teacherName}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
