import React from "react";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

interface AssignmentListItemProps {
  assignment: AssignmentItem;
  onClick: (item: AssignmentItem) => void;
}

export const AssignmentListItem: React.FC<AssignmentListItemProps> = ({
  assignment,
  onClick,
}) => {
  const getStatusBadge = () => {
    switch (assignment.status) {
      case "graded":
        return (
          <Tag color="success" className="m-0 font-semibold text-xs">
            Đã chấm: {assignment.score}/{assignment.pointsPossible}
          </Tag>
        );
      case "submitted":
        return (
          <Tag color="processing" className="m-0 font-semibold text-xs">
            Đã nộp bài
          </Tag>
        );
      case "overdue":
        return (
          <Tag color="error" className="m-0 font-semibold text-xs">
            Quá hạn nộp
          </Tag>
        );
      case "pending":
      default:
        return (
          <Tag color="warning" className="m-0 font-semibold text-xs">
            Chưa hoàn thành
          </Tag>
        );
    }
  };

  const getTypeLabel = () => {
    switch (assignment.type) {
      case "quiz":
        return "Trắc nghiệm";
      case "project":
        return "Báo cáo / Dự án";
      case "essay":
        return "Bài tự luận";
      case "homework":
      default:
        return "Bài tập về nhà";
    }
  };

  return (
    <div
      onClick={() => onClick(assignment)}
      className="bg-white rounded-xl border border-[#f0f0f0] shadow-2xs p-4 sm:p-5 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="space-y-2 flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-xl">
            {assignment.subjectName}
          </span>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {getTypeLabel()}
          </span>
          {getStatusBadge()}
        </div>

        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-0 truncate" title={assignment.title}>
          {assignment.title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Icon name="clock" size={13} className={assignment.status === "overdue" ? "text-rose-500" : "text-slate-400"} />
            <span>Hạn nộp: <strong className={assignment.status === "overdue" ? "text-rose-600" : "text-slate-700"}>{assignment.dueDate}</strong></span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Icon name="user" size={13} className="text-slate-400" />
            <span>{assignment.teacherName}</span>
          </span>
          {assignment.attachments && assignment.attachments.length > 0 && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-blue-600">
                <Icon name="file" size={13} />
                <span>{assignment.attachments.length} tệp đính kèm</span>
              </span>
            </>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-end">
        <Button
          variant={assignment.status === "pending" ? "primary" : "outline"}
          onClick={(e) => {
            e.stopPropagation();
            onClick(assignment);
          }}
          className="whitespace-nowrap"
        >
          {assignment.status === "pending"
            ? "Nộp bài ngay"
            : assignment.status === "graded"
              ? "Xem kết quả"
              : "Xem chi tiết"}
        </Button>
      </div>
    </div>
  );
};
