import React, { useEffect } from "react";
import { Modal, Form, Select, Input as AntInput, Checkbox, message } from "antd";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { SendFeedbackPayload } from "@/modules/students/features/contact-book/types";

interface ParentFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetWeek?: number;
  onConfirmWeeklyReport?: (
    weekNumber: number,
    feedback: string,
    parentName: string
  ) => Promise<boolean>;
  onSendMessage?: (payload: SendFeedbackPayload) => Promise<boolean>;
  submitting: boolean;
}

export const ParentFeedbackModal: React.FC<ParentFeedbackModalProps> = ({
  isOpen,
  onClose,
  targetWeek,
  onConfirmWeeklyReport,
  onSendMessage,
  submitting,
}) => {
  const [form] = Form.useForm();
  const confirmed = Form.useWatch("confirmed", form);

  useEffect(() => {
    if (isOpen) {
      form.setFieldsValue({
        weekNumber: targetWeek ?? 4,
        parentName: "Nguyễn Văn Bình",
        phone: "0912.345.678",
        relationship: "Bố học sinh",
        homeStudyComment: "Cháu tự giác ngồi vào bàn học đúng giờ, hoàn thành bài tập trước khi ngủ.",
        generalOpinion: "",
        confirmed: true,
      });
    }
  }, [isOpen, targetWeek, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const parentName = values.parentName.trim();
      const weekNumber = values.weekNumber;
      const homeStudy = values.homeStudyComment?.trim() || "";
      const generalOpinion = values.generalOpinion?.trim() || "";
      const fullFeedback = homeStudy
        ? `${homeStudy} — Ý kiến gia đình: ${generalOpinion}`
        : generalOpinion;

      if (targetWeek && onConfirmWeeklyReport) {
        // Confirm weekly report action
        const ok = await onConfirmWeeklyReport(
          weekNumber,
          fullFeedback,
          `${parentName} (${values.relationship})`
        );
        if (ok) {
          form.resetFields();
          onClose();
        }
      } else if (onSendMessage) {
        // Send / Add parent note action
        const ok = await onSendMessage({
          weekNumber,
          parentName,
          parentRole: values.relationship,
          phone: values.phone,
          homeStudyComment: homeStudy,
          generalOpinion: generalOpinion,
          content: fullFeedback,
        });
        if (ok) {
          form.resetFields();
          onClose();
        }
      }
    } catch {
      message.warning("Vui lòng điền đầy đủ các thông tin bắt buộc.");
    }
  };

  const weekOptions = [
    { label: "Tuần 4 (22/09 - 27/09)", value: 4 },
    { label: "Tuần 3 (15/09 - 20/09)", value: 3 },
    { label: "Tuần 2 (08/09 - 13/09)", value: 2 },
    { label: "Tuần 1 (01/09 - 06/09)", value: 1 },
  ];

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      centered
      width={600}
      title={
        <div className="flex items-center gap-3 pb-3 border-b border-[#f0f0f0]">
          <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200 shadow-2xs">
            <Icon name="fileText" size={17} />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-0">
              {targetWeek
                ? `Ký xác nhận & Ghi ý kiến Sổ liên lạc Tuần ${targetWeek}`
                : "Mục ghi ý kiến của Cha Mẹ học sinh vào Sổ liên lạc"}
            </h3>
            <span className="text-xs text-slate-500 font-normal">
              Ý kiến và chữ ký của Cha Mẹ học sinh được lưu chính thức trong sổ liên lạc điện tử
            </span>
          </div>
        </div>
      }
    >
      <Form form={form} layout="vertical" className="pt-3 space-y-2">
        {/* Tuần liên lạc */}
        <Form.Item
          name="weekNumber"
          label={<span className="text-xs font-bold text-slate-700">Tuần ghi nhận xét trong sổ:</span>}
          rules={[{ required: true, message: "Vui lòng chọn tuần học" }]}
        >
          <Select
            options={weekOptions}
            className="w-full rounded-lg"
            disabled={Boolean(targetWeek)}
          />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Người ghi ý kiến */}
          <Form.Item
            name="parentName"
            label={<span className="text-xs font-bold text-slate-700">Họ và tên Cha Mẹ / Người ký:</span>}
            rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
          >
            <AntInput placeholder="Ví dụ: Nguyễn Văn Bình" className="rounded-lg text-xs" />
          </Form.Item>

          {/* Vai trò */}
          <Form.Item
            name="relationship"
            label={<span className="text-xs font-bold text-slate-700">Quan hệ với học sinh:</span>}
            rules={[{ required: true, message: "Vui lòng chọn quan hệ" }]}
          >
            <Select
              options={[
                { label: "Bố học sinh", value: "Bố học sinh" },
                { label: "Mẹ học sinh", value: "Mẹ học sinh" },
                { label: "Người giám hộ", value: "Người giám hộ" },
              ]}
              className="w-full rounded-lg"
            />
          </Form.Item>
        </div>

        {/* Số điện thoại */}
        <Form.Item
          name="phone"
          label={<span className="text-xs font-bold text-slate-700">Số điện thoại liên lạc:</span>}
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
        >
          <AntInput placeholder="0912.xxx.xxx" className="rounded-lg text-xs" />
        </Form.Item>

        {/* 1. Tình hình học tập ở nhà */}
        <Form.Item
          name="homeStudyComment"
          label={
            <span className="text-xs font-bold text-slate-700">
              1. Tình hình tự học & sinh hoạt tại nhà của học sinh:
            </span>
          }
          rules={[
            { required: true, message: "Vui lòng ghi nhận tình hình học ở nhà của học sinh" },
          ]}
        >
          <AntInput.TextArea
            rows={2}
            placeholder="Ví dụ: Ở nhà cháu tự giác học bài đúng giờ, chuẩn bị bài đầy đủ, sức khỏe và tinh thần tốt..."
            className="rounded-lg text-xs"
          />
        </Form.Item>

        {/* 2. Ý kiến đề xuất của gia đình */}
        <Form.Item
          name="generalOpinion"
          label={
            <span className="text-xs font-bold text-slate-700">
              2. Ý kiến, đề xuất của Cha Mẹ học sinh gửi tới Nhà trường & Giáo viên chủ nhiệm:
            </span>
          }
          rules={[
            { required: true, message: "Vui lòng nhập ý kiến của gia đình" },
            { min: 10, message: "Nội dung ý kiến tối thiểu 10 ký tự" },
          ]}
        >
          <AntInput.TextArea
            rows={3}
            placeholder="Ví dụ: Gia đình rất mừng trước sự tiến bộ của cháu. Kính nhờ cô giáo tiếp tục rèn giũa và bồi dưỡng thêm cho cháu môn Tiếng Anh và Tin học..."
            className="rounded-lg text-xs"
          />
        </Form.Item>

        {/* Checkbox cam kết & ký sổ */}
        <Form.Item
          name="confirmed"
          valuePropName="checked"
          className="mb-1"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(new Error("Vui lòng tích xác nhận đồng ý ký sổ")),
            },
          ]}
        >
          <Checkbox className="text-xs text-slate-600">
            Tôi xác nhận đã xem toàn bộ kết quả học tập & rèn luyện trong tuần của học sinh và ký tên vào sổ liên lạc.
          </Checkbox>
        </Form.Item>

        {/* Actions */}
        <div className="pt-4 border-t border-[#f0f0f0] flex items-center justify-end gap-2.5">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!confirmed || submitting}
            className="font-semibold"
          >
            <Icon name="check" size={14} />
            <span>{submitting ? "Đang lưu..." : "Ký tên & Ghi vào sổ liên lạc"}</span>
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
