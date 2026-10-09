import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { message } from "@/components/ui/Message";

export interface UseAvatarUploadProps {
  currentAvatarUrl: string;
  onSelectAvatar: (url: string) => Promise<void>;
  onClose: () => void;
}

export interface UseAvatarUploadReturn {
  selectedUrl: string;
  isSubmitting: boolean;
  setSelectedUrl: (url: string) => void;
  handleCustomUpload: (file: File) => boolean;
  handleSave: () => Promise<void>;
}

export const useAvatarUpload = ({
  currentAvatarUrl,
  onSelectAvatar,
  onClose,
}: UseAvatarUploadProps): UseAvatarUploadReturn => {
  const { t } = useTranslation(["message"]);
  const [selectedUrl, setSelectedUrl] = useState<string>(currentAvatarUrl);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleCustomUpload = useCallback(
    (file: File) => {
      const isAllowedType =
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/webp";

      if (!isAllowedType) {
        message.error(t("message:error"));
        return false;
      }

      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error(t("message:error"));
        return false;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setSelectedUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      return false; // prevent default upload POST request
    },
    [t]
  );

  const handleSave = useCallback(async () => {
    try {
      setIsSubmitting(true);
      await onSelectAvatar(selectedUrl);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }, [onSelectAvatar, selectedUrl, onClose]);

  return {
    selectedUrl,
    isSubmitting,
    setSelectedUrl,
    handleCustomUpload,
    handleSave,
  };
};
