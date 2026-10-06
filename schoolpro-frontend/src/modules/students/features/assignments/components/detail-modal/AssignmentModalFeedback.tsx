import React from "react";
import { Icon } from "@/components/ui/Icon";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

interface AssignmentModalFeedbackProps {
  assignment: AssignmentItem;
}

export const AssignmentModalFeedback: React.FC<AssignmentModalFeedbackProps> = ({
  assignment,
}) => {
  if (assignment.status !== "graded") return null;

  return (
    <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
          <Icon name="check" size={14} className="text-emerald-600" />
          Kết quả đánh giá từ giáo viên
        </span>
        <span className="text-sm font-extrabold text-emerald-700">
          {assignment.score} / {assignment.pointsPossible} điểm
        </span>
      </div>
      {assignment.teacherFeedback && (
        <p className="text-xs text-emerald-950 italic mb-0 leading-relaxed">
          "{assignment.teacherFeedback}"
        </p>
      )}
    </div>
  );
};
