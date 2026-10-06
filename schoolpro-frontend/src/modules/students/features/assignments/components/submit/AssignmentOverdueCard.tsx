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
    <div className="p-4 sm:p-5 border border-rose-200 bg-rose-50/40 rounded-xl space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-rose-200/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Icon name="lock" size={16} />
          </div>
          <div>
            <span className="font-bold text-rose-950 text-sm block">Cổng nộp bài đã khóa</span>
            <span className="text-xs text-rose-700">
              Thời hạn nộp bài tập đã kết thúc vào ngày <strong>{assignment.dueDate}</strong>.
            </span>
          </div>
        </div>
        <Tag color="error">Quá hạn nộp bài</Tag>
      </div>

      <p className="text-xs text-slate-600 mb-0 leading-relaxed">
        Cổng nộp bài trực tuyến đã tự động khóa. Nếu bạn có lý do chính đáng cần nộp bù, 
        vui lòng nhấn nút dưới đây để gửi thông điệp yêu cầu mở lại đến hòm thư email của giáo viên phụ trách.
      </p>

      {/* Reopen Request Info if already submitted */}
      {assignment.reopenRequest && (
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-xs space-y-1.5 mt-4">
          <div className="flex items-center justify-between font-bold text-amber-900">
            <span className="flex items-center gap-1.5">
              <Icon name="clock" size={13} className="text-amber-600" />
              <span>Đã gửi yêu cầu mở lại cổng nộp bài</span>
            </span>
            <Tag color="warning">Đang chờ giáo viên duyệt</Tag>
          </div>
          <p className="text-slate-600 mb-0">
            Gửi đến: <strong className="text-blue-700">{assignment.reopenRequest.teacherEmail}</strong> lúc {assignment.reopenRequest.requestedAt}
          </p>
          <div className="p-2.5 bg-white rounded border border-amber-200 text-slate-700 italic">
            "{assignment.reopenRequest.reason}"
          </div>
        </div>
      )}

      <div className="flex items-center justify-end pt-1">
        <Button variant="primary" onClick={onRequestReopen}>
          <Icon name="mail" size={13} className="mr-1.5" />
          {assignment.reopenRequest ? "Gửi lại yêu cầu mở cổng" : "Yêu cầu mở lại nộp bài"}
        </Button>
      </div>
    </div>
  );
};
