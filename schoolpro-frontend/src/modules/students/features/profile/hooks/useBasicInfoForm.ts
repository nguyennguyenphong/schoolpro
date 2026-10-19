import { useState } from "react";
import type {
  StudentPersonalInfo,
  UpdateProfilePayload,
} from "@/modules/students/features/profile/types";

export interface BasicInfoFormValues {
  // Contact
  phone: string;
  email: string;
  address: string;
  bio: string;

  // Residence & Citizen
  birthPlace: string;
  ethnicity: string;
  religion: string;
  nationalIdIssuedDate: string;
  nationalIdIssuedPlace: string;
  permanentAddress: string;
  temporaryAddress: string;
  householdRegistrationNumber: string;

  // Insurance & Policies
  insuranceCardNumber: string;
  policyBeneficiary: string;

  // Organization & youth affiliation
  isPioneer: boolean;
  pioneerEntryDate: string;
  isUnionMember: boolean;
  unionEntryDate: string;
  specialNotes: string;

  // Health
  bloodType: string;
  allergies: string;
}

export interface UseBasicInfoFormProps {
  personalInfo: StudentPersonalInfo;
  onSave: (payload: UpdateProfilePayload) => Promise<boolean>;
}

export interface UseBasicInfoFormReturn {
  isSubmitting: boolean;
  handleSubmit: (values: BasicInfoFormValues) => Promise<void>;
  initialValues: Record<string, unknown>;
}

/**
 * Custom hook to manage student comprehensive personal dossier form logic.
 */
export const useBasicInfoForm = ({
  personalInfo,
  onSave,
}: UseBasicInfoFormProps): UseBasicInfoFormReturn => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const initialValues: Record<string, unknown> = {
    // Read-only reference fields
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

    // Editable Contact
    phone: personalInfo.phone || "",
    email: personalInfo.email || "",
    address: personalInfo.address || "",
    bio: personalInfo.bio || "",

    // Editable Residence & Citizen
    birthPlace: personalInfo.birthPlace || "",
    ethnicity: personalInfo.ethnicity || "Kinh",
    religion: personalInfo.religion || "Không",
    nationalIdIssuedDate: personalInfo.nationalIdIssuedDate || "",
    nationalIdIssuedPlace: personalInfo.nationalIdIssuedPlace || "",
    permanentAddress: personalInfo.permanentAddress || personalInfo.address || "",
    temporaryAddress: personalInfo.temporaryAddress || personalInfo.address || "",
    householdRegistrationNumber: personalInfo.householdRegistrationNumber || "",

    // Editable Insurance & Policy
    insuranceCardNumber: personalInfo.insuranceCardNumber || "",
    policyBeneficiary: personalInfo.policyBeneficiary || "",

    // Editable Youth affiliation
    isPioneer: Boolean(personalInfo.isPioneer),
    pioneerEntryDate: personalInfo.pioneerEntryDate || "",
    isUnionMember: Boolean(personalInfo.isUnionMember),
    unionEntryDate: personalInfo.unionEntryDate || "",
    specialNotes: personalInfo.specialNotes || "",

    // Editable Health
    bloodType: personalInfo.bloodType || "O",
    allergies: personalInfo.allergies || "",
  };

  const handleSubmit = async (values: BasicInfoFormValues) => {
    try {
      setIsSubmitting(true);
      await onSave({
        phone: values.phone,
        email: values.email,
        address: values.address,
        bio: values.bio,
        birthPlace: values.birthPlace,
        ethnicity: values.ethnicity,
        religion: values.religion,
        nationalIdIssuedDate: values.nationalIdIssuedDate || undefined,
        nationalIdIssuedPlace: values.nationalIdIssuedPlace,
        permanentAddress: values.permanentAddress,
        temporaryAddress: values.temporaryAddress,
        householdRegistrationNumber: values.householdRegistrationNumber,
        insuranceCardNumber: values.insuranceCardNumber,
        policyBeneficiary: values.policyBeneficiary,
        isPioneer: values.isPioneer,
        pioneerEntryDate: values.pioneerEntryDate || undefined,
        isUnionMember: values.isUnionMember,
        unionEntryDate: values.unionEntryDate || undefined,
        specialNotes: values.specialNotes,
        bloodType: values.bloodType,
        allergies: values.allergies,
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
