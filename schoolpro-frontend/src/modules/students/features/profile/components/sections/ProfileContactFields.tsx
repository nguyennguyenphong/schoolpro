import React from "react";
import { useTranslation } from "react-i18next";
import { Form } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";

export const ProfileContactFields: React.FC = () => {
  const { t } = useTranslation(["card", "input", "validation"]);

  return (
    <section id="profile-section-contact" className="scroll-mt-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-3 mb-5 border-b border-slate-100">
        <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
          <Icon name="mail" size={17} />
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

      <div className="flex flex-col gap-4.5">
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
      </div>
    </section>
  );
};
