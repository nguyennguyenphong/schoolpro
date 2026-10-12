import React from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

interface AssignmentSubmitHeaderProps {
  assignment: AssignmentItem;
  isPastDue: boolean;
  typeLabel: string;
  onBack: () => void;
}

export const AssignmentSubmitHeader: React.FC<AssignmentSubmitHeaderProps> = ({
  assignment,
  isPastDue,
  typeLabel,
  onBack,
}) => {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
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
            href: "/student/assignments",
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                <Icon name="edit" size={13} className="text-slate-400 shrink-0" />
                <span>Bài tập & Nhiệm vụ</span>
              </span>
            ),
          },
          {
            title: (
              <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                <span>Chi tiết & Nộp bài</span>
              </span>
            ),
          },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-0">
              {assignment.title}
            </h1>
            <span className="font-semibold text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-xl">
              {assignment.subjectName}
            </span>
            <span className="text-xs text-slate-600 bg-slate-100 border border-[#f0f0f0] px-2 py-0.5 rounded-xl">
              {typeLabel}
            </span>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Thang điểm {assignment.pointsPossible}
            </span>
            {assignment.status === "graded" && (
              <Tag color="success" className="m-0 font-semibold text-xs">
                Đã chấm: {assignment.score}/{assignment.pointsPossible} điểm
              </Tag>
            )}
            {assignment.status === "submitted" && (
              <Tag color="processing" className="m-0 font-semibold text-xs">
                Đã nộp bài
              </Tag>
            )}
            {assignment.status === "overdue" && (
              <Tag color="error" className="m-0 font-semibold text-xs">
                Quá hạn nộp
              </Tag>
            )}
            {assignment.status === "pending" && (
              <Tag color="warning" className="m-0 font-semibold text-xs">
                Chưa nộp bài
              </Tag>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>
              Giáo viên: <strong className="text-slate-700">{assignment.teacherName}</strong>
            </span>
            <span>•</span>
            <span>
              Ngày giao: <strong className="text-slate-700">{assignment.assignedDate}</strong>
            </span>
            <span>•</span>
            <span>
              Hạn chót:{" "}
              <strong className={isPastDue ? "text-rose-600 font-bold" : "text-slate-700"}>
                {assignment.dueDate}
              </strong>
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={onBack}
          className="shrink-0 self-start sm:self-auto"
        >
          <Icon name="arrow-left" size={13} />
          Danh sách bài tập
        </Button>
      </div>
    </div>
  );
};
