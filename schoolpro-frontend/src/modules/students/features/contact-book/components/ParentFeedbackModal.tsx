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
        content: "",
        confirmed: Boolean(targetWeek),
      });
    }
  }, [isOpen, targetWeek, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const content = values.content.trim();
      const parentName = values.parentName.trim();
      const weekNumber = values.weekNumber;

      if (targetWeek && onConfirmWeeklyReport) {
        // Confirm weekly report action
        const ok = await onConfirmWeeklyReport(weekNumber, content, `${parentName} (${values.relationship})`);
        if (ok) {
          form.resetFields();
          onClose();
        }
      } else if (onSendMessage) {
        // Send general message
        const ok = await onSendMessage({
          weekNumber,
          content,
          parentName: `${parentName} (${values.relationship})`,
          phone: values.phone,
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
      destroyOnClose
      centered
      width={560}
      title={
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Icon name="edit" size={16} />
          </span>
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-0">
              {targetWeek
                ? `Ký xác nhận & Ý kiến Tuần ${targetWeek}`
                : "Gửi ý kiến đóng góp của Phụ huynh"}
            </h3>
            <span className="text-xs text-slate-500 font-normal">
              Ý kiến sẽ được chuyển trực tiếp tới Giáo viên chủ nhiệm lớp 11A1
            </span>
          </div>
        </div>
      }
    >
      <Form form={form} layout="vertical" className="pt-3 space-y-2">
        {/* Week selection */}
        <Form.Item
          name="weekNumber"
          label={<span className="text-xs font-bold text-slate-700">Tuần báo cáo liên hệ:</span>}
          rules={[{ required: true, message: "Vui lòng chọn tuần học" }]}
        >
          <Select
            options={weekOptions}
            className="w-full rounded-lg"
            disabled={Boolean(targetWeek)}
          />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Parent Name */}
          <Form.Item
            name="parentName"
            label={<span className="text-xs font-bold text-slate-700">Họ và tên phụ huynh:</span>}
            rules={[{ required: true, message: "Vui lòng nhập họ tên phụ huynh" }]}
          >
            <AntInput placeholder="Ví dụ: Nguyễn Văn Bình" className="rounded-lg text-xs" />
          </Form.Item>

          {/* Relationship */}
          <Form.Item
            name="relationship"
            label={<span className="text-xs font-bold text-slate-700">Quan hệ với học sinh:</span>}
            rules={[{ required: true, message: "Vui lòng chọn hoặc nhập quan hệ" }]}
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

        {/* Phone */}
        <Form.Item
          name="phone"
          label={<span className="text-xs font-bold text-slate-700">Số điện thoại liên hệ:</span>}
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
        >
          <AntInput placeholder="0912.xxx.xxx" className="rounded-lg text-xs" />
        </Form.Item>

        {/* Feedback Content */}
        <Form.Item
          name="content"
          label={
            <span className="text-xs font-bold text-slate-700">
              Nội dung ý kiến phản hồi / Góp ý với nhà trường:
            </span>
          }
          rules={[
            { required: true, message: "Vui lòng nhập nội dung ý kiến phản hồi" },
            { min: 10, message: "Nội dung phản hồi tối thiểu 10 ký tự" },
          ]}
        >
          <AntInput.TextArea
            rows={4}
            placeholder="Ví dụ: Gia đình đã xem tình hình học tập của cháu. Ở nhà cháu học bài nghiêm túc, cảm ơn cô giáo đã luôn quan tâm sát sao..."
            className="rounded-lg text-xs"
          />
        </Form.Item>

        {/* Consent check */}
        <Form.Item
          name="confirmed"
          valuePropName="checked"
          className="mb-1"
          rules={[
            {
              validator: (_, value) =>
                value
                  ? Promise.resolve()
                  : Promise.reject(new Error("Vui lòng tích xác nhận đồng ý")),
            },
          ]}
        >
          <Checkbox className="text-xs text-slate-600">
            Tôi xác nhận đã xem và đồng ý với nội dung kết quả học tập & rèn luyện của học sinh.
          </Checkbox>
        </Form.Item>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
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
            <span>{submitting ? "Đang gửi..." : "Ký xác nhận & Gửi ý kiến"}</span>
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
