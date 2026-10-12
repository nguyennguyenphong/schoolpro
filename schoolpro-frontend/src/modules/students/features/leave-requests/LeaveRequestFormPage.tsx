import { message } from "antd";
import dayjs from "dayjs";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { DatePicker } from "@/components/ui/DatePicker";
import { Icon } from "@/components/ui/Icon";
import { Input, TextArea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Tag } from "@/components/ui/Tag";
import { Upload } from "@/components/ui/Upload";
import { leaveRequestsService } from "@/modules/students/features/leave-requests/services";
import type {
  LeaveAffectedLesson,
  LeaveRequestAttachment,
  LeaveRequestItem,
  LeaveRequestSummary,
  LeaveSessionShift,
  LeaveType,
} from "@/modules/students/features/leave-requests/types";
import {
  formatLeaveDateRange,
  getLeaveTypeLabel,
  getSessionShiftLabel,
} from "@/modules/students/features/leave-requests/utils/leaveRequestHelpers";

/**
 * Converts a Dayjs weekday (0 = Sunday, 1 = Monday ... 6 = Saturday)
 * to SchoolPro DB timetable day_of_week (2 = Monday ... 7 = Saturday, 8 = Sunday).
 */
function toTimetableDayOfWeek(d: dayjs.Dayjs): number {
  const jsDay = d.day();
  return jsDay === 0 ? 8 : jsDay + 1;
}

/**
 * Finds the nearest date starting from `baseDate` that falls on one of `activeDaysOfWeek`.
 */
function getNearestValidStudyDate(baseDate: dayjs.Dayjs, activeDaysOfWeek: number[]): string {
  if (!activeDaysOfWeek || activeDaysOfWeek.length === 0) {
    return baseDate.format("YYYY-MM-DD");
  }
  for (let offset = 0; offset <= 7; offset += 1) {
    const candidate = baseDate.add(offset, "day");
    if (activeDaysOfWeek.includes(toTimetableDayOfWeek(candidate))) {
      return candidate.format("YYYY-MM-DD");
    }
  }
  return baseDate.format("YYYY-MM-DD");
}

interface LeaveRequestFormBodyProps {
  editingItem: LeaveRequestItem | null;
  summary: LeaveRequestSummary | null;
  onCancel: () => void;
  onSuccess: (savedItem: LeaveRequestItem) => void;
}

