import React from "react";
import { Tag } from "@/components/ui/Tag";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import type { AssignmentItem } from "@/modules/students/features/assignments/types";

interface AssignmentOverdueCardProps {
  assignment: AssignmentItem;
  onRequestReopen: () => void;
}

export const AssignmentOverdueCard: React.FC<AssignmentOverdueCardProps> = ({
  assignment,
  onRequestReopen,
}) => {
  return (
    <div className="p-4 sm:p-5 border border-rose-200 bg-rose-50/30 rounded-xl space-y-3.5">
      {/* 1. Header Alert Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-rose-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
            <Icon name="lock" size={17} />
          </div>
          <div>
            <span className="font-bold text-rose-950 text-sm block">Cổng nộp bài đã khóa</span>
            <span className="text-xs text-rose-700">
              Thời hạn nộp bài tập đã kết thúc vào lúc <strong>{assignment.dueDate}</strong>.
            </span>
          </div>
        </div>
        <Tag color="error" className="m-0 font-semibold self-start sm:self-auto">
          Quá hạn nộp bài
        </Tag>
      </div>

      <p className="text-xs text-slate-600 mb-0 leading-relaxed">
        Cổng nộp bài trực tuyến đã tự động khóa theo lịch biểu học vụ. Nếu bạn gặp sự cố kỹ thuật hoặc
        có lý do bất khả kháng cần nộp bù, vui lòng sử dụng biểu mẫu yêu cầu mở lại cổng nộp bài để gửi
        thông điệp trực tiếp đến giáo viên phụ trách.
      </p>

      {/* 2. Reopen Request Status Preview if already sent */}
      {assignment.reopenRequest && (
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs space-y-1.5 mt-4">
          <div className="flex items-center justify-between font-bold text-amber-900">
            <span className="flex items-center gap-1.5">
              <Icon name="clock" size={13} className="text-amber-600" />
              <span>Đã gửi yêu cầu mở lại cổng nộp bài</span>
            </span>
            <Tag color="warning" className="m-0 text-[10px]">
              Đang chờ giáo viên duyệt
            </Tag>
          </div>
          <p className="text-slate-600 mb-0">
            Gửi đến: <strong className="text-blue-700">{assignment.reopenRequest.teacherEmail}</strong>{" "}
            lúc {assignment.reopenRequest.requestedAt}
          </p>
          <div className="p-2.5 bg-white rounded border border-amber-200 text-slate-700 italic mt-2">
            "{assignment.reopenRequest.reason}"
          </div>
        </div>
      )}

      {/* 3. Action Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-rose-200/60">
        <span className="text-[11px] text-slate-500 italic">
          * Đề xuất sẽ được gửi trực tiếp tới email giáo viên bộ môn
        </span>
        <Button variant="primary" onClick={onRequestReopen}>
          <Icon name="mail" size={13} className="mr-1.5" />
          {assignment.reopenRequest ? "Gửi lại yêu cầu mở cổng" : "Yêu cầu mở lại nộp bài"}
        </Button>
      </div>
    </div>
  );
};
