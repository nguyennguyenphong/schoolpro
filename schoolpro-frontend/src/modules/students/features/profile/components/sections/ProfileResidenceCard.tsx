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

interface ProfileResidenceCardProps {
  personalInfo: StudentPersonalInfo;
  onSave: (payload: UpdateProfilePayload) => Promise<boolean>;
  disabled?: boolean;
}

interface ResidenceFormValues {
  birthPlace: string;
  ethnicity: string;
  religion: string;
  householdRegistrationNumber: string;
  permanentAddress: string;
  temporaryAddress: string;
}

export const ProfileResidenceCard: React.FC<ProfileResidenceCardProps> = ({
  personalInfo,
  onSave,
  disabled = false,
}) => {
  const { t } = useTranslation(["card", "input", "button"]);
  const [form] = Form.useForm<ResidenceFormValues>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    form.setFieldsValue({
      birthPlace: personalInfo.birthPlace || "",
      ethnicity: personalInfo.ethnicity || "Kinh",
      religion: personalInfo.religion || "Không",
      householdRegistrationNumber: personalInfo.householdRegistrationNumber || "",
      permanentAddress: personalInfo.permanentAddress || personalInfo.address || "",
      temporaryAddress: personalInfo.temporaryAddress || personalInfo.address || "",
    });
  }, [personalInfo, form]);

  const handleSubmit = async (values: ResidenceFormValues) => {
    try {
      setIsSubmitting(true);
      await onSave({
        birthPlace: values.birthPlace,
        ethnicity: values.ethnicity,
        religion: values.religion,
        householdRegistrationNumber: values.householdRegistrationNumber,
        permanentAddress: values.permanentAddress,
        temporaryAddress: values.temporaryAddress,
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
          <Icon name="home" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-0.5">
            {t("card:profile.sections.residenceTitle")}
          </h3>
          <p className="text-xs text-slate-500 mb-0">
            {t("card:profile.sections.residenceDesc")}
          </p>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="pt-5 flex flex-col gap-4.5"
      >
        {/* Row 1: Vital Statistics & Origin (Birth Place, Ethnicity, Religion) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Form.Item
            label={t("input:labels.birthPlace")}
            name="birthPlace"
            className="mb-0"
          >
            <Input
              placeholder={t("input:placeholder.default")}
              prefix={<Icon name="home" size={14} className="text-slate-400" />}
            />
          </Form.Item>

          <Form.Item
            label={t("input:labels.ethnicity")}
            name="ethnicity"
            className="mb-0"
          >
            <Input placeholder={t("input:placeholder.default")} />
          </Form.Item>

          <Form.Item
            label={t("input:labels.religion")}
            name="religion"
            className="mb-0"
          >
            <Input placeholder={t("input:placeholder.default")} />
          </Form.Item>
        </div>

        {/* Row 2: Household Registry & Permanent Residence */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Form.Item
            label={t("input:labels.householdRegistrationNumber")}
            name="householdRegistrationNumber"
            className="mb-0"
          >
            <Input placeholder={t("input:placeholder.default")} />
          </Form.Item>

          <Form.Item
            label={t("input:labels.permanentAddress")}
            name="permanentAddress"
            className="mb-0 lg:col-span-2"
          >
            <Input
              placeholder={t("input:placeholder.address")}
              prefix={<Icon name="home" size={14} className="text-slate-400" />}
            />
          </Form.Item>
        </div>

        {/* Row 3: Current Temporary Residence */}
        <Form.Item
          label={t("input:labels.temporaryAddress")}
          name="temporaryAddress"
          className="mb-0"
        >
          <Input
            placeholder={t("input:placeholder.address")}
            prefix={<Icon name="home" size={14} className="text-slate-400" />}
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
