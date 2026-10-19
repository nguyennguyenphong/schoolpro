import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/Card";
import { Form } from "@/components/ui/Form";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type {
  StudentPersonalInfo,
  UpdateProfilePayload,
} from "@/modules/students/features/profile/types";
import {
  ProfileStepperNav,
  type ProfileStepItem,
} from "@/modules/students/features/profile/components/ProfileStepperNav";
import { ProfileIdentityFields } from "@/modules/students/features/profile/components/sections/ProfileIdentityFields";
import { ProfileContactFields } from "@/modules/students/features/profile/components/sections/ProfileContactFields";
import { ProfileResidenceFields } from "@/modules/students/features/profile/components/sections/ProfileResidenceFields";
import { ProfileOrganizationFields } from "@/modules/students/features/profile/components/sections/ProfileOrganizationFields";

interface ProfileBasicInfoTabProps {
  personalInfo: StudentPersonalInfo;
  onSave: (payload: UpdateProfilePayload) => Promise<boolean>;
  disabled?: boolean;
}

interface ComprehensiveProfileFormValues {
  // Identity & Account
  studentCode: string;
  username: string;
  preferredName: string;
  lastName: string;
  firstName: string;
  fullName: string;
  dateOfBirth?: string;
  gender: string;
  admissionDate?: string;
  nationalId: string;
  nationalIdIssuedDate?: string;
  nationalIdIssuedPlace: string;

  // Contact
  phone: string;
  email: string;
  address: string;
  bio: string;

  // Residence
  birthPlace: string;
  ethnicity: string;
  religion: string;
  householdRegistrationNumber: string;
  permanentAddress: string;
  temporaryAddress: string;

  // Organization & Policies
  insuranceCardNumber: string;
  policyBeneficiary: string;
  isPioneer: boolean;
  pioneerEntryDate?: string;
  isUnionMember: boolean;
  unionEntryDate?: string;
  specialNotes: string;
}

const TRACKED_FIELDS: (keyof ComprehensiveProfileFormValues)[] = [
  "username",
  "fullName",
  "firstName",
  "lastName",
  "dateOfBirth",
  "gender",
  "nationalId",
  "admissionDate",
  "phone",
  "email",
  "address",
  "birthPlace",
  "ethnicity",
  "religion",
  "permanentAddress",
  "temporaryAddress",
  "householdRegistrationNumber",
  "insuranceCardNumber",
];

const computeCompletionRate = (
  data: StudentPersonalInfo | Partial<ComprehensiveProfileFormValues>
): number => {
  let filled = 0;
  for (const key of TRACKED_FIELDS) {
    const val = (data as Record<string, unknown>)[key];
    if (val !== undefined && val !== null && val !== "") {
      filled++;
    }
  }
  return Math.min(100, Math.max(0, Math.round((filled / TRACKED_FIELDS.length) * 100)));
};

