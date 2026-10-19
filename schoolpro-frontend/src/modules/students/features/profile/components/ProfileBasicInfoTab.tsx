import React from "react";
import { useTranslation } from "react-i18next";
import { Form } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type {
  StudentPersonalInfo,
  UpdateProfilePayload,
} from "@/modules/students/features/profile/types";
import { useBasicInfoForm } from "@/modules/students/features/profile/hooks/useBasicInfoForm";
import { ProfileIdentitySection } from "@/modules/students/features/profile/components/sections/ProfileIdentitySection";
import { ProfileContactSection } from "@/modules/students/features/profile/components/sections/ProfileContactSection";
import { ProfileResidenceSection } from "@/modules/students/features/profile/components/sections/ProfileResidenceSection";
import { ProfileOrganizationSection } from "@/modules/students/features/profile/components/sections/ProfileOrganizationSection";

interface ProfileBasicInfoTabProps {
  personalInfo: StudentPersonalInfo;
  onSave: (payload: UpdateProfilePayload) => Promise<boolean>;
  disabled?: boolean;
}

export const ProfileBasicInfoTab: React.FC<ProfileBasicInfoTabProps> = ({
  personalInfo,
  onSave,
  disabled = false,
}) => {
  const { t } = useTranslation(["card", "button"]);
  const [form] = Form.useForm();
  const { isSubmitting, handleSubmit, initialValues } = useBasicInfoForm({
    personalInfo,
    onSave,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-[#f0f0f0]">
        <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
          <Icon name="user" size={20} />
        </span>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-0.5">
            {t("card:profile.sections.personal")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-0">
            {t("card:profile.sections.personalDesc")}
          </p>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSubmit}
        className="space-y-5"
      >
        {/* 1. Read-only official identity dossier */}
        <ProfileIdentitySection />

        {/* 2. Contact details & bio */}
        <ProfileContactSection />

        {/* 3. Residence, citizenship & household registry */}
        <ProfileResidenceSection />

        {/* 4. Youth affiliations, insurance & policies */}
        <ProfileOrganizationSection />

        {/* Save button bar */}
        <div className="flex items-center justify-end pt-3 border-t border-[#f0f0f0]">
          <Button
            htmlType="submit"
            variant="primary"
            disabled={isSubmitting || disabled}
            className="px-6 h-10 shadow-sm"
          >
            <Icon
              name={isSubmitting || disabled ? "loading" : "check"}
              size={15}
              className={isSubmitting || disabled ? "animate-spin" : ""}
            />
            {t("button:saveChanges")}
          </Button>
        </div>
      </Form>
    </div>
  );
};
