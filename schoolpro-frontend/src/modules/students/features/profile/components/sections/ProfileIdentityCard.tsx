import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs, { type Dayjs } from "dayjs";
import { Card } from "@/components/ui/Card";
import { Form } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type {
  StudentPersonalInfo,
  UpdateProfilePayload,
} from "@/modules/students/features/profile/types";

interface ProfileIdentityCardProps {
  personalInfo: StudentPersonalInfo;
  onSave: (payload: UpdateProfilePayload) => Promise<boolean>;
  disabled?: boolean;
}

interface IdentityFormValues {
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
}

export const ProfileIdentityCard: React.FC<ProfileIdentityCardProps> = ({
  personalInfo,
  onSave,
  disabled = false,
}) => {
  const { t } = useTranslation(["card", "input", "button", "validation"]);
  const [form] = Form.useForm<IdentityFormValues>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Synchronize form values whenever personalInfo changes
  useEffect(() => {
    let initFirst = personalInfo.firstName || "";
    let initLast = personalInfo.lastName || "";
    if (!initFirst && !initLast && personalInfo.fullName) {
      const parts = personalInfo.fullName.trim().split(/\s+/);
      if (parts.length > 1) {
        initLast = parts.slice(0, -1).join(" ");
        initFirst = parts[parts.length - 1];
      } else {
        initFirst = parts[0];
      }
    }

    form.setFieldsValue({
      studentCode: personalInfo.studentCode || "",
      username: personalInfo.username || "",
      preferredName: personalInfo.preferredName || "",
      lastName: initLast,
      firstName: initFirst,
      fullName: personalInfo.fullName || "",
      dateOfBirth: personalInfo.dateOfBirth || undefined,
      gender: personalInfo.gender || "MALE",
      admissionDate: personalInfo.admissionDate || undefined,
      nationalId: personalInfo.nationalId || "",
      nationalIdIssuedDate: personalInfo.nationalIdIssuedDate || undefined,
      nationalIdIssuedPlace: personalInfo.nationalIdIssuedPlace || "",
    });
  }, [personalInfo, form]);

  const handleNamePartChange = (field: "firstName" | "lastName", val: string) => {
    const currentFirst = field === "firstName" ? val : form.getFieldValue("firstName") || "";
    const currentLast = field === "lastName" ? val : form.getFieldValue("lastName") || "";
    const computed = `${currentLast ? currentLast.trim() + " " : ""}${
      currentFirst ? currentFirst.trim() : ""
    }`.trim();
    form.setFieldsValue({ fullName: computed });
  };

  const handleFullNameChange = (val: string) => {
    const parts = val.trim().split(/\s+/);
    if (parts.length > 1) {
      form.setFieldsValue({
        lastName: parts.slice(0, -1).join(" "),
        firstName: parts[parts.length - 1],
      });
    } else if (parts.length === 1 && parts[0]) {
      form.setFieldsValue({
        firstName: parts[0],
      });
    }
  };

  const handleSubmit = async (values: IdentityFormValues) => {
    try {
      setIsSubmitting(true);
      let computedFullName = values.fullName?.trim();
      if (!computedFullName && (values.lastName || values.firstName)) {
        computedFullName = `${values.lastName ? values.lastName.trim() + " " : ""}${
          values.firstName ? values.firstName.trim() : ""
        }`.trim();
      }

      await onSave({
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
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="rounded-xl border border-[#f0f0f0] bg-white shadow-2xs overflow-hidden [&>.ant-card-body]:p-5 sm:[&>.ant-card-body]:p-6">
      {/* Card Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#f0f0f0]">
        <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
          <Icon name="user" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-0.5">
            {t("card:profile.sections.identityTitle")}
          </h3>
          <p className="text-xs text-slate-500 mb-0">
            {t("card:profile.sections.identityDesc")}
          </p>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="pt-5 flex flex-col gap-4.5"
      >
        {/* Row 1: Student Code & Username */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item
            label={t("input:labels.studentCode")}
            name="studentCode"
            className="mb-0"
          >
            <Input
              disabled
              className="bg-slate-50! text-slate-700!"
              prefix={<Icon name="user" size={14} className="text-slate-400" />}
            />
          </Form.Item>

          <Form.Item
            label={t("input:labels.username")}
            name="username"
            rules={[{ required: true, message: t("validation:required") }]}
            className="mb-0"
          >
            <Input
              placeholder={t("input:placeholder.default")}
              prefix={<Icon name="user" size={14} className="text-slate-400" />}
            />
          </Form.Item>
        </div>

        {/* Row 2: Name components with real-time automatic synchronization */}
        <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100/60 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Form.Item
              label={t("input:labels.lastName")}
              name="lastName"
              className="mb-0"
            >
              <Input
                placeholder={t("input:placeholder.default")}
                onChange={(e) => handleNamePartChange("lastName", e.target.value)}
              />
            </Form.Item>

            <Form.Item
              label={t("input:labels.firstName")}
              name="firstName"
              rules={[{ required: true, message: t("validation:required") }]}
              className="mb-0"
            >
              <Input
                placeholder={t("input:placeholder.default")}
                onChange={(e) => handleNamePartChange("firstName", e.target.value)}
              />
            </Form.Item>

            <Form.Item
              label={t("input:labels.fullName")}
              name="fullName"
              rules={[{ required: true, message: t("validation:required") }]}
              className="mb-0"
            >
              <Input
                placeholder={t("input:placeholder.default")}
                onChange={(e) => handleFullNameChange(e.target.value)}
              />
            </Form.Item>
          </div>
        </div>

        {/* Row 3: Demographics & Personal Attributes (Preferred name, DOB, Gender, Admission Date) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Form.Item
            label={t("input:labels.preferredName")}
            name="preferredName"
            className="mb-0"
          >
            <Input placeholder={t("input:placeholder.default")} />
          </Form.Item>

          <Form.Item
            label={t("input:labels.dateOfBirth")}
            name="dateOfBirth"
            getValueProps={(val: string | undefined | null) => ({
              value: val && dayjs(val).isValid() ? dayjs(val) : null,
            })}
            normalize={(val: Dayjs | null) =>
              val && dayjs.isDayjs(val) ? val.format("YYYY-MM-DD") : undefined
            }
            rules={[{ required: true, message: t("validation:required") }]}
            className="mb-0"
          >
            <DatePicker
              className="w-full"
              format="DD/MM/YYYY"
              placeholder={t("input:placeholder.date")}
              allowClear
            />
          </Form.Item>

          <Form.Item
            label={t("input:labels.gender")}
            name="gender"
            rules={[{ required: true, message: t("validation:required") }]}
            className="mb-0"
          >
            <Select
              className="w-full"
              options={[
                { value: "MALE", label: t("input:labels.genderMale") },
                { value: "FEMALE", label: t("input:labels.genderFemale") },
                { value: "OTHER", label: t("input:labels.genderOther") },
              ]}
            />
          </Form.Item>

          <Form.Item
            label={t("input:labels.admissionDate")}
            name="admissionDate"
            getValueProps={(val: string | undefined | null) => ({
              value: val && dayjs(val).isValid() ? dayjs(val) : null,
            })}
            normalize={(val: Dayjs | null) =>
              val && dayjs.isDayjs(val) ? val.format("YYYY-MM-DD") : undefined
            }
            className="mb-0"
          >
            <DatePicker
              className="w-full"
              format="DD/MM/YYYY"
              placeholder={t("input:placeholder.date")}
              allowClear
            />
          </Form.Item>
        </div>

        {/* Row 4: Citizen ID Dossier */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Form.Item
            label={t("input:labels.nationalId")}
            name="nationalId"
            className="mb-0"
          >
            <Input placeholder={t("input:placeholder.default")} />
          </Form.Item>

          <Form.Item
            label={t("input:labels.nationalIdIssuedDate")}
            name="nationalIdIssuedDate"
            getValueProps={(val: string | undefined | null) => ({
              value: val && dayjs(val).isValid() ? dayjs(val) : null,
            })}
            normalize={(val: Dayjs | null) =>
              val && dayjs.isDayjs(val) ? val.format("YYYY-MM-DD") : undefined
            }
            className="mb-0"
          >
            <DatePicker
              className="w-full"
              format="DD/MM/YYYY"
              placeholder={t("input:placeholder.date")}
              allowClear
            />
          </Form.Item>

          <Form.Item
            label={t("input:labels.nationalIdIssuedPlace")}
            name="nationalIdIssuedPlace"
            className="mb-0"
          >
            <Input placeholder={t("input:placeholder.default")} />
          </Form.Item>
        </div>

        {/* Card Footer: Dedicated Update Button */}
        <div className="flex items-center justify-end pt-3 mt-1 border-t border-[#f0f0f0]">
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
