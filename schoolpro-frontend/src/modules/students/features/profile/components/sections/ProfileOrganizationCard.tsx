import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs, { type Dayjs } from "dayjs";
import { Card } from "@/components/ui/Card";
import { Form } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { DatePicker } from "@/components/ui/DatePicker";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type {
  StudentPersonalInfo,
  UpdateProfilePayload,
} from "@/modules/students/features/profile/types";

interface ProfileOrganizationCardProps {
  personalInfo: StudentPersonalInfo;
  onSave: (payload: UpdateProfilePayload) => Promise<boolean>;
  disabled?: boolean;
}

interface OrganizationFormValues {
  insuranceCardNumber: string;
  policyBeneficiary: string;
  isPioneer: boolean;
  pioneerEntryDate?: string;
  isUnionMember: boolean;
  unionEntryDate?: string;
  specialNotes: string;
}

export const ProfileOrganizationCard: React.FC<ProfileOrganizationCardProps> = ({
  personalInfo,
  onSave,
  disabled = false,
}) => {
  const { t } = useTranslation(["card", "input", "button"]);
  const [form] = Form.useForm<OrganizationFormValues>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    form.setFieldsValue({
      insuranceCardNumber: personalInfo.insuranceCardNumber || "",
      policyBeneficiary: personalInfo.policyBeneficiary || "",
      isPioneer: Boolean(personalInfo.isPioneer),
      pioneerEntryDate: personalInfo.pioneerEntryDate || undefined,
      isUnionMember: Boolean(personalInfo.isUnionMember),
      unionEntryDate: personalInfo.unionEntryDate || undefined,
      specialNotes: personalInfo.specialNotes || "",
    });
  }, [personalInfo, form]);

  const handleSubmit = async (values: OrganizationFormValues) => {
    try {
      setIsSubmitting(true);
      await onSave({
        insuranceCardNumber: values.insuranceCardNumber,
        policyBeneficiary: values.policyBeneficiary,
        isPioneer: values.isPioneer,
        pioneerEntryDate: values.pioneerEntryDate || undefined,
        isUnionMember: values.isUnionMember,
        unionEntryDate: values.unionEntryDate || undefined,
        specialNotes: values.specialNotes,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-xl border-[#f0f0f0] shadow-2xs [&>.ant-card-body]:p-5 sm:[&>.ant-card-body]:p-6">
      {/* Card Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#f0f0f0]">
        <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
          <Icon name="sparkles" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-0.5">
            {t("card:profile.sections.organizationTitle")}
          </h3>
          <p className="text-xs text-slate-500 mb-0">
            {t("card:profile.sections.organizationDesc")}
          </p>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="pt-4 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Form.Item
            label={t("input:labels.insuranceCardNumber")}
            name="insuranceCardNumber"
          >
            <Input placeholder={t("input:placeholder.default")} />
          </Form.Item>

          <Form.Item
            label={t("input:labels.policyBeneficiary")}
            name="policyBeneficiary"
          >
            <Input placeholder={t("input:placeholder.default")} />
          </Form.Item>
        </div>

        {/* Youth Organization Affiliation Dossier */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50/70 rounded-xl border border-slate-200">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                {t("input:labels.isPioneer")}
              </span>
              <Form.Item name="isPioneer" valuePropName="checked" noStyle>
                <Switch size="small" />
              </Form.Item>
            </div>
            <Form.Item
              label={t("input:labels.pioneerEntryDate")}
              name="pioneerEntryDate"
              className="mb-0"
              getValueProps={(val: string | undefined | null) => ({
                value: val && dayjs(val).isValid() ? dayjs(val) : null,
              })}
              normalize={(val: Dayjs | null) =>
                val && dayjs.isDayjs(val) ? val.format("YYYY-MM-DD") : undefined
              }
            >
              <DatePicker
                className="w-full"
                format="DD/MM/YYYY"
                placeholder={t("input:placeholder.date")}
                allowClear
              />
            </Form.Item>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                {t("input:labels.isUnionMember")}
              </span>
              <Form.Item name="isUnionMember" valuePropName="checked" noStyle>
                <Switch size="small" />
              </Form.Item>
            </div>
            <Form.Item
              label={t("input:labels.unionEntryDate")}
              name="unionEntryDate"
              className="mb-0"
              getValueProps={(val: string | undefined | null) => ({
                value: val && dayjs(val).isValid() ? dayjs(val) : null,
              })}
              normalize={(val: Dayjs | null) =>
                val && dayjs.isDayjs(val) ? val.format("YYYY-MM-DD") : undefined
              }
            >
              <DatePicker
                className="w-full"
                format="DD/MM/YYYY"
                placeholder={t("input:placeholder.date")}
                allowClear
              />
            </Form.Item>
          </div>
        </div>

        <Form.Item label={t("input:labels.specialNotes")} name="specialNotes">
          <Input.TextArea
            rows={2}
            placeholder={t("input:placeholder.default")}
            maxLength={300}
            showCount
          />
        </Form.Item>

        {/* Card Footer: Dedicated Update Button */}
        <div className="flex items-center justify-end pt-3 border-t border-[#f0f0f0]">
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
