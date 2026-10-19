import { useState } from "react";
import type {
  StudentPersonalInfo,
  UpdateProfilePayload,
} from "@/modules/students/features/profile/types";

export interface BasicInfoFormValues {
  // Identity & Account
  username: string;
  fullName: string;
  firstName: string;
  lastName: string;
  preferredName: string;
  dateOfBirth: string;
  gender: string;
  nationalId: string;
  nationalIdIssuedDate: string;
  nationalIdIssuedPlace: string;
  admissionDate: string;

  // Contact
  phone: string;
  email: string;
  address: string;
  bio: string;

  // Residence & Citizen
  birthPlace: string;
  ethnicity: string;
  religion: string;
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

  // Derive initial first and last name if not explicitly set
  let initialFirst = personalInfo.firstName || "";
  let initialLast = personalInfo.lastName || "";
  if (!initialFirst && !initialLast && personalInfo.fullName) {
    const parts = personalInfo.fullName.trim().split(" ");
    if (parts.length > 1) {
      initialLast = parts.slice(0, -1).join(" ");
      initialFirst = parts[parts.length - 1];
    } else {
      initialFirst = parts[0];
    }
  }

  const initialValues: Record<string, unknown> = {
    // Reference
    studentCode: personalInfo.studentCode,

    // Identity & Account
    username: personalInfo.username || "",
    fullName: personalInfo.fullName || "",
    firstName: initialFirst,
    lastName: initialLast,
    preferredName: personalInfo.preferredName || "",
    dateOfBirth: personalInfo.dateOfBirth || "",
    gender: personalInfo.gender || "MALE",
    nationalId: personalInfo.nationalId || "",
    nationalIdIssuedDate: personalInfo.nationalIdIssuedDate || "",
    nationalIdIssuedPlace: personalInfo.nationalIdIssuedPlace || "",
    admissionDate: personalInfo.admissionDate || "",

    // Editable Contact
    phone: personalInfo.phone || "",
    email: personalInfo.email || "",
    address: personalInfo.address || "",
    bio: personalInfo.bio || "",

    // Editable Residence & Citizen
    birthPlace: personalInfo.birthPlace || "",
    ethnicity: personalInfo.ethnicity || "Kinh",
    religion: personalInfo.religion || "Không",
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
      // Auto-compute fullName if not directly customized
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
        nationalId: values.nationalId,
        nationalIdIssuedDate: values.nationalIdIssuedDate || undefined,
        nationalIdIssuedPlace: values.nationalIdIssuedPlace,
        admissionDate: values.admissionDate || undefined,
        phone: values.phone,
        email: values.email,
        address: values.address,
        bio: values.bio,
        birthPlace: values.birthPlace,
        ethnicity: values.ethnicity,
        religion: values.religion,
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