export const ProfileBasicInfoTab: React.FC<ProfileBasicInfoTabProps> = ({
  personalInfo,
  onSave,
  disabled = false,
}) => {
  const { t } = useTranslation(["card", "input", "button", "message"]);
  const [form] = Form.useForm<ComprehensiveProfileFormValues>();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [liveFormValues, setLiveFormValues] = useState<Partial<ComprehensiveProfileFormValues> | null>(null);

  const completionPercentage = useMemo(() => {
    return computeCompletionRate(liveFormValues || personalInfo);
  }, [liveFormValues, personalInfo]);

  const populateForm = useCallback(
    (info: StudentPersonalInfo) => {
      let initFirst = info.firstName || "";
      let initLast = info.lastName || "";
      if (!initFirst && !initLast && info.fullName) {
        const parts = info.fullName.trim().split(/\s+/);
        if (parts.length > 1) {
          initLast = parts.slice(0, -1).join(" ");
          initFirst = parts[parts.length - 1];
        } else {
          initFirst = parts[0];
        }
      }

      const initialValues: ComprehensiveProfileFormValues = {
        // Identity & Account
        studentCode: info.studentCode || "",
        username: info.username || "",
        preferredName: info.preferredName || "",
        lastName: initLast,
        firstName: initFirst,
        fullName: info.fullName || "",
        dateOfBirth: info.dateOfBirth || undefined,
        gender: info.gender || "MALE",
        admissionDate: info.admissionDate || undefined,
        nationalId: info.nationalId || "",
        nationalIdIssuedDate: info.nationalIdIssuedDate || undefined,
        nationalIdIssuedPlace: info.nationalIdIssuedPlace || "",

        // Contact
        phone: info.phone || "",
        email: info.email || "",
        address: info.address || "",
        bio: info.bio || "",

        // Residence
        birthPlace: info.birthPlace || "",
        ethnicity: info.ethnicity || "Kinh",
        religion: info.religion || "Không",
        householdRegistrationNumber: info.householdRegistrationNumber || "",
        permanentAddress: info.permanentAddress || info.address || "",
        temporaryAddress: info.temporaryAddress || info.address || "",

        // Organization & Policies
        insuranceCardNumber: info.insuranceCardNumber || "",
        policyBeneficiary: info.policyBeneficiary || "",
        isPioneer: Boolean(info.isPioneer),
        pioneerEntryDate: info.pioneerEntryDate || undefined,
        isUnionMember: Boolean(info.isUnionMember),
        unionEntryDate: info.unionEntryDate || undefined,
        specialNotes: info.specialNotes || "",
      };

      form.setFieldsValue(initialValues);
    },
    [form]
  );

  useEffect(() => {
    populateForm(personalInfo);
  }, [personalInfo, populateForm]);

  const handleReset = () => {
    populateForm(personalInfo);
    setLiveFormValues(null);
  };

  const handleValuesChange = (
    _changed: Partial<ComprehensiveProfileFormValues>,
    allValues: ComprehensiveProfileFormValues
  ) => {
    setLiveFormValues(allValues);
  };

  const handleSubmit = async (values: ComprehensiveProfileFormValues) => {
    try {
      setIsSubmitting(true);
      let computedFullName = values.fullName?.trim();
      if (!computedFullName && (values.lastName || values.firstName)) {
        computedFullName = `${values.lastName ? values.lastName.trim() + " " : ""}${
          values.firstName ? values.firstName.trim() : ""
        }`.trim();
      }

      await onSave({
        // Identity & Account
        username: values.username,
        fullName: computedFullName,
        firstName: values.firstName,
        lastName: values.lastName,
        preferredName: values.preferredName,
        dateOfBirth: values.dateOfBirth || undefined,
        gender: values.gender,
        admissionDate: values.admissionDate || undefined,
        nationalId: values.nationalId,
        nationalIdIssuedDate: values.nationalIdIssuedDate || undefined,
        nationalIdIssuedPlace: values.nationalIdIssuedPlace,

        // Contact
        phone: values.phone,
        email: values.email,
        address: values.address,
        bio: values.bio,

        // Residence
        birthPlace: values.birthPlace,
        ethnicity: values.ethnicity,
        religion: values.religion,
        householdRegistrationNumber: values.householdRegistrationNumber,
        permanentAddress: values.permanentAddress,
        temporaryAddress: values.temporaryAddress,

        // Organization
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

  const stepItems: ProfileStepItem[] = useMemo(
    () => [
      {
        id: "step-identity",
        stepNumber: "Bước 01",
        title: t("card:profile.sections.identityTitle"),
        subtitle: "Họ tên, Mã HS, CCCD",
        iconName: "user",
      },
      {
        id: "step-contact",
        stepNumber: "Bước 02",
        title: t("card:profile.sections.contactTitle"),
        subtitle: "Số điện thoại, Email, Bio",
        iconName: "mail",
      },
      {
        id: "step-residence",
        stepNumber: "Bước 03",
        title: t("card:profile.sections.residenceTitle"),
        subtitle: "Quê quán, Hộ khẩu, Địa chỉ",
        iconName: "home",
      },
      {
        id: "step-organization",
        stepNumber: "Bước 04",
        title: t("card:profile.sections.organizationTitle"),
        subtitle: "BHYT, Đoàn - Đội",
        iconName: "sparkles",
      },
    ],
    [t]
  );

  return (
    <Card className="rounded-2xl border border-[#f0f0f0] bg-white shadow-2xs overflow-hidden [&>.ant-card-body]:p-5 sm:[&>.ant-card-body]:p-7">
      {/* 1. Header with Gamified Progress Bar */}
      <div className="pb-5 mb-6 border-b border-[#f0f0f0] flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <Icon name="user" size={19} />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-0.5">
                {t("card:profile.sections.personal")}
              </h2>
              <p className="text-xs text-slate-500 mb-0">
                {t("card:profile.sections.personalDesc")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80">
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold text-slate-700">
                {t("card:profile.completionRate")}
              </span>
              <span className="text-[11px] text-slate-500">
                {completionPercentage === 100
                  ? "Đã hoàn tất 100% hồ sơ"
                  : `${completionPercentage}% • Tiếp tục hoàn thiện`}
              </span>
            </div>
            <div className="w-24">
              <Progress
                percent={completionPercentage}
                size="small"
                status={completionPercentage === 100 ? "success" : "active"}
                showInfo={false}
              />
            </div>
          </div>
        </div>

        {/* 2. Custom Interactive Stepper with Active Background & Border Highlights */}
        <div className="pt-1">
          <ProfileStepperNav
            currentStep={currentStep}
            onStepChange={(step) => setCurrentStep(step)}
            steps={stepItems}
            disabled={isSubmitting || disabled}
          />
        </div>
      </div>

      {/* 3. Form Container - Keeps all steps mounted to preserve form state */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={handleValuesChange}
        className="flex flex-col gap-6"
      >
        {/* Step 0: Identity & Account */}
        <div className={currentStep === 0 ? "block" : "hidden"}>
          <ProfileIdentityFields form={form} />
        </div>

        {/* Step 1: Contact & Biography */}
        <div className={currentStep === 1 ? "block" : "hidden"}>
          <ProfileContactFields />
        </div>

        {/* Step 2: Residence & Citizen Registry */}
        <div className={currentStep === 2 ? "block" : "hidden"}>
          <ProfileResidenceFields />
        </div>

        {/* Step 3: Youth Organizations & Insurance Policies */}
        <div className={currentStep === 3 ? "block" : "hidden"}>
          <ProfileOrganizationFields />
        </div>

        {/* 4. Unified Interactive Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 mt-3 border-t border-[#f0f0f0]">
          {/* Left Actions: Back & Reset */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {currentStep > 0 && (
              <Button
                htmlType="button"
                variant="outline"
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                disabled={isSubmitting || disabled}
                className="h-10 px-4 text-xs sm:text-sm font-medium"
              >
                <Icon name="arrow-left" size={14} />
                {t("button:previousStep")}
              </Button>
            )}

            <Button
              htmlType="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting || disabled}
              className="h-10 px-4 text-xs sm:text-sm font-medium"
            >
              {t("button:reset")}
            </Button>
          </div>

          {/* Right Actions: Next step & Save */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {/* Quick save button always available at any step */}
            {currentStep < stepItems.length - 1 && (
              <Button
                htmlType="submit"
                variant="outline"
                disabled={isSubmitting || disabled}
                className="h-10 px-4 text-xs sm:text-sm font-semibold"
              >
                <Icon
                  name={isSubmitting ? "loading" : "check"}
                  size={14}
                  className={isSubmitting ? "animate-spin" : ""}
                />
                {t("button:saveChanges")}
              </Button>
            )}

            {/* Next Step Button */}
            {currentStep < stepItems.length - 1 ? (
              <Button
                htmlType="button"
                variant="primary"
                onClick={() =>
                  setCurrentStep((prev) => Math.min(stepItems.length - 1, prev + 1))
                }
                disabled={isSubmitting || disabled}
                className="h-10 px-5 text-xs sm:text-sm font-semibold shadow-xs"
              >
                <span>{t("button:nextStep")}</span>
                <Icon name="arrow-right" size={14} />
              </Button>
            ) : (
              /* Final Completion Button on Step 4 */
              <Button
                htmlType="submit"
                variant="primary"
                disabled={isSubmitting || disabled}
                className="h-10 px-6 text-xs sm:text-sm font-semibold shadow-xs"
              >
                <Icon
                  name={isSubmitting ? "loading" : "check"}
                  size={14}
                  className={isSubmitting ? "animate-spin" : ""}
                />
                {t("button:completeProfile")}
              </Button>
            )}
          </div>
        </div>
      </Form>
    </Card>
  );
};
