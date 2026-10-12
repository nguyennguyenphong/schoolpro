import { message } from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
  calculateStudyDaysCount,
  computeApprovalDeadlinePreview,
  computeNotificationRecipients,
  getNearestValidStudyDate,
  toTimetableDayOfWeek,
} from "@/modules/students/features/leave-requests/utils";

export interface UseLeaveRequestFormOptions {
  editingItem: LeaveRequestItem | null;
  summary: LeaveRequestSummary | null;
  onSuccess: (savedItem: LeaveRequestItem) => void;
}

export function useLeaveRequestForm({
  editingItem,
  summary,
  onSuccess,
}: UseLeaveRequestFormOptions) {
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
        const res = await leaveRequestsService.getAffectedLessons(startDate, endDate, "all_day");
        if (!ignore) {
          if (res.activeDaysOfWeek && res.activeDaysOfWeek.length > 0) {
            setActiveDaysOfWeek(res.activeDaysOfWeek);
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
          setAllDayLessonsForRange(res.affectedLessons || []);
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

  const approvalDeadlineInfo = useMemo(() => {
    const preview = computeApprovalDeadlinePreview(selectedLessons);
    if (!preview) return null;
    return {
      firstLessonLabel: t("card:leaveRequests.form.firstLessonSummary", {
        period: preview.firstLesson.periodNumber,
        subject: preview.firstLesson.subjectName,
        time: preview.firstLesson.startTime,
        date: dayjs(preview.firstLesson.date).format("DD/MM/YYYY"),
      }),
      deadlineFormatted: preview.deadlineFormatted,
    };
  }, [selectedLessons, t]);

  const notificationRecipients = useMemo(
    () => computeNotificationRecipients(selectedLessons, summary),
    [selectedLessons, summary],
  );

  const calculatedDays = useMemo(
    () =>
      calculateStudyDaysCount(
        startDate,
        endDate,
        sessionShift,
        allDayLessonsForRange,
        availableLessons.length,
      ),
    [startDate, endDate, sessionShift, allDayLessonsForRange, availableLessons.length],
  );

  const hasNoLessonsInSelection = !loadingLessons && availableLessons.length === 0;
  const hasNoSelectedLessons = !loadingLessons && selectedLessons.length === 0;

  const isDateDisabledByTimetable = (current: dayjs.Dayjs | null): boolean => {
    if (!current) return false;
    return !activeDaysOfWeek.includes(toTimetableDayOfWeek(current));
  };

  const handleSessionShiftChange = (nextShift: LeaveSessionShift) => {
    setSessionShift(nextShift);
    setCustomSelectedKeys(null);
  };

  const handleStartDateChange = (nextStart: string) => {
    setStartDate(nextStart);
    setCustomSelectedKeys(null);
    if (endDate && nextStart > endDate) {
      setEndDate(nextStart);
    }
  };

  const handleEndDateChange = (nextEnd: string) => {
    setEndDate(nextEnd);
    setCustomSelectedKeys(null);
  };

  const handleToggleLesson = (lessonKey: string, checked: boolean) => {
    setCustomSelectedKeys((prev) => {
      const base = prev ?? availableLessons.map((l) => l.lessonKey);
      return checked ? [...base, lessonKey] : base.filter((k) => k !== lessonKey);
    });
  };

  const handleToggleAllLessons = (checked: boolean) => {
    setCustomSelectedKeys(checked ? availableLessons.map((l) => l.lessonKey) : []);
  };

  const handleAddAttachment = (file: File) => {
    const newItem: LeaveRequestAttachment = {
      id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: file.name,
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      type: file.type.includes("image") ? "image" : "pdf",
      url: URL.createObjectURL(file),
    };
    setAttachments((prev) => [...prev, newItem]);
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
      const errMsg = err instanceof Error ? err.message : t("message:leaveRequestSaveError");
      setFormError(errMsg);
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    leaveType,
    setLeaveType,
    startDate,
    endDate,
    sessionShift,
    reason,
    setReason,
    commitment,
    setCommitment,
    guardianName,
    setGuardianName,
    guardianPhone,
    setGuardianPhone,
    guardianRelationship,
    setGuardianRelationship,
    attachments,
    allDayLessonsForRange,
    availableLessons,
    selectedLessons,
    selectedLessonKeys,
    morningLessonsCount,
    afternoonLessonsCount,
    loadingLessons,
    submitting,
    formError,
    calculatedDays,
    hasNoLessonsInSelection,
    hasNoSelectedLessons,
    approvalDeadlineInfo,
    notificationRecipients,
    isDateDisabledByTimetable,
    handleSessionShiftChange,
    handleStartDateChange,
    handleEndDateChange,
    handleToggleLesson,
    handleToggleAllLessons,
    handleAddAttachment,
    handleRemoveAttachment,
    handleSubmit,
  };
}
