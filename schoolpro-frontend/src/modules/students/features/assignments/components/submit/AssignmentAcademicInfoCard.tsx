import React from "react";
import { Icon } from "@/components/ui/Icon";
import type {
  AssignmentItem,
  AssignmentSummary,
} from "@/modules/students/features/assignments/types";

interface AssignmentAcademicInfoCardProps {
  assignment: AssignmentItem;
  summary: AssignmentSummary | null;
  teacherEmail: string;
}

export const AssignmentAcademicInfoCard: React.FC<AssignmentAcademicInfoCardProps> = ({
  assignment,
  summary,
  teacherEmail,
}) => {
  return (
    <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
        <h3 className="text-sm font-bold text-slate-900 mb-0">
          Thông tin học vụ
        </h3>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Môn học:</span>
          <strong className="text-slate-800">
            {assignment.subjectName} ({assignment.subjectCode})
          </strong>
        </div>

        {summary?.className && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Lớp học:</span>
            <strong className="text-slate-800">{summary.className}</strong>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-slate-500">Giáo viên phụ trách:</span>
          <strong className="text-slate-800">{assignment.teacherName}</strong>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-500">Email giáo viên:</span>
          <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1">
            <Icon name="mail" size={11} className="text-blue-600" />
            <span className="truncate max-w-37.5">{teacherEmail}</span>
          </span>
        </div>

        {summary?.semesterName && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Học kỳ:</span>
            <strong className="text-slate-800">
              {summary.semesterName} {summary.academicYear ? `(${summary.academicYear})` : ""}
            </strong>
          </div>
        )}
      </div>
    </div>
  );
};
