import React from "react";
import { Modal, Rate } from "antd";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { SurveyItem } from "@/modules/students/features/evaluation/types";

interface SurveyViewModalProps {
  isOpen: boolean;
  survey: SurveyItem | null;
  onClose: () => void;
}

export const SurveyViewModal: React.FC<SurveyViewModalProps> = ({
  isOpen,
  survey,
  onClose,
}) => {
  if (!survey) return null;

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
      width={680}
      title={null}
      destroyOnHidden
      centered
    >
      <div className="space-y-4 pt-1 max-h-[75vh] overflow-y-auto pr-1">
        {/* Header */}
        <div className="border-b border-slate-100 pb-3 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-1.5 h-5 rounded-full bg-emerald-600 inline-block" />
            <h2 className="text-lg font-bold text-slate-900 mb-0">
              Chi tiết phản hồi: {survey.title}
            </h2>
            <Tag color="success" className="font-semibold m-0 text-xs">
              Đã gửi thành công
            </Tag>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>Thời gian nộp: <strong>{survey.completedAt || "Học kỳ 1"}</strong></span>
            <span>•</span>
            <span>Hình thức: {survey.isAnonymous ? "Khảo sát ẩn danh" : "Định danh cá nhân"}</span>
          </div>
        </div>

        {/* Survey Questions Summary View */}
        <div className="space-y-3.5">
          {survey.questions.map((q, idx) => (
            <div
              key={q.id}
              className="p-3.5 rounded-xl border border-[#f0f0f0] bg-slate-50/60 space-y-1.5"
            >
              <div className="text-xs font-bold text-slate-800">
                <span className="text-emerald-700 mr-1.5">Câu {idx + 1}.</span>
                {q.title}
              </div>

              <div className="pt-1 text-xs">
                {q.type === "rating" && (
                  <div className="flex items-center gap-2">
                    <Rate disabled defaultValue={5} className="text-sm" />
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Rất tốt (5/5 sao)
                    </span>
                  </div>
                )}

                {q.type === "single_choice" && (
                  <div className="text-slate-700 bg-white p-2 rounded-lg border border-[#f0f0f0] inline-block font-medium">
                    ✓ {q.options ? q.options[0] : "Đã hoàn thành"}
                  </div>
                )}

                {q.type === "multiple_choice" && (
                  <div className="text-slate-700 bg-white p-2 rounded-lg border border-[#f0f0f0] inline-block font-medium">
                    ✓ {q.options ? q.options[0] : "Đã chọn"}
                  </div>
                )}

                {q.type === "text" && (
                  <div className="p-2.5 rounded-lg bg-white border border-[#f0f0f0] text-slate-700 italic">
                    "Tiết học rất bổ ích, giáo viên giảng dạy nhiệt tình, phương pháp trực quan và dễ hiểu."
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <Icon name="checkCircle" size={15} className="text-emerald-600 shrink-0" />
          <span>Ý kiến đánh giá đã được tổng hợp tự động vào Báo cáo Khảo sát Chất lượng Giáo dục Học kỳ 1.</span>
        </div>
      </div>
    </Modal>
  );
};
