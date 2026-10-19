import React from "react";
import { useTranslation } from "react-i18next";
import { Form } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";

export const ProfileContactSection: React.FC = () => {
  const { t } = useTranslation(["card", "input", "validation"]);

  return (
    <div className="rounded-xl border border-[#f0f0f0] p-4 sm:p-5 bg-white space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-[#f0f0f0]">
        <Icon name="mail" size={16} className="text-blue-600 shrink-0" />
        <h4 className="text-sm font-bold text-slate-800 mb-0">
          {t("card:profile.sections.contactTitle")}
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
        <Form.Item
          label={t("input:labels.phone")}
          name="phone"
          rules={[
            { required: true, message: t("validation:required") },
            { pattern: /^[0-9+\s-]{9,15}$/, message: t("validation:invalidPhone") },
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
            { required: true, message: t("validation:required") },
            { type: "email", message: t("validation:invalidEmail") },
          ]}
        >
          <Input
            placeholder={t("input:placeholder.email")}
            prefix={<Icon name="mail" size={14} className="text-slate-400" />}
          />
        </Form.Item>
      </div>

      <Form.Item label={t("input:labels.address")} name="address">
        <Input placeholder={t("input:placeholder.address")} />
      </Form.Item>

      <Form.Item label={t("input:labels.bio")} name="bio">
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
