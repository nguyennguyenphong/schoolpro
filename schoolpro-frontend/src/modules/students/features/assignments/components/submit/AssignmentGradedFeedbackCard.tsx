import React from "react";
import { Tag } from "@/components/ui/Tag";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

interface AssignmentGradedFeedbackCardProps {
  assignment: AssignmentItem;
}

export const AssignmentGradedFeedbackCard: React.FC<AssignmentGradedFeedbackCardProps> = ({
  assignment,
}) => {
  if (assignment.status !== "graded") return null;

  return (
    <div className="p-5 border border-emerald-200 bg-emerald-50/50 rounded-xl shadow-2xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-emerald-200/70">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-emerald-600 inline-block" />
          <h3 className="text-base font-bold text-emerald-950 mb-0">
            Kết quả chấm điểm & Lời nhận xét
          </h3>
        </div>
        <Tag color="success" className="m-0 text-xs font-bold px-2.5 py-0.5">
          Điểm số: {assignment.score} / {assignment.pointsPossible}
        </Tag>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-600">
          <span>
            Giáo viên chấm: <strong className="text-slate-800">{assignment.teacherName}</strong>
          </span>
          <span>
            Thang điểm: <strong>10.0</strong>
          </span>
        </div>
        {assignment.teacherFeedback && (
          <div className="p-3 bg-white rounded-lg border border-emerald-200 text-slate-800 italic leading-relaxed">
            "{assignment.teacherFeedback}"
          </div>
        )}
      </div>
    </div>
  );
};