const LeaveRequestFormBody: React.FC<LeaveRequestFormBodyProps> = ({
  editingItem,
  summary,
  onCancel,
  onSuccess,
}) => {
  const { t } = useTranslation(["input", "card", "button", "validation", "message"]);

  const initialDefaultDate = useMemo(
    () => getNearestValidStudyDate(dayjs(), [2, 3, 4, 5, 6, 7]),
    [],
  );

  const [leaveType, setLeaveType] = useState<LeaveType>(editingItem?.leaveType ?? "sick");
  const [startDate, setStartDate] = useState<string>(editingItem?.startDate ?? initialDefaultDate);
  const [endDate, setEndDate] = useState<string>(editingItem?.endDate ?? initialDefaultDate);
  const [sessionShift, setSessionShift] = useState<LeaveSessionShift>(
    editingItem?.sessionShift ?? "all_day",
  );
  const [reason, setReason] = useState<string>(editingItem?.reason ?? "");
  const [commitment, setCommitment] = useState<string>(
    editingItem?.commitment || t("input:leaveRequests.defaultCommitment"),
  );
  const [guardianName, setGuardianName] = useState<string>(
    editingItem?.guardianName || summary?.guardianName || "",
  );
  const [guardianPhone, setGuardianPhone] = useState<string>(
    editingItem?.guardianPhone || summary?.guardianPhone || "",
  );
  const [guardianRelationship, setGuardianRelationship] = useState<string>(
    editingItem?.guardianRelationship ||
      summary?.guardianRelationship ||
      t("input:leaveRequests.relationshipGuardian"),
  );
  const [attachments, setAttachments] = useState<LeaveRequestAttachment[]>(
    editingItem?.attachments ?? [],
  );

  // Full day timetable lessons for the selected date range (used to know both morning & afternoon availability)
  const [allDayLessonsForRange, setAllDayLessonsForRange] = useState<LeaveAffectedLesson[]>(
    editingItem?.affectedLessons ?? [],
  );
  const [activeDaysOfWeek, setActiveDaysOfWeek] = useState<number[]>([2, 3, 4, 5, 6, 7]);
  const [customSelectedKeys, setCustomSelectedKeys] = useState<string[] | null>(null);
  const [loadingLessons, setLoadingLessons] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchTimetableForDateRange() {
      if (!startDate || !endDate || dayjs(endDate).isBefore(dayjs(startDate), "day")) {
        setAllDayLessonsForRange([]);
        return;
      }

      try {
        setLoadingLessons(true);
        // Fetch all_day lessons so we can inspect both morning and afternoon availability on the selected dates
        const res = await leaveRequestsService.getAffectedLessons(startDate, endDate, "all_day");
        if (!ignore) {
          if (res.activeDaysOfWeek && res.activeDaysOfWeek.length > 0) {
            setActiveDaysOfWeek(res.activeDaysOfWeek);
            // If creating a new request and initial date is not an active weekday, snap once to nearest active weekday
            if (
              !editingItem &&
              startDate === endDate &&
              !res.activeDaysOfWeek.includes(toTimetableDayOfWeek(dayjs(startDate)))
            ) {
              const snapped = getNearestValidStudyDate(dayjs(startDate), res.activeDaysOfWeek);
              if (snapped !== startDate) {
                setStartDate(snapped);
                setEndDate(snapped);
                return;
              }
            }
          }
          const fetchedAllDay = res.affectedLessons || [];
          setAllDayLessonsForRange(fetchedAllDay);
        }
      } finally {
        if (!ignore) {
          setLoadingLessons(false);
        }
      }
    }

    fetchTimetableForDateRange();

    return () => {
      ignore = true;
    };
  }, [startDate, endDate, editingItem]);

  // Lessons filtered by current sessionShift ("all_day" | "morning" | "afternoon")
  const availableLessons = useMemo(() => {
    if (sessionShift === "all_day") {
      return allDayLessonsForRange;
    }
    return allDayLessonsForRange.filter((l) => l.shift === sessionShift);
  }, [allDayLessonsForRange, sessionShift]);

  const selectedLessonKeys = useMemo(
    () => customSelectedKeys ?? availableLessons.map((l) => l.lessonKey),
    [customSelectedKeys, availableLessons],
  );

  const morningLessonsCount = useMemo(
    () => allDayLessonsForRange.filter((l) => l.shift === "morning").length,
    [allDayLessonsForRange],
  );

  const afternoonLessonsCount = useMemo(
    () => allDayLessonsForRange.filter((l) => l.shift === "afternoon").length,
    [allDayLessonsForRange],
  );

  const selectedLessons = useMemo(
    () => availableLessons.filter((l) => selectedLessonKeys.includes(l.lessonKey)),
    [availableLessons, selectedLessonKeys],
  );

  // Earliest lesson start time & Approval Deadline (3 hours before first lesson)
  const approvalDeadlineInfo = useMemo(() => {
    if (selectedLessons.length === 0) return null;
    let earliest: dayjs.Dayjs | null = null;
    let firstLesson: LeaveAffectedLesson | null = null;
    for (const lesson of selectedLessons) {
      const candidate = dayjs(`${lesson.date} ${lesson.startTime || "07:15"}`, "YYYY-MM-DD HH:mm");
      if (candidate.isValid() && (!earliest || candidate.isBefore(earliest))) {
        earliest = candidate;
        firstLesson = lesson;
      }
    }
    if (!earliest || !firstLesson) return null;
    const deadline = earliest.subtract(3, "hour");
    return {
      firstLessonLabel: t("card:leaveRequests.form.firstLessonSummary", {
        period: firstLesson.periodNumber,
        subject: firstLesson.subjectName,
        time: firstLesson.startTime,
        date: dayjs(firstLesson.date).format("DD/MM/YYYY"),
      }),
      deadlineFormatted: deadline.format("HH:mm - DD/MM/YYYY"),
    };
  }, [selectedLessons, t]);

  // Group notified teachers and detect if Homeroom Teacher is also teaching one of the affected subjects
  const notificationRecipients = useMemo(() => {
    const homeroomEmail = (summary?.homeroomTeacherEmail || "").trim().toLowerCase();
    const homeroomName = (summary?.homeroomTeacherName || "").trim().toLowerCase();

    let homeroomTeachingSubjects: string[] = [];
    let homeroomLessonCount = 0;

    const otherTeachersMap = new Map<
      string,
      {
        teacherId: string;
        teacherName: string;
        teacherEmail: string;
        subjects: string[];
        lessonCount: number;
      }
    >();

    for (const lesson of selectedLessons) {
      const tEmail = (lesson.teacherEmail || "").trim().toLowerCase();
      const tName = (lesson.teacherName || "").trim().toLowerCase();
      const isHomeroom =
        (Boolean(homeroomEmail) && tEmail === homeroomEmail) ||
        (Boolean(homeroomName) && tName === homeroomName);

      if (isHomeroom) {
        if (!homeroomTeachingSubjects.includes(lesson.subjectName)) {
          homeroomTeachingSubjects = [...homeroomTeachingSubjects, lesson.subjectName];
        }
        homeroomLessonCount += 1;
        continue;
      }

      const key = lesson.teacherEmail || lesson.teacherId || lesson.teacherName;
      if (!key) continue;
      const existing = otherTeachersMap.get(key);
      if (!existing) {
        otherTeachersMap.set(key, {
          teacherId: lesson.teacherId,
          teacherName: lesson.teacherName,
          teacherEmail: lesson.teacherEmail,
          subjects: [lesson.subjectName],
          lessonCount: 1,
        });
      } else {
        if (!existing.subjects.includes(lesson.subjectName)) {
          existing.subjects.push(lesson.subjectName);
        }
        existing.lessonCount += 1;
      }
    }

    return {
      homeroomAlsoSubjectTeacher: homeroomLessonCount > 0,
      homeroomTeachingSubjects,
      homeroomLessonCount,
      otherSubjectTeachers: Array.from(otherTeachersMap.values()),
    };
  }, [selectedLessons, summary?.homeroomTeacherEmail, summary?.homeroomTeacherName]);

  const calculatedDays = useMemo(() => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    if (!start.isValid() || !end.isValid() || end.isBefore(start, "day")) {
      return 0;
    }
    // Count only days that actually have timetable lessons in the range
    const uniqueLessonDates = new Set(allDayLessonsForRange.map((l) => l.date));
    const activeDaysCount = uniqueLessonDates.size;
    if (activeDaysCount === 0) {
      return 0;
    }
    if (
      activeDaysCount === 1 &&
      (sessionShift === "morning" || sessionShift === "afternoon")
    ) {
      return availableLessons.length > 0 ? 0.5 : 0;
    }
    return activeDaysCount;
  }, [startDate, endDate, sessionShift, allDayLessonsForRange, availableLessons.length]);

  const hasNoLessonsInSelection = !loadingLessons && availableLessons.length === 0;
  const hasNoSelectedLessons = !loadingLessons && selectedLessons.length === 0;

  const isDateDisabledByTimetable = (current: dayjs.Dayjs | null): boolean => {
    if (!current) return false;
    const dow = toTimetableDayOfWeek(current);
    return !activeDaysOfWeek.includes(dow);
  };

  const handleToggleLesson = (lessonKey: string, checked: boolean) => {
    setCustomSelectedKeys((prev) => {
      const base = prev ?? availableLessons.map((l) => l.lessonKey);
      return checked ? [...base, lessonKey] : base.filter((k) => k !== lessonKey);
    });
  };

  const handleToggleAllLessons = (checked: boolean) => {
    if (checked) {
      setCustomSelectedKeys(availableLessons.map((l) => l.lessonKey));
    } else {
      setCustomSelectedKeys([]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setFormError(null);

    if (!startDate || !endDate) {
      setFormError(t("validation:leaveRequests.dateRangeRequired"));
      return;
    }

    if (dayjs(endDate).isBefore(dayjs(startDate), "day")) {
      setFormError(t("validation:leaveRequests.endDateBeforeStart"));
      return;
    }

    if (availableLessons.length === 0) {
      setFormError(t("validation:leaveRequests.noLessonsInTimetable"));
      return;
    }

    if (selectedLessonKeys.length === 0) {
      setFormError(t("validation:leaveRequests.atLeastOneLessonRequired"));
      return;
    }

    if (!reason.trim() || reason.trim().length < 10) {
      setFormError(t("validation:leaveRequests.reasonMinLength"));
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        leaveType,
        startDate,
        endDate,
        sessionShift,
        reason: reason.trim(),
        commitment: commitment.trim(),
        attachments,
        selectedLessonKeys,
        guardianName: guardianName.trim(),
        guardianPhone: guardianPhone.trim(),
        guardianRelationship: guardianRelationship.trim(),
      };

      const saved = editingItem
        ? await leaveRequestsService.updateLeaveRequest(editingItem.id, payload)
        : await leaveRequestsService.createLeaveRequest(payload);

      message.success(
        editingItem
          ? t("message:leaveRequestUpdatedSuccess")
          : t("message:leaveRequestCreatedSuccess"),
      );
      onSuccess(saved);
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : t("message:leaveRequestSaveError");
      setFormError(errMsg);
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const homeroomDisplayName =
    summary?.homeroomTeacherName || t("card:leaveRequests.header.homeroomTeacherFallback");
  const classDisplayName = summary?.className || "10A1";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
      {/* Left 2 Columns: Form */}
      <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-5">
        {formError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <Icon name="warning" size={15} className="text-rose-600 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* 1. Loại đơn & Ca nghỉ (Khóa ca nghỉ nếu buổi đó không có môn học trong Thời khóa biểu) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {t("input:leaveRequests.leaveTypeLabel")} <span className="text-rose-500">*</span>
            </label>
            <Select
              value={leaveType}
              onChange={(val: LeaveType) => setLeaveType(val)}
              className="w-full"
              options={[
                { label: t("card:leaveRequests.leaveTypes.sick"), value: "sick" },
                { label: t("card:leaveRequests.leaveTypes.family_affair"), value: "family_affair" },
                { label: t("card:leaveRequests.leaveTypes.bereavement"), value: "bereavement" },
                {
                  label: t("card:leaveRequests.leaveTypes.official_competition"),
                  value: "official_competition",
                },
                { label: t("card:leaveRequests.leaveTypes.other"), value: "other" },
              ]}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {t("input:leaveRequests.sessionShiftLabel")} <span className="text-rose-500">*</span>
            </label>
            <Select
              value={sessionShift}
              onChange={(val: LeaveSessionShift) => {
                setSessionShift(val);
                setCustomSelectedKeys(null);
              }}
              className="w-full"
              options={[
                {
                  label: t("input:leaveRequests.shiftAllDayOption", {
                    count: allDayLessonsForRange.length,
                  }),
                  value: "all_day",
                },
                {
                  label:
                    !loadingLessons && morningLessonsCount === 0
                      ? t("input:leaveRequests.shiftMorningLockedOption")
                      : t("input:leaveRequests.shiftMorningOption", {
                          count: morningLessonsCount,
                        }),
                  value: "morning",
                  disabled: !loadingLessons && morningLessonsCount === 0,
                },
                {
                  label:
                    !loadingLessons && afternoonLessonsCount === 0
                      ? t("input:leaveRequests.shiftAfternoonLockedOption")
                      : t("input:leaveRequests.shiftAfternoonOption", {
                          count: afternoonLessonsCount,
                        }),
                  value: "afternoon",
                  disabled: !loadingLessons && afternoonLessonsCount === 0,
                },
              ]}
            />
          </div>
        </div>

        {/* 2. Từ ngày - Đến ngày (Khóa các ngày không có lịch học trong Thời khóa biểu) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {t("input:leaveRequests.startDateLabel")} <span className="text-rose-500">*</span>
            </label>
            <DatePicker
              format="DD/MM/YYYY"
              allowClear={false}
              value={startDate ? dayjs(startDate) : null}
              disabledDate={(current) => isDateDisabledByTimetable(current)}
              onChange={(dateVal) => {
                const singleDate = Array.isArray(dateVal) ? dateVal[0] : dateVal;
                if (!singleDate) return;
                const nextStart = singleDate.format("YYYY-MM-DD");
                setStartDate(nextStart);
                setCustomSelectedKeys(null);
                if (endDate && nextStart > endDate) {
                  setEndDate(nextStart);
                }
              }}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {t("input:leaveRequests.endDateLabel")} <span className="text-rose-500">*</span>
            </label>
            <DatePicker
              format="DD/MM/YYYY"
              allowClear={false}
              value={endDate ? dayjs(endDate) : null}
              disabledDate={(current) =>
                Boolean(
                  isDateDisabledByTimetable(current) ||
                    (startDate && current && current.isBefore(dayjs(startDate), "day")),
                )
              }
              onChange={(dateVal) => {
                const singleDate = Array.isArray(dateVal) ? dateVal[0] : dateVal;
                if (!singleDate) return;
                setEndDate(singleDate.format("YYYY-MM-DD"));
                setCustomSelectedKeys(null);
              }}
              className="w-full"
            />
          </div>

          <div
            className={`p-2.5 rounded-xl border text-center ${
              calculatedDays > 0
                ? "bg-blue-50/70 border-blue-200"
                : "bg-amber-50/80 border-amber-200"
            }`}
          >
            <span className="text-[11px] text-slate-500 block">
              {t("input:leaveRequests.totalDurationLabel")}
            </span>
            <strong
              className={`text-sm font-extrabold ${
                calculatedDays > 0 ? "text-blue-700" : "text-amber-700"
              }`}
            >
              {calculatedDays > 0
                ? t("input:leaveRequests.studyDaysCount", { count: calculatedDays })
                : t("input:leaveRequests.noStudyLessons")}
            </strong>
          </div>
        </div>

        {/* Cảnh báo khóa khi chọn ngày hoặc buổi học không có môn học nào trong Thời khóa biểu */}
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

        {/* 3. Môn học / Tiết học xin nghỉ & Thông báo Giáo viên bộ môn */}
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
                checked={
                  availableLessons.length > 0 &&
                  selectedLessonKeys.length === availableLessons.length
                }
                indeterminate={
                  selectedLessonKeys.length > 0 &&
                  selectedLessonKeys.length < availableLessons.length
                }
                onChange={(e) => handleToggleAllLessons(e.target.checked)}
              >
                <span className="text-xs font-semibold text-slate-600">
                  {t("input:leaveRequests.selectAllLessons", {
                    selected: selectedLessons.length,
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
            <div className="py-6 text-center text-xs text-slate-500">
              {t("card:leaveRequests.form.checkingTimetable")}
            </div>
          ) : availableLessons.length === 0 ? (
            <div className="p-4 rounded-xl bg-white border border-amber-200 text-xs text-amber-800 text-center font-medium">
              {t("card:leaveRequests.form.noLessonsInSlot")}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {availableLessons.map((lesson) => {
                const isChecked = selectedLessonKeys.includes(lesson.lessonKey);
                return (
                  <div
                    key={lesson.lessonKey}
                    onClick={() => handleToggleLesson(lesson.lessonKey, !isChecked)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isChecked
                        ? "bg-white border-blue-300 shadow-2xs"
                        : "bg-slate-100/60 border-slate-200 opacity-75"
                    }`}
                  >
                    <div onClick={(e) => e.stopPropagation()} className="pt-0.5">
                      <Checkbox
                        checked={isChecked}
                        onChange={(e) => handleToggleLesson(lesson.lessonKey, e.target.checked)}
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

        {/* 4. Lý do xin nghỉ chi tiết */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            {t("input:leaveRequests.reasonLabel")} <span className="text-rose-500">*</span>
          </label>
          <TextArea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("input:leaveRequests.reasonPlaceholder")}
          />
        </div>

        {/* 5. Thông tin Phụ huynh xác nhận */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Icon name="users" size={14} className="text-blue-600" />
            <span>{t("input:leaveRequests.guardianSectionTitle")}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                {t("input:leaveRequests.guardianNameLabel")}
              </label>
              <Input
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder={t("input:leaveRequests.guardianNamePlaceholder")}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                {t("input:leaveRequests.guardianPhoneLabel")}
              </label>
              <Input
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder={t("input:leaveRequests.guardianPhonePlaceholder")}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                {t("input:leaveRequests.guardianRelationshipLabel")}
              </label>
              <Select
                value={guardianRelationship}
                onChange={(val: string) => setGuardianRelationship(val)}
                className="w-full"
                options={[
                  {
                    label: t("input:leaveRequests.relationshipFather"),
                    value: t("input:leaveRequests.relationshipFather"),
                  },
                  {
                    label: t("input:leaveRequests.relationshipMother"),
                    value: t("input:leaveRequests.relationshipMother"),
                  },
                  {
                    label: t("input:leaveRequests.relationshipGrandparent"),
                    value: t("input:leaveRequests.relationshipGrandparent"),
                  },
                  {
                    label: t("input:leaveRequests.relationshipGuardian"),
                    value: t("input:leaveRequests.relationshipGuardian"),
                  },
                ]}
              />
            </div>
          </div>
        </div>

        {/* 6. Đính kèm minh chứng */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-700 block">
            {t("input:leaveRequests.attachmentLabel")}
          </label>

          <Upload.Dragger
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            showUploadList={false}
            beforeUpload={(file) => {
              const newItem: LeaveRequestAttachment = {
                id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                name: file.name,
                size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
                type: file.type.includes("image") ? "image" : "pdf",
                url: URL.createObjectURL(file),
              };
              setAttachments((prev) => [...prev, newItem]);
              return false;
            }}
            className="rounded-xl"
          >
            <div className="py-2 flex flex-col items-center justify-center gap-1">
              <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                <Icon name="upload" size={18} />
              </span>
              <p className="text-xs font-semibold text-slate-700 mb-0">
                {t("input:leaveRequests.attachmentDropzoneTitle")}
              </p>
              <p className="text-[11px] text-slate-400 mb-0">
                {t("input:leaveRequests.attachmentDropzoneHint")}
              </p>
            </div>
          </Upload.Dragger>

          {attachments.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {attachments.map((att, idx) => (
                <div
                  key={att.id || idx}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon name="paperclip" size={13} className="text-blue-600 shrink-0" />
                    <span className="font-medium text-slate-700 truncate">{att.name}</span>
                    {att.size && <span className="text-slate-400 text-[11px]">({att.size})</span>}
                  </div>
                  <Button
                    size="small"
                    variant="danger"
                    onClick={() => handleRemoveAttachment(idx)}
                  >
                    <Icon name="delete" size={12} />
                    <span>{t("button:delete")}</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 7. Cam kết học tập của học sinh */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            {t("input:leaveRequests.commitmentLabel")}
          </label>
          <TextArea
            rows={3}
            value={commitment}
            onChange={(e) => setCommitment(e.target.value)}
            placeholder={t("input:leaveRequests.commitmentPlaceholder")}
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onCancel} disabled={submitting}>
            {t("button:cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
            disabled={
              submitting ||
              loadingLessons ||
              hasNoLessonsInSelection ||
              hasNoSelectedLessons
            }
          >
            <Icon name="send" size={14} />
            <span>
              {hasNoLessonsInSelection
                ? t("button:lockedNoLessons")
                : editingItem
                  ? t("button:updateLeaveRequest")
                  : t("button:submitLeaveRequest")}
            </span>
          </Button>
        </div>
      </div>

      {/* Right Column: Live Summary, Subject Teachers Notification & School Policy */}
      <div className="space-y-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
            <h3 className="text-sm font-bold text-slate-900 mb-0">
              {t("card:leaveRequests.form.summaryCardTitle")}
            </h3>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">
                {t("card:leaveRequests.form.approverLabel")}
              </span>
              <strong className="text-slate-900">{homeroomDisplayName}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">{t("card:leaveRequests.summary.classLabel")}</span>
              <strong className="text-blue-600">
                {t("card:leaveRequests.header.classBadge", { className: classDisplayName })}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">{t("card:leaveRequests.form.categoryLabel")}</span>
              <strong className="text-slate-800">{getLeaveTypeLabel(leaveType)}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">{t("card:leaveRequests.form.leaveTimeLabel")}</span>
              <strong className="text-slate-800">
                {formatLeaveDateRange(startDate, endDate)}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">{t("card:leaveRequests.form.totalDaysLabel")}</span>
              <strong className="text-blue-700">
                {t("card:leaveRequests.item.daysAndShift", {
                  days: calculatedDays,
                  shift: getSessionShiftLabel(sessionShift),
                })}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">
                {t("card:leaveRequests.form.selectedLessonsCountLabel")}
              </span>
              <strong className="text-indigo-600">
                {t("card:leaveRequests.form.periodsCount", { count: selectedLessons.length })}
              </strong>
            </div>

            {approvalDeadlineInfo && (
              <div className="pt-2 border-t border-slate-200/80 space-y-1">
                <div className="text-[11px] text-slate-500">
                  {t("card:leaveRequests.form.firstLessonLabel")}{" "}
                  <strong className="text-slate-700">{approvalDeadlineInfo.firstLessonLabel}</strong>
                </div>
                <div className="text-[11px] text-amber-800 bg-amber-50/90 border border-amber-200 rounded-xl px-2.5 py-1.5">
                  {t("card:leaveRequests.form.deadlineLabel")}{" "}
                  <strong className="font-mono">{approvalDeadlineInfo.deadlineFormatted}</strong>
                  <span className="block text-[10px] text-amber-700 mt-0.5">
                    {t("card:leaveRequests.form.deadlineAutoApproveHint")}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Danh sách Giáo viên nhận thông báo & Email */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
              <h3 className="text-sm font-bold text-slate-900 mb-0">
                {t("card:leaveRequests.form.recipientsCardTitle")}
              </h3>
            </div>
            <Tag color="purple" className="m-0 text-[11px] font-semibold">
              {t("card:leaveRequests.form.recipientsCount", {
                count: notificationRecipients.otherSubjectTeachers.length + 1,
              })}
            </Tag>
          </div>

          <div className="space-y-2 text-xs">
            {/* Giáo viên chủ nhiệm */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-2">
              <div className="min-w-0 space-y-0.5">
                <div className="font-bold text-slate-900 truncate">{homeroomDisplayName}</div>
                <div className="text-[11px] text-slate-600">
                  {notificationRecipients.homeroomAlsoSubjectTeacher ? (
                    <span>
                      {t("card:leaveRequests.form.homeroomCombinedDesc", {
                        subjects: notificationRecipients.homeroomTeachingSubjects.join(", "),
                        count: notificationRecipients.homeroomLessonCount,
                      })}
                    </span>
                  ) : (
                    <span>
                      {t("card:leaveRequests.form.homeroomOnlyDesc", {
                        className: classDisplayName,
                      })}
                    </span>
                  )}
                </div>
              </div>
              <Tag color="blue" className="m-0 text-[10px] font-bold shrink-0">
                {notificationRecipients.homeroomAlsoSubjectTeacher
                  ? t("card:leaveRequests.form.homeroomCombinedBadge")
                  : t("card:leaveRequests.form.approverBadge")}
              </Tag>
            </div>

            {/* Các Giáo viên bộ môn khác */}
            {notificationRecipients.otherSubjectTeachers.map((teacher, idx) => (
              <div
                key={teacher.teacherId || idx}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 truncate">
                    {teacher.teacherName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {t("card:leaveRequests.form.subjectLessonsSummary", {
                      subjects: teacher.subjects.join(", "),
                      count: teacher.lessonCount,
                    })}
                  </div>
                </div>
                <Tag color="cyan" className="m-0 text-[10px] font-semibold shrink-0">
                  {t("card:leaveRequests.form.notifiedBadge")}
                </Tag>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-amber-500 inline-block" />
            <h3 className="text-sm font-bold text-slate-900 mb-0">
              {t("card:leaveRequests.form.policyCardTitle")}
            </h3>
          </div>
          <ul className="list-disc pl-4 space-y-1.5 text-slate-600 mb-0">
            <li>{t("card:leaveRequests.form.policyRule1")}</li>
            <li>{t("card:leaveRequests.form.policyRule2")}</li>
            <li>{t("card:leaveRequests.form.policyRule3")}</li>
            <li>{t("card:leaveRequests.form.policyRule4")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const LeaveRequestFormPage: React.FC = () => {
  const { t } = useTranslation(["navigation", "button"]);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [editingItem, setEditingItem] = useState<LeaveRequestItem | null>(null);
  const [summary, setSummary] = useState<LeaveRequestSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let ignore = false;

    async function loadContext() {
      try {
        setLoading(true);
        const [sumRes, itemRes] = await Promise.all([
          leaveRequestsService.getSummary(),
          id ? leaveRequestsService.getLeaveRequestById(id) : Promise.resolve(null),
        ]);
        if (!ignore) {
          setSummary(sumRes);
          setEditingItem(itemRes);
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadContext();

    return () => {
      ignore = true;
    };
  }, [id]);

  return (
    <div className="space-y-4 sm:space-y-5 pb-8">
      {/* Page Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-2.5">
        <Breadcrumb
          items={[
            {
              href: "/student/home",
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                  <Icon name="home" size={13} className="text-slate-400 shrink-0" />
                  <span>{t("navigation:breadcrumb.home")}</span>
                </span>
              ),
            },
            {
              href: "/student/leave-requests",
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                  <Icon name="file-text" size={13} className="text-slate-400 shrink-0" />
                  <span>{t("navigation:breadcrumb.leaveRequests")}</span>
                </span>
              ),
            },
            {
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                  <span>
                    {isEditMode
                      ? t("navigation:breadcrumb.leaveRequestEdit")
                      : t("navigation:breadcrumb.leaveRequestCreate")}
                  </span>
                </span>
              ),
            },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
                {isEditMode
                  ? t("navigation:pageTitle.leaveRequestEdit")
                  : t("navigation:pageTitle.leaveRequestCreate")}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mb-0">
              {t("navigation:pageSubtitle.leaveRequestForm")}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() =>
              navigate(isEditMode && id ? `/student/leave-requests/${id}` : "/student/leave-requests")
            }
          >
            <Icon name="arrow-left" size={14} />
            <span>{t("button:back")}</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <Card
          loading={true}
          className="rounded-xl shadow-2xs border-[#f0f0f0] h-96"
          skeletonProps={{ paragraph: { rows: 8 } }}
        />
      ) : (
        <LeaveRequestFormBody
          key={`${editingItem?.id ?? "new"}-${summary?.guardianName ?? ""}`}
          editingItem={editingItem}
          summary={summary}
          onCancel={() =>
            navigate(isEditMode && id ? `/student/leave-requests/${id}` : "/student/leave-requests")
          }
          onSuccess={(savedItem) => navigate(`/student/leave-requests/${savedItem.id}`)}
        />
      )}
    </div>
  );
};

export default LeaveRequestFormPage;
