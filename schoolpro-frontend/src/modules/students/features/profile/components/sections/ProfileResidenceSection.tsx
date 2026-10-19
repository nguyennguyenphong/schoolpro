import React from "react";
import { useTranslation } from "react-i18next";
import { Form } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";

export const ProfileResidenceSection: React.FC = () => {
  const { t } = useTranslation(["card", "input"]);

  return (
    <div className="rounded-xl border border-[#f0f0f0] p-4 sm:p-5 bg-white space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-[#f0f0f0]">
        <Icon name="home" size={16} className="text-blue-600 shrink-0" />
        <h4 className="text-sm font-bold text-slate-800 mb-0">
          {t("card:profile.sections.residenceTitle")}
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
        <Form.Item label={t("input:labels.birthPlace")} name="birthPlace">
          <Input placeholder={t("input:placeholder.default")} />
        </Form.Item>

        <Form.Item label={t("input:labels.ethnicity")} name="ethnicity">
          <Input placeholder={t("input:placeholder.default")} />
        </Form.Item>

        <Form.Item label={t("input:labels.religion")} name="religion">
          <Input placeholder={t("input:placeholder.default")} />
        </Form.Item>

        <Form.Item
          label={t("input:labels.householdRegistrationNumber")}
          name="householdRegistrationNumber"
        >
          <Input placeholder={t("input:placeholder.default")} />
        </Form.Item>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Form.Item
          label={t("input:labels.permanentAddress")}
          name="permanentAddress"
        >
          <Input placeholder={t("input:placeholder.address")} />
        </Form.Item>

        <Form.Item
          label={t("input:labels.temporaryAddress")}
          name="temporaryAddress"
        >
          <Input placeholder={t("input:placeholder.address")} />
        </Form.Item>
      </div>
    </div>
  );
};
