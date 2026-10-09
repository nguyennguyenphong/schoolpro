import React from "react";
import { Icon } from "@/components/ui/Icon";

export const AssignmentSubmissionNotesCard: React.FC = () => {
  return (
    <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-slate-50/60 rounded-xl text-xs space-y-2">
      <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
        <Icon name="info" size={14} className="text-blue-600 shrink-0" />
        <span>Lưu ý khi nộp bài:</span>
      </div>
      <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
        <li>
          Đặt tên file rõ ràng: <code className="text-blue-700 bg-blue-50 px-1 rounded">11A1_HoTen_BaiTap</code>.
        </li>
        <li>Dung lượng: Tối đa 100MB với Video/Audio và 25MB với tài liệu văn bản.</li>
        <li>Khi cổng nộp bài đã đóng do hết hạn, học sinh có thể gửi yêu cầu đề xuất mở lại đến giáo viên phụ trách.</li>
        <li>Học sinh có thể nộp lại bài trước thời điểm hết hạn nộp bài.</li>
      </ul>
    </div>
  );
};
