import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { message } from "@/components/ui/Message";
import type {
  StudentProfileData,
  UpdateProfilePayload,
} from "@/modules/students/features/profile/types";
import { profileService } from "@/modules/students/features/profile/services/profileService";

export interface UseProfileReturn {
  profile: StudentProfileData | null;
  loading: boolean;
  updating: boolean;
  updateProfile: (payload: UpdateProfilePayload) => Promise<boolean>;
  updateBasicInfo: (payload: UpdateProfilePayload) => Promise<boolean>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useProfile = (): UseProfileReturn => {
  const { t } = useTranslation(["message"]);
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  const refreshProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
    } catch {
      message.error(t("message:error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    let isMounted = true;
    void (async () => {
      try {
        const data = await profileService.getProfile();
        if (isMounted) setProfile(data);
      } catch {
        if (isMounted) message.error(t("message:error"));
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [t]);

  const updateProfile = async (payload: UpdateProfilePayload): Promise<boolean> => {
    try {
      setUpdating(true);
      const updated = await profileService.updateProfile(payload);
      setProfile(updated);
      message.success(t("message:profileUpdatedSuccess"));
      return true;
    } catch {
      message.error(t("message:error"));
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const updateBasicInfo = async (payload: UpdateProfilePayload): Promise<boolean> => {
    return updateProfile(payload);
  };

  const updateAvatar = async (avatarUrl: string): Promise<void> => {
    await updateProfile({ avatarUrl });
  };

  return {
    profile,
    loading,
    updating,
    updateProfile,
    updateBasicInfo,
    updateAvatar,
    refreshProfile,
  };
};
