import React from "react";
import { useTranslation } from "react-i18next";
import type { FormInstance } from "antd";
import { Form } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Icon } from "@/components/ui/Icon";

interface ProfileIdentitySectionProps {
  form: FormInstance;
}

export const ProfileIdentitySection: React.FC<ProfileIdentitySectionProps> = ({ form }) => {
  const { t } = useTranslation(["card", "input", "validation"]);

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

  return (
    <div className="rounded-xl border border-[#f0f0f0] p-4 sm:p-5 bg-white space-y-4">
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

      {/* Row 1: Student Code (Reference) & Username */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <Form.Item label={t("input:labels.studentCode")} name="studentCode">
          <Input disabled className="bg-slate-50! text-slate-700!" />
        </Form.Item>

        <Form.Item
          label={t("input:labels.username")}
          name="username"
          rules={[{ required: true, message: t("validation:required") }]}
        >
          <Input
            placeholder={t("input:placeholder.default")}
            prefix={<Icon name="user" size={14} className="text-slate-400" />}
          />
        </Form.Item>

        <Form.Item label={t("input:labels.preferredName")} name="preferredName">
          <Input placeholder={t("input:placeholder.default")} />
        </Form.Item>
      </div>

      {/* Row 2: Name parts & Full Name (Auto-computed / Synced) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-3.5 bg-blue-50/40 rounded-xl border border-blue-100/60">
        <Form.Item label={t("input:labels.lastName")} name="lastName">
          <Input
            placeholder={t("input:placeholder.default")}
            onChange={(e) => handleNamePartChange("lastName", e.target.value)}
          />
        </Form.Item>

        <Form.Item
          label={t("input:labels.firstName")}
          name="firstName"
          rules={[{ required: true, message: t("validation:required") }]}
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
        >
          <Input
            placeholder={t("input:placeholder.default")}
            onChange={(e) => handleFullNameChange(e.target.value)}
          />
        </Form.Item>
      </div>

      {/* Row 3: Demographics (DOB, Gender, Admission Date) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Form.Item
          label={t("input:labels.dateOfBirth")}
          name="dateOfBirth"
          rules={[{ required: true, message: t("validation:required") }]}
        >
          <Input type="date" placeholder={t("input:placeholder.date")} />
        </Form.Item>

        <Form.Item
          label={t("input:labels.gender")}
          name="gender"
          rules={[{ required: true, message: t("validation:required") }]}
        >
          <Select
            options={[
              { value: "MALE", label: t("input:labels.genderMale") },
              { value: "FEMALE", label: t("input:labels.genderFemale") },
              { value: "OTHER", label: t("input:labels.genderOther") },
            ]}
          />
        </Form.Item>

        <Form.Item label={t("input:labels.admissionDate")} name="admissionDate">
          <Input type="date" placeholder={t("input:placeholder.date")} />
        </Form.Item>
      </div>

      {/* Row 4: Citizen ID Dossier */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <Form.Item label={t("input:labels.nationalId")} name="nationalId">
          <Input placeholder={t("input:placeholder.default")} />
        </Form.Item>

        <Form.Item
          label={t("input:labels.nationalIdIssuedDate")}
          name="nationalIdIssuedDate"
        >
          <Input type="date" placeholder={t("input:placeholder.date")} />
        </Form.Item>

        <Form.Item
          label={t("input:labels.nationalIdIssuedPlace")}
          name="nationalIdIssuedPlace"
        >
          <Input placeholder={t("input:placeholder.default")} />
        </Form.Item>
      </div>
    </div>
  );
};
