import { httpClient } from "@/shared/api/httpClient";
import type { ApiResponse } from "@/shared/types/auth";
import type {
  StudentProfileData,
  UpdateProfilePayload,
} from "@/modules/students/features/profile/types";
import { MOCK_STUDENT_PROFILE } from "@/modules/students/features/profile/services/mockProfileData";

const STORAGE_KEY = "schoolpro_student_profile_data";

class ProfileService {
  /**
   * Fetch full student profile dossier from Backend API.
   * Fallbacks to local cache or seed data if offline.
   */
  async getProfile(): Promise<StudentProfileData> {
    try {
      const res = await httpClient.get<ApiResponse<StudentProfileData>>("/core/profile/");
      if (res.data?.data) {
        const data = res.data.data;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {
          // Ignore localStorage errors
        }
        return data;
      }
    } catch {
      // Network offline or mock mode fallback
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch {
        // Fallback to in-memory mock
      }
    }

    return MOCK_STUDENT_PROFILE;
  }

  /**
   * Update student profile fields (contact info, address, residence, youth union, health).
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<StudentProfileData> {
    try {
      const res = await httpClient.put<ApiResponse<StudentProfileData>>(
        "/core/profile/",
        payload
      );
      if (res.data?.data) {
        const updated = res.data.data;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // Ignore localStorage errors
        }
        return updated;
      }
    } catch {
      // Local fallback in disconnected mode
    }

    // In case backend is unavailable, merge locally
    const current = await this.getProfile();
    const updated: StudentProfileData = {
      ...current,
      personalInfo: {
        ...current.personalInfo,
        phone: payload.phone ?? current.personalInfo.phone,
        email: payload.email ?? current.personalInfo.email,
        address: payload.address ?? current.personalInfo.address,
        permanentAddress:
          payload.permanentAddress ?? current.personalInfo.permanentAddress,
        temporaryAddress:
          payload.temporaryAddress ?? current.personalInfo.temporaryAddress,
        householdRegistrationNumber:
          payload.householdRegistrationNumber ??
          current.personalInfo.householdRegistrationNumber,
        birthPlace: payload.birthPlace ?? current.personalInfo.birthPlace,
        ethnicity: payload.ethnicity ?? current.personalInfo.ethnicity,
        religion: payload.religion ?? current.personalInfo.religion,
        nationalIdIssuedDate:
          payload.nationalIdIssuedDate ?? current.personalInfo.nationalIdIssuedDate,
        nationalIdIssuedPlace:
          payload.nationalIdIssuedPlace ?? current.personalInfo.nationalIdIssuedPlace,
        insuranceCardNumber:
          payload.insuranceCardNumber ?? current.personalInfo.insuranceCardNumber,
        policyBeneficiary:
          payload.policyBeneficiary ?? current.personalInfo.policyBeneficiary,
        bloodType: payload.bloodType ?? current.personalInfo.bloodType,
        allergies: payload.allergies ?? current.personalInfo.allergies,
        isPioneer: payload.isPioneer ?? current.personalInfo.isPioneer,
        pioneerEntryDate:
          payload.pioneerEntryDate ?? current.personalInfo.pioneerEntryDate,
        isUnionMember: payload.isUnionMember ?? current.personalInfo.isUnionMember,
        unionEntryDate:
          payload.unionEntryDate ?? current.personalInfo.unionEntryDate,
        specialNotes: payload.specialNotes ?? current.personalInfo.specialNotes,
        bio: payload.bio ?? current.personalInfo.bio,
        avatarUrl: payload.avatarUrl ?? current.personalInfo.avatarUrl,
      },
      healthRecord: {
        ...current.healthRecord,
        heightCm: payload.heightCm ?? current.healthRecord.heightCm,
        weightKg: payload.weightKg ?? current.healthRecord.weightKg,
        bloodType: payload.bloodType ?? current.healthRecord.bloodType,
        visionLeft: payload.visionLeft ?? current.healthRecord.visionLeft,
        visionRight: payload.visionRight ?? current.healthRecord.visionRight,
        allergies: payload.allergies ?? current.healthRecord.allergies,
        chronicIllness: payload.chronicIllness ?? current.healthRecord.chronicIllness,
        notes: payload.healthNotes ?? current.healthRecord.notes,
        specialCareInstructions:
          payload.specialCareInstructions ??
          current.healthRecord.specialCareInstructions,
      },
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore localStorage errors
    }

    return updated;
  }
}

export const profileService = new ProfileService();
