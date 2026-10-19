import React from "react";
import { useTranslation } from "react-i18next";
import { Form } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";

export const ProfileIdentitySection: React.FC = () => {
  const { t } = useTranslation(["card", "input"]);

  return (
    <div className="rounded-xl border border-[#f0f0f0] p-4 sm:p-5 bg-slate-50/60 space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-[#f0f0f0]">
        <Icon name="user" size={16} className="text-blue-600 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-slate-800 mb-0">
            {t("card:profile.sections.identityTitle")}
          </h4>
          <p className="text-xs text-slate-500 mb-0">
            {t("card:profile.sections.identityDesc")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
        <Form.Item label={t("input:labels.fullName")} name="fullName">
          <Input disabled className="bg-white! text-slate-700!" />
        </Form.Item>

        <Form.Item label={t("input:labels.studentCode")} name="studentCode">
          <Input disabled className="bg-white! text-slate-700!" />
        </Form.Item>

        <Form.Item label={t("input:labels.username")} name="username">
          <Input disabled className="bg-white! text-slate-700!" />
        </Form.Item>

        <Form.Item label={t("input:labels.dateOfBirth")} name="dateOfBirth">
          <Input disabled className="bg-white! text-slate-700!" />
        </Form.Item>

        <Form.Item label={t("input:labels.gender")} name="gender">
          <Input disabled className="bg-white! text-slate-700!" />
        </Form.Item>

        <Form.Item label={t("input:labels.nationalId")} name="nationalId">
          <Input disabled className="bg-white! text-slate-700!" />
        </Form.Item>
      </div>
    </div>
  );
};
