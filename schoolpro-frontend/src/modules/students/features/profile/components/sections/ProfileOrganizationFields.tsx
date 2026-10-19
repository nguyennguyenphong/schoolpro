import React from "react";
import { useTranslation } from "react-i18next";
import dayjs, { type Dayjs } from "dayjs";
import { Form } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { DatePicker } from "@/components/ui/DatePicker";
import { Icon } from "@/components/ui/Icon";

export const ProfileOrganizationFields: React.FC = () => {
  const { t } = useTranslation(["card", "input"]);

  return (
    <section id="profile-section-organization" className="scroll-mt-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-3 mb-5 border-b border-slate-100">
        <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
          <Icon name="sparkles" size={17} />
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

      <div className="flex flex-col gap-4.5">
        {/* Row 1: Insurance & Policy Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item
            label={t("input:labels.insuranceCardNumber")}
            name="insuranceCardNumber"
            className="mb-0"
          >
            <Input placeholder={t("input:placeholder.default")} />
          </Form.Item>

          <Form.Item
            label={t("input:labels.policyBeneficiary")}
            name="policyBeneficiary"
            className="mb-0"
          >
            <Input placeholder={t("input:placeholder.default")} />
          </Form.Item>
        </div>

        {/* Row 2: Youth Organization Affiliation Dossier */}
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

        {/* Row 3: Special Notes */}
        <Form.Item
          label={t("input:labels.specialNotes")}
          name="specialNotes"
          className="mb-0"
        >
          <Input.TextArea
            rows={2}
            placeholder={t("input:placeholder.default")}
            maxLength={300}
            showCount
          />
        </Form.Item>
      </div>
    </section>
  );
};
