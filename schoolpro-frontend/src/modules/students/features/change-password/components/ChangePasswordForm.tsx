import React from "react";
import { useTranslation } from "react-i18next";
import { Form } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Icon } from "@/components/ui/Icon";
import { PasswordStrengthMeter } from "@/modules/students/features/change-password/components/PasswordStrengthMeter";
import { PasswordRequirementsList } from "@/modules/students/features/change-password/components/PasswordRequirementsList";
import type {
  ChangePasswordFormData,
  PasswordEvaluation,
} from "@/modules/students/features/change-password/types";

interface ChangePasswordFormProps {
  evaluation: PasswordEvaluation;
  onNewPasswordChange: (value: string) => void;
  onSubmit: (values: ChangePasswordFormData) => Promise<boolean>;
  submitting?: boolean;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  evaluation,
  onNewPasswordChange,
  onSubmit,
  submitting = false,
}) => {
  const { t } = useTranslation(["input", "button", "message", "validation", "card"]);
  const [form] = Form.useForm<ChangePasswordFormData>();

  const handleFinish = async (values: ChangePasswordFormData) => {
    const success = await onSubmit(values);
    if (success) {
      form.resetFields();
      onNewPasswordChange("");
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        revokeOtherSessions: true,
      }}
      requiredMark="optional"
      className="space-y-4"
    >
      {/* Current Password */}
      <Form.Item
        name="currentPassword"
        label={
          <span className="font-semibold text-xs sm:text-sm text-slate-700">
            {t("input:labels.currentPassword")}
          </span>
        }
        rules={[
          {
            required: true,
            message: t("validation:required"),
          },
        ]}
      >
        <Input.Password
          prefix={<Icon name="lock" size={15} className="text-slate-400 mr-1.5" />}
          placeholder={t("input:placeholder.currentPassword")}
          autoComplete="current-password"
          autoFocus
        />
      </Form.Item>

      {/* New Password */}
      <Form.Item
        name="newPassword"
        label={
          <span className="font-semibold text-xs sm:text-sm text-slate-700">
            {t("input:labels.newPassword")}
          </span>
        }
        rules={[
          {
            required: true,
            message: t("validation:required"),
          },
          {
            min: 8,
            message: t("card:password.requirements.minChars"),
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (value && value === getFieldValue("currentPassword")) {
                return Promise.reject(new Error(t("card:password.requirements.noMatchOld")));
              }
              return Promise.resolve();
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<Icon name="shield-check" size={15} className="text-slate-400 mr-1.5" />}
          placeholder={t("input:placeholder.newPassword")}
          autoComplete="new-password"
          onChange={(e) => onNewPasswordChange(e.target.value)}
        />
      </Form.Item>

      {/* Live Strength Meter */}
      <PasswordStrengthMeter score={evaluation.score} level={evaluation.level} />

      {/* Requirements checklist */}
      <div className="pt-1 pb-1">
        <PasswordRequirementsList requirements={evaluation.requirements} />
      </div>

      {/* Confirm New Password */}
      <Form.Item
        name="confirmPassword"
        label={
          <span className="font-semibold text-xs sm:text-sm text-slate-700">
            {t("input:labels.confirmPassword")}
          </span>
        }
        dependencies={["newPassword"]}
        rules={[
          {
            required: true,
            message: t("validation:required"),
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("newPassword") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(t("message:passwordMismatch")));
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<Icon name="shield-check" size={15} className="text-slate-400 mr-1.5" />}
          placeholder={t("input:placeholder.confirmPassword")}
          autoComplete="new-password"
        />
      </Form.Item>

      {/* Checkbox Revoke Other Sessions */}
      <Form.Item name="revokeOtherSessions" valuePropName="checked" className="mb-2">
        <Checkbox className="text-xs sm:text-sm text-slate-700">
          {t("card:password.revokeOtherSessions")}
        </Checkbox>
      </Form.Item>

      {/* Submit Button */}
      <Button
        variant="primary"
        htmlType="submit"
        loading={submitting}
        className="w-full"
      >
        <Icon name="check" size={16} />
        <span>{t("button:updatePassword")}</span>
      </Button>
    </Form>
  );
};
