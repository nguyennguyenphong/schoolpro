import { message } from "antd";
import dayjs from "dayjs";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
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
  LEAVE_TYPE_LABELS,
  SESSION_SHIFT_LABELS,
  formatLeaveDateRange,
} from "@/modules/students/features/leave-requests/utils/leaveRequestHelpers";

const DEFAULT_COMMITMENT =
  "Em xin hứa sẽ chép bài, làm bài tập đầy đủ và tự ôn tập kiến thức trong thời gian nghỉ học.";

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
    editingItem?.commitment || DEFAULT_COMMITMENT,
  );
  const [guardianName, setGuardianName] = useState<string>(
    editingItem?.guardianName || summary?.guardianName || "",
  );
  const [guardianPhone, setGuardianPhone] = useState<string>(
    editingItem?.guardianPhone || summary?.guardianPhone || "",
  );
  const [guardianRelationship, setGuardianRelationship] = useState<string>(
    editingItem?.guardianRelationship || summary?.guardianRelationship || "Phụ huynh",
  );
  const [attachments, setAttachments] = useState<LeaveRequestAttachment[]>(
    editingItem?.attachments ?? [],
  );

  // Full day timetable lessons for the selected date range (used to know both morning & afternoon availability)
  const [allDayLessonsForRange, setAllDayLessonsForRange] = useState<LeaveAffectedLesson[]>(
    editingItem?.affectedLessons ?? [],
  );
  const [activeDaysOfWeek, setActiveDaysOfWeek] = useState<number[]>([2, 3, 4, 5, 6, 7]);
  const [selectedLessonKeys, setSelectedLessonKeys] = useState<string[]>(
    editingItem?.affectedLessons?.map((l) => l.lessonKey) ?? [],
  );
  const [loadingLessons, setLoadingLessons] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchTimetableForDateRange() {
      if (!startDate || !endDate || dayjs(endDate).isBefore(dayjs(startDate), "day")) {
        setAllDayLessonsForRange([]);
        setSelectedLessonKeys([]);
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

  // Synchronize selectedLessonKeys whenever availableLessons changes
  useEffect(() => {
    setSelectedLessonKeys(availableLessons.map((l) => l.lessonKey));
  }, [availableLessons]);

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
      firstLessonLabel: `Tiết ${firstLesson.periodNumber} (${firstLesson.subjectName}) lúc ${firstLesson.startTime} ngày ${dayjs(firstLesson.date).format("DD/MM/YYYY")}`,
      deadlineFormatted: deadline.format("HH:mm [ngày] DD/MM/YYYY"),
    };
  }, [selectedLessons]);

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
    setSelectedLessonKeys((prev) =>
      checked ? [...prev, lessonKey] : prev.filter((k) => k !== lessonKey),
    );
  };

  const handleToggleAllLessons = (checked: boolean) => {
    if (checked) {
      setSelectedLessonKeys(availableLessons.map((l) => l.lessonKey));
    } else {
      setSelectedLessonKeys([]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setFormError(null);

    if (!startDate || !endDate) {
      setFormError("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc nghỉ.");
      return;
    }

    if (dayjs(endDate).isBefore(dayjs(startDate), "day")) {
      setFormError("Ngày kết thúc không được nhỏ hơn ngày bắt đầu nghỉ.");
      return;
    }

    if (availableLessons.length === 0) {
      setFormError(
        "Ngày hoặc buổi học đã chọn không có môn học nào trong Thời khóa biểu. Vui lòng chọn ngày/buổi học có tiết trong Thời khóa biểu.",
      );
      return;
    }

    if (selectedLessonKeys.length === 0) {
      setFormError("Vui lòng chọn ít nhất 01 tiết học trong Thời khóa biểu để đăng ký nghỉ phép.");
      return;
    }

    if (!reason.trim() || reason.trim().length < 10) {
      setFormError("Vui lòng nhập lý do xin nghỉ phép chi tiết (tối thiểu 10 ký tự).");
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
          ? "Cập nhật đơn xin nghỉ phép thành công!"
          : "Đã gửi đơn xin nghỉ phép và gửi Email/Thông báo tới Giáo viên chủ nhiệm & Giáo viên bộ môn!",
      );
      onSuccess(saved);
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : "Đã có lỗi xảy ra khi lưu đơn xin nghỉ phép.";
      setFormError(errMsg);
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

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
              Loại đơn xin nghỉ <span className="text-rose-500">*</span>
            </label>
            <Select
              value={leaveType}
              onChange={(val: LeaveType) => setLeaveType(val)}
              className="w-full"
              options={[
                { label: "Nghỉ ốm / Khám chữa bệnh", value: "sick" },
                { label: "Việc gia đình", value: "family_affair" },
                { label: "Việc hiếu / Tang chế", value: "bereavement" },
                { label: "Thi đấu / Công tác đoàn trường", value: "official_competition" },
                { label: "Lý do khác", value: "other" },
              ]}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Buổi / Ca xin nghỉ (Theo Thời khóa biểu) <span className="text-rose-500">*</span>
            </label>
            <Select
              value={sessionShift}
              onChange={(val: LeaveSessionShift) => setSessionShift(val)}
              className="w-full"
              options={[
                {
                  label: `Nghỉ cả ngày (${allDayLessonsForRange.length} tiết)`,
                  value: "all_day",
                },
                {
                  label:
                    !loadingLessons && morningLessonsCount === 0
                      ? "Chỉ nghỉ buổi sáng (Không có môn học - Đã khóa)"
                      : `Chỉ nghỉ buổi sáng (${morningLessonsCount} tiết)`,
                  value: "morning",
                  disabled: !loadingLessons && morningLessonsCount === 0,
                },
                {
                  label:
                    !loadingLessons && afternoonLessonsCount === 0
                      ? "Chỉ nghỉ buổi chiều (Không có môn học - Đã khóa)"
                      : `Chỉ nghỉ buổi chiều (${afternoonLessonsCount} tiết)`,
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
              Từ ngày (Chỉ mở ngày có lịch học) <span className="text-rose-500">*</span>
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
                if (endDate && nextStart > endDate) {
                  setEndDate(nextStart);
                }
              }}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Đến hết ngày <span className="text-rose-500">*</span>
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
            <span className="text-[11px] text-slate-500 block">Tổng thời gian nghỉ</span>
            <strong
              className={`text-sm font-extrabold ${
                calculatedDays > 0 ? "text-blue-700" : "text-amber-700"
              }`}
            >
              {calculatedDays > 0 ? `${calculatedDays} ngày học` : "Không có môn học"}
            </strong>
          </div>
        </div>

        {/* Cảnh báo khóa khi chọn ngày hoặc buổi học không có môn học nào trong Thời khóa biểu */}
        {hasNoLessonsInSelection && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-2.5">
            <Icon name="warning" size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">
                Đã khóa đăng ký: Không có môn học nào trong Thời khóa biểu vào buổi/ngày đã chọn!
              </div>
              <p className="mb-0 text-amber-800 leading-relaxed">
                Lịch xin nghỉ bắt buộc phải rơi vào ngày và buổi học có môn học trong Thời khóa biểu của lớp{" "}
                <strong>{summary?.className || "10A1"}</strong>. Vui lòng đổi sang{" "}
                <strong>Nghỉ cả ngày / Buổi học có tiết</strong> hoặc chọn ngày học khác.
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
              <span>Các môn học xin nghỉ theo Thời khóa biểu</span>
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
                  Chọn tất cả ({selectedLessons.length}/{availableLessons.length} tiết)
                </span>
              </Checkbox>
            )}
          </div>

          <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-[11px] text-blue-800 flex items-start gap-2">
            <Icon name="info" size={14} className="text-blue-600 shrink-0 mt-0.5" />
            <span>
              Khi đăng ký, hệ thống tự động gửi thông báo &amp; Email đến{" "}
              <strong>Giáo viên chủ nhiệm ({summary?.homeroomTeacherName || "GVCN"})</strong> và các{" "}
              <strong>Giáo viên bộ môn</strong> dạy các tiết bên dưới (nếu GVCN đồng thời là GV bộ môn thì hệ thống chỉ gửi{" "}
              <strong>01 lần hợp nhất</strong>). Hạn GVCN phê duyệt là{" "}
              <strong>trước thời gian diễn ra môn học 03 giờ</strong>; quá hạn hệ thống sẽ{" "}
              <strong>tự động phê duyệt</strong> và gửi Email kết quả cho học sinh + thông báo GV bộ môn.
            </span>
          </div>

          {loadingLessons ? (
            <div className="py-6 text-center text-xs text-slate-500">
              Đang đối chiếu Thời khóa biểu của lớp...
            </div>
          ) : availableLessons.length === 0 ? (
            <div className="p-4 rounded-xl bg-white border border-amber-200 text-xs text-amber-800 text-center font-medium">
              Buổi học hoặc ngày học này không có tiết học nào trong Thời khóa biểu (Đã khóa chọn tiết).
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
                          Tiết {lesson.periodNumber}
                        </Tag>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {lesson.dayOfWeekLabel} ({dayjs(lesson.date).format("DD/MM/YYYY")}) •{" "}
                        {lesson.startTime} - {lesson.endTime}
                      </div>
                      <div className="text-[11px] text-slate-600 truncate">
                        GV bộ môn: <strong className="text-slate-800">{lesson.teacherName}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Lý do xin nghỉ chi tiết (Đã bỏ các nút chọn mẫu lý do theo yêu cầu) */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Lý do xin nghỉ chi tiết <span className="text-rose-500">*</span>
          </label>
          <TextArea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Trình bày rõ lý do xin nghỉ học để Giáo viên chủ nhiệm xem xét phê duyệt..."
          />
        </div>

        {/* 5. Thông tin Phụ huynh xác nhận */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Icon name="users" size={14} className="text-blue-600" />
            <span>Thông tin Phụ huynh xác nhận đơn</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Họ và tên phụ huynh
              </label>
              <Input
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Số điện thoại liên hệ
              </label>
              <Input
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="0912345678"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Mối quan hệ
              </label>
              <Select
                value={guardianRelationship}
                onChange={(val: string) => setGuardianRelationship(val)}
                className="w-full"
                options={[
                  { label: "Bố", value: "Bố" },
                  { label: "Mẹ", value: "Mẹ" },
                  { label: "Ông / Bà", value: "Ông / Bà" },
                  { label: "Người giám hộ", value: "Phụ huynh" },
                ]}
              />
            </div>
          </div>
        </div>

        {/* 6. Đính kèm minh chứng (Chỉ dùng Upload component, không hiển thị link URL) */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-700 block">
            Đính kèm minh chứng (Giấy khám bệnh, giấy hẹn, quyết định triệu tập...)
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
                Nhấn hoặc kéo thả tệp minh chứng vào đây để đính kèm
              </p>
              <p className="text-[11px] text-slate-400 mb-0">
                Hỗ trợ định dạng PDF, JPG, PNG, DOC, DOCX (Tối đa 10MB/tệp)
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
                    <span>Xóa</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 7. Cam kết học tập của học sinh (Dùng TextArea) */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Cam kết học tập của học sinh
          </label>
          <TextArea
            rows={3}
            value={commitment}
            onChange={(e) => setCommitment(e.target.value)}
            placeholder="Cam kết chép bài, làm bài tập đầy đủ và tự ôn tập kiến thức..."
          />
        </div>

        {/* Submit Actions (Khóa nút gửi nếu ngày/buổi không có tiết học hoặc chưa chọn tiết nào) */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onCancel} disabled={submitting}>
            Hủy bỏ
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
                ? "Đã khóa (Không có môn học)"
                : editingItem
                  ? "Lưu cập nhật đơn"
                  : "Gửi đơn xin nghỉ phép"}
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
              Tóm tắt đơn &amp; Hạn phê duyệt
            </h3>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Người phê duyệt (GVCN):</span>
              <strong className="text-slate-900">
                {summary?.homeroomTeacherName || "Giáo viên chủ nhiệm"}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Lớp học:</span>
              <strong className="text-blue-600">Lớp {summary?.className || "10A1"}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Phân loại:</span>
              <strong className="text-slate-800">{LEAVE_TYPE_LABELS[leaveType]}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Thời gian nghỉ:</span>
              <strong className="text-slate-800">
                {formatLeaveDateRange(startDate, endDate)}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Tổng số ngày:</span>
              <strong className="text-blue-700">
                {calculatedDays} ngày ({SESSION_SHIFT_LABELS[sessionShift]})
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Số tiết học xin nghỉ:</span>
              <strong className="text-indigo-600">{selectedLessons.length} tiết</strong>
            </div>

            {approvalDeadlineInfo && (
              <div className="pt-2 border-t border-slate-200/80 space-y-1">
                <div className="text-[11px] text-slate-500">
                  Tiết học đầu tiên:{" "}
                  <strong className="text-slate-700">{approvalDeadlineInfo.firstLessonLabel}</strong>
                </div>
                <div className="text-[11px] text-amber-800 bg-amber-50/90 border border-amber-200 rounded-xl px-2.5 py-1.5">
                  Hạn GVCN duyệt (trước 03 giờ):{" "}
                  <strong className="font-mono">{approvalDeadlineInfo.deadlineFormatted}</strong>
                  <span className="block text-[10px] text-amber-700 mt-0.5">
                    Nếu quá hạn trên chưa duyệt, hệ thống sẽ tự động duyệt và gửi Email kết quả.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Danh sách Giáo viên nhận thông báo & Email (Gộp 1 lần nếu GVCN cũng là GV bộ môn) */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
              <h3 className="text-sm font-bold text-slate-900 mb-0">
                Giáo viên nhận thông báo &amp; Email
              </h3>
            </div>
            <Tag color="purple" className="m-0 text-[11px] font-semibold">
              {notificationRecipients.otherSubjectTeachers.length + 1} người nhận
            </Tag>
          </div>

          <div className="space-y-2 text-xs">
            {/* GVCN - Người duyệt duy nhất (Hợp nhất nếu đồng thời là GV bộ môn) */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-2">
              <div className="min-w-0 space-y-0.5">
                <div className="font-bold text-slate-900 truncate">
                  {summary?.homeroomTeacherName || "Giáo viên chủ nhiệm"}
                </div>
                <div className="text-[11px] text-slate-600">
                  {notificationRecipients.homeroomAlsoSubjectTeacher ? (
                    <span>
                      GVCN kiêm GV bộ môn{" "}
                      <strong>{notificationRecipients.homeroomTeachingSubjects.join(", ")}</strong> (
                      {notificationRecipients.homeroomLessonCount} tiết) •{" "}
                      <span className="text-blue-700 font-semibold">Gửi 01 lần hợp nhất</span>
                    </span>
                  ) : (
                    <span>
                      Giáo viên chủ nhiệm • Lớp {summary?.className || "10A1"} (Nhận Email duyệt đơn)
                    </span>
                  )}
                </div>
              </div>
              <Tag color="blue" className="m-0 text-[10px] font-bold shrink-0">
                {notificationRecipients.homeroomAlsoSubjectTeacher
                  ? "GVCN & GVBM (1 lần)"
                  : "Người xét duyệt"}
              </Tag>
            </div>

            {/* Các Giáo viên bộ môn khác (Đã loại trừ nếu trùng với GVCN) */}
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
                    Môn: <strong>{teacher.subjects.join(", ")}</strong> ({teacher.lessonCount} tiết)
                  </div>
                </div>
                <Tag color="cyan" className="m-0 text-[10px] font-semibold shrink-0">
                  Nhận thông báo
                </Tag>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 rounded-full bg-amber-500 inline-block" />
            <h3 className="text-sm font-bold text-slate-900 mb-0">
              Quy định phê duyệt &amp; Gửi Email
            </h3>
          </div>
          <ul className="list-disc pl-4 space-y-1.5 text-slate-600 mb-0">
            <li>
              Lịch xin nghỉ bắt buộc phải rơi vào ngày và buổi học có môn học trong Thời khóa biểu.
            </li>
            <li>
              Khi đăng ký, hệ thống gửi thông báo &amp; Email tới Giáo viên chủ nhiệm và Giáo viên bộ môn (nếu GVCN kiêm GVBM thì chỉ gửi 1 lần).
            </li>
            <li>
              Hạn phê duyệt của GVCN là từ lúc đăng ký đến <strong>trước giờ diễn ra môn học 03 giờ</strong>. Nếu quá hạn chưa duyệt, hệ thống sẽ <strong>duyệt tự động</strong>.
            </li>
            <li>
              Sau khi đơn được duyệt (bởi GVCN hoặc tự động), hệ thống gửi Email kết quả tới Học sinh và thông báo cho Giáo viên bộ môn.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const LeaveRequestFormPage: React.FC = () => {
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
                  <span>Trang chủ</span>
                </span>
              ),
            },
            {
              href: "/student/leave-requests",
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                  <Icon name="file-text" size={13} className="text-slate-400 shrink-0" />
                  <span>Xin nghỉ phép</span>
                </span>
              ),
            },
            {
              title: (
                <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                  <span>
                    {isEditMode ? "Chỉnh sửa đơn xin nghỉ phép" : "Tạo đơn xin nghỉ phép"}
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
                {isEditMode ? "Chỉnh sửa đơn xin nghỉ phép" : "Tạo đơn xin nghỉ phép trực tuyến"}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mb-0">
              Điền đầy đủ thông tin thời gian, môn học xin nghỉ và xác nhận của phụ huynh để gửi Giáo viên chủ nhiệm phê duyệt
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() =>
              navigate(isEditMode && id ? `/student/leave-requests/${id}` : "/student/leave-requests")
            }
          >
            <Icon name="arrow-left" size={14} />
            <span>Quay lại</span>
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
