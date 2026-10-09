import React from "react";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon/types";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

interface AssignmentOverdueLogProps {
  assignment: AssignmentItem;
}

interface LogEventItem {
  id: string;
  time: string;
  title: string;
  description: React.ReactNode;
  tagText: string;
  tagColor: "default" | "processing" | "success" | "warning" | "error";
  iconName: IconName;
  iconBgClass: string;
  iconTextClass: string;
  isLast?: boolean;
}

export const AssignmentOverdueLog: React.FC<AssignmentOverdueLogProps> = ({ assignment }) => {
  const events: LogEventItem[] = [
    {
      id: "event-assigned",
      time: assignment.assignedDate,
      title: "Giao bài tập & Mở cổng nộp bài",
      description: (
        <span>
          Giáo viên phụ trách <strong className="text-slate-800">{assignment.teacherName}</strong> đã
          phát hành đề bài và kích hoạt cổng nộp bài trực tuyến cho học sinh.
        </span>
      ),
      tagText: "Đã giao bài",
      tagColor: "processing",
      iconName: "file-text",
      iconBgClass: "bg-blue-100 text-blue-700 border border-blue-200",
      iconTextClass: "text-blue-700",
    },
    {
      id: "event-due",
      time: assignment.dueDate,
      title: "Hết hạn nộp & Tự động khóa cổng",
      description: (
        <span>
          Hết thời hạn nộp bài theo lịch biểu học vụ. Hệ thống SchoolPro đã tự động khóa cổng nộp
          trực tuyến. Bài tập được chuyển sang trạng thái <strong>Quá hạn</strong>.
        </span>
      ),
      tagText: "Đã khóa cổng",
      tagColor: "error",
      iconName: "lock",
      iconBgClass: "bg-rose-100 text-rose-700 border border-rose-200",
      iconTextClass: "text-rose-700",
    },
  ];

  if (assignment.reopenRequest) {
    events.push({
      id: "event-reopen-request",
      time: assignment.reopenRequest.requestedAt,
      title: "Học sinh gửi yêu cầu mở lại cổng",
      description: (
        <div className="space-y-1.5 pt-0.5">
          <p className="text-xs text-slate-600 mb-0">
            Đã gửi thông điệp yêu cầu đến giáo viên{" "}
            <strong className="text-slate-800">{assignment.teacherName}</strong> qua hòm thư{" "}
            <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              {assignment.reopenRequest.teacherEmail}
            </span>
          </p>
          <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-lg text-slate-700 italic text-xs mt-3">
            "{assignment.reopenRequest.reason}"
          </div>
        </div>
      ),
      tagText: "Chờ phê duyệt",
      tagColor: "warning",
      iconName: "mail",
      iconBgClass: "bg-amber-100 text-amber-700 border border-amber-200",
      iconTextClass: "text-amber-700",
    });

    events.push({
      id: "event-current-status",
      time: "Hiện tại",
      title: "Đang chờ giáo viên xử lý yêu cầu",
      description: (
        <span>
          Yêu cầu đề xuất mở lại đang trong danh sách chờ duyệt của giáo viên bộ môn. Học sinh sẽ
          nhận được thông báo ngay khi giáo viên phản hồi hoặc gia hạn cổng nộp bài.
        </span>
      ),
      tagText: "Đang xử lý",
      tagColor: "warning",
      iconName: "clock",
      iconBgClass: "bg-amber-50 text-amber-600 border border-amber-200",
      iconTextClass: "text-amber-600",
      isLast: true,
    });
  } else {
    events.push({
      id: "event-current-closed",
      time: "Hiện tại",
      title: "Cổng nộp bài đang đóng",
      description: (
        <span>
          Học sinh chưa thể tải bài làm lên hệ thống. Nếu có lý do chính đáng cần nộp bài bổ sung,
          vui lòng sử dụng tính năng gửi yêu cầu mở cổng nộp bài bên trên.
        </span>
      ),
      tagText: "Tạm khóa",
      tagColor: "error",
      iconName: "lock",
      iconBgClass: "bg-slate-100 text-slate-600 border border-[#f0f0f0]",
      iconTextClass: "text-slate-600",
      isLast: true,
    });
  }

  return (
    <div className="p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
          <h3 className="text-base font-bold text-slate-900 mb-0">
            Nhật ký tiến trình sự kiện (Log)
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Theo dòng thời gian từ trên xuống</span>
      </div>

      {/* Top-to-Bottom Vertical Timeline Log */}
      <div className="relative pl-1 pr-1 pt-1">
        {events.map((event, index) => {
          const isFinal = index === events.length - 1;

          return (
            <div key={event.id} className="relative flex items-start gap-3 sm:gap-4 group">
              {/* Vertical connecting line */}
              {!isFinal && (
                <div
                  className="absolute left-4 top-8 -bottom-3 w-0.5 bg-slate-200 group-hover:bg-blue-300 transition-colors"
                  aria-hidden="true"
                />
              )}

              {/* Node Icon */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-transform ${event.iconBgClass}`}
              >
                <Icon name={event.iconName} size={14} className={event.iconTextClass} />
              </div>

              {/* Event Content Card */}
              <div className="flex-1 pb-5 min-w-0">
                <div className="bg-slate-50/70 border border-[#f0f0f0]/80 rounded-xl p-3 sm:p-3.5 space-y-1.5 transition-colors hover:bg-slate-50 hover:border-slate-300">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="text-xs font-bold text-slate-800">{event.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        <Icon name="clock" size={11} className="text-slate-400" />
                        <span>{event.time}</span>
                      </span>
                      <Tag color={event.tagColor} className="m-0 font-semibold text-[10px]">
                        {event.tagText}
                      </Tag>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 leading-relaxed">{event.description}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
