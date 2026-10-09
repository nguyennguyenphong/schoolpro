import { useState } from "react";
import type {
  StudentPersonalInfo,
  UpdateProfilePayload,
} from "@/modules/students/features/profile/types";

export interface BasicInfoFormValues {
  phone: string;
  email: string;
  address: string;
}

export interface UseBasicInfoFormProps {
  personalInfo: StudentPersonalInfo;
  onSave: (payload: UpdateProfilePayload) => Promise<boolean>;
}

export interface UseBasicInfoFormReturn {
  isSubmitting: boolean;
  handleSubmit: (values: BasicInfoFormValues) => Promise<void>;
  initialValues: Record<string, any>;
}

/**
 * Custom hook to manage student basic and contact information form logic.
 */
export const useBasicInfoForm = ({
  personalInfo,
  onSave,
}: UseBasicInfoFormProps): UseBasicInfoFormReturn => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const initialValues = {
    fullName: personalInfo.fullName,
    studentCode: personalInfo.studentCode,
    username: personalInfo.username,
    dateOfBirth: personalInfo.dateOfBirth,
    gender:
      personalInfo.gender === "MALE"
        ? "Nam"
        : personalInfo.gender === "FEMALE"
        ? "Nữ"
        : "Khác",
    nationalId: personalInfo.nationalId,
    ethnicity: personalInfo.ethnicity,
    religion: personalInfo.religion,
    birthPlace: personalInfo.birthPlace,
    phone: personalInfo.phone,
    email: personalInfo.email,
    address: personalInfo.address,
  };

  const handleSubmit = async (values: BasicInfoFormValues) => {
    try {
      setIsSubmitting(true);
      await onSave({
        phone: values.phone,
        email: values.email,
        address: values.address,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit,
    initialValues,
  };
};
