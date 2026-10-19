import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Form } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type {
  StudentPersonalInfo,
  UpdateProfilePayload,
} from "@/modules/students/features/profile/types";

interface ProfileContactCardProps {
  personalInfo: StudentPersonalInfo;
  onSave: (payload: UpdateProfilePayload) => Promise<boolean>;
  disabled?: boolean;
}

interface ContactFormValues {
  phone: string;
  email: string;
  address: string;
  bio: string;
}

export const ProfileContactCard: React.FC<ProfileContactCardProps> = ({
  personalInfo,
  onSave,
  disabled = false,
}) => {
  const { t } = useTranslation(["card", "input", "button", "validation"]);
  const [form] = Form.useForm<ContactFormValues>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    form.setFieldsValue({
      phone: personalInfo.phone || "",
      email: personalInfo.email || "",
      address: personalInfo.address || "",
      bio: personalInfo.bio || "",
    });
  }, [personalInfo, form]);

  const handleSubmit = async (values: ContactFormValues) => {
    try {
      setIsSubmitting(true);
      await onSave({
        phone: values.phone,
        email: values.email,
        address: values.address,
        bio: values.bio,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-xl border border-[#f0f0f0] bg-white shadow-2xs overflow-hidden [&>.ant-card-body]:p-5 sm:[&>.ant-card-body]:p-6">
      {/* Card Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#f0f0f0]">
        <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
          <Icon name="mail" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-0.5">
            {t("card:profile.sections.contactTitle")}
          </h3>
          <p className="text-xs text-slate-500 mb-0">
            {t("card:profile.sections.contactDesc")}
          </p>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="pt-5 flex flex-col gap-4.5"
      >
        {/* Row 1: Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item
            label={t("input:labels.phone")}
            name="phone"
            rules={[
              { required: true, message: t("validation:required") },
              { pattern: /^[0-9+\s-]{9,15}$/, message: t("validation:invalidPhone") },
            ]}
            className="mb-0"
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
              { required: true, message: t("validation:required") },
              { type: "email", message: t("validation:invalidEmail") },
            ]}
            className="mb-0"
          >
            <Input
              placeholder={t("input:placeholder.email")}
              prefix={<Icon name="mail" size={14} className="text-slate-400" />}
            />
          </Form.Item>
        </div>

        {/* Row 2: Current Address */}
        <Form.Item
          label={t("input:labels.address")}
          name="address"
          className="mb-0"
        >
          <Input
            placeholder={t("input:placeholder.address")}
            prefix={<Icon name="home" size={14} className="text-slate-400" />}
          />
        </Form.Item>

        {/* Row 3: Biography */}
        <Form.Item
          label={t("input:labels.bio")}
          name="bio"
          className="mb-0"
        >
          <Input.TextArea
            rows={3}
            placeholder={t("input:placeholder.default")}
            maxLength={300}
            showCount
          />
        </Form.Item>

        {/* Card Footer: Dedicated Update Button */}
        <div className="flex items-center justify-end pt-3 mt-1 border-t border-[#f0f0f0]">
          <Button
            htmlType="submit"
            variant="primary"
            disabled={isSubmitting || disabled}
            className="px-5 h-9.5 text-xs sm:text-sm font-semibold shadow-xs"
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
    </Card>
  );
};
