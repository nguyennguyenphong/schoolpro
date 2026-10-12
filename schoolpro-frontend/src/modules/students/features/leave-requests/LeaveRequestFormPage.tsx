import dayjs from "dayjs";
import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { Icon } from "@/components/ui/Icon";
import { TextArea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  LeaveRequestFormHeader,
  LeaveRequestFormSidebar,
  LeaveRequestFormSkeleton,
  LeaveRequestGuardianAttachmentsSection,
  LeaveRequestLessonsSelector,
} from "@/modules/students/features/leave-requests/components/form";
import { useLeaveRequestForm } from "@/modules/students/features/leave-requests/hooks";
import { leaveRequestsService } from "@/modules/students/features/leave-requests/services";
import type {
  LeaveRequestItem,
  LeaveRequestSummary,
  LeaveSessionShift,
  LeaveType,
} from "@/modules/students/features/leave-requests/types";

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
  const { t } = useTranslation(["input", "card", "button"]);

  const {
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
  } = useLeaveRequestForm({ editingItem, summary, onSuccess });

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

        {/* 1. Loại đơn & Ca nghỉ */}
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
                {
                  label: t("card:leaveRequests.leaveTypes.family_affair"),
                  value: "family_affair",
                },
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
              onChange={(val: LeaveSessionShift) => handleSessionShiftChange(val)}
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

        {/* 2. Từ ngày - Đến ngày */}
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
                handleStartDateChange(singleDate.format("YYYY-MM-DD"));
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
                handleEndDateChange(singleDate.format("YYYY-MM-DD"));
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

        {/* 3. Môn học / Tiết học xin nghỉ */}
        <LeaveRequestLessonsSelector
          availableLessons={availableLessons}
          selectedLessonKeys={selectedLessonKeys}
          loadingLessons={loadingLessons}
          hasNoLessonsInSelection={hasNoLessonsInSelection}
          classDisplayName={classDisplayName}
          homeroomDisplayName={homeroomDisplayName}
          onToggleLesson={handleToggleLesson}
          onToggleAllLessons={handleToggleAllLessons}
        />

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

        {/* 5 & 6. Phụ huynh xác nhận & Đính kèm minh chứng */}
        <LeaveRequestGuardianAttachmentsSection
          guardianName={guardianName}
          guardianPhone={guardianPhone}
          guardianRelationship={guardianRelationship}
          attachments={attachments}
          onGuardianNameChange={setGuardianName}
          onGuardianPhoneChange={setGuardianPhone}
          onGuardianRelationshipChange={setGuardianRelationship}
          onAddAttachment={handleAddAttachment}
          onRemoveAttachment={handleRemoveAttachment}
        />

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

      {/* Right Column: Live Summary, Recipients & School Policy */}
      <LeaveRequestFormSidebar
        homeroomDisplayName={homeroomDisplayName}
        classDisplayName={classDisplayName}
        leaveType={leaveType}
        startDate={startDate}
        endDate={endDate}
        calculatedDays={calculatedDays}
        sessionShift={sessionShift}
        selectedLessonsCount={selectedLessons.length}
        approvalDeadlineInfo={approvalDeadlineInfo}
        notificationRecipients={notificationRecipients}
      />
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

    void loadContext();

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleBack = () =>
    navigate(isEditMode && id ? `/student/leave-requests/${id}` : "/student/leave-requests");

  return (
    <div className="space-y-4 sm:space-y-5 pb-8">
      <LeaveRequestFormHeader isEditMode={isEditMode} onBack={handleBack} />

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
          onCancel={handleBack}
          onSuccess={(savedItem) => navigate(`/student/leave-requests/${savedItem.id}`)}
        />
      )}
    </div>
  );
};

export default LeaveRequestFormPage;
