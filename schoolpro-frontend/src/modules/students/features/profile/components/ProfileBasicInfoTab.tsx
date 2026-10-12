import React from "react";
import { useTranslation } from "react-i18next";
import { Form } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type {
  StudentPersonalInfo,
  UpdateProfilePayload,
} from "@/modules/students/features/profile/types";
import { useBasicInfoForm } from "@/modules/students/features/profile/hooks/useBasicInfoForm";

interface ProfileBasicInfoTabProps {
  personalInfo: StudentPersonalInfo;
  onSave: (payload: UpdateProfilePayload) => Promise<boolean>;
  disabled?: boolean;
}

export const ProfileBasicInfoTab: React.FC<ProfileBasicInfoTabProps> = ({
  personalInfo,
  onSave,
  disabled = false,
}) => {
  const { t } = useTranslation(["card", "input", "button", "validation"]);
  const [form] = Form.useForm();
  const { isSubmitting, handleSubmit, initialValues } = useBasicInfoForm({
    personalInfo,
    onSave,
  });

  return (
    <>
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
          <Icon name="user" size={20} />
        </span>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-0.5">
            {t("card:profile.sections.personal")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            {t("card:profile.sections.personalDesc")}
          </p>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSubmit}
        className="space-y-4"
      >
        {/* Read-only Identity Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Form.Item label={t("input:labels.fullName")} name="fullName">
            <Input disabled className="bg-slate-50! text-slate-700!" />
          </Form.Item>

          <Form.Item label={t("input:labels.studentCode")} name="studentCode">
            <Input disabled className="bg-slate-50! text-slate-700!" />
          </Form.Item>

          <Form.Item label={t("input:labels.username")} name="username">
            <Input disabled className="bg-slate-50! text-slate-700!" />
          </Form.Item>

          <Form.Item label={t("input:labels.dateOfBirth")} name="dateOfBirth">
            <Input disabled className="bg-slate-50! text-slate-700!" />
          </Form.Item>

          <Form.Item label={t("input:labels.gender")} name="gender">
            <Input disabled className="bg-slate-50! text-slate-700!" />
          </Form.Item>

          <Form.Item label={t("input:labels.nationalId")} name="nationalId">
            <Input disabled className="bg-slate-50! text-slate-700!" />
          </Form.Item>

          <Form.Item label={t("input:labels.ethnicity")} name="ethnicity">
            <Input disabled className="bg-slate-50! text-slate-700!" />
          </Form.Item>

          <Form.Item label={t("input:labels.religion")} name="religion">
            <Input disabled className="bg-slate-50! text-slate-700!" />
          </Form.Item>

          <Form.Item label={t("input:labels.birthPlace")} name="birthPlace">
            <Input disabled className="bg-slate-50! text-slate-700!" />
          </Form.Item>
        </div>

        {/* Editable Contact Section */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Icon name="mail" size={15} className="text-blue-600" />
            <span>Thông tin liên lạc học sinh (Có thể cập nhật)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              label={t("input:labels.phone")}
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại liên lạc" },
                { pattern: /^[0-9+\s-]{9,15}$/, message: "Định dạng số điện thoại không hợp lệ" },
              ]}
            >
              <Input
                placeholder={t("input:placeholder.phone")}
                prefix={<Icon name="user" size={14} className="text-slate-400" />}
              />
            </Form.Item>

            <Form.Item
              label={t("input:labels.email")}
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập địa chỉ email" },
                { type: "email", message: "Địa chỉ email không hợp lệ" },
              ]}
            >
              <Input
                placeholder={t("input:placeholder.email")}
                prefix={<Icon name="mail" size={14} className="text-slate-400" />}
              />
            </Form.Item>
          </div>

          <Form.Item
            label={t("input:labels.address")}
            name="address"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ thường trú" }]}
          >
            <Input.TextArea
              rows={2}
              placeholder={t("input:placeholder.address")}
            />
          </Form.Item>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end pt-3">
          <Button
            htmlType="submit"
            variant="primary"
            disabled={isSubmitting || disabled}
            className="px-6"
          >
            <Icon
              name={isSubmitting || disabled ? "loading" : "check"}
              size={14}
              className={isSubmitting || disabled ? "animate-spin" : ""}
            />
            {t("button:saveChanges")}
          </Button>
        </div>
      </Form>
    </>
  );
};
