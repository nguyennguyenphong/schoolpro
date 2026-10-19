import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { Form } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
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
  const [currentHeight, setCurrentHeight] = useState<number>(healthRecord.heightCm || 170);
  const [currentWeight, setCurrentWeight] = useState<number>(healthRecord.weightKg || 60);

  // Dynamic automatic BMI calculation
  const heightM = currentHeight / 100;
  const computedBmi = heightM > 0 ? Number((currentWeight / (heightM * heightM)).toFixed(1)) : 0;

  const getBmiBadge = (bmiVal: number) => {
    if (bmiVal < 18.5) return { text: "Thiếu cân nhẹ (BMI < 18.5)", color: "orange" };
    if (bmiVal <= 24.9) return { text: "Thể trạng Cân đối (18.5 - 24.9)", color: "green" };
    return { text: "Thừa cân nhẹ (BMI ≥ 25.0)", color: "red" };
  };

  const bmiBadge = getBmiBadge(computedBmi);

  const initialValues = {
    heightCm: healthRecord.heightCm,
    weightKg: healthRecord.weightKg,
    bloodType: healthRecord.bloodType || "O",
    visionLeft: healthRecord.visionLeft || "10/10",
    visionRight: healthRecord.visionRight || "10/10",
    hearingStatus: healthRecord.hearingStatus || "Bình thường",
    dentalStatus: healthRecord.dentalStatus || "Bình thường",
    skeletalStatus: healthRecord.skeletalStatus || "Bình thường",
    healthClassification: healthRecord.healthClassification || "TYPE_1",
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
        bmi: computedBmi,
        bloodType: values.bloodType,
        visionLeft: values.visionLeft,
        visionRight: values.visionRight,
        hearingStatus: values.hearingStatus,
        dentalStatus: values.dentalStatus,
        skeletalStatus: values.skeletalStatus,
        healthClassification: values.healthClassification,
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
      width={640}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleFinish}
        autoComplete="off"
        className="space-y-4 pt-2"
      >
        {/* Physical Growth & Auto Calculated BMI Card */}
        <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <Icon name="sparkles" size={14} className="text-blue-600" />
              <span>Chỉ số thể chất & BMI (Tự động tính)</span>
            </span>
            <Tag color={bmiBadge.color} className="text-xs font-semibold m-0">
              BMI: {computedBmi} • {bmiBadge.text}
            </Tag>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Form.Item
              label={t("input:labels.height")}
              name="heightCm"
              rules={[{ required: true, message: t("validation:required") }]}
              className="mb-0"
            >
              <Input
                type="number"
                min={50}
                max={250}
                step="0.1"
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) setCurrentHeight(val);
                }}
              />
            </Form.Item>

            <Form.Item
              label={t("input:labels.weight")}
              name="weightKg"
              rules={[{ required: true, message: t("validation:required") }]}
              className="mb-0"
            >
              <Input
                type="number"
                min={15}
                max={200}
                step="0.1"
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) setCurrentWeight(val);
                }}
              />
            </Form.Item>
          </div>
        </div>

        {/* Clinical measurements */}
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

        {/* Specialized health status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <Form.Item label={t("input:labels.hearingStatus")} name="hearingStatus">
            <Input placeholder={t("input:placeholder.default")} />
          </Form.Item>

          <Form.Item label={t("input:labels.dentalStatus")} name="dentalStatus">
            <Input placeholder={t("input:placeholder.default")} />
          </Form.Item>

          <Form.Item label={t("input:labels.skeletalStatus")} name="skeletalStatus">
            <Input placeholder={t("input:placeholder.default")} />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Form.Item
            label={t("input:labels.healthClassification")}
            name="healthClassification"
          >
            <Select
              options={[
                { value: "TYPE_1", label: "Loại 1 (Rất tốt)" },
                { value: "TYPE_2", label: "Loại 2 (Tốt)" },
                { value: "TYPE_3", label: "Loại 3 (Trung bình)" },
                { value: "TYPE_4", label: "Loại 4 (Yếu)" },
              ]}
            />
          </Form.Item>

          <Form.Item label={t("input:labels.chronicIllness")} name="chronicIllness">
            <Input placeholder={t("input:placeholder.default")} />
          </Form.Item>
        </div>

        <Form.Item label={t("input:labels.allergies")} name="allergies">
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
