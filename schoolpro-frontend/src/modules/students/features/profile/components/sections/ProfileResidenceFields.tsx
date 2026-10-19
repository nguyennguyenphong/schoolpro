import React from "react";
import { useTranslation } from "react-i18next";
import { Form } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";

export const ProfileResidenceFields: React.FC = () => {
  const { t } = useTranslation(["card", "input"]);

  return (
    <section id="profile-section-residence" className="scroll-mt-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-3 mb-5 border-b border-slate-100">
        <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
          <Icon name="home" size={17} />
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

      <div className="flex flex-col gap-4.5">
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
      </div>
    </section>
  );
};
