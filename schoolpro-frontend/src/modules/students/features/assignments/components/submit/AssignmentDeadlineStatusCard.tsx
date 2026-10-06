import React from "react";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

interface AssignmentDeadlineStatusCardProps {
  assignment: AssignmentItem;
  isPastDue: boolean;
  isSubmittedAndExpired: boolean;
  isGraded: boolean;
  isSubmitted: boolean;
  isOverdue: boolean;
}

export const AssignmentDeadlineStatusCard: React.FC<AssignmentDeadlineStatusCardProps> = ({
  assignment,
  isPastDue,
  isSubmittedAndExpired,
  isGraded,
  isSubmitted,
  isOverdue,
}) => {
  return (
    <div className="p-4 sm:p-5 border border-slate-200 bg-white rounded-xl shadow-2xs space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <span className="w-1.5 h-4 rounded-full bg-amber-500 inline-block" />
        <h3 className="text-sm font-bold text-slate-900 mb-0">
          Thời hạn & Trạng thái
        </h3>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Trạng thái:</span>
          {isSubmittedAndExpired ? (
            <Tag color="default">Đã nộp (Đã đóng)</Tag>
          ) : isGraded ? (
            <Tag color="success">Đã chấm điểm</Tag>
          ) : isSubmitted ? (
            <Tag color="processing">Đã nộp bài</Tag>
          ) : isOverdue ? (
            <Tag color="error">Quá hạn nộp</Tag>
          ) : (
            <Tag color="warning">Chưa nộp</Tag>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">Hạn chót:</span>
          <strong className={isPastDue ? "text-rose-600 font-bold" : "text-slate-800"}>
            {assignment.dueDate}
          </strong>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">Tình trạng cổng:</span>
          {isPastDue ? (
            <span className="text-rose-600 font-semibold flex items-center gap-1">
              <Icon name="lock" size={12} />
              <span>Đã đóng cổng</span>
            </span>
          ) : (
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <Icon name="check" size={12} />
              <span>Đang mở nộp bài</span>
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">Thang điểm tối đa:</span>
          <strong className="text-slate-800">{assignment.pointsPossible} điểm</strong>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">Hình thức nộp:</span>
          <strong className="text-blue-600">Trực tuyến (SchoolPro)</strong>
        </div>
      </div>
    </div>
  );
};
