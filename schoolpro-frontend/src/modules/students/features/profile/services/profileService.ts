import type {
  StudentProfileData,
  UpdateProfilePayload,
} from "@/modules/students/features/profile/types";
import { MOCK_STUDENT_PROFILE } from "@/modules/students/features/profile/services/mockProfileData";

const STORAGE_KEY = "schoolpro_student_profile_data";

class ProfileService {
  /**
   * Fetch full student profile dossier.
   */
  async getProfile(): Promise<StudentProfileData> {
    // Simulate short network latency
    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Fallback to in-memory mock if localStorage is not accessible
    }

    return MOCK_STUDENT_PROFILE;
  }

  /**
   * Update student profile fields (contact info, address, avatar, health notes).
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<StudentProfileData> {
    await new Promise((resolve) => setTimeout(resolve, 250));

    const current = await this.getProfile();
    const updated: StudentProfileData = {
      ...current,
      personalInfo: {
        ...current.personalInfo,
        phone: payload.phone ?? current.personalInfo.phone,
        email: payload.email ?? current.personalInfo.email,
        address: payload.address ?? current.personalInfo.address,
        avatarUrl: payload.avatarUrl ?? current.personalInfo.avatarUrl,
      },
      healthRecord: {
        ...current.healthRecord,
        notes: payload.healthNotes ?? current.healthRecord.notes,
      },
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore localStorage error in test or sandbox environment
    }

    return updated;
  }
}

export const profileService = new ProfileService();
