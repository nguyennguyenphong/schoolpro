import React, { useRef, useState } from "react";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { Carousel } from "@/components/ui/Carousel";
import type { CarouselRef } from "@/components/ui/Carousel";
import type {
  ClassScheduleItem,
  AssignmentItem,
  UpcomingExamItem,
} from "@/modules/students/features/home/types";

interface RemindersCarouselProps {
  schedule?: ClassScheduleItem[];
  assignments?: AssignmentItem[];
  exams?: UpcomingExamItem[];
  onSubmitAssignment?: (id: string) => Promise<boolean> | void;
  onJoinMeeting?: (item: ClassScheduleItem) => void;
  onViewExamCard?: (item: UpcomingExamItem) => void;
}

export const RemindersCarousel: React.FC<RemindersCarouselProps> = ({
  schedule = [],
  assignments = [],
  exams = [],
  onSubmitAssignment,
  onJoinMeeting,
  onViewExamCard,
}) => {
  const { t } = useTranslation(["student"]);
  const carouselRef = useRef<CarouselRef>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const handleJoinClass = (item: ClassScheduleItem) => {
    if (onJoinMeeting) {
      onJoinMeeting(item);
    } else if (item.onlineMeetingUrl) {
      window.open(item.onlineMeetingUrl, "_blank");
    } else {
      message.info(`${t("student:schedule.joinClass")}: ${item.courseName}`);
    }
  };

  const handleSubmit = async (item: AssignmentItem) => {
    if (item.isSubmitted) {
      message.info(`${item.title} đã được nộp`);
      return;
    }

    if (onSubmitAssignment) {
      try {
        setSubmittingId(item.id);
        const success = await onSubmitAssignment(item.id);
        if (success !== false) {
          message.success(`${t("student:assignments.submitNow")}: ${item.title}`);
        }
      } catch {
        message.error("Lỗi khi nộp bài");
      } finally {
        setSubmittingId(null);
      }
    } else {
      message.success(`${t("student:assignments.submitNow")}: ${item.title}`);
    }
  };

  const handleExamClick = (item: UpcomingExamItem) => {
    if (onViewExamCard) {
      onViewExamCard(item);
    } else {
      message.info(`Thẻ dự thi: ${item.courseName} - SBD: ${item.seatNumber}`);
    }
  };

  // Build unified reminder cards
  const reminderCards: React.ReactNode[] = [];

  // 1. Schedule Cards
  schedule.forEach((item) => {
    const isOngoing = item.status === "ongoing";
    const isCompleted = item.status === "completed";

    reminderCards.push(
      <div key={`sched-${item.id}`} className="px-2 py-1">
        <div
          className={`h-[224px] p-4.5 rounded-xl border flex flex-col justify-between transition-all bg-white shadow-2xs ${
            isOngoing
              ? "border-blue-400 bg-blue-50/20 ring-1 ring-blue-400/40"
              : isCompleted
              ? "border-slate-200 bg-slate-50/60 opacity-85"
              : "border-slate-200 hover:border-blue-300"
          }`}
        >
          {/* Top Bar */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                  <Icon name="book" size={14} />
                </span>
                <span className="text-xs font-bold text-blue-700">
                  {t("student:remindersSection.scheduleBadge", { defaultValue: "Lịch học hôm nay" })}
                </span>
              </div>

              {isOngoing && (
                <Tag color="processing" className="text-[11px] font-bold mr-0">
                  {t("student:schedule.statusOngoing")}
                </Tag>
              )}
              {item.status === "upcoming" && (
                <Tag color="warning" className="text-[11px] font-bold mr-0">
                  {t("student:schedule.statusUpcoming")}
                </Tag>
              )}
              {isCompleted && (
                <Tag color="success" className="text-[11px] font-bold mr-0">
                  {t("student:schedule.statusCompleted")}
                </Tag>
              )}
            </div>

            {/* Course Title */}
            <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mb-1" title={item.courseName}>
              {item.courseCode} - {item.courseName}
            </h4>

            {/* Metadata */}
            <div className="space-y-1 text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <Icon name="check" size={13} className="text-blue-500 shrink-0" />
                <span>{item.timeRange}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-slate-400">Phòng:</span>
                <strong className="text-slate-700">{item.room} ({item.building})</strong>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-slate-400">GV:</span>
                <span className="text-slate-600">{item.instructorName}</span>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
            {isOngoing ? (
              <Button
                variant="primary"
                size="small"
                onClick={() => handleJoinClass(item)}
                className="w-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg h-8"
              >
                {t("student:schedule.joinClass")}
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="small"
                onClick={() => handleJoinClass(item)}
                className="w-full text-xs font-medium rounded-lg h-8 text-slate-700"
              >
                {t("student:schedule.details")}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  });

  // 2. Urgent Assignment Cards
  assignments.forEach((item) => {
    let dueTagColor: "error" | "warning" | "default" = "default";
    if (item.priority === "critical" || item.dueDaysLeft <= 1) dueTagColor = "error";
    else if (item.priority === "urgent" || item.dueDaysLeft <= 3) dueTagColor = "warning";

    const dueLabel =
      item.dueDaysLeft === 1
        ? t("student:assignments.dueTomorrow")
        : t("student:assignments.dueInDays", { days: item.dueDaysLeft });

    reminderCards.push(
      <div key={`assign-${item.id}`} className="px-2 py-1">
        <div
          className={`h-[224px] p-4.5 rounded-xl border flex flex-col justify-between transition-all bg-white shadow-2xs ${
            item.isSubmitted
              ? "border-emerald-200 bg-emerald-50/20"
              : item.priority === "critical"
              ? "border-rose-300 bg-rose-50/15 hover:border-rose-400"
              : "border-slate-200 hover:border-blue-300"
          }`}
        >
          {/* Top Bar */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                  <Icon name="edit" size={14} />
                </span>
                <span className="text-xs font-bold text-rose-700">
                  {t("student:remindersSection.assignmentBadge", { defaultValue: "Hạn nộp bài tập" })}
                </span>
              </div>

              {item.isSubmitted ? (
                <Tag color="success" className="text-[11px] font-bold mr-0">
                  Đã nộp bài
                </Tag>
              ) : (
                <Tag color={dueTagColor} className="text-[11px] font-bold mr-0">
                  {dueLabel}
                </Tag>
              )}
            </div>

            {/* Assignment Title */}
            <h4 className="text-sm font-bold text-slate-800 line-clamp-2 mb-1" title={item.title}>
              {item.title}
            </h4>

            {/* Metadata */}
            <div className="space-y-1 text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-slate-400">Học phần:</span>
                <strong className="text-slate-700">{item.courseCode}</strong>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <Icon name="check" size={13} className="text-rose-500 shrink-0" />
                <span>Hạn chót: {item.dueDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Thang điểm:</span>
                <span className="text-slate-600 font-semibold">{item.maxScore} điểm</span>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
            {item.isSubmitted ? (
              <Button
                variant="secondary"
                size="small"
                disabled
                className="w-full text-xs font-medium text-emerald-700 bg-emerald-100 rounded-lg h-8 cursor-default flex items-center justify-center gap-1.5"
              >
                <Icon name="check" size={13} />
                <span>Đã nộp</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="small"
                loading={submittingId === item.id}
                onClick={() => handleSubmit(item)}
                className="w-full text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg h-8 flex items-center justify-center gap-1.5"
              >
                <Icon name="upload" size={13} />
                <span>{t("student:assignments.submitNow")}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  });

  // 3. Upcoming Exam Cards
  exams.forEach((item) => {
    reminderCards.push(
      <div key={`exam-${item.id}`} className="px-2 py-1">
        <div className="h-[224px] p-4.5 rounded-xl border border-slate-200 hover:border-purple-300 bg-white shadow-2xs flex flex-col justify-between transition-all">
          {/* Top Bar */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
                  <Icon name="check" size={14} />
                </span>
                <span className="text-xs font-bold text-purple-700">
                  {t("student:remindersSection.examBadge", { defaultValue: "Lịch thi sắp tới" })}
                </span>
              </div>

              <Tag color="purple" className="text-[11px] font-bold mr-0">
                {item.examDate}
              </Tag>
            </div>

            {/* Exam Title */}
            <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mb-1" title={item.courseName}>
              {item.courseCode} - {item.courseName}
            </h4>

            {/* Metadata */}
            <div className="space-y-1 text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-1.5 font-medium text-slate-700">
                <Icon name="check" size={13} className="text-purple-500 shrink-0" />
                <span>Giờ thi: {item.examTime}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-slate-400">Phòng:</span>
                <strong className="text-slate-700">{item.room} ({item.building})</strong>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded text-[11px]">
                  SBD: {item.seatNumber}
                </span>
                <span className="text-slate-500 text-[11px]">
                  {item.format === "essay" ? "Tự luận" : item.format === "multiple_choice" ? "Trắc nghiệm" : "Thực hành"}
                </span>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
            <Button
              variant="outline"
              size="small"
              onClick={() => handleExamClick(item)}
              className="w-full text-xs font-medium rounded-lg h-8 text-slate-700 hover:text-purple-600 hover:border-purple-300"
            >
              {t("student:exams.viewExamCard")}
            </Button>
          </div>
        </div>
      </div>
    );
  });

  const totalCount = reminderCards.length;

  return (
    <section aria-labelledby="reminders-carousel-title" className="space-y-4">
      {/* Header with Title and Custom Carousel Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-4 rounded-full bg-amber-500 inline-block" />
            <h2 id="reminders-carousel-title" className="text-lg sm:text-xl font-bold text-slate-900 mb-0">
              {t("student:remindersSection.title")}
            </h2>
            {totalCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                {t("student:remindersSection.totalCount", { count: totalCount, defaultValue: `${totalCount} việc cần chú ý` })}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            {t("student:remindersSection.subtitle")}
          </p>
        </div>

        {/* Carousel Navigation Buttons */}
        {totalCount > 3 && (
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <Button
              variant="secondary"
              size="small"
              onClick={() => carouselRef.current?.prev()}
              aria-label="Previous reminders"
              className="w-8 h-8 p-0 rounded-lg border-slate-200 hover:border-blue-400 text-slate-600 flex items-center justify-center cursor-pointer"
            >
              <Icon name="chevron-left" size={16} />
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={() => carouselRef.current?.next()}
              aria-label="Next reminders"
              className="w-8 h-8 p-0 rounded-lg border-slate-200 hover:border-blue-400 text-slate-600 flex items-center justify-center cursor-pointer"
            >
              <Icon name="chevron-right" size={16} />
            </Button>
          </div>
        )}
      </div>

      {/* Carousel Track */}
      {totalCount === 0 ? (
        <Card className="p-8 border-slate-200 text-center text-slate-400 text-sm">
          Hiện không có nhắc nhở nào cần xử lý.
        </Card>
      ) : (
        <div className="reminders-carousel-container -mx-2">
          <Carousel
            ref={carouselRef}
            dots={totalCount > 3}
            arrows={false}
            infinite={false}
            slidesToShow={3}
            slidesToScroll={1}
            responsive={[
              {
                breakpoint: 1280,
                settings: {
                  slidesToShow: 3,
                  slidesToScroll: 1,
                },
              },
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 2,
                  slidesToScroll: 1,
                },
              },
              {
                breakpoint: 640,
                settings: {
                  slidesToShow: 1,
                  slidesToScroll: 1,
                },
              },
            ]}
          >
            {reminderCards}
          </Carousel>
        </div>
      )}
    </section>
  );
};
