import React from "react";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

interface AssignmentCardProps {
  assignment: AssignmentItem;
  onClick: (item: AssignmentItem) => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onClick,
}) => {
  const getStatusBadge = () => {
    switch (assignment.status) {
      case "graded":
        return (
          <Tag color="success" className="m-0 font-semibold text-[11px]">
            Đã chấm: {assignment.score}/{assignment.pointsPossible}
          </Tag>
        );
      case "submitted":
        return (
          <Tag color="processing" className="m-0 font-semibold text-[11px]">
            Đã nộp bài
          </Tag>
        );
      case "overdue":
        return (
          <Tag color="error" className="m-0 font-semibold text-[11px]">
            Quá hạn nộp
          </Tag>
        );
      case "pending":
      default:
        return (
          <Tag color="warning" className="m-0 font-semibold text-[11px]">
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
      className="h-60 w-full bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between transition-all"
    >
      <div>
        <div className="flex items-center justify-between gap-1 mb-2">
          <span className="font-semibold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md truncate">
            {assignment.subjectName}
          </span>
          {getStatusBadge()}
        </div>

        <h4
          className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug h-10 transition-colors mb-0"
          title={assignment.title}
        >
          {assignment.title}
        </h4>
      </div>

      <div className="pt-2.5 border-t border-slate-100 space-y-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Icon
            name="clock"
            size={13}
            className={`shrink-0 ${
              assignment.status === "overdue" ? "text-rose-500" : "text-slate-400"
            }`}
          />
          <span className="truncate font-medium">
            Hạn: <strong className={assignment.status === "overdue" ? "text-rose-600" : "text-slate-800"}>{assignment.dueDate}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500">
          <Icon name="user" size={13} className="text-slate-400 shrink-0" />
          <span className="truncate" title={assignment.teacherName}>
            Giáo viên: {assignment.teacherName}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
            <Icon name="file" size={11} className="text-slate-400" />
            <span>{getTypeLabel()}</span>
          </span>

          <Button
            variant={assignment.status === "pending" ? "primary" : "outline"}
            onClick={(e) => {
              e.stopPropagation();
              onClick(assignment);
            }}
            href={`/student/assignments/${assignment.id}`}
          >
            {assignment.status === "pending"
              ? "Nộp bài"
              : assignment.status === "graded"
                ? "Xem điểm"
                : "Chi tiết"}
          </Button>
        </div>
      </div>
    </div>
  );
};
