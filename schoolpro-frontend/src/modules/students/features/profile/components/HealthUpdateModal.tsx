import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { Form } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type {
  StudentHealthRecord,
  UpdateProfilePayload,
} from "@/modules/students/features/profile/types";

interface HealthUpdateModalProps {
  open: boolean;
  onClose: () => void;
  healthRecord: StudentHealthRecord;
  onSave: (payload: UpdateProfilePayload) => Promise<boolean>;
}

export const HealthUpdateModal: React.FC<HealthUpdateModalProps> = ({
  open,
  onClose,
  healthRecord,
  onSave,
}) => {
  const { t } = useTranslation(["card", "input", "button", "validation"]);
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const initialValues = {
    heightCm: healthRecord.heightCm,
    weightKg: healthRecord.weightKg,
    bloodType: healthRecord.bloodType || "O",
    visionLeft: healthRecord.visionLeft || "10/10",
    visionRight: healthRecord.visionRight || "10/10",
    allergies: healthRecord.allergies || "",
    chronicIllness: healthRecord.chronicIllness || "",
    healthNotes: healthRecord.notes || "",
    specialCareInstructions: healthRecord.specialCareInstructions || "",
  };

  const handleFinish = async (values: typeof initialValues) => {
    try {
      setIsSubmitting(true);
      const success = await onSave({
        heightCm: Number(values.heightCm),
        weightKg: Number(values.weightKg),
        bloodType: values.bloodType,
        visionLeft: values.visionLeft,
        visionRight: values.visionRight,
        allergies: values.allergies,
        chronicIllness: values.chronicIllness,
        healthNotes: values.healthNotes,
        specialCareInstructions: values.specialCareInstructions,
      });
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <div className="flex items-center gap-2">
          <Icon name="heart" size={18} className="text-blue-600" />
          <span className="font-bold text-slate-800">
            {t("card:profile.sections.healthUpdateTitle")}
          </span>
        </div>
      }
      destroyOnClose
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleFinish}
        className="space-y-4 pt-3"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Form.Item
            label={t("input:labels.height")}
            name="heightCm"
            rules={[{ required: true, message: t("validation:required") }]}
          >
            <Input type="number" min={50} max={250} step="0.1" />
          </Form.Item>

          <Form.Item
            label={t("input:labels.weight")}
            name="weightKg"
            rules={[{ required: true, message: t("validation:required") }]}
          >
            <Input type="number" min={15} max={200} step="0.1" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Form.Item label={t("input:labels.bloodType")} name="bloodType">
            <Select
              options={[
                { value: "A", label: "A" },
                { value: "B", label: "B" },
                { value: "AB", label: "AB" },
                { value: "O", label: "O" },
              ]}
            />
          </Form.Item>

          <Form.Item label={`${t("input:labels.vision")} - L`} name="visionLeft">
            <Input placeholder="10/10" />
          </Form.Item>

          <Form.Item label={`${t("input:labels.vision")} - R`} name="visionRight">
            <Input placeholder="10/10" />
          </Form.Item>
        </div>

        <Form.Item label={t("input:labels.allergies")} name="allergies">
          <Input.TextArea rows={2} placeholder={t("input:placeholder.default")} />
        </Form.Item>

        <Form.Item label={t("input:labels.chronicIllness")} name="chronicIllness">
          <Input.TextArea rows={2} placeholder={t("input:placeholder.default")} />
        </Form.Item>

        <Form.Item
          label={t("input:labels.specialCareInstructions")}
          name="specialCareInstructions"
        >
          <Input.TextArea rows={2} placeholder={t("input:placeholder.default")} />
        </Form.Item>

        <Form.Item label={t("input:labels.healthNotes")} name="healthNotes">
          <Input.TextArea rows={2} placeholder={t("input:placeholder.default")} />
        </Form.Item>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f0f0f0]">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t("button:cancel")}
          </Button>
          <Button variant="primary" htmlType="submit" disabled={isSubmitting}>
            <Icon
              name={isSubmitting ? "loading" : "check"}
              size={14}
              className={isSubmitting ? "animate-spin" : ""}
            />
            {t("button:saveChanges")}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
