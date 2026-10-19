import React from "react";
import { useTranslation } from "react-i18next";
import { Form } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Icon } from "@/components/ui/Icon";

export const ProfileOrganizationSection: React.FC = () => {
  const { t } = useTranslation(["card", "input"]);

  return (
    <div className="rounded-xl border border-[#f0f0f0] p-4 sm:p-5 bg-white space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-[#f0f0f0]">
        <Icon name="sparkles" size={16} className="text-blue-600 shrink-0" />
        <h4 className="text-sm font-bold text-slate-800 mb-0">
          {t("card:profile.sections.organizationTitle")}
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50/70 rounded-xl border border-[#f0f0f0]">
        <div className="space-y-2">
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
          >
            <Input type="date" placeholder={t("input:placeholder.date")} />
          </Form.Item>
        </div>

        <div className="space-y-2">
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
          >
            <Input type="date" placeholder={t("input:placeholder.date")} />
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
    </div>
  );
};
