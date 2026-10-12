import React, { useState } from "react";
import { Modal, Rate, Radio, Checkbox, message } from "antd";
import { TextArea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Tag } from "@/components/ui/Tag";
import type { SurveyItem } from "@/modules/students/features/evaluation/types";

interface SurveyFormModalProps {
  isOpen: boolean;
  survey: SurveyItem | null;
  onClose: () => void;
  onSubmit: (surveyId: string, answers: Record<string, any>) => void;
}

export const SurveyFormModal: React.FC<SurveyFormModalProps> = ({
  isOpen,
  survey,
  onClose,
  onSubmit,
}) => {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!survey) return null;

  const handleRatingChange = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleRadioChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleCheckboxChange = (questionId: string, checkedValues: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: checkedValues }));
  };

  const handleTextChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: text }));
  };

  const handleSubmit = () => {
    // Validate required questions
    for (const q of survey.questions) {
      if (q.required && (answers[q.id] === undefined || answers[q.id] === "")) {
        message.warning(`Vui lòng hoàn thành câu hỏi: "${q.title}"`);
        return;
      }
    }

    setSubmitting(true);
    setTimeout(() => {
      onSubmit(survey.id, answers);
      setSubmitting(false);
    }, 600);
  };

  const rateLabels = ["Rất kém", "Chưa tốt", "Bình thường", "Tốt", "Rất tốt"];

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Icon name="lock" size={13} className="text-emerald-600" />
            <span>Phản hồi được bảo vệ và xử lý ẩn danh</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Hủy bỏ
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={submitting}
              className="font-semibold flex items-center gap-1.5"
            >
              <Icon name="check" size={14} />
              <span>Gửi phiếu đánh giá</span>
            </Button>
          </div>
        </div>
      }
      width={720}
      title={null}
      destroyOnHidden
      centered
    >
      <div className="space-y-4 pt-1 max-h-[75vh] overflow-y-auto pr-1">
        {/* Header */}
        <div className="border-b border-slate-100 pb-3.5 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-0">
              {survey.title}
            </h2>
            <Tag color="blue" className="font-bold m-0 text-xs">
              {survey.code}
            </Tag>
          </div>

          <p className="text-xs text-slate-500 mb-0 leading-relaxed">
            {survey.description}
          </p>

          {/* Privacy Guarantee Pill */}
          {survey.isAnonymous ? (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <Icon name="lock" size={15} className="text-emerald-600 shrink-0" />
              <span>
                <strong>Bảo mật ẩn danh 100%:</strong> Giáo viên và người chấm sẽ không thể biết danh tính học sinh gửi phiếu khảo sát này.
              </span>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2">
              <Icon name="user" size={15} className="text-blue-600 shrink-0" />
              <span>
                <strong>Tự đánh giá định danh:</strong> Phiếu này gắn với hồ sơ rèn luyện của học sinh Nguyễn Văn An (Lớp 11A1).
              </span>
            </div>
          )}
        </div>

        {/* Questions Body */}
        <div className="space-y-5 py-1">
          {survey.questions.map((q, idx) => (
            <div
              key={q.id}
              className="p-4 rounded-xl border border-[#f0f0f0] bg-white shadow-2xs space-y-2.5"
            >
              {/* Question Title */}
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold text-slate-900 mb-0 leading-snug">
                  <span className="text-blue-600 mr-1.5">Câu {idx + 1}.</span>
                  {q.title}
                  {q.required && <span className="text-rose-500 ml-1">*</span>}
                </h4>

                <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                  {q.type === "rating"
                    ? "Đánh giá sao"
                    : q.type === "single_choice"
                    ? "Chọn 1 đáp án"
                    : q.type === "multiple_choice"
                    ? "Chọn nhiều"
                    : "Tự luận"}
                </span>
              </div>

              {q.description && (
                <p className="text-xs text-slate-400 mb-0">{q.description}</p>
              )}

              {/* Question Input depending on type */}
              <div className="pt-1.5">
                {q.type === "rating" && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <Rate
                      value={answers[q.id] || 0}
                      onChange={(val) => handleRatingChange(q.id, val)}
                    />
                    {answers[q.id] > 0 && (
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {rateLabels[answers[q.id] - 1]}
                      </span>
                    )}
                  </div>
                )}

                {q.type === "single_choice" && q.options && (
                  <Radio.Group
                    value={answers[q.id]}
                    onChange={(e) => handleRadioChange(q.id, e.target.value)}
                    className="flex flex-col gap-2 w-full"
                  >
                    {q.options.map((opt, i) => (
                      <Radio key={i} value={opt} className="text-xs text-slate-700">
                        {opt}
                      </Radio>
                    ))}
                  </Radio.Group>
                )}

                {q.type === "multiple_choice" && q.options && (
                  <Checkbox.Group
                    value={answers[q.id] || []}
                    onChange={(vals) => handleCheckboxChange(q.id, vals)}
                    className="flex flex-col gap-2 w-full"
                  >
                    {q.options.map((opt, i) => (
                      <Checkbox key={i} value={opt} className="text-xs text-slate-700">
                        {opt}
                      </Checkbox>
                    ))}
                  </Checkbox.Group>
                )}

                {q.type === "text" && (
                  <TextArea
                    rows={3}
                    placeholder="Nhập ý kiến đóng góp chân thành của em tại đây..."
                    value={typeof answers[q.id] === "string" ? (answers[q.id] as string) : ""}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleTextChange(q.id, e.target.value)
                    }
                    className="w-full text-xs"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
